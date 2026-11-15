import {legalActions,applyAction,project,predictPacket,ownerOf,CONFIG} from './engine.js';
const weights={tactical:{hq:12,town:2.2,buffer:.25},pressure:{hq:17,town:1.1,buffer:.12},network:{hq:9,town:4,buffer:.4}};
function value(s,side,w){
 if(s.phase==='over')return s.winner===null?0:s.winner===side?10000:-10000;
 const own=s.nodes[side===0?0:8],enemy=s.nodes[side===0?8:0];let score=(own.integrity-enemy.integrity)*w.hq;
 for(const n of s.nodes)if(n.kind==='town'){score+=n.influence*(side===0?1:-1)*w.town;const owner=ownerOf(n);if(owner!==null)score+=(owner===side?1:-1)*(1.4+n.buffer*w.buffer);}
 for(const p of s.packets){const f=predictPacket(s,p);if(f.expired){score+=(p.side===side?-1:1)*p.power*.15;continue;}const target=s.nodes[f.target],sign=p.side===side?1:-1;
  if(target.kind==='hq'){if(target.owner!==p.side)score+=sign*p.power*w.hq*.7/(1+f.eta*.35);else score+=0;}
  else {const next=Math.max(-CONFIG.influence,Math.min(CONFIG.influence,target.influence+(p.side===0?p.power:-p.power)));score+=(next-target.influence)*(side===0?1:-1)*w.town/(1+f.eta*.3);}
 }
 return score;
}
function evaluate(s,side,w){const current=value(s,side,w);if(s.phase==='over')return current;return current*.3+value(project(s,2),side,w)*.7;}
/** All state is public. Search uses exactly the player's legal transitions. */
export function chooseAction(state,style='tactical'){
 if(state.phase!=='playing')throw Error('Keine laufende Partie');const side=state.turn,w=weights[style]??weights.tactical;
 const options=legalActions(state).map((action,index)=>{const next=applyAction(state,action);return{action,next,index,score:evaluate(next,side,w)};}).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,8);
 let best=options[0],score=-Infinity;
 for(const option of options){let future=option.score;
  if(option.next.phase==='playing'){
   const replies=legalActions(option.next).map(a=>evaluate(applyAction(option.next,a),side,w));future=option.next.turn===side?Math.max(...replies):Math.min(...replies);
  }
  const combined=future*.8+option.score*.2;if(combined>score+1e-9){score=combined;best=option;}
 }
 return {...best.action};
}
