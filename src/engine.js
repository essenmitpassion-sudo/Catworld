export const SIZE=7,GOAL=8,TURN_LIMIT=80;
export const ROLES={spark:{name:'Funke',symbol:'ϟ',beats:'ward',color:'#ffd58b'},ward:{name:'Schild',symbol:'⬡',beats:'shade',color:'#8ed6c3'},shade:{name:'Schatten',symbol:'◇',beats:'spark',color:'#c3a6f0'}};
export const RELAYS=[{x:1,y:3},{x:3,y:3},{x:5,y:3}],WALLS=[{x:3,y:2},{x:3,y:4}];
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]],HOME=[0,1,2,4,5,6];
export function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const at=(pieces,x,y)=>pieces.find(p=>p.x===x&&p.y===y);
const coordinate=p=>String.fromCharCode(65+p.x)+(p.y+1);
export function createGame(seed=731,starter=(seed>>>0)%2){
 if(starter!==0&&starter!==1)throw Error('Ungültige Startseite');
 const normalized=seed>>>0,rng=random(normalized),pieces=[];
 for(const side of [0,1]){const roles=['spark','spark','ward','ward','shade','shade'];for(let i=roles.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[roles[i],roles[j]]=[roles[j],roles[i]];}for(let i=0;i<6;i++)pieces.push({id:`${side}-${i}`,side,role:roles[i],x:HOME[i],y:side===0?5:1,revealed:false});}
 return {version:1,seed:normalized,phase:'setup',starter,turn:starter,pieces,fallen:[],signal:starter===0?[0,2]:[2,0],ply:0,winner:null,reason:'',log:[],last:null,history:[],deployment:pieces.filter(p=>p.side===0).map(({id,x,y})=>({id,x,y})),repetitions:{}};
}
export function swapSetup(input,a,b){
 if(input.phase!=='setup')throw Error('Die Aufstellung ist bereits abgeschlossen.');
 const s=structuredClone(input),p=s.pieces.find(p=>p.id===a&&p.side===0),q=s.pieces.find(p=>p.id===b&&p.side===0);if(!p||!q||p===q)throw Error('Wähle zwei eigene Figuren.');
 [p.x,q.x]=[q.x,p.x];[p.y,q.y]=[q.y,p.y];s.deployment=s.pieces.filter(p=>p.side===0).map(({id,x,y})=>({id,x,y}));return s;
}
export function startGame(input){if(input.phase!=='setup')throw Error('Die Partie läuft bereits.');const s=structuredClone(input);s.phase='playing';s.repetitions={[positionKey(s)]:1};return s;}
export function positionKey(s){return JSON.stringify([s.turn,s.signal,s.pieces.map(p=>[p.id,p.x,p.y,p.revealed]).sort((a,b)=>a[0].localeCompare(b[0]))]);}
export function observe(s,side){
 return {version:s.version,phase:s.phase,viewer:side,turn:s.turn,ply:s.ply,signal:[...s.signal],winner:s.winner,reason:s.reason,pieces:s.pieces.map(p=>({...p,role:p.side===side||p.revealed?p.role:null})),fallen:structuredClone(s.fallen),last:structuredClone(s.last),recent:structuredClone(s.history.slice(-6))};
}
export function scanTargets(view,piece){
 const targets=[];for(const [dx,dy] of DIRS)for(let n=1;n<=3;n++){const x=piece.x+dx*n,y=piece.y+dy*n;if(x<0||x>=SIZE||y<0||y>=SIZE||WALLS.some(w=>w.x===x&&w.y===y))break;const hit=at(view.pieces,x,y);if(hit){if(hit.side!==piece.side&&!hit.revealed)targets.push(hit);break;}}return targets;
}
export function legalActions(view){
 if(view.phase!=='playing')return[];const actions=[];
 for(const p of view.pieces.filter(p=>p.side===view.turn)){
  for(const [dx,dy] of DIRS){const x=p.x+dx,y=p.y+dy;if(x<0||x>=SIZE||y<0||y>=SIZE||WALLS.some(w=>w.x===x&&w.y===y)||at(view.pieces,x,y)?.side===p.side)continue;actions.push({type:'move',piece:p.id,x,y});}
  for(const t of scanTargets(view,p))actions.push({type:'scan',piece:p.id,target:t.id});
 }
 return actions.length?actions:[{type:'pass'}];
}
function nextOnRay(pieces,x,y,dx,dy){
 for(let n=1;n<SIZE;n++){const px=x+dx*n,py=y+dy*n;if(px<0||px>=SIZE||py<0||py>=SIZE||WALLS.some(w=>w.x===px&&w.y===py))return null;const p=at(pieces,px,py);if(p)return p;}return null;
}
export function isPincer(pieces,attacker,defender){const dx=defender.x-attacker.x,dy=defender.y-attacker.y;const support=nextOnRay(pieces,defender.x,defender.y,dx,dy);return support?.side===attacker.side;}
export function closingTargets(pieces,mover){return DIRS.map(([dx,dy])=>{const enemy=nextOnRay(pieces,mover.x,mover.y,dx,dy);if(!enemy||enemy.side===mover.side)return null;const support=nextOnRay(pieces,enemy.x,enemy.y,dx,dy);return support?.side===mover.side?enemy:null;}).filter(Boolean);}

export function combat(attacker,defender,pincer){if(pincer)return'attacker';if(attacker===defender)return'both';return ROLES[attacker].beats===defender?'attacker':'defender';}
function normalize(action,legal){return legal.find(a=>a.type===action?.type&&(a.type==='pass'||a.piece===action.piece&&(a.type==='move'?a.x===action.x&&a.y===action.y:a.target===action.target)));}
function finish(s,winner,reason){s.phase='over';s.winner=winner;s.reason=reason;}
export function relayCount(s,side){return RELAYS.filter(r=>s.pieces.some(p=>p.side===side&&p.x===r.x&&p.y===r.y)).length;}
export function applyAction(input,action){
 const valid=normalize(action,legalActions(observe(input,input.turn)));if(!valid)throw Error('Dieser Zug ist nicht erlaubt.');
 const s=structuredClone(input),actor=s.turn;let message='Kein legaler Zug: ausgesetzt.';
 const p=s.pieces.find(p=>p.id===valid.piece);
 if(valid.type==='move'){
  const target=at(s.pieces,valid.x,valid.y),from={x:p.x,y:p.y};s.last={type:'move',piece:p.id,from,to:{x:valid.x,y:valid.y},outcome:null,pincer:false};
  if(target){
   const pincer=isPincer(s.pieces,p,target),outcome=combat(p.role,target.role,pincer);p.revealed=true;target.revealed=true;
   const removed=outcome==='both'?[p,target]:outcome==='attacker'?[target]:[p];
   s.fallen.push(...removed.map(u=>({...u,revealed:true})));s.pieces=s.pieces.filter(u=>!removed.some(r=>r.id===u.id));
   message=`${actor===0?'Du':'Gegner'}: ${ROLES[p.role].name} gegen ${ROLES[target.role].name} auf ${coordinate(target)}. ${pincer?'Zange: Angreifer gewinnt.':outcome==='both'?'Gleiche Rolle: beide fallen.':outcome==='attacker'?'Angreifer gewinnt.':'Verteidiger gewinnt.'}`;s.last.outcome=outcome;s.last.pincer=pincer;
  }else message=`${actor===0?'Du':'Gegner'}: ${coordinate(p)} → ${coordinate(valid)}.`;
  if(s.pieces.some(u=>u.id===p.id)){p.x=valid.x;p.y=valid.y;const enclosed=closingTargets(s.pieces,p);if(enclosed.length){s.fallen.push(...enclosed.map(q=>({...q,revealed:true})));s.pieces=s.pieces.filter(q=>!enclosed.some(t=>t.id===q.id));s.last.pincer=true;s.last.trapped=enclosed.map(q=>q.id);message+=` Zange geschlossen: ${enclosed.map(q=>ROLES[q.role].name+' auf '+coordinate(q)).join(', ')} geschlagen.`;}}
 }else if(valid.type==='scan'){
  const t=s.pieces.find(p=>p.id===valid.target);p.revealed=true;t.revealed=true;s.last={type:'scan',piece:p.id,from:{x:p.x,y:p.y},to:{x:t.x,y:t.y}};
  message=`Echo: ${ROLES[p.role].name} auf ${coordinate(p)} und ${ROLES[t.role].name} auf ${coordinate(t)} sind jetzt offen.`;
 }else s.last={type:'pass'};
 s.ply++;s.history.push({...valid});s.log.push(message);
 const remaining=[0,1].map(side=>s.pieces.filter(p=>p.side===side).length);
 if(!remaining[0]||!remaining[1])finish(s,remaining[0]?0:remaining[1]?1:null,remaining[0]||remaining[1]?'Alle gegnerischen Figuren geschlagen.':'Beide letzten Figuren sind gefallen.');
 else{
  s.turn=1-actor;const gain=relayCount(s,s.turn);s.signal[s.turn]+=gain;
  if(gain)s.log.push(`${s.turn===0?'Du':'Gegner'} hält ${gain} Relais: +${gain} Signal.`);
  if(s.signal[s.turn]>=GOAL)finish(s,s.turn,`${GOAL} Signal erreicht. Die Relais wurden über den Gegenzug gehalten.`);
  else{
   const key=positionKey(s);s.repetitions[key]=(s.repetitions[key]??0)+1;
   if(s.repetitions[key]>=3)finish(s,null,'Dreifache Wiederholung derselben Stellung.');
   else if(s.ply>=TURN_LIMIT)finish(s,s.signal[0]===s.signal[1]?null:s.signal[0]>s.signal[1]?0:1,`Zuglimit ${TURN_LIMIT}: die höhere Signalzahl entscheidet; Gleichstand ist Remis.`);
  }
 }
 s.log=s.log.slice(-14);return s;
}
export function replayGame(saved,count=saved.history.length){
 let s=createGame(saved.seed,saved.starter);for(const p of s.pieces.filter(p=>p.side===0)){const pose=saved.deployment.find(d=>d.id===p.id);if(!pose)throw Error('Ungültige Aufstellung');p.x=pose.x;p.y=pose.y;}s.deployment=structuredClone(saved.deployment);if(saved.phase==='setup')return s;s=startGame(s);for(const a of saved.history.slice(0,count))s=applyAction(s,a);return s;
}
export function validateGame(raw){
 try{
  if(!raw||raw.version!==1||!Number.isInteger(raw.seed)||raw.seed<0||raw.seed>4294967295||!['setup','playing','over'].includes(raw.phase)||!Array.isArray(raw.deployment)||raw.deployment.length!==6||!Array.isArray(raw.history)||raw.history.length>TURN_LIMIT||JSON.stringify(raw).length>80000)return null;
  const cells=new Set(),ids=new Set();for(const p of raw.deployment){if(!/^0-[0-5]$/.test(p.id)||ids.has(p.id)||!HOME.includes(p.x)||p.y!==5||cells.has(p.x))return null;ids.add(p.id);cells.add(p.x);}
  const rebuilt=replayGame(raw);for(const key of Object.keys(rebuilt))if(JSON.stringify(raw[key])!==JSON.stringify(rebuilt[key]))return null;return rebuilt;
 }catch{return null;}
}
