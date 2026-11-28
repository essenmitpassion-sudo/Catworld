import {getLanguage,m,setText} from './i18n.mjs';

const failureMessage={
  denied:'Kein Mikrofonzugriff. Erlaube Mikrofon und Spracherkennung in den Systemeinstellungen oder tippe weiter.',
  unsupported:'Lokales Diktat ist für diese Sprache auf deinem Gerät nicht verfügbar. Wähle eine andere Sprache oder tippe weiter.',
  empty:'Kein Text erkannt. Versuche es erneut oder tippe deinen Wunsch.',
  timeout:'Das Diktat wurde nicht rechtzeitig abgeschlossen. Dein Text bleibt erhalten.',
  cancelled:'Diktat abgebrochen. Dein Text bleibt erhalten.',
  busy:'Das Mikrofon ist gerade belegt. Versuche es erneut oder tippe weiter.',
  error:'Das Diktat konnte nicht gestartet oder abgeschlossen werden. Du kannst weiter tippen.',
};

export function nativeSpeech(bridge=globalThis.Capacitor) {
  const plugin=bridge?.Plugins?.NativeSpeech;
  return ['recognize','stop','cancel','addListener'].every(method=>typeof plugin?.[method]==='function')?plugin:null;
}

export function setupNativeVoice(root,onInput,plugin) {
  const button=root.querySelector('[data-mic]');
  const label=button.querySelector('[data-mic-label]');
  const panel=root.querySelector('[data-voice]');
  const status=panel.querySelector('[data-voice-status]');
  const options=panel.querySelector('[data-native-voice-options]');
  const locale=options.querySelector('select');
  const start=options.querySelector('[data-native-voice-start]');
  const cancelButton=panel.querySelector('[data-native-voice-cancel]');
  const resume=panel.querySelector('[data-native-voice-resume]');
  const input=root.elements.query;
  let current,cancellation;
  let selectedLocale=false;
  const tell=key=>{panel.hidden=false;setText(status,m(key));};

  function reset(key,canResume=false) {
    clearTimeout(current?.timer);
    current=null;
    button.disabled=false;
    button.removeAttribute('data-recording');
    button.setAttribute('aria-expanded','false');
    setText(label,m('Einsprechen'));
    options.hidden=true;
    cancelButton.hidden=true;
    resume.hidden=!canResume;
    tell(key);
  }
  const askNative=(method,id)=>Promise.resolve().then(()=>plugin[method]({id})).then(()=>true,()=>false);
  function closeOptions() {
    button.setAttribute('aria-expanded','false');
    options.hidden=true;
    cancelButton.hidden=true;
    panel.hidden=true;
  }
  function cancel(key=failureMessage.cancelled) {
    if(current) {
      const stopping={id:current.id,promise:askNative('cancel',current.id)};
      cancellation=stopping;
      void stopping.promise.then(stopped=>{if(stopped&&cancellation===stopping)cancellation=null;});
    }
    reset(key);
    return cancellation?.promise??Promise.resolve(true);
  }
  function finish(currentRun,result) {
    if(result?.status&&cancellation?.id===currentRun.id)cancellation=null;
    if(current!==currentRun)return;
    const partial=result?.status==='partial-transcript';
    if(!partial && result?.status!=='transcript') {
      reset(failureMessage[result?.status]??failureMessage.error);
      return;
    }
    const text=typeof result.text==='string'?result.text.trim():'';
    if(!text)return reset(failureMessage.empty);
    const combined=[input.value.trim(),text].filter(Boolean).join(' ');
    if(combined.length>input.maxLength)return reset('Dein Text und das Diktat sind zusammen zu lang. Dein bisheriger Text bleibt erhalten.');
    input.value=combined;
    onInput();
    reset(partial?'Diktat unterbrochen. Erkannter Text übernommen.':'Diktat ergänzt.',true);
  }

  button.setAttribute('aria-controls',options.id);
  button.setAttribute('aria-expanded','false');
  const subscription=Promise.resolve().then(()=>plugin.addListener('speechState',event=>{
    if(!current || event?.id!==current.id)return;
    if(event.status==='listening' && !current.finishing) {
      current.listening=true;
      setText(label,m('Aufnahme stoppen'));
      tell('Aufnahme läuft. Sprich deinen Wunsch.');
    } else if(event.status==='finishing') {
      current.finishing=true;
      button.disabled=true;
      setText(label,m('Diktat abschliessen'));
      tell('Diktat wird abgeschlossen …');
    }
  })).then(()=>true,()=>false);

  button.addEventListener('click',()=>{
    if(current) {
      if(!current.listening)return cancel();
      current.finishing=true;
      button.disabled=true;
      setText(label,m('Diktat abschliessen'));
      tell('Diktat wird abgeschlossen …');
      void askNative('stop',current.id);
      return;
    }
    if(!options.hidden) {
      closeOptions();
      return;
    }
    if(!selectedLocale)locale.value=getLanguage()==='de'?'de-DE':'en-GB';
    options.hidden=false;
    resume.hidden=true;
    button.setAttribute('aria-expanded','true');
    cancelButton.hidden=false;
    tell('UDI braucht das Mikrofon, um deinen Wunsch auf diesem Gerät als Text zu erfassen.');
    start.scrollIntoView({block:'nearest'});
  });
  locale.addEventListener('change',()=>{selectedLocale=true;});
  cancelButton.addEventListener('click',()=>{
    if(current)void cancel();
    else closeOptions();
    button.focus();
  });
  async function beginDictation() {
    if(current||cancellation)return;
    const id=Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
    const run={id,listening:false,finishing:false,timer:setTimeout(()=>{
      if(current?.id===id)cancel(failureMessage.timeout);
    },48000)};
    current=run;
    const language=locale.value;
    options.hidden=true;
    resume.hidden=true;
    cancelButton.hidden=false;
    button.setAttribute('aria-expanded','false');
    button.setAttribute('data-recording','');
    setText(label,m('Abbrechen'));
    tell('Lokales Diktat und Mikrofon werden vorbereitet …');
    const listening=await subscription;
    if(current!==run)return;
    if(!listening)return finish(run,{status:'error'});
    try {finish(run,await plugin.recognize({id,locale:language}));}
    catch {finish(run);}
  }
  start.addEventListener('click',beginDictation);
  resume.addEventListener('click',beginDictation);

  window.addEventListener('pagehide',()=>{if(current)cancel();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && current)cancel();});
  button.hidden = false;
  return {
    isRecording:()=>Boolean(current),
    stop() {
      if(current)return cancel();
      if(!options.hidden)closeOptions();
      return cancellation?.promise??Promise.resolve(true);
    },
  };
}
