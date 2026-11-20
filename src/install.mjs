export function setupInstall(root = document) {
  const button=root.querySelector('[data-install]');
  const status=root.querySelector('[data-install-status]');
  let invitation;
  const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  function update() {
    button.hidden=!invitation||installed();
    if(installed()) status.textContent='UDI ist als App-Fenster geöffnet. Für aktuelle Angebote brauchst du Internet.';
    else if(['localhost','127.0.0.1','[::1]'].includes(location.hostname)) status.textContent='Lokaler Testbuild auf diesem Computer. Für die Installation auf deinem Telefon fehlt noch eine freigegebene HTTPS-Testadresse.';
    else status.textContent='Installationsmöglichkeiten hängen von deinem Browser ab. Für aktuelle Angebote brauchst du Internet.';
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();invitation=event;update();});
  window.addEventListener('appinstalled',()=>{invitation=null;button.hidden=true;status.textContent='Installation gemeldet. Öffne UDI über das App-Symbol; prüfe Angebote dort erneut.';});
  button.addEventListener('click',async()=>{
    if(!invitation)return;
    const current=invitation;invitation=null;button.disabled=true;
    try {
      await current.prompt();
      const choice=await current.userChoice;
      status.textContent=choice.outcome==='accepted'?'Installationsanfrage angenommen. Die tatsächliche Installation prüfst du über das App-Symbol.':'Installation abgebrochen. Du kannst UDI weiter im aktuellen Fenster verwenden.';
    } catch {status.textContent='Die Installation konnte nicht gestartet werden. Nutze das Browser-Menü oder die Anleitung unten.';}
    finally {button.disabled=false;button.hidden=true;}
  });
  update();
}
