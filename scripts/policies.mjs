import {edit,advance} from '../src/engine.js';
export function evaluate(s,style='balanced') {
 const gain=s.beacons.reduce((a,c)=>a+c,0),min=Math.min(...s.beacons);
 return (s.status==='won'?10000:0)-(s.status==='lost'?10000:0)+gain*5+min*(style==='balanced'?5:0)+s.hull*(style==='safe'?12:5);
}
export function choose(state,style='balanced') {
 if(style==='idle')return [];
 const actions=s=>[...s.board.flatMap((c,i)=>[{index:i,kind:'flip'},...(c.pressure>0?[{index:i,kind:'vent'}]:[])])];
 let candidates=[{s:state,path:[]}];
 for(let depth=0;depth<2;depth++) {
  const expanded=[...candidates];
  for(const {s,path} of candidates.filter(x=>x.path.length===depth)) for(const a of actions(s)) {
   const n=edit(s,a.index,a.kind);expanded.push({s:n,path:[...path,a]});
  }
  for(const c of expanded) {
   const n=advance(c.s);c.score=evaluate(n,style)-c.path.length*.03;
   if(n.status==='playing')c.score+=evaluate(advance(n),style)*.35;
  }
  expanded.sort((a,b)=>b.score-a.score);candidates=expanded.slice(0,8);
 }
 return candidates[0].path;
}
