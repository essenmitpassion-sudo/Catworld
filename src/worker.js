import {chooseMove} from './ai.js';
self.onmessage=({data})=>{try{self.postMessage({id:data.id,result:chooseMove(data.game,data.options)});}catch{self.postMessage({id:data.id,error:true});}};
