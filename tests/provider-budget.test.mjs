import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openProviderBudget} from '../scripts/provider-budget.mjs';
import {gatewaySearch} from '../scripts/gateway.mjs';

test('Providerreservierungen teilen sich die Monatsgrenze über Verbindungen und Neustarts',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-budget-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  let now=Date.parse('2026-11-30T23:59:59Z');
  const config={databasePath:join(directory,'budget.sqlite'),monthlyMicros:100,requestMicros:40,now:()=>now};
  const first=openProviderBudget(config),second=openProviderBudget(config);
  try {
    assert.equal(first.reserve(),true);
    assert.equal(second.reserve(),true);
    assert.equal(first.reserve(),false);
  } finally {first.close();second.close();}
  const reopened=openProviderBudget(config);
  try {
    assert.equal(reopened.reserve(),false);
    now+=1000;
    assert.equal(reopened.reserve(),true);
  } finally {reopened.close();}
});

test('Gateway bleibt ohne Budget geschlossen und lehnt erschöpfte oder abgebrochene Aufrufe vor dem Anbieter ab',async()=>{
  const config={apiKey:'unit-test-only',model:'openai/gpt-5.4-mini'};
  assert.equal(gatewaySearch(config),null);
  let reservations=0;
  const search=gatewaySearch({...config,budget:{reserve(){reservations++;return false;}}});
  await assert.rejects(search({query:'SSD'}),/budget exhausted/);
  await assert.rejects(search({query:'SSD'},{signal:AbortSignal.abort()}),{name:'AbortError'});
  assert.equal(reservations,1);
});

const primaryModel='openai/gpt-5.4-mini';
const backupModel='google/gemini-3-flash';
const searchRequest={query:'SSD',scope:'component',domains:['dq-solutions.ch']};
const resultRow={title:'SSD',url:'https://www.dq-solutions.ch/de/ssd-test',snippet:'Fixture'};
const gatewayUnavailable=()=>Response.json({error:{type:'internal_server_error',message:'Unavailable'}},{status:503});

function gatewayResult(output) {
  return Response.json({
    content:[
      {type:'tool-call',toolName:'search',toolCallId:'search-1',input:'{"query":"SSD"}',providerExecuted:true},
      {type:'tool-result',toolName:'search',toolCallId:'search-1',result:output},
    ],
    finishReason:{unified:'stop',raw:'stop'},
    usage:{inputTokens:{total:10},outputTokens:{total:10}},
  });
}

function fixtureSearch({fallbackModel=backupModel,reservations=2,respond}) {
  const calls=[];
  let reserved=0;
  const search=gatewaySearch({
    apiKey:'unit-test-only',model:primaryModel,fallbackModel,
    budget:{reserve(){if(reserved===reservations)return false;reserved++;return true;}},
    fetchImpl:async (_url,init)=>{
      const model=new Headers(init.headers).get('ai-language-model-id');
      calls.push({model,body:JSON.parse(init.body),signal:init.signal,reserved});
      return respond(calls.length);
    },
  });
  return {search,calls};
}

test('a single model and a successful empty search each make one Gateway call',async()=>{
  const single=fixtureSearch({fallbackModel:'',respond:()=>gatewayResult({id:'stub',results:[resultRow]})});
  assert.deepEqual(await single.search(searchRequest),[resultRow]);
  assert.deepEqual(single.calls.map(call=>call.model),[primaryModel]);
  const empty=fixtureSearch({respond:()=>gatewayResult({id:'stub',results:[]})});
  assert.deepEqual(await empty.search(searchRequest),[]);
  assert.deepEqual(empty.calls.map(call=>call.model),[primaryModel]);
});

test('a transient Gateway failure permits one different model under its own reservation and shared deadline',async()=>{
  const fixture=fixtureSearch({respond:attempt=>attempt===1?gatewayUnavailable():gatewayResult({id:'stub',results:[resultRow]})});
  assert.deepEqual(await fixture.search(searchRequest),[resultRow]);
  assert.deepEqual(fixture.calls.map(({model,reserved})=>[model,reserved]),[[primaryModel,1],[backupModel,2]]);
  assert.equal(fixture.calls[0].signal,fixture.calls[1].signal);
  for(const {body} of fixture.calls) {
    assert.equal(body.providerOptions.gateway.disallowPromptTraining,true);
    assert.equal(body.providerOptions.gateway.models,undefined);
  }
});

test('eligibility, budget, and cancellation stop the Gateway before an extra call',async()=>{
  const invalid=fixtureSearch({fallbackModel:'https://unapproved.example',respond:gatewayUnavailable});
  assert.equal(invalid.search,null);
  const duplicate=fixtureSearch({fallbackModel:primaryModel,respond:gatewayUnavailable});
  await assert.rejects(duplicate.search(searchRequest),{statusCode:503});
  assert.equal(duplicate.calls.length,1);

  const budget=fixtureSearch({reservations:1,respond:gatewayUnavailable});
  await assert.rejects(budget.search(searchRequest),/budget exhausted/);
  assert.equal(budget.calls.length,1);

  const controller=new AbortController();
  const cancelled=fixtureSearch({respond:()=>{controller.abort();return gatewayUnavailable();}});
  await assert.rejects(cancelled.search(searchRequest,{signal:controller.signal}),{name:'AbortError'});
  assert.equal(cancelled.calls.length,1);
});

test('a second failure, permission or billing errors, and missing tool results do not cause further calls',async()=>{
  const offline=fixtureSearch({respond:gatewayUnavailable});
  await assert.rejects(offline.search(searchRequest),{statusCode:503});
  assert.equal(offline.calls.length,2);
  for(const status of [401,402,403,429,500]) {
    const error=fixtureSearch({respond:()=>Response.json({error:{message:'Rejected'}},{status})});
    await assert.rejects(error.search(searchRequest),{statusCode:status});
    assert.equal(error.calls.length,1);
  }
  const incomplete=fixtureSearch({respond:()=>gatewayResult({error:'invalid_input',message:'Bad request'})});
  await assert.rejects(incomplete.search(searchRequest),/did not supply results/);
  assert.equal(incomplete.calls.length,1);
});
