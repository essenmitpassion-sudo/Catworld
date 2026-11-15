import {legalMoves,applyMove} from './engine.js';
const goalFor=side=>side===1?2:22;
/** Exact one-turn wins, not a heuristic prediction of eventual safety. */
export function immediateWins(game){
 const wins=[];
 for(const move of legalMoves(game)){
  const next=applyMove(game,move);
  if(next.status==='won'&&next.winner===game.turn)wins.push({move,reason:next.reason,goal:next.reason==='gate'?goalFor(game.turn):null,landing:next.last.landing});
 }
 return wins;
}
/** Project the complete action and all legal immediate winning replies. Never mutates. */
export function previewMove(game,move){
 const next=applyMove(game,move),stepped=game.board.slice();
 const capture=stepped[move.to]===-game.turn?{cell:move.to,side:-game.turn}:null;
 stepped[move.from]=0;stepped[move.to]=game.turn;
 const row=Math.floor(move.to/5),transports=[];
 for(let x=0;x<5;x++){const from=row*5+x;if(stepped[from])transports.push({from,to:row*5+(x+move.shift+5)%5,side:stepped[from],mover:from===move.to});}
 return {game:next,capture,transports,goal:next.reason==='gate'?goalFor(next.winner):null,replyWins:immediateWins(next)};
}
