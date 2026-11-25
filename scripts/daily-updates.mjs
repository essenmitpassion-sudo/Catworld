// Server-only preference/eligibility boundary. accountId MUST be the subject
// returned by real authentication, never an account/email supplied in a body.
// Default off. Reads never create consent; repeated writes are idempotent.
// Supply an operator-owned SQLite path for durable storage (:memory: is useful
// for isolated tests). No route is mounted, no listener/provider/schedule is
// created. Briefs retain the quote's delivery basis for the current day.
import {DatabaseSync} from 'node:sqlite';
import {catalog,assess} from '../src/deals.mjs';

const validAccount=value=>typeof value==='string'&&/^[A-Za-z0-9:_|.-]{1,128}$/.test(value);
function account(value) {if(!validAccount(value))throw new Error('Invalid authenticated account');return value;}
function instant(now) {const value=now();if(!Number.isSafeInteger(value)||value<0)throw new Error('Invalid clock');return value;}
const sameBasis=(left,right)=>['Neu','Gebraucht','Generalüberholt'].includes(left.condition)
  &&left.condition===right.condition&&left.deliveryDestination?.country==='CH'
  &&typeof left.deliveryDestination.postalCode==='string'&&/^[1-9]\d{3}$/.test(left.deliveryDestination.postalCode)
  &&right.deliveryDestination?.country==='CH'&&left.deliveryDestination.postalCode===right.deliveryDestination.postalCode;
const production=row=>row&&typeof row==='object'&&row.testData!==true&&row.dataMode!=='test';
const calendar=new Intl.DateTimeFormat('en',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'});
function zurichDay(time) {
  const parts=Object.fromEntries(calendar.formatToParts(new Date(time)).map(part=>[part.type,part.value]));
  return parts.year+'-'+parts.month+'-'+parts.day;
}

export function createDailyUpdates({databasePath=':memory:',now=Date.now}={}) {
  const database=new DatabaseSync(databasePath);let closed=false;
  database.exec(`PRAGMA busy_timeout=1000;
    CREATE TABLE IF NOT EXISTS daily_update_preferences (
      account_id TEXT PRIMARY KEY NOT NULL,
      enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),
      updated_at TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS daily_update_briefings (
      account_id TEXT NOT NULL,
      day TEXT NOT NULL,
      payload TEXT,
      PRIMARY KEY(account_id,day)
    ) STRICT;`);
  const read=database.prepare('SELECT enabled,updated_at FROM daily_update_preferences WHERE account_id=?');
  const write=database.prepare(`INSERT INTO daily_update_preferences(account_id,enabled,updated_at) VALUES(?,?,?)
    ON CONFLICT(account_id) DO UPDATE SET enabled=excluded.enabled,updated_at=excluded.updated_at`);
  const remove=database.prepare('DELETE FROM daily_update_preferences WHERE account_id=?');
  const readBrief=database.prepare('SELECT payload FROM daily_update_briefings WHERE account_id=? AND day=?');
  const writeBrief=database.prepare('INSERT INTO daily_update_briefings(account_id,day,payload) VALUES(?,?,?)');
  const updateBrief=database.prepare('UPDATE daily_update_briefings SET payload=? WHERE account_id=? AND day=?');
  const cancelBrief=database.prepare('UPDATE daily_update_briefings SET payload=NULL WHERE account_id=?');
  const removeBrief=database.prepare('DELETE FROM daily_update_briefings WHERE account_id=?');
  const pruneBriefs=database.prepare('DELETE FROM daily_update_briefings WHERE account_id=? AND day<?');
  function transaction(work) {
    database.exec('BEGIN IMMEDIATE');
    try {const result=work();database.exec('COMMIT');return result;}
    catch(error){database.exec('ROLLBACK');throw error;}
  }
  function getPreference(accountId) {
    const row=read.get(account(accountId));
    return row?{enabled:row.enabled===1,updatedAt:row.updated_at}:{enabled:false,updatedAt:null};
  }
    // The caller supplies two account-scoped, trusted observation snapshots.
    // No baseline -> no claimed change. Historical checks may be old, but the
    // current check must independently pass the existing five-minute verifier,
    // be available, fully priced in CHF and on the same condition/destination.
    // Only a lower total or availability returning without a price increase is
    // useful enough for a daily digest. Duplicates/ambiguity and test data fail
    // closed. This method neither reserves nor reports a daily delivery: a
    // future worker MUST recheck opt-in, freshness and its own daily cadence
    // after asynchronous work and immediately before any external handoff.
  function eligibleDeals(accountId,{previous=[],current=[]}={}) {
      if(!getPreference(accountId).enabled)return [];
      if(!Array.isArray(previous)||!Array.isArray(current)||previous.length>128||current.length>128)throw new Error('Invalid observation snapshots');
      const time=instant(now),eligible=[];
      for(const product of catalog)for(const source of product.sources) {
        const before=previous.filter(row=>row?.url===source.url),after=current.filter(row=>row?.url===source.url);
        if(before.length!==1||after.length!==1||!production(before[0])||!production(after[0]))continue;
        const old=before[0],latest=after[0],oldTime=Date.parse(old.checkedAt),newTime=Date.parse(latest.checkedAt);
        if(!Number.isFinite(oldTime)||oldTime>=newTime||!sameBasis(latest,old))continue;
        const historical=assess(product,source,old,oldTime),fresh=assess(product,source,latest,time);
        if(historical.state!=='verified'||fresh.state!=='verified'||latest.stock!=='in-stock')continue;
        const change=fresh.total<historical.total?'lower-total'
          :old.stock==='out-of-stock'&&fresh.total===historical.total?'back-in-stock':null;
        if(change)eligible.push({...fresh,observation:structuredClone(fresh.observation),change,previousTotal:historical.total});
      }
      return eligible;
  }
  function freshBriefing(brief,time,day,current) {
    if(!brief||brief.date!==day||!Array.isArray(brief.items)||brief.items.length<1||brief.items.length>3
      ||!Number.isFinite(Date.parse(brief.createdAt))||Date.parse(brief.createdAt)>time)throw new Error('Invalid stored briefing');
    const items=brief.items.filter(item=>{
      const product=catalog.find(product=>product.mpn===item.observation?.mpn),source=product?.sources.find(source=>source.url===item.observation?.url);
      if(!source||!production(item.observation)||!sameBasis(item.observation,item.observation))return false;
      const saved=assess(product,source,item.observation,time);
      if(saved.state!=='verified'||saved.observation.stock!=='in-stock'||!Number.isSafeInteger(item.previousTotal)
        ||!(item.change==='lower-total'?item.previousTotal>saved.total:item.change==='back-in-stock'&&item.previousTotal===saved.total))return false;
      if(current!==undefined) {
        const matches=current.filter(row=>row?.url===source.url);
        if(matches.length!==1||!production(matches[0])||!sameBasis(matches[0],item.observation)
          ||Date.parse(matches[0].checkedAt)<Date.parse(item.observation.checkedAt))return false;
        const latest=assess(product,source,matches[0],time);
        if(latest.state!=='verified'||latest.observation.stock!=='in-stock'||latest.total!==saved.total)return false;
      }
      return true;
    });
    return items.length?{...brief,items}:null;
  }
  return Object.freeze({
    getPreference,
    setPreference(accountId,enabled) {
      account(accountId);if(typeof enabled!=='boolean')throw new Error('Invalid consent value');
      // Serialize the read/change pair across SQLite connections as well as
      // this process. An unchanged value keeps its original confirmation time.
      return transaction(()=>{
        const current=getPreference(accountId);
        if(current.enabled!==enabled)write.run(accountId,Number(enabled),new Date(instant(now)).toISOString());
        // Erase cancelled contents immediately, while keeping the account/day
        // tombstone: re-enabling does not recreate a second briefing that day.
        if(!enabled)cancelBrief.run(accountId);
        return getPreference(accountId);
      });
    },
    deleteAccount(accountId) {
      account(accountId);transaction(()=>{removeBrief.run(accountId);remove.run(accountId);});
    },
    eligibleDeals,
    // Local, retrievable evidence only: never a sent/delivered notification.
    // One frozen briefing per authenticated account and Zurich calendar day.
    // BEGIN IMMEDIATE + the unique key protect concurrent workers/restarts.
    // Empty/unverified changes do not consume the day. Existing contents must
    // still pass freshness on every read; they cannot be renewed that day.
    // External sending, cadence handoff and source refresh remain unimplemented.
    getDailyBriefing(accountId,snapshots={}) {
      account(accountId);
      const current=Object.hasOwn(snapshots,'current')?snapshots.current:undefined;
      if(current!==undefined&&(!Array.isArray(current)||current.length>128))throw new Error('Invalid observation snapshots');
      return transaction(()=>{
        if(!getPreference(accountId).enabled)return null;
        const time=instant(now),day=zurichDay(time);
        pruneBriefs.run(accountId,day);
        const saved=readBrief.get(accountId,day);
        if(saved) {
          if(saved.payload===null)return null;
          const briefing=freshBriefing(JSON.parse(saved.payload),time,day,current);
          // New contradictions remove old facts permanently without returning
          // the consumed day. Later reads cannot resurrect omitted evidence.
          updateBrief.run(briefing?JSON.stringify(briefing):null,accountId,day);
          return briefing;
        }
        const items=eligibleDeals(accountId,snapshots).slice(0,3);if(!items.length)return null;
        const brief={date:day,createdAt:new Date(time).toISOString(),items},payload=JSON.stringify(brief);
        if(Buffer.byteLength(payload)>65536)throw new Error('Briefing too large');
        writeBrief.run(accountId,day,payload);return brief;
      });
    },
    close() {if(!closed){database.close();closed=true;}},
  });
}

const origins=new Set(['https://localhost','capacitor://localhost']);
const path='/api/v1/preferences/daily-update';
const fault=status=>Object.assign(new Error('Preference request rejected'),{status});
function readBody(request,signal) {
  return new Promise((resolve,reject)=>{
    const chunks=[];let size=0,finished=false;
    const finish=(error,value)=>{
      if(finished)return;finished=true;
      request.off('data',data);request.off('end',end);request.off('error',failed);request.off('aborted',failed);signal.removeEventListener('abort',aborted);
      error?reject(error):resolve(value);
    };
    const failed=()=>finish(fault(400)),aborted=()=>finish(fault(504));
    const data=chunk=>{size+=chunk.length;if(size>256){request.pause();finish(fault(413));}else chunks.push(chunk);};
    const end=()=>{try{finish(null,JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks))));}catch{finish(fault(400));}};
    request.on('data',data);request.once('end',end);request.once('error',failed);request.once('aborted',failed);
    signal.addEventListener('abort',aborted,{once:true});if(signal.aborted)aborted();
  });
}

// Optional HTTP handler only. Mounting, real authentication, account lifecycle
// coordination, durable DB ownership and delivery integration remain separate.
// authenticate(token,{signal}) returns a trusted subject string or null. The
// handler accepts no account selector, cookie credentials or arbitrary origins.
export function createDailyUpdateHandler({store,authenticate,timeoutMs=5000}={}) {
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<20||timeoutMs>20000)throw new Error('Invalid preference timeout');
  const configured=typeof authenticate==='function'&&typeof store?.getPreference==='function'&&typeof store?.setPreference==='function';
  let active=0,attempts=0,windowEnds=0;
  return async(request,response)=>{
    const origin=request.headers.origin;
    const send=(status,payload)=>{
      if(response.destroyed||response.writableEnded)return;
      const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
        'Referrer-Policy':'no-referrer',Connection:'close',Vary:'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{})};
      if(status===204)Object.assign(headers,{'Access-Control-Allow-Methods':'GET, PUT','Access-Control-Allow-Headers':'authorization,content-type,accept'});
      if(status===405)headers.Allow='GET, PUT, OPTIONS';
      if(status===429)headers['Retry-After']='60';
      response.once('finish',()=>{if(!request.complete)request.destroy();});
      response.writeHead(status,headers).end(payload===undefined?undefined:JSON.stringify(payload));
    };
    if(request.url!==path)return send(404,{kind:'unavailable'});
    if(origin!==undefined&&!origins.has(origin))return send(403,{kind:'access-denied'});
    if(request.method==='OPTIONS') {
      const headers=(request.headers['access-control-request-headers']??'').split(',').map(value=>value.trim().toLowerCase()).filter(Boolean);
      if(!origins.has(origin)||!['GET','PUT'].includes(request.headers['access-control-request-method'])||headers.some(value=>!['authorization','content-type','accept'].includes(value)))return send(403,{kind:'access-denied'});
      return send(204);
    }
    if(!['GET','PUT'].includes(request.method))return send(405,{kind:'invalid'});
    if(!configured)return send(503,{kind:'unavailable'});
    if(request.headers.cookie!==undefined||request.rawHeaders.filter((value,index)=>index%2===0&&value.toLowerCase()==='authorization').length!==1)return send(403,{kind:'access-denied'});
    const authorization=request.headers.authorization;
    if(typeof authorization!=='string'||authorization.length>4103||!/^Bearer [-A-Za-z0-9._~+/]+=*$/.test(authorization))return send(401,{kind:'authentication-required'});
    const length=request.headers['content-length'];
    if(length!==undefined&&(!/^\d+$/.test(length)||Number(length)>256))return send(413,{kind:'invalid'});
    if(request.method==='GET'&&(request.headers['transfer-encoding']!==undefined||(length!==undefined&&Number(length)!==0)))return send(400,{kind:'invalid'});
    if(request.method==='PUT'&&!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type']??''))return send(415,{kind:'invalid'});
    const time=Date.now();if(time>=windowEnds){attempts=0;windowEnds=time+60000;}
    if(active>=4||attempts>=60)return send(429,{kind:'busy'});
    attempts++;active++;
    const controller=new AbortController(),disconnect=()=>{if(!response.writableEnded)controller.abort();};
    response.once('close',disconnect);
    const operation=(async()=>{
      try {
        let subject;try{subject=await authenticate(authorization.slice(7),{signal:controller.signal});}catch{throw fault(503);}
        if(controller.signal.aborted)throw fault(504);
        if(subject===null||subject===undefined)throw fault(401);
        if(!validAccount(subject))throw fault(403);
        let preference;
        if(request.method==='GET')preference=store.getPreference(subject);
        else {
          const value=await readBody(request,controller.signal);
          if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==1||!Object.hasOwn(value,'enabled')||typeof value.enabled!=='boolean')throw fault(400);
          if(controller.signal.aborted)throw fault(504);
          preference=store.setPreference(subject,value.enabled);
        }
        return {schemaVersion:1,...preference};
      }finally{active--;}
    })();
    let timer;
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(fault(504));},timeoutMs);});
    try{send(200,await Promise.race([operation,deadline]));}
    catch(error){const status=[400,401,403,413,504].includes(error.status)?error.status:503;send(status,{kind:status===504?'timeout':status===401?'authentication-required':status===403?'access-denied':status===400||status===413?'invalid':'unavailable'});}
    finally{clearTimeout(timer);response.off('close',disconnect);}
  };
}
