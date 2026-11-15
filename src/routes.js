/** Shortest solo routes on an empty board, using complete step+row-shift actions.
 * Other pieces can block, capture or transport this piece; this is not a match solver.
 */
const incoming=Array.from({length:25},()=>[]);
for(let from=0;from<25;from++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
 const x=from%5+dx,y=Math.floor(from/5)+dy;if(x<0||x>4||y<0||y>4)continue;
 for(const shift of[-1,1])incoming[y*5+(x+shift+5)%5].push(from);
}
const distances=new Uint8Array(25).fill(255),queue=[2];distances[2]=0;
for(const end of queue)for(const from of incoming[end])if(distances[from]===255){distances[from]=distances[end]+1;queue.push(from);}
export function gateDistance(cell,side){
 if(!Number.isInteger(cell)||cell<0||cell>24||![1,-1].includes(side))throw new RangeError('Ungültiges Feld oder ungültige Seite.');
 return distances[side===1?cell:24-cell];
}
