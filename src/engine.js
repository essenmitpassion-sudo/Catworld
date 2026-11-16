// Pure deterministic rules. Ports in clockwise order: north, east, south, west.
export const SIZE=5, TARGET=8, LIMIT=10, HULL=12;
const clone=s=>structuredClone(s);
function random(seed) {
 let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);
 return ()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};
}
export function createGame(seed='MORGEN') {
 seed=String(seed).trim().toUpperCase();
 if(!/^[A-Z0-9-]{1,24}$/.test(seed))throw new Error('Nutze 1–24 Buchstaben, Zahlen oder Bindestriche.');
 const rng=random(seed),roll=n=>Math.floor(rng()*n);
 const board=Array.from({length:25},()=>({axis:roll(2)?'h':'v',pressure:roll(4)}));
 const schedule=Array.from({length:LIMIT},()=>{
  const a=6+roll(3)+5*roll(3);let b=6+roll(3)+5*roll(3);if(b===a)b=6+((b-6+1)%3)+5*Math.floor((b-6)/5);
  return [{index:a,amount:4},{index:b,amount:4}];
 });
 return {seed,board,schedule,turn:0,edits:0,hull:HULL,beacons:[0,0,0,0],status:'playing',last:null};
}
export function forecast(state,offset=0) {return clone(state.schedule[state.turn+offset]??[]);}
export function resolve(input,feeds=[]) {
 const board=clone(input),delivered=[0,0,0,0],events=[];let leaks=0;
 for(const {index,amount} of feeds) board[index].pressure+=amount;
 for(let step=0;;step++) {
  const fires=[];for(let i=0;i<25;i++)if(board[i].pressure>=4)fires.push(i);
  if(!fires.length)break;
  if(step>=10000)throw new Error('Drucknetz stabilisiert sich nicht.');
  const links=[];
  for(const i of fires)board[i].pressure-=4;
  for(const i of fires) {
   const x=i%5,y=Math.floor(i/5),dirs=board[i].axis==='h'?[[-1,0],[1,0]]:[[0,-1],[0,1]];
   for(const [dx,dy] of dirs) {
    const nx=x+dx,ny=y+dy;
    if(nx>=0&&nx<5&&ny>=0&&ny<5) {const to=ny*5+nx;board[to].pressure+=2;links.push({from:i,to,amount:2});}
    else {
     const port=ny<0&&x===2?0:nx>=5&&y===2?1:ny>=5&&x===2?2:nx<0&&y===2?3:-1;
     if(port>=0)delivered[port]+=2;else leaks++;
     links.push({from:i,to:null,dx,dy,port,leak:port<0,amount:2});
    }
   }
  }
  events.push({fires,links,pressure:board.map(c=>c.pressure)});
 }
 return {board,delivered,leaks,events};
}
export function edit(state,index,kind) {
 if(state.status!=='playing'||state.edits>=2)throw new Error('Keine Eingriffe mehr.');
 if(!Number.isInteger(index)||index<0||index>=25)throw new Error('Ungültiges Feld.');
 if(!['flip','vent'].includes(kind))throw new Error('Unbekannter Eingriff.');
 if(kind==='vent'&&state.board[index].pressure===0)throw new Error('Hier ist kein Druck zum Entlasten.');
 const next=clone(state);next.edits++;
 if(kind==='flip')next.board[index].axis=next.board[index].axis==='h'?'v':'h';
 else next.board[index].pressure=Math.max(0,next.board[index].pressure-2);
 return next;
}
export function advance(state) {
 if(state.status!=='playing')throw new Error('Die Partie ist beendet.');
 const next=clone(state),result=resolve(state.board,forecast(state));
 next.board=result.board;next.hull=Math.max(0,next.hull-result.leaks);next.beacons=state.beacons.map((n,i)=>Math.min(TARGET,n+result.delivered[i]));next.turn++;next.edits=0;
 next.status=next.hull<=0?'lost':next.beacons.every(n=>n>=TARGET)?'won':next.turn>=LIMIT?'lost':'playing';
 next.last=result;return next;
}
