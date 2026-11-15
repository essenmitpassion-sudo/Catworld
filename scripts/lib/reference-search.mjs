import {legalMoves,applyMove} from '../../src/engine.js';
const MATE=100000;
export function referenceValue(s,side,style='material'){
 if(s.status==='won')return (s.winner===side?1:-1)*(MATE-s.ply);if(s.status==='draw')return 0;
 let value=0;for(let i=0;i<25;i++)if(s.board[i]){const p=s.board[i],distance=p===1?Math.floor(i/5):4-Math.floor(i/5);let local=100;if(style==='race')local=70+(4-distance)*35;else if(style==='position')local=125+(4-distance)*16+(2-Math.abs(2-i%5))*4;value+=(p===side?1:-1)*local;}return value;
}
const mix=x=>{x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0;};
/** Separate research implementation; full immutable histories, different tie hash, no caches. */
export function chooseReference(game,{depth=3,nodeLimit=60000,style='material',seed=0}={}){
 let nodes=0,best=null,bestScore=0,completedDepth=0;const STOP=Symbol('budget');
 const children=s=>legalMoves(s).map(move=>({move,next:applyMove(s,move)})).sort((a,b)=>referenceValue(b.next,s.turn,style)-referenceValue(a.next,s.turn,style)||rank(a.move,s.turn)-rank(b.move,s.turn));
 function rank(m,side){return mix(seed^(side===1?m.from:24-m.from)*997^(side===1?m.to:24-m.to)*47^(m.shift*side===1?373:853));}
 function solve(s,d,alpha,beta){if(nodes>=nodeLimit)throw STOP;nodes++;if(s.status!=='playing'||!d)return referenceValue(s,s.turn,style);let result=-Infinity;for(const c of children(s)){result=Math.max(result,-solve(c.next,d-1,-beta,-alpha));alpha=Math.max(alpha,result);if(alpha>=beta)break;}return Number.isFinite(result)?result:0;}
 for(let d=1;d<=depth;d++){let winner=null,value=-Infinity,alpha=-Infinity;try{for(const c of children(game)){const score=-solve(c.next,d-1,-Infinity,-alpha);if(score>value){winner=c.move;value=score;}alpha=Math.max(alpha,value);}}catch(e){if(e!==STOP)throw e;break;}best=winner;bestScore=value;completedDepth=d;if(Math.abs(value)>MATE-200)break;}
 return {move:best||legalMoves(game)[0]||null,score:bestScore,nodes,completedDepth};
}
