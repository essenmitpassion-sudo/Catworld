/** SOG's public, deterministic rules. No rendering, clocks or random rolls. */
export const CONFIG = Object.freeze({size:5, target:4, maxMoves:23});
const SIZE = CONFIG.size;
const inside = (r,c) => r>=0 && r<SIZE && c>=0 && c<SIZE;
export const LINES = Object.freeze((() => {
 const lines=[];
 for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
  if(inside(r+dr*(CONFIG.target-1),c+dc*(CONFIG.target-1)))
   lines.push(Object.freeze(Array.from({length:CONFIG.target},(_,i)=>(r+dr*i)*SIZE+c+dc*i)));
 }
 return lines;
})());

export function createGame(seed=13,starter=0) {
 if(!Number.isInteger(seed)||seed<0||seed>4294967295||![0,1].includes(starter))throw Error('Ungültiger Partiestart.');
 const opening=seed%24,cell=opening>=12?opening+1:opening,board=Array(SIZE*SIZE).fill(0);
 board[cell]=1;board[SIZE*SIZE-1-cell]=2;
 return {version:4,seed,starter,turn:starter,phase:'playing',board,history:[],ply:0,last:null,winner:null,winning:[[],[]],reason:''};
}

/** Place, then attract the nearest pre-existing stone on each cardinal ray. */
export function resolve(board,cell,side) {
 if(!Array.isArray(board)||board.length!==SIZE*SIZE||![0,1].includes(side)||!Number.isInteger(cell)||cell<0||cell>=board.length||board[cell]!==0)
  throw Error('Hier kannst du keinen Stein setzen.');
 const next=[...board],pulls=[],row=Math.floor(cell/SIZE),col=cell%SIZE;
 next[cell]=side+1;
 for(const [dr,dc] of [[-1,0],[0,1],[1,0],[0,-1]]) {
  for(let distance=1;inside(row+dr*distance,col+dc*distance);distance++) {
   const from=(row+dr*distance)*SIZE+col+dc*distance;
   if(!board[from])continue;
   if(distance>1) {
    const to=from-dr*SIZE-dc;
    next[to]=board[from]; next[from]=0;
    pulls.push({from,to,side:board[from]-1});
   }
   break;
  }
 }
 const lines=[[],[]];
 for(const line of LINES)if(next[line[0]]&&line.every(at=>next[at]===next[line[0]]))lines[next[line[0]]-1].push([...line]);
 const both=lines[0].length>0&&lines[1].length>0;
 const winner=both?null:lines[0].length?0:lines[1].length?1:null;
 const full=!next.includes(0),over=both||winner!==null||full;
 return {board:next,pulls,lines,winner,over,reason:both?'double-line':winner!==null?'line':full?'full':''};
}

export function legalMoves(state) {
 return state.phase==='playing'?state.board.flatMap((value,cell)=>value===0?[cell]:[]):[];
}
export function applyMove(state,cell) {
 if(state.phase!=='playing')throw Error('Diese Partie ist beendet.');
 const result=resolve(state.board,cell,state.turn);
 return {...state,board:result.board,history:[...state.history,cell],ply:state.ply+1,turn:1-state.turn,
  last:{cell,side:state.turn,pulls:result.pulls},phase:result.over?'over':'playing',
  winner:result.winner,winning:result.lines,reason:result.reason};
}
export function replayGame(saved,count=saved.history.length) {
 if(!Number.isInteger(count)||count<0||count>saved.history.length)throw Error('Ungültiger Verlauf.');
 let state=createGame(saved.seed,saved.starter);
 for(const cell of saved.history.slice(0,count))state=applyMove(state,cell);
 return state;
}
export function validateGame(raw) {
 try {
  if(!raw||raw.version!==4||!Array.isArray(raw.history)||raw.history.length>CONFIG.maxMoves||JSON.stringify(raw).length>16000)return null;
  const rebuilt=replayGame(raw);
  if(Object.keys(raw).length!==Object.keys(rebuilt).length)return null;
  for(const key of Object.keys(rebuilt))if(JSON.stringify(raw[key])!==JSON.stringify(rebuilt[key]))return null;
  return rebuilt;
 } catch {return null;}
}
