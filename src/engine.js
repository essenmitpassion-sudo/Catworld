export const CONFIG=Object.freeze({hqIntegrity:6,influence:2,buffer:3,sendCost:2,sendPower:2,takeoverCost:1,autoPower:1,packetLife:8,maxTicks:24});
export const NODE_DEFS=[
 {id:0,name:'Westzentrale',kind:'hq',x:70,y:300,owner:0},
 {id:1,name:'Westhafen',kind:'town',x:255,y:155,owner:0},
 {id:2,name:'Westgarten',kind:'town',x:255,y:445,owner:0},
 {id:3,name:'Nordrelais',kind:'relay',x:450,y:95},
 {id:4,name:'Mittelrelais',kind:'relay',x:450,y:300},
 {id:5,name:'Südrelais',kind:'relay',x:450,y:505},
 {id:6,name:'Osthafen',kind:'town',x:645,y:155,owner:1},
 {id:7,name:'Ostgarten',kind:'town',x:645,y:445,owner:1},
 {id:8,name:'Ostzentrale',kind:'hq',x:830,y:300,owner:1}
];
const BASE_EDGES=[[0,1,1],[0,2,1],[1,3,1],[1,4,1],[2,4,2],[2,5,1],[3,6,1],[4,6,1],[4,7,2],[5,7,1],[6,8,1],[7,8,1],[3,4,1],[4,5,1],[0,4,3],[4,8,3]];
export const POLICIES=['tactical','pressure','network'];
export function createGame(seed=731,starter=(seed>>>0)%2){
 if(starter!==0&&starter!==1)throw Error('Ungültige Startseite');
 const s=seed>>>0,upper=s%3===1?2:1,lower=s%3===1?1:2,edges=BASE_EDGES.map(([a,b,delay])=>({a,b,delay:a===1&&b===4||a===4&&b===6?upper:a===2&&b===4||a===4&&b===7?lower:delay}));
 const outputs={1:3,2:5,3:4,4:s%2?5:3,5:4,6:3,7:5};
 return {version:3,seed:s,initialStarter:starter,starter,phase:'setup',turn:starter,acted:[false,false],tick:0,ply:0,nodes:NODE_DEFS.map(d=>({id:d.id,kind:d.kind,...(d.kind==='hq'?{owner:d.owner,integrity:CONFIG.hqIntegrity}:d.kind==='town'?{influence:d.owner===0?CONFIG.influence:-CONFIG.influence,buffer:2,out:outputs[d.id]}:{out:outputs[d.id],locked:false})})),edges,packets:[],nextPacket:1,history:[],log:[],last:null,winner:null,reason:''};
}
export function ownerOf(node){return node.kind==='hq'?node.owner:node.kind==='town'?node.influence>0?0:node.influence<0?1:null:null;}
export function edgeBetween(s,a,b){return s.edges.find(e=>e.a===a&&e.b===b||e.a===b&&e.b===a);}
export function neighbors(s,id){return s.edges.filter(e=>e.a===id||e.b===id).map(e=>e.a===id?e.b:e.a);}
export function startGame(input){if(input.phase!=='setup')throw Error('Die Partie läuft bereits.');return {...structuredClone(input),phase:'playing'};}
export function legalActions(s){
 if(s.phase!=='playing')return[];const actions=[];
 for(const n of s.nodes){if(n.kind==='town'&&ownerOf(n)===s.turn&&n.buffer>=CONFIG.sendCost)for(const to of neighbors(s,n.id))actions.push({type:'send',source:n.id,to});if(n.kind==='relay'&&!n.locked)for(const to of neighbors(s,n.id))if(to!==n.out)actions.push({type:'redirect',relay:n.id,to});}
 for(const p of s.packets)if(p.at!==null&&p.side!==s.turn&&!p.sealed&&s.nodes[s.turn===0?0:8].integrity>CONFIG.takeoverCost)actions.push({type:'takeover',packet:p.id});return actions;
}
function normalize(s,a){return legalActions(s).find(b=>b.type===a?.type&&(b.type==='send'?b.source===a.source&&b.to===a.to:b.type==='redirect'?b.relay===a.relay&&b.to===a.to:b.packet===a.packet));}
function emit(s,side,from,to,power){const p={id:'s'+s.nextPacket++,side,power,at:null,from,to,remaining:edgeBetween(s,from,to).delay,ttl:CONFIG.packetLife,sealed:false};s.packets.push(p);return p;}
const name=id=>NODE_DEFS[id].name;
function end(s,winner,reason){s.phase='over';s.winner=winner;s.reason=reason;}
function tickWorld(s){
 const arrivals=new Map(),survivors=[],events=s.last?.worldTick?[]:[...(s.last?.events??[])];
 for(const original of s.packets){const p={...original};if(p.at!==null){p.from=p.at;p.to=s.nodes[p.at].out;p.at=null;p.remaining=edgeBetween(s,p.from,p.to).delay;}p.remaining--;p.ttl--;
  if(p.remaining===0){const node=s.nodes[p.to];events.push({type:'arrival',packet:p.id,node:node.id,side:p.side,power:p.power});if(node.kind==='relay'){if(p.ttl>0){p.at=node.id;p.to=null;p.remaining=0;survivors.push(p);}else events.push({type:'expire',packet:p.id});}else{if(!arrivals.has(node.id))arrivals.set(node.id,[]);arrivals.get(node.id).push(p);}}
  else if(p.ttl>0)survivors.push(p);else events.push({type:'expire',packet:p.id});
 }
 s.packets=survivors;
 for(const [id,packets] of [...arrivals].sort((a,b)=>a[0]-b[0])){
  const node=s.nodes[id];if(node.kind==='hq'){const delta=packets.reduce((n,p)=>n+(p.side===node.owner?0:-p.power),0);node.integrity=Math.min(CONFIG.hqIntegrity,Math.max(0,node.integrity+delta));s.log.push(`${name(id)}: ${delta>=0?'+':''}${delta} Stabilität → ${node.integrity}/${CONFIG.hqIntegrity}.`);}
  else{const old=ownerOf(node),delta=packets.reduce((n,p)=>n+(p.side===0?p.power:-p.power),0);node.influence=Math.max(-CONFIG.influence,Math.min(CONFIG.influence,node.influence+delta));if(ownerOf(node)!==old)node.buffer=0;s.log.push(`${name(id)} empfängt ${packets.map(p=>(p.side===0?'West':'Ost')+' '+p.power).join(' / ')}. ${ownerOf(node)===null?'Jetzt neutral.':ownerOf(node)!==old?'Kontrolle wechselt.':'Kontrolle hält.'}`);}
 }
 s.tick++;
 const west=s.nodes[0].integrity,east=s.nodes[8].integrity;
 if(west===0||east===0)end(s,west>0?0:east>0?1:null,west===0&&east===0?'Beide Zentralen sind im selben Netztakt ausgefallen.':`${name(west===0?0:8)} hat ihre Stabilität verloren.`);
 if(s.phase==='playing'){
  for(const node of s.nodes)if(node.kind==='town'&&ownerOf(node)!==null){node.buffer=Math.min(CONFIG.buffer,node.buffer+1);if(node.buffer===CONFIG.buffer){node.buffer=0;const p=emit(s,ownerOf(node),node.id,node.out,CONFIG.autoPower);events.push({type:'auto',node:node.id,packet:p.id,side:p.side});}}
  if(s.tick>=CONFIG.maxTicks)end(s,null,`${CONFIG.maxTicks} Netztakte ohne Ausfall einer Zentrale: Remis.`);
 }
 for(const n of s.nodes)if(n.kind==='relay')n.locked=false;
 s.acted=[false,false];s.starter=1-s.starter;s.turn=s.starter;s.last={...(s.last??{}),worldTick:true,events};s.log=s.log.slice(-16);return s;
}
export function advanceWorld(input){if(input.phase!=='playing')return structuredClone(input);return tickWorld(structuredClone(input));}
export function applyAction(input,action){
 const valid=normalize(input,action);if(!valid)throw Error('Dieser Eingriff ist nicht erlaubt.');const s=structuredClone(input),side=s.turn,who=side===0?'Du':'Gegner';s.last={actor:side,action:{...valid},worldTick:false,events:[]};
 if(valid.type==='send'){const node=s.nodes[valid.source];node.buffer-=CONFIG.sendCost;node.out=valid.to;const p=emit(s,side,node.id,valid.to,CONFIG.sendPower);s.last.events.push({type:'send',node:node.id,packet:p.id,side});s.log.push(`${who}: Signal ${p.power} von ${name(node.id)} nach ${name(valid.to)}. Ständiger Ausgang angepasst.`);}
 else if(valid.type==='redirect'){s.nodes[valid.relay].out=valid.to;s.nodes[valid.relay].locked=true;s.log.push(`${who}: ${name(valid.relay)} leitet jetzt nach ${name(valid.to)} – für beide Seiten.`);}
 else{const p=s.packets.find(p=>p.id===valid.packet);p.side=side;p.sealed=true;s.nodes[side===0?0:8].integrity-=CONFIG.takeoverCost;s.last.events.push({type:'takeover',packet:p.id,node:p.at,side});s.log.push(`${who}: Signal ${p.power} im ${name(p.at)} übernommen und versiegelt (−${CONFIG.takeoverCost} eigene Stabilität).`);}
 s.acted[side]=true;s.ply++;s.history.push({...valid});if(s.acted[0]&&s.acted[1])tickWorld(s);else s.turn=1-side;s.log=s.log.slice(-16);return s;
}
/** Conditional forecast only: no later human/AI intervention. Never saved as real history. */
export function project(input,ticks=2){let s=structuredClone(input);for(let i=0;i<ticks&&s.phase==='playing';i++)s=tickWorld(s);return s;}
export function predictPacket(s,packet){
 let time=0,to=packet.at??packet.to,trail=packet.at!==null?[packet.at]:[packet.from,packet.to];if(packet.at===null)time=packet.remaining;
 for(let n=0;n<=CONFIG.packetLife;n++){
  const node=s.nodes[to];if(node.kind!=='relay')return {target:node.id,eta:time,expired:time>packet.ttl,trail};
  const next=node.out;time+=edgeBetween(s,to,next).delay;trail.push(next);to=next;if(time>packet.ttl)return {target:null,eta:time,expired:true,trail};
 }
 return {target:null,eta:packet.ttl+1,expired:true,trail};
}
export function replayGame(saved,count=saved.history.length){let s=createGame(saved.seed,saved.initialStarter);if(saved.phase==='setup')return s;s=startGame(s);for(const a of saved.history.slice(0,count))s=applyAction(s,a);return s;}
export function validateGame(raw){try{if(!raw||raw.version!==3||!Number.isInteger(raw.seed)||raw.seed<0||raw.seed>4294967295||![0,1].includes(raw.initialStarter)||!['setup','playing','over'].includes(raw.phase)||!Array.isArray(raw.history)||raw.history.length>CONFIG.maxTicks*2||JSON.stringify(raw).length>120000)return null;const rebuilt=replayGame(raw);for(const key of Object.keys(rebuilt))if(JSON.stringify(raw[key])!==JSON.stringify(rebuilt[key]))return null;return rebuilt;}catch{return null;}}
