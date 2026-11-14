import {legalActions,ROLES,RELAYS,isPincer,combat,random,GOAL} from './engine.js';
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const occupying=(pieces,side)=>RELAYS.filter(r=>pieces.some(p=>p.side===side&&p.x===r.x&&p.y===r.y)).length;
function beliefs(v){const count={spark:2,ward:2,shade:2};for(const p of [...v.pieces,...v.fallen])if(p.side!==v.viewer&&p.role)count[p.role]=Math.max(0,count[p.role]-1);const total=Object.values(count).reduce((a,b)=>a+b,0);return Object.entries(count).map(([role,n])=>({role,p:total?n/total:1/3}));}
function hash(v){let n=2166136261;for(const c of JSON.stringify([v.ply,v.viewer,v.pieces])){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
function boardValue(pieces,v,style){
 const own=pieces.filter(p=>p.side===v.viewer),enemy=pieces.filter(p=>p.side!==v.viewer);
 if(!own.length||!enemy.length)return own.length?10000:enemy.length?-10000:0;
 const held=occupying(pieces,v.viewer),opponent=occupying(pieces,1-v.viewer);
 if(v.signal[1-v.viewer]+opponent>=GOAL)return -9000;
 let value=(own.length-enemy.length)*(style==='aggressive'?11:9)+held*8-opponent*9;
 for(const r of RELAYS){value-=Math.min(...own.map(p=>distance(p,r)))*1.05;value+=Math.min(...enemy.map(p=>distance(p,r)))*.3;}
 for(const p of own){
  value-=Math.min(...RELAYS.map(r=>distance(p,r)))*.16;
  const threats=enemy.filter(e=>distance(e,p)===1);
  for(const e of threats){if(isPincer(pieces,e,p))value-=12;else if(e.role&&p.role&&combat(e.role,p.role,false)==='attacker')value-=5;else if(!e.role)value-=.85;}
  if(!p.revealed)value+=.12;
 }
 return value;
}
/** Deliberately accepts an observation, never a full game state or hidden setup seed. */
export function chooseAction(view,style='balanced'){
 if(view.viewer!==view.turn||view.phase!=='playing')throw Error('AI needs its own live observation.');
 const actions=legalActions(view),rng=random(hash(view)),unknown=beliefs(view),side=view.viewer;
 let best=actions[0],bestScore=-Infinity;
 for(const action of actions){
  const p=view.pieces.find(p=>p.id===action.piece);let value;
  if(action.type==='pass')value=boardValue(view.pieces,view,style)-10;
  else if(action.type==='scan'){
   const target=view.pieces.find(p=>p.id===action.target),copy=view.pieces.map(q=>q.id===p.id?{...q,revealed:true}:q);
   value=boardValue(copy,view,style)+(style==='cautious'?3.4:style==='aggressive'?1:2.1)+(distance(p,target)<=2?.7:0)-(p.revealed?0:.4);
  }else{
   const target=view.pieces.find(q=>q.x===action.x&&q.y===action.y);
   if(!target){const copy=view.pieces.map(q=>q.id===p.id?{...q,x:action.x,y:action.y}:q);value=boardValue(copy,view,style);}
   else{
    const pincer=isPincer(view.pieces,p,target),possibilities=target.role?[{role:target.role,p:1}]:unknown;value=0;
    for(const belief of possibilities){const outcome=combat(p.role,belief.role,pincer);const copy=view.pieces.filter(q=>outcome==='both'?q.id!==p.id&&q.id!==target.id:outcome==='attacker'?q.id!==target.id:q.id!==p.id).map(q=>q.id===p.id?{...q,x:action.x,y:action.y,revealed:true}:q.id===target.id?{...q,role:belief.role,revealed:true}:q);value+=belief.p*boardValue(copy,view,style);}
    if(pincer)value+=1;
   }
   const previous=view.recent.findLast(a=>a.type==='move'&&a.piece===p.id);if(previous&&previous.x===action.x&&previous.y===action.y)value-=.8;
  }
  value+=rng()*.12;
  if(value>bestScore){bestScore=value;best=action;}
 }
 return {...best};
}
