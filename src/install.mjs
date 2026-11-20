import {m,setText} from './i18n.mjs';
import {runtimePlatform} from './runtime.mjs';
export function setupInstall(root = document) {
  const button=root.querySelector('[data-install]');
  const status=root.querySelector('[data-install-status]');
  if(runtimePlatform()!=='web') {
    button.hidden=true;
    const card=status.closest('.surface');
    card.querySelectorAll('p:not([data-install-status])').forEach(node=>{node.hidden=true;});
    setText(card.querySelector('h2'),m('Deine App-Version'));
    setText(status,m('Die Angebotssuche ist in dieser App-Version noch nicht verbunden. Gespeicherte Suchen bleiben verfügbar.'));
    return;
  }
  let invitation;
  const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  function update() {
    button.hidden=!invitation||installed();
    if(installed()) setText(status,m('UDI ist als App-Fenster geöffnet. Für aktuelle Angebote brauchst du Internet.'));
    else if(['localhost','127.0.0.1','[::1]'].includes(location.hostname)) setText(status,m('Lokaler Testbuild auf diesem Computer. Für die Installation auf deinem Telefon fehlt noch eine freigegebene HTTPS-Testadresse.'));
    else setText(status,m('Installationsmöglichkeiten hängen von deinem Browser ab. Für aktuelle Angebote brauchst du Internet.'));
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();invitation=event;update();});
  window.addEventListener('appinstalled',()=>{invitation=null;button.hidden=true;setText(status,m('Installation gemeldet. Öffne UDI über das App-Symbol; prüfe Angebote dort erneut.'));});
  button.addEventListener('click',async()=>{
    if(!invitation)return;
    const current=invitation;invitation=null;button.disabled=true;
    try {
      await current.prompt();
      const choice=await current.userChoice;
      setText(status,m(choice.outcome==='accepted'?m('Installationsanfrage angenommen. Die tatsächliche Installation prüfst du über das App-Symbol.'):m('Installation abgebrochen. Du kannst UDI weiter im aktuellen Fenster verwenden.')));
    } catch {setText(status,m('Die Installation konnte nicht gestartet werden. Nutze das Browser-Menü oder die Anleitung unten.'));}
    finally {button.disabled=false;button.hidden=true;}
  });
  update();
}
