/** VERSATZ rules v1. No DOM, randomness or AI. Board: 0 empty, +1 ivory, -1 teal. */
export const SIZE=5, PLY_LIMIT=120;
const FORMATIONS=[[1,2,3],[0,2,4],[0,1,3],[1,3,4]];
export const coordinate=i=>`${'ABCDE'[i%5]}${5-Math.floor(i/5)}`;
export const positionKey=s=>s.board.map(x=>x+1).join('')+(s.turn===1?'i':'t');
export function createGame({starter=1,formation=2}={}){
 if(![1,-1].includes(starter)||!Number.isInteger(formation)||!FORMATIONS[formation])throw Error('Ungültige Startstellung.');
 const board=Array(25).fill(0);for(const x of FORMATIONS[formation]){board[20+x]=1;board[4-x]=-1;}
 const s={version:2,initial:{starter,formation},board,turn:starter,ply:0,status:'playing',winner:null,reason:null,last:null,history:[],positions:[]};s.positions=[positionKey(s)];return s;
}
function valid(s,m){
 if(s.status!=='playing'||!m||!Number.isInteger(m.from)||!Number.isInteger(m.to)||m.from<0||m.from>24||m.to<0||m.to>24||![1,-1].includes(m.shift)||s.board[m.from]!==s.turn||s.board[m.to]===s.turn)return false;
 return Math.abs(m.from%5-m.to%5)+Math.abs(Math.floor(m.from/5)-Math.floor(m.to/5))===1;
}
export function legalMoves(s){
 if(s.status!=='playing')return [];const moves=[];
 for(let from=0;from<25;from++)if(s.board[from]===s.turn){for(const delta of [-5,-1,1,5]){const to=from+delta;const m={from,to,shift:-1};if(valid(s,m)){moves.push(m,{from,to,shift:1});}}}return moves;
}
/** Complete a step/capture, THEN slide; only the active side can win on its turn. */
export function advance(s,m){
 if(!valid(s,m))throw Error('Dieser Zug ist nicht erlaubt.');
 const board=s.board.slice(),row=Math.floor(m.to/5),capture=board[m.to]===-s.turn?m.to:null;
 board[m.from]=0;board[m.to]=s.turn;const strip=board.slice(row*5,row*5+5);
 for(let x=0;x<5;x++)board[row*5+(x+m.shift+5)%5]=strip[x];
 const n={board,turn:-s.turn,ply:s.ply+1,status:'playing',winner:null,reason:null,last:{...m,side:s.turn,row,capture,landing:row*5+(m.to%5+m.shift+5)%5}};
 if(!board.includes(-s.turn)){n.status='won';n.winner=s.turn;n.reason='elimination';}
 else if(board[s.turn===1?2:22]===s.turn){n.status='won';n.winner=s.turn;n.reason='gate';}
 else if(n.ply>=PLY_LIMIT){n.status='draw';n.reason='limit';}
 else if(!legalMoves(n).length){n.status='draw';n.reason='blocked';}
 return n;
}
export function applyMove(s,m){
 const next=advance(s,m),key=positionKey(next),positions=[...s.positions,key];
 if(next.status==='playing'&&positions.filter(k=>k===key).length>=3){next.status='draw';next.reason='repetition';}
 return {...s,...next,history:[...s.history,{from:m.from,to:m.to,shift:m.shift}],positions};
}
export function replay(s,count=s.history.length){
 if(!Number.isInteger(count)||count<0||count>s.history.length)throw Error('Ungültiger Replay-Zug.');
 let next=createGame(s.initial);for(const m of s.history.slice(0,count))next=applyMove(next,m);return next;
}
export const undo=(s,count=Math.max(0,s.history.length-1))=>replay(s,count);
export function validateSave(raw){
 try{
  if(!raw||raw.version!==2||!Array.isArray(raw.history)||raw.history.length>PLY_LIMIT||JSON.stringify(raw).length>50000)return null;
  const reconstructed=replay(raw);for(const k of Object.keys(reconstructed))if(JSON.stringify(raw[k])!==JSON.stringify(reconstructed[k]))return null;
  return reconstructed;
 }catch{return null;}
}
