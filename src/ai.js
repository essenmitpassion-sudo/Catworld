import {advance,legalMoves,positionKey} from './engine.js';
const WIN=100000;
/** Evaluation is a hypothesis. Exact wins/captures come from the same public rules. */
export function evaluate(s,side,style='balanced'){
 if(s.status==='won')return s.winner===side?WIN:-WIN;if(s.status==='draw')return 0;
 let score=0;const material=style==='capture'?200:125,progress=style==='race'?28:16;
 for(let i=0;i<25;i++)if(s.board[i]){const p=s.board[i],y=Math.floor(i/5),x=i%5,d=p===1?y:4-y;const value=material+(4-d)*progress+(2-Math.abs(2-x))*4;score+=p===side?value:-value;}
 return score;
}
/** Iterative alpha-beta; no transposition cache because repetition is path-dependent. */
export function chooseMove(game,{depth=3,nodeLimit=25000,style='balanced',seed=0}={}){
 const actions=legalMoves(game);if(!actions.length)return {move:null,score:evaluate(game,game.turn,style),nodes:0,completedDepth:0,prunedEquivalentMoves:0};
 depth=Math.max(1,Math.min(7,Math.floor(depth)||1));nodeLimit=Math.max(1,Math.floor(nodeLimit)||1);
 const counts=new Map();for(const k of game.positions||[positionKey(game)])counts.set(k,(counts.get(k)||0)+1);
 let prunedEquivalentMoves=0;
 let nodes=0,best=actions[0],bestScore=-Infinity,completedDepth=0;const STOP=Symbol('budget');
 const tie=m=>{let h=(seed^m.from*541^m.to*79^m.shift*17)>>>0;h=Math.imul(h^(h>>>16),2246822507);return h>>>0;};
 function children(s,preferred){
  const ordered=legalMoves(s).map(move=>{const next=advance(s,move),key=positionKey(next);if(next.status==='playing'&&(counts.get(key)||0)>=2){next.status='draw';next.reason='repetition';}return {move,next,key,value:evaluate(next,s.turn,style)};}).sort((a,b)=>Number(JSON.stringify(b.move)===JSON.stringify(preferred))-Number(JSON.stringify(a.move)===JSON.stringify(preferred))||b.value-a.value||tie(a.move)-tie(b.move));
  // Same parent, same ply/side/board/repetition count: future rules and value coincide.
  // This is local sibling deduplication, not a history-unsafe transposition cache.
  const seen=new Set();return ordered.filter(child=>{if(seen.has(child.key)){prunedEquivalentMoves++;return false;}seen.add(child.key);return true;});
 }
 function search(s,d,alpha,beta){
  if(nodes>=nodeLimit)throw STOP;nodes++;
  if(s.status!=='playing'||d===0){const score=evaluate(s,s.turn,style);return Math.abs(score)===WIN?Math.sign(score)*(WIN-s.ply):score;}
  let value=-Infinity;for(const c of children(s)){counts.set(c.key,(counts.get(c.key)||0)+1);let score;try{score=-search(c.next,d-1,-beta,-alpha);}finally{counts.set(c.key,counts.get(c.key)-1);}value=Math.max(value,score);alpha=Math.max(alpha,value);if(alpha>=beta)break;}return value===-Infinity?0:value;
 }
 for(let d=1;d<=depth;d++){
  let currentBest=null,currentScore=-Infinity,alpha=-Infinity;
  try{for(const c of children(game,best)){counts.set(c.key,(counts.get(c.key)||0)+1);let score;try{score=-search(c.next,d-1,-Infinity,-alpha);}finally{counts.set(c.key,counts.get(c.key)-1);}if(score>currentScore){currentScore=score;currentBest=c.move;}alpha=Math.max(alpha,score);}}
  catch(e){if(e!==STOP)throw e;break;}
  best=currentBest;bestScore=currentScore;completedDepth=d;if(Math.abs(bestScore)>WIN-200)break;
 }
 if(bestScore===-Infinity)bestScore=evaluate(advance(game,best),game.turn,style);
 return {move:best,score:bestScore,nodes,completedDepth,prunedEquivalentMoves};
}
