import {CONFIG,createGame,applyMove,resolve,legalMoves,replayGame,validateGame} from './engine.js';
import {chooseMove} from './ai.js';

const KEY='sog.match',SIZE=CONFIG.size,MOTION=320,AI_DELAY=560;
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let storageOK=true,loadNote='',game,aiTimer,settleTimer,generation=0,animating=false;
let review=null,preview=null,renderedPly=-1,renderedBoard=[],tokens=new Map(),keyboardCell=12,keyboardInput=false;
try {
 const raw=localStorage.getItem(KEY);
 if(raw){
  try {game=validateGame(JSON.parse(raw));}catch {game=null;}
  if(!game)loadNote='Die gespeicherte Partie war beschädigt. Ein neues Brett ist bereit.';
 }
}catch {storageOK=false;}
const params=new URLSearchParams(location.search),seed=Number(params.get('seed')),starter=Number(params.get('starter')??0);
if(params.has('seed')&&Number.isInteger(seed)&&seed>=0&&seed<=4294967295) {
 if(!game||game.seed!==seed||game.starter!==starter)game=createGame(seed,starter===1?1:0);
}
if(!game)game=createGame(13,0);
// A replayed URL must not force an old seed over a later saved rematch.
if(location.search)history.replaceState(null,'',location.pathname);

$('app').innerHTML=`
<header class="top"><a class="brand" href="#" aria-label="SOG"><svg viewBox="0 0 44 32" aria-hidden="true"><path d="M2 16h9m22 0h9"/><circle cx="22" cy="16" r="9"/><path d="m7 12 4 4-4 4m30-8-4 4 4 4"/></svg><span>SOG</span></a><span class="tagline">Ein Stein verändert das Ganze.</span></header>
<main><section class="game" aria-label="Partie gegen den Computer">
 <div class="match-head"><div class="players"><span><i class="blue-dot"></i> DU</span><span class="divider">/</span><span><i class="red-dot"></i> ROT</span></div><span id="turn-count"></span></div>
 <div class="instruction"><h1 id="status" aria-live="polite"></h1><p id="goal"><span class="four" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Vier in einer Reihe gewinnen.</p></div>
 <div id="stage" class="stage"><div id="board" role="group" aria-label="Spielfeld. Pfeiltasten wählen ein freies Feld, Enter setzt einen Stein."></div><svg id="arrows" viewBox="0 0 500 500" aria-hidden="true"></svg><div id="stones" aria-hidden="true"></div><div id="ghosts" aria-hidden="true"></div></div>
 <p id="hint" class="hint" aria-live="polite"></p>
 <div id="result" class="result" hidden></div>
 <div id="replay-panel" class="replay-panel" hidden><div><span id="replay-label"></span><button id="replay-close" class="text-button">Zur Partie</button></div><input id="replay-range" type="range" min="0" value="0" aria-label="Vergangenen Zug ansehen"></div>
 <div class="controls"><button id="undo" class="button secondary"><span aria-hidden="true">↶</span> Zurück</button><button id="new-game" class="button">Neue Partie</button></div>
 <div class="under-board"><details id="rules"><summary>Wie geht’s?</summary><ol><li>Tippe auf ein freies Feld: Dort setzt du einen blauen Stein.</li><li>Er zieht in jeder geraden Richtung den nächsten Stein ein Feld näher – auch rote. Direkt benachbarte Steine bleiben stehen und halten weiter entfernte auf.</li><li>Vier gleiche Farben in einer Reihe gewinnen, auch diagonal. Du kannst dabei Rot zum Sieg ziehen. Entstehen beide Reihen gleichzeitig oder ist das Brett ohne Reihe voll, gibt es ein Remis.</li></ol><p>Vor dem Klicken zeigt die Vorschau, was sich bewegt. Am Handy siehst du sie beim Gedrückthalten. „Zurück“ nimmt deinen letzten Zug samt Antwort zurück.</p></details><button id="watch" class="text-button" hidden>Verlauf</button></div>
 <p id="storage-note" class="storage-note" role="status"></p>
</section><aside class="side-note" aria-hidden="true"><span class="serial">01 / SOG</span><div class="side-art"><i></i><i></i><i></i><i></i></div><p>Du setzt einen.<br>Das Brett antwortet.</p><span class="side-caption">Ein kleines Duell mit Anziehung.</span></aside></main>`;
const cells=Array.from({length:SIZE*SIZE},(_,cell)=>{
 const button=document.createElement('button');button.type='button';button.dataset.cell=cell;button.className='cell';
 button.addEventListener('click',()=>playHuman(cell));
 button.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')showPreview(cell);});
 button.addEventListener('pointerleave',()=>clearPreview());
 button.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')showPreview(cell);});
 button.addEventListener('pointercancel',clearPreview);
 button.addEventListener('focus',()=>{keyboardCell=cell;showPreview(cell);});
 button.addEventListener('blur',clearPreview);
 $('board').append(button);return button;
});
$('board').style.setProperty('--size',SIZE);
$('board').addEventListener('keydown',event=>{
 keyboardInput=true;const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-SIZE,ArrowDown:SIZE}[event.key];
 if(delta===undefined)return;event.preventDefault();
 let cell=keyboardCell;
 for(let n=0;n<SIZE*SIZE;n++){cell=(cell+delta+SIZE*SIZE)%(SIZE*SIZE);if(!cells[cell].disabled){cells[cell].focus();break;}}
});
$('board').addEventListener('pointerdown',()=>{keyboardInput=false;});
$('board').addEventListener('pointerleave',clearPreview);
$('undo').addEventListener('click',undo);
$('new-game').addEventListener('click',()=>{
 cancelWork();review=null;loadNote='';
 game=createGame((Math.imul(game.seed,1664525)+1013904223)>>>0,1-game.starter);
 resetVisual();save();render();scheduleAI();
});
$('watch').addEventListener('click',()=>{
 cancelWork();review=game.ply;resetVisual();render();
});
$('replay-range').addEventListener('input',event=>{review=Number(event.target.value);resetVisual();render();});
$('replay-close').addEventListener('click',()=>{review=null;resetVisual();render();scheduleAI();});
$('rules').addEventListener('toggle',()=>clearPreview());
document.querySelector('.brand').addEventListener('click',e=>e.preventDefault());

function save() {
 try {localStorage.setItem(KEY,JSON.stringify(game));}catch {storageOK=false;}
}
function cancelWork() {
 generation++;clearTimeout(aiTimer);clearTimeout(settleTimer);aiTimer=settleTimer=undefined;animating=false;clearPreview();
}
function resetVisual() {renderedPly=-1;renderedBoard=[];for(const token of tokens.values())token.remove();tokens=new Map();}
function current() {return review===null?game:replayGame(game,review);}
function canPlay() {return review===null&&!animating&&game.phase==='playing'&&game.turn===0;}
function description(s) {
 if(s.reason==='double-line')return 'Beide Farben haben eine Viererreihe. Remis.';
 if(s.reason==='full')return 'Das Brett ist voll. Keine Viererreihe – Remis.';
 return s.winner===0?'Vier blaue Steine bilden eine Reihe.':'Vier rote Steine bilden eine Reihe.';
}
function ordinaryHint(s) {
 if(review!==null)return review===0?'Die beiden Startsteine. Der Verlauf verändert deine Partie nicht.':`Zug ${review}: ${s.last.side===0?'Blau':'Rot'} setzte einen Stein${s.last.pulls.length?' und zog '+s.last.pulls.length+' näher':''}.`;
 if(loadNote)return loadNote;
 if(s.ply<2)return 'Er zieht die nächsten Steine ein Feld näher. Auch rote.';
 if(s.last?.pulls.length){const own=s.last.pulls.filter(p=>p.side===s.last.side).length,enemy=s.last.pulls.length-own;return `${s.last.side===0?'Dein':'Rots'} Sog: ${own} ${own===1?'eigener Stein':'eigene Steine'}, ${enemy} ${enemy===1?'gegnerischer Stein':'gegnerische Steine'} bewegt.`;}
 return 'Gerade Nachbarn bleiben stehen. Weiter entfernte rücken näher.';
}
function updateStatus() {
 const s=current();$('stage').classList.toggle('readonly',!canPlay());
 $('status').className='';
 if(review!==null){$('status').textContent='Dein Blick zurück.';$('status').className='review-status';}
 else if(animating){$('status').textContent=s.last.side===0?'Dein Stein zieht.':'Rot zieht.';$('status').className=s.last.side===0?'blue-text':'red-text';}
 else if(s.phase==='over'){$('status').textContent=s.winner===0?'Du gewinnst.':s.winner===1?'Rot gewinnt.':'Unentschieden.';$('status').className=s.winner===0?'blue-text':s.winner===1?'red-text':'';}
 else {$('status').textContent=s.turn===0?'Setze einen blauen Stein.':'Rot denkt …';$('status').className=s.turn===0?'blue-text':'red-text';}
 $('turn-count').textContent=s.ply?`ZUG ${s.ply}`:'';
 $('result').hidden=s.phase!=='over'||animating||review!==null;$('result').textContent=s.phase==='over'?description(s):'';
 $('hint').textContent=ordinaryHint(s);$('hint').className='hint';
 const hasHuman=game.history.some((_,i)=>(game.starter+i)%2===0);
 $('undo').disabled=review!==null||!hasHuman;
 $('watch').hidden=game.ply===0||review!==null;
 $('replay-panel').hidden=review===null;
 $('replay-range').max=game.ply;$('replay-range').value=review??game.ply;
 $('replay-label').textContent=review===0?'Anfang':`Zug ${review} / ${game.ply}`;
 $('storage-note').textContent=storageOK?'':'Ohne Speicher: Die Partie bleibt nur in diesem Fenster.';
 const available=legalMoves(s);if(!available.includes(keyboardCell))keyboardCell=available[0]??0;
 for(let cell=0;cell<cells.length;cell++) {
  const color=s.board[cell];cells[cell].disabled=!canPlay()||color!==0;
  cells[cell].tabIndex=cell===keyboardCell?0:-1;
  cells[cell].setAttribute('aria-label',`Reihe ${Math.floor(cell/SIZE)+1}, Spalte ${cell%SIZE+1}. ${color===1?'Blauer Stein':color===2?'Roter Stein':'Freies Feld. Stein setzen'}`);
 }
}
function center(cell){return {x:(cell%SIZE+.5)*500/SIZE,y:(Math.floor(cell/SIZE)+.5)*500/SIZE};}
function position(token,cell) {token.style.left=`${(cell%SIZE+.5)/SIZE*100}%`;token.style.top=`${(Math.floor(cell/SIZE)+.5)/SIZE*100}%`;}
function makeStone(color,cell,extra='') {const el=document.createElement('i');el.className=`stone ${color===1?'blue':'red'} ${extra}`;position(el,cell);return el;}
function drawArrows(pulls,kind='trail') {
 const marker=kind==='preview'?'preview-arrow':'trail-arrow';
 $('arrows').innerHTML=`<defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="currentColor"/></marker></defs>`+pulls.map(p=>{
  const a=center(p.from),b=center(p.to),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),end=.72;
  return `<line class="${kind} ${p.side===0?'blue-arrow':'red-arrow'}" x1="${a.x+dx/len*17}" y1="${a.y+dy/len*17}" x2="${a.x+dx*end}" y2="${a.y+dy*end}" marker-end="url(#${marker})"/>`;
 }).join('');
}
function renderBoard(s,animate) {
 const incremental=animate&&renderedPly===s.ply-1&&renderedBoard.length===s.board.length;
 if(incremental) {
  const moved=s.last.pulls.map(p=>({p,token:tokens.get(p.from)}));
  for(const {p} of moved)tokens.delete(p.from);
  for(const {p,token} of moved)if(token){token.classList.add('pulled');position(token,p.to);tokens.set(p.to,token);}
  const added=makeStone(s.last.side+1,s.last.cell,'new');$('stones').append(added);tokens.set(s.last.cell,added);
 }else {
  resetVisual();
  s.board.forEach((color,cell)=>{if(color){const token=makeStone(color,cell);$('stones').append(token);tokens.set(cell,token);}});
 }
 const winning=new Set(s.winning.flat(2));
 for(const [cell,token] of tokens){token.classList.toggle('winning',!animating&&winning.has(cell));token.classList.remove('preview-moving');if(!animating)token.classList.remove('new','pulled');}
 renderedPly=s.ply;renderedBoard=[...s.board];drawArrows(s.last?.pulls??[]);
}
function clearPreview() {
 preview=null;if(!$('ghosts'))return;$('ghosts').replaceChildren();
 for(const token of tokens.values())token.classList.remove('preview-moving');
 if($('hint')){$('hint').className='hint';$('hint').textContent=ordinaryHint(current());drawArrows(current().last?.pulls??[]);}
}
function showPreview(cell) {
 if(!canPlay()||game.board[cell]!==0)return;clearPreview();preview=cell;
 const result=resolve(game.board,cell,0),ghosts=[makeStone(1,cell,'ghost anchor')];
 for(const pull of result.pulls){tokens.get(pull.from)?.classList.add('preview-moving');ghosts.push(makeStone(pull.side+1,pull.to,'ghost'));}
 $('ghosts').replaceChildren(...ghosts);drawArrows(result.pulls,'preview');
 $('hint').textContent=result.over?(result.winner===0?'Dieser Zug bildet deine Viererreihe. Du gewinnst.':result.winner===1?'Achtung: Dieser Zug bildet Rots Viererreihe.':result.reason==='double-line'?'Beide Farben bilden vier. Dieser Zug endet remis.':'Brett voll: Dieser Zug endet remis.'):
  result.pulls.length?`Vorschau: ${result.pulls.filter(p=>p.side===0).length} blaue und ${result.pulls.filter(p=>p.side===1).length} rote Steine rücken näher.`:'Hier wird ein Stein gesetzt. Kein anderer rückt näher.';
 $('hint').className='hint '+(result.over&&result.winner===1?'danger':result.winner===0?'success':'');
}
function render(animate=false) {clearPreview();const s=current();renderBoard(s,animate);updateStatus();}
function commit(cell) {
 loadNote='';clearPreview();game=applyMove(game,cell);save();
 animating=!reduced.matches;render(true);
 if(animating){const ownGeneration=generation;settleTimer=setTimeout(()=>{if(ownGeneration!==generation)return;animating=false;render(false);if(keyboardInput&&canPlay())cells[keyboardCell].focus();},MOTION+25);}
 else if(keyboardInput&&canPlay())cells[keyboardCell].focus();
 scheduleAI();
}
function playHuman(cell) {if(canPlay()&&game.board[cell]===0)commit(cell);}
function scheduleAI() {
 clearTimeout(aiTimer);aiTimer=undefined;
 if(review!==null||game.phase!=='playing'||game.turn!==1)return;
 const ownGeneration=generation;
 aiTimer=setTimeout(()=>{
  if(ownGeneration!==generation||review!==null||game.phase!=='playing'||game.turn!==1)return;
  const cell=chooseMove(game);commit(cell);
 },AI_DELAY);
}
function undo() {
 if(review!==null)return;
 let index=game.history.length-1;while(index>=0&&(game.starter+index)%2!==0)index--;
 if(index<0)return;cancelWork();game=replayGame(game,index);loadNote='';resetVisual();save();render();scheduleAI();
}
save();render();scheduleAI();
