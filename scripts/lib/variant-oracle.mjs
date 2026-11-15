export function oracleStep(s,m,variant){
 if(s.status!=='playing'||![-1,1].includes(m.shift))throw Error('illegal phase/direction');const actors=s.board.flatMap((side,i)=>side?[{side,x:i%5,y:Math.floor(i/5)}]:[]),p=actors.find(p=>p.y*5+p.x===m.from),t=actors.find(p=>p.y*5+p.x===m.to),x=m.to%5,y=Math.floor(m.to/5);
 if(!p||p.side!==s.turn||m.to<0||m.to>24||t?.side===s.turn||Math.abs(p.x-x)+Math.abs(p.y-y)!==1)throw Error('illegal step');if(t)actors.splice(actors.indexOf(t),1);p.x=x;p.y=y;
 const row=actors.filter(q=>q.y===y),amount=variant==='resonance'&&row.some(q=>q.side===1)&&row.some(q=>q.side===-1)?2:1;
 for(const q of row){q.x+=m.shift*amount;while(q.x<0)q.x+=5;while(q.x>4)q.x-=5;}const board=Array(25).fill(0);for(const q of actors)board[q.y*5+q.x]=q.side;
 const won=!actors.some(q=>q.side===-s.turn)||actors.some(q=>q.side===s.turn&&q.x===2&&q.y===(s.turn===1?0:4));if(variant==='active'&&!won&&board.every((p,i)=>p===s.board[i]))throw Error('empty turn');return{board,won,amount,shiftedPieces:row.length};
}
export function independentMoves(s,variant){const moves=[];for(let y=0;y<5;y++)for(let x=0;x<5;x++)if(s.board[y*5+x]===s.turn)for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]])for(const shift of[-1,1]){const nx=x+dx,ny=y+dy;if(nx<0||nx>4||ny<0||ny>4)continue;const m={from:y*5+x,to:ny*5+nx,shift};try{oracleStep(s,m,variant);moves.push(m);}catch{}}return moves;}
