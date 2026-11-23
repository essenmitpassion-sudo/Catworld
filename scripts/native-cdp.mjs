// QA connection to this job's installed Android debug app, never a desktop tab.
import assert from 'node:assert/strict';
export async function withAndroidPage(port,work) {
  assert(/^\d+$/.test(String(port)),'Invalid adb port');
  const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`,{signal:AbortSignal.timeout(10000)})).json();
  const page=targets.find(target=>target.type==='page'&&/^https?:\/\/localhost(?:\/|$)/.test(target.url));
  assert(page,'Installed local UDI WebView missing');
  const url=new URL(page.webSocketDebuggerUrl);
  assert(url.protocol==='ws:'&&url.pathname.startsWith('/devtools/page/'),'Unexpected WebView target');
  url.hostname='127.0.0.1';url.port=String(port);
  const socket=new WebSocket(url);let sequence=0;
  try {
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('WebView connection timeout')),10000);
      socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
      socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('WebView connection failed'));},{once:true});
    });
    const send=(method,params={})=>new Promise((resolve,reject)=>{
      const id=++sequence;
      const listener=event=>{const reply=JSON.parse(event.data);if(reply.id!==id)return;
        clearTimeout(timer);socket.removeEventListener('message',listener);
        if(reply.error)reject(new Error(reply.error.message));else resolve(reply.result);};
      const timer=setTimeout(()=>{socket.removeEventListener('message',listener);reject(new Error(method+' timed out'));},10000);
      socket.addEventListener('message',listener);socket.send(JSON.stringify({id,method,params}));
    });
    const evaluate=async expression=>{const reply=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
      assert(!reply.exceptionDetails,JSON.stringify(reply.exceptionDetails));return reply.result?.value;};
    return await work({send,evaluate});
  } finally {socket.close();}
}
