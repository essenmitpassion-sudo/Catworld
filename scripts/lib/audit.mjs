import {createHash} from 'node:crypto';
import {createGame,applyMove,legalMoves} from '../../src/engine.js';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const reflect=i=>Math.floor(i/5)*5+4-i%5;
/** Coordinate/list oracle: no production legality, advance, key, terminal or repetition helpers. */
export function auditTranscript(initial,history){
 let actors=initial.board.flatMap((side,i)=>side?[{side,x:i%5,y:Math.floor(i/5)}]:[]),turn=initial.turn,ply=initial.ply,status=initial.status,winner=initial.winner,reason=initial.reason;
 const boardOf=()=>{const board=Array(25).fill(0);for(const p of actors)board[p.y*5+p.x]=p.side;return board;};
 const key=()=>JSON.stringify([boardOf(),turn]),counts=new Map([[key(),1]]);
 for(const move of history){
  if(status!=='playing')throw Error('Transcript continues after terminal outcome');
  if(!move||!Number.isInteger(move.from)||!Number.isInteger(move.to)||move.from<0||move.from>24||move.to<0||move.to>24||![1,-1].includes(move.shift))throw Error('Malformed action');
  const piece=actors.find(p=>p.y*5+p.x===move.from),target=actors.find(p=>p.y*5+p.x===move.to),x=move.to%5,y=Math.floor(move.to/5);
  if(!piece||piece.side!==turn||target?.side===turn||Math.abs(piece.x-x)+Math.abs(piece.y-y)!==1)throw Error('Illegal action');
  if(target)actors.splice(actors.indexOf(target),1);piece.x=x;piece.y=y;
  for(const p of actors)if(p.y===y){p.x+=move.shift;if(p.x===-1)p.x=4;else if(p.x===5)p.x=0;}
  const acting=turn;turn=-turn;ply++;
  if(!actors.some(p=>p.side===-acting)){status='won';winner=acting;reason='elimination';}
  else if(actors.some(p=>p.side===acting&&p.x===2&&p.y===(acting===1?0:4))){status='won';winner=acting;reason='gate';}
  else if(ply>=120){status='draw';reason='limit';}
  const k=key();counts.set(k,(counts.get(k)||0)+1);if(status==='playing'&&counts.get(k)>=3){status='draw';reason='repetition';}
 }
 return {board:boardOf(),turn,ply,status,winner,reason};
}
export function transformGame(game,kind){
 const rotate=kind==='rotate'||kind==='both',mirror=kind==='reflect'||kind==='both';
 let formation=game.initial.formation;if(mirror&&formation>=2)formation=5-formation;
 let next=createGame({formation,starter:rotate?-game.initial.starter:game.initial.starter});
 const index=i=>{let j=rotate?24-i:i;return mirror?reflect(j):j;};
 for(const m of game.history)next=applyMove(next,{from:index(m.from),to:index(m.to),shift:m.shift*(rotate?-1:1)*(mirror?-1:1)});
 return next;
}
export function traceIdentity(game){
 const encode=g=>[createGame(g.initial).board,g.initial.starter,g.history];
 const raw=hash(encode(game)),normalized=hash(['identity','rotate','reflect','both'].map(kind=>JSON.stringify(encode(kind==='identity'?game:transformGame(game,kind)))).sort()[0]);
 return {raw,normalized};
}
export function opening({formation=2,seed=1,plies=0}={}){
 let game=createGame({formation,starter:1}),word=(seed+0x9e3779b9)>>>0;
 const random=()=>{word^=word<<13;word^=word>>>17;word^=word<<5;return (word>>>0)/2**32;};
 for(let p=0;p<plies&&game.status==='playing';p++){const moves=legalMoves(game);game=applyMove(game,moves[Math.floor(random()*moves.length)]);}return game;
}
export function summarize(games){
 for(const g of games)if(g.claimedStarterWin!==undefined&&g.claimedStarterWin!==(g.winner===g.initial.starter))throw Error('Incorrect starter attribution');
 return {games:games.length,starterWins:games.filter(g=>g.winner===g.initial.starter).length,secondWins:games.filter(g=>g.winner===-g.initial.starter).length,draws:games.filter(g=>g.winner===null).length,uniqueTraces:new Set(games.map(g=>g.identity?.raw)).size,uniqueUpToRotationAndReflection:new Set(games.map(g=>g.identity?.normalized)).size,meanPlies:games.length?games.reduce((n,g)=>n+g.plies,0)/games.length:0};
}
