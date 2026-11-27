// Browser-native dictation plus a temporary, local recording for review.
import {m,setText,t,speechLanguage} from './i18n.mjs';
import {runtimePlatform} from './runtime.mjs';
import {nativeSpeech,setupNativeVoice} from './native-voice.mjs';
export function setupVoice(root, onInput) {
  const native=runtimePlatform()!=='web';
  const plugin=native?nativeSpeech():null;
  if(plugin)return setupNativeVoice(root,onInput,plugin);
  const button = root.querySelector('[data-mic]');
  const input = root.elements.query;
  const panel = root.querySelector('[data-voice]');
  const status = root.querySelector('[data-voice-status]');
  const preview = root.querySelector('[data-audio-preview]');
  const audio = root.querySelector('[data-audio]');
  const label = root.querySelector('[data-mic-label]');
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  const supported = !native&&!!(Recognition && navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  let session = null;
  let audioUrl;
  let recordingVersion = 0;
  const tell = text => { panel.hidden = false; setText(status,m(text)); };
  const clearAudio = () => {
    audio.pause(); audio.removeAttribute('src'); audio.load(); preview.hidden = true;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  };
  root.querySelector('[data-delete-audio]').addEventListener('click', () => {
    recordingVersion++;
    clearAudio(); tell(m('Aufnahme gelöscht. Dein Text bleibt erhalten.')); button.focus();
  });
  function finish(current, note) {
    if (session !== current) return;
    session = null;
    current.cancelled = true;
    clearInterval(current.timer);
    clearTimeout(current.deadline);
    try { current.speech?.abort?.(); } catch { /* recognition may have ended */ }
    if (current.recorder?.state === 'recording') current.recorder.stop();
    current.stream?.getTracks().forEach(track => track.stop());
    button.disabled = false;
    button.setAttribute('aria-pressed', 'false'); setText(label,m('Einsprechen'));
    if (note) tell(note);
  }
  function stop(note) {
    const current = session;
    if (!current || current.stopping) return;
    if (!current.speech) { finish(current, note); return; }
    // stop() emits final words asynchronously; cancellation uses finish().
    current.stopping = true;
    clearInterval(current.timer);
    if (current.recorder?.state === 'recording') current.recorder.stop();
    current.stream?.getTracks().forEach(track => track.stop());
    button.disabled = true;
    setText(label,m('Diktat abschliessen'));
    current.deadline = setTimeout(() => finish(current, m('Das Diktat wurde nicht rechtzeitig abgeschlossen. Dein Text bleibt erhalten. Höre die Aufnahme an oder tippe weiter.')), 3000);
    try { current.speech.stop(); } catch { finish(current, note); }
  }
  button.setAttribute('aria-pressed', 'false');
  if (!supported) {
    button.disabled = true;
    button.dataset.i18nTitle=native?'Die Spracheingabe ist für diese App-Version noch nicht verfügbar. Nutze die Texteingabe.':'Dieser Browser unterstützt Aufnahme und Diktat nicht gemeinsam. Nutze die Texteingabe.';
    button.title=t(button.dataset.i18nTitle);
    if(native) {
      // This native build has no verified speech adapter. Keep its first action
      // usable rather than leading with a disabled microphone and error panel.
      root.querySelector('.composer-tools').hidden=true;
      panel.hidden=true;
    } else tell(m('Diktieren ist hier nicht verfügbar. Beschreibe deinen Wunsch im Textfeld.'));
  }
  button.addEventListener('click', async () => {
    if (session) { stop(m('Aufnahme beendet. Prüfe deinen Text und höre die Aufnahme an.')); return; }
    const current = { cancelled: false, chunks: [], version: ++recordingVersion };
    session = current;
    button.setAttribute('aria-pressed', 'true'); setText(label,m('Abbrechen'));
    root.querySelector('[data-voice-privacy]').hidden = false;
    tell(m('Bitte erlaube den Mikrofonzugriff im Browser. Dein bisheriger Text bleibt erhalten.'));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (current.cancelled) { stream.getTracks().forEach(track => track.stop()); return; }
      current.stream = stream;
      const recorder = new MediaRecorder(stream);
      current.recorder = recorder;
      recorder.ondataavailable = event => { if (event.data.size) current.chunks.push(event.data); };
      recorder.onstop = () => {
        if (!current.chunks.length || current.version !== recordingVersion) return;
        clearAudio();
        audioUrl = URL.createObjectURL(new Blob(current.chunks, { type: recorder.mimeType }));
        audio.src = audioUrl; preview.hidden = false;
      };
      recorder.onerror = () => finish(current, m('Die Aufnahme ist fehlgeschlagen. Dein Text bleibt erhalten. Versuche es erneut oder tippe weiter.'));
      const speech = new Recognition();
      current.speech = speech;
      speech.lang = speechLanguage(); speech.interimResults = false;
      speech.onresult = event => {
        // Ignore delayed events from an older or cancelled recording.
        if (session !== current) return;
        const transcript = Array.from(event.results).slice(event.resultIndex ?? 0).map(result => result[0].transcript).join(' ').trim();
        if (!transcript) return;
        const combined = [input.value.trim(), transcript].filter(Boolean).join(' ');
        if (combined.length > input.maxLength) {
          finish(current, m('Dein Text und das Diktat sind zusammen zu lang. Der vorhandene Text bleibt erhalten. Höre die Aufnahme an und kürze den Text.'));
          return;
        }
        input.value = combined;
        current.recognized = true;
        onInput();
        tell(m('Diktat ergänzt. Prüfe und bearbeite den Text vor der Suche.'));
      };
      speech.onerror = event => {
        if (session !== current) return;
        const note = event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? m('Die Spracherkennung wurde nicht erlaubt. Erlaube sie im Browser oder nutze die Texteingabe.')
          : m('Der Browser konnte dich nicht verstehen. Höre die Aufnahme an, versuche es erneut oder tippe deinen Wunsch.');
        finish(current, note);
      };
      speech.onend = () => {
        if (session !== current || current.cancelled) return;
        finish(current, current.recognized ? m('Diktat ergänzt. Höre die Aufnahme an und prüfe den Text vor der Suche.')
          : m('Kein Text erkannt. Höre die Aufnahme an, versuche es erneut oder tippe deinen Wunsch.'));
        input.focus();
      };
      recorder.start(200);
      current.started = performance.now();
      current.timer = setInterval(() => {
        const elapsed = Math.floor((performance.now() - current.started) / 1000);
        tell(m('Aufnahme läuft · {duration} · Diktat wird an deinen Text angehängt.',{duration:'0:'+String(elapsed).padStart(2,'0')}));
        if (elapsed >= 60) stop(m('60 Sekunden erreicht. Prüfe den Text und die Aufnahme vor der Suche.'));
      }, 1000);
      setText(label,m('Aufnahme stoppen'));
      tell(m('Aufnahme läuft · {duration} · Diktat wird an deinen Text angehängt.',{duration:'0:00'}));
      speech.start();
    } catch (error) {
      if (session !== current) return;
      finish(current, error.name === 'NotAllowedError'
        ? m('Kein Mikrofonzugriff. Erlaube das Mikrofon im Browser oder nutze die Texteingabe.')
        : m('Das Mikrofon oder die Spracherkennung ist nicht verfügbar. Versuche es erneut oder nutze die Texteingabe.'));
    }
  });
  window.addEventListener('pagehide', () => { recordingVersion++; if (session) finish(session); clearAudio(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && session) finish(session, m('Aufnahme beendet: Die Seite wurde verlassen. Prüfe deinen Text.')); });
  button.hidden = false;
  return { isRecording: () => !!session, stop: () => stop(m('Aufnahme beendet. Prüfe zuerst den Text und die Aufnahme und starte dann die Suche.')) };
}
