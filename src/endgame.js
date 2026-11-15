import {advance,applyMove,legalMoves,positionKey,PLY_LIMIT} from './engine.js';
const SLOTS=1250,STATES=1200;
const index=(ivory,jade,turn)=>(ivory*25+jade)*2+(turn===1?0:1);
let baseline=null,lastRestricted=null;
/** Exact finite attractor for one piece each. Previously twice-visited successor keys
 * are draw edges. Winning ranks strictly decrease under every defending reply, so
 * a decisive strategy never revisits a new state; other once-visited history keys
 * cannot become a third occurrence on that strategy. Remaining plies cap mate rank.
 */
function build(forbidden){
 const outcome=new Int8Array(SLOTS),distance=new Uint16Array(SLOTS),remaining=new Int16Array(SLOTS),longest=new Uint16Array(SLOTS),parents=Array.from({length:SLOTS},()=>[]),queue=[];let transitions=0;
 for(let ivory=0;ivory<25;ivory++)for(let jade=0;jade<25;jade++)if(ivory!==jade)for(const turn of[1,-1]){
  const id=index(ivory,jade,turn),board=Array(25).fill(0);board[ivory]=1;board[jade]=-1;
  const s={board,turn,ply:0,status:'playing'},children=new Set();let drawEdge=false;
  for(const move of legalMoves(s)){
   const next=advance(s,move);if(next.status==='won'){outcome[id]=1;distance[id]=1;continue;}
   if(forbidden.has(positionKey(next))){drawEdge=true;continue;}
   children.add(index(next.board.indexOf(1),next.board.indexOf(-1),next.turn));
  }
  remaining[id]=children.size+Number(drawEdge);transitions+=children.size+Number(drawEdge);
  for(const child of children)parents[child].push(id);if(outcome[id]===1)queue.push(id);
 }
 for(let head=0;head<queue.length;head++){
  const child=queue[head];for(const parent of parents[child])if(outcome[parent]===0){
   if(outcome[child]===-1){outcome[parent]=1;distance[parent]=distance[child]+1;queue.push(parent);}
   else{remaining[parent]--;longest[parent]=Math.max(longest[parent],distance[child]);if(remaining[parent]===0){outcome[parent]=-1;distance[parent]=longest[parent]+1;queue.push(parent);}}
  }
 }
 return {outcome,distance,states:STATES,transitions};
}
function tableFor(game){
 const counts=new Map();for(const key of game.positions)counts.set(key,(counts.get(key)||0)+1);
 // Material can only decrease. Repeats with more pieces cannot occur in a 1v1 future.
 const keys=[...counts].filter(([key,count])=>count>=2&&[...key.slice(0,25)].filter(c=>c==='0'||c==='2').length===2).map(([key])=>key).sort();
 if(!keys.length){baseline??=build(new Set());return baseline;}
 const signature=keys.join('|');if(lastRestricted?.signature===signature)return lastRestricted.table;
 const table=build(new Set(keys));lastRestricted={signature,table};return table;
}
export function solveOneVsOne(game){
 if(!Array.isArray(game.positions)||!Array.isArray(game.history)||game.status!=='playing'||game.board.filter(x=>x===1).length!==1||game.board.filter(x=>x===-1).length!==1||game.ply>=PLY_LIMIT)return null;
 const table=tableFor(game),choices=[];
 for(const move of legalMoves(game)){
  const next=applyMove(game,move);let value=0,distance=0;
  if(next.status==='won'){value=1;distance=1;}
  else if(next.status==='playing'){
   const id=index(next.board.indexOf(1),next.board.indexOf(-1),next.turn),rank=table.distance[id];
   if(rank<=PLY_LIMIT-next.ply){value=-table.outcome[id];distance=value?rank+1:0;}
  }
  choices.push({move,value,distance,terminalDraw:next.status==='draw'});
 }
 choices.sort((a,b)=>b.value-a.value||(a.value===1?a.distance-b.distance:a.value===-1?b.distance-a.distance:Number(b.terminalDraw)-Number(a.terminalDraw)));
 const chosen=choices[0];if(!chosen)return null;
 return {move:chosen.move,outcome:chosen.value===1?'win':chosen.value===-1?'loss':'draw',distance:chosen.distance,states:table.states,transitions:table.transitions};
}
