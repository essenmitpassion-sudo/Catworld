// Reproduce the focused deployment follow-up independently of the broad tournament.
import {createGame,applyMove,positionKey} from '../src/engine.js';
import {chooseMove} from '../src/ai.js';
import {writeFile} from 'node:fs/promises';
const currentFormations=[],additionalFixtures=[];
async function run(xs,formation,n,base,target){let starterWins=0,draws=0;for(let k=0;k<n;k++)for(const starter of [1,-1]){let s=createGame({starter,formation:formation??0});if(xs){s.board=Array(25).fill(0);for(const x of xs){s.board[20+x]=1;s.board[4-x]=-1;}s.positions=[positionKey(s)];}while(s.status==='playing')s=applyMove(s,chooseMove(s,{depth:3,nodeLimit:16000,seed:base+k+s.ply}).move);starterWins+=Number(s.winner===starter);draws+=Number(s.winner===null);target.push({...xs?{xs}:{formation},seed:base+k,starter,winner:s.winner,reason:s.reason,plies:s.ply});}console.log(JSON.stringify({xs,formation,games:n*2,starterWins,draws}));}
for(const formation of [0,2])await run(null,formation,32,2000,currentFormations);
for(const xs of [[0,1,2],[0,1,4],[0,2,3]])await run(xs,null,12,3000,additionalFixtures);
await writeFile('docs/balance-exploration.json',JSON.stringify({date:'2026-11-15',method:'depth3/nodeLimit16000, balanced policy, seeds listed, both starters. Additional three deployments are exploratory board fixtures, not selectable game modes.',currentFormations,additionalFixtures},null,2)+'\n');
