import {CONFIG,LINES,resolve,legalMoves} from './engine.js';

const MATE=100000;
const PROFILES={tactical:[0,1,10,75],gather:[0,2,16,55],pressure:[0,1,7,100]};
function hash(value) {value=Math.imul(value^(value>>>16),0x45d9f3b);value=Math.imul(value^(value>>>16),0x45d9f3b);return(value^(value>>>16))>>>0;}
function value(result,side,weights,ply) {
 if(result.over)return result.winner===null?0:result.winner===side?MATE-ply:-MATE+ply;
 const own=side+1,other=2-side;let score=0;
 for(const line of LINES) {
  let mine=0,theirs=0;
  for(const at of line){mine+=result.board[at]===own?1:0;theirs+=result.board[at]===other?1:0;}
  if(!theirs)score+=weights[mine];if(!mine)score-=weights[theirs];
 }
 for(let cell=0;cell<result.board.length;cell++)if(result.board[cell]) {
  const middle=(CONFIG.size-1)/2;
  const central=CONFIG.size-1-Math.abs(middle-Math.floor(cell/CONFIG.size))-Math.abs(middle-cell%CONFIG.size);
  score+=(result.board[cell]===own?1:-1)*central*.18;
 }
 return score;
}

/** Bounded iterative adversarial search. Public board, identical legal resolve. */
export function chooseMove(state,{depth=3,style='tactical',maxNodes=9000}={}) {
 const moves=legalMoves(state);if(!moves.length)throw Error('Kein erlaubter Zug.');
 depth=Math.max(1,Math.min(4,Number.isInteger(depth)?depth:3));
 maxNodes=Math.max(1000,Math.min(50000,Number.isFinite(maxNodes)?maxNodes:9000));
 const side=state.turn,weights=PROFILES[style]??PROFILES.tactical,abort=Symbol('budget');
 let nodes=0,salt=state.seed;
 for(const v of state.board)salt=hash(salt^v^0x9e3779b9);
 function candidates(board,actor,ply) {
  const list=[];
  for(let cell=0;cell<board.length;cell++)if(board[cell]===0) {
   if(++nodes>maxNodes)throw abort;
   const result=resolve(board,cell,actor);
   list.push({cell,result,score:value(result,side,weights,ply),tie:hash(salt^Math.imul(cell+1,2654435761))});
  }
  return list.sort((a,b)=>(actor===side?b.score-a.score:a.score-b.score)||a.tie-b.tie);
 }
 function search(result,actor,left,alpha,beta,ply) {
  if(result.over||left===0)return value(result,side,weights,ply);
  const options=candidates(result.board,actor,ply+1);
  // At the leaf every legal child has already been scored and sorted.
  if(left===1)return options[0].score;
  let best=actor===side?-Infinity:Infinity;
  for(const option of options) {
   const score=search(option.result,1-actor,left-1,alpha,beta,ply+1);
   if(actor===side){best=Math.max(best,score);alpha=Math.max(alpha,best);}
   else{best=Math.min(best,score);beta=Math.min(beta,best);}
   if(alpha>=beta)break;
  }
  return best;
 }
 const roots=candidates(state.board,side,1);
 let completed=roots[0].cell;
 if(roots[0].result.winner===side)return completed;
 for(let horizon=1;horizon<=depth;horizon++) {
  let best=-Infinity,chosen=completed;
  try {
   for(const option of roots) {
    const score=search(option.result,1-side,horizon-1,best,Infinity,1);
    if(score>best){best=score;chosen=option.cell;}
   }
   completed=chosen;
  }catch(error){if(error!==abort)throw error;break;}
 }
 return completed;
}
