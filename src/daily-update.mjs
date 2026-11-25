import {m, setText} from './i18n.mjs';

// Bind only after the account and delivery service are available. Dispose on sign-out.
export function bindDailyUpdate(root, account = null) {
  const toggle = root.querySelector('[role="switch"]');
  const status = root.querySelector('[role="status"]');
  const retry = root.querySelector('button');
  const session = new AbortController();
  let confirmed = false;
  function message(key) { setText(status, m(key)); }
  function reset() {
    confirmed = false;
    toggle.checked = false;
    toggle.disabled = true;
    retry.hidden = true;
    message('Tägliche Updates sind verfügbar, sobald Konto und Versand verbunden sind.');
  }
  async function refresh(write) {
    const desired = toggle.checked;
    toggle.checked = confirmed;
    toggle.disabled = true;
    retry.hidden = true;
    message(write ? 'Einstellung wird gespeichert …' : 'Einstellung wird geladen …');
    try {
      const value = write ? await account.setEnabled(desired, session.signal) : await account.getEnabled(session.signal);
      if (typeof value !== 'boolean' || (write && value !== desired)) throw new Error('Unconfirmed preference');
      if (session.signal.aborted) return;
      confirmed = toggle.checked = value;
      toggle.disabled = false;
      message(value ? 'Aktiv. Bei passenden Änderungen erhältst du höchstens ein Update pro Tag.' : 'Aus. Du erhältst keine täglichen Updates.');
    } catch {
      if (session.signal.aborted) return;
      // A lost write response can mean the server already applied the change.
      retry.hidden = false;
      message('Aktueller Status unbekannt. Lade die Einstellung erneut.');
    }
  }
  reset();
  if (account) {
    toggle.addEventListener('change', () => refresh(true), {signal:session.signal});
    retry.addEventListener('click', () => refresh(false), {signal:session.signal});
    void refresh(false);
  }
  return () => { session.abort(); reset(); };
}

// Supply a pinned origin and short-lived token getter from the signed-in session.
export function dailyUpdateAccount({approvedOrigin, getAccessToken, fetchImpl = fetch}) {
  const url = new URL('/api/v1/preferences/daily-update', approvedOrigin);
  if (url.protocol !== 'https:' || url.origin !== approvedOrigin || url.port ||
      !url.hostname.includes('.') || /^[\d.]+$/.test(url.hostname) || /(?:^|\.)(?:localhost|local|internal)$/.test(url.hostname) ||
      typeof getAccessToken !== 'function') {
    throw new TypeError('Invalid daily update service configuration');
  }
  async function exchange(method, enabled, signal) {
    signal.throwIfAborted();
    const token = await getAccessToken(signal);
    if (!token || typeof token !== 'string' || token.length > 4096 || !/^[-A-Za-z0-9._~+/]+=*$/.test(token)) throw new Error('Sign in required');
    signal.throwIfAborted();
    const headers = {Accept:'application/json', Authorization:'Bearer '+token};
    if (method === 'PUT') headers['Content-Type'] = 'application/json';
    const response = await fetchImpl(url, {method, headers, signal, credentials:'omit', redirect:'error', cache:'no-store', referrerPolicy:'no-referrer', body:method === 'PUT' ? JSON.stringify({enabled}) : undefined});
    if (!response.ok || response.redirected || !/^application\/json(?:;|$)/i.test(response.headers.get('content-type') ?? '')) {
      await response.body?.cancel();
      throw new Error('Preference unavailable');
    }
    if (!response.body) throw new Error('Empty preference response');
    const reader = response.body.getReader();
    const bytes = new Uint8Array(1024);
    let length = 0;
    try {
      for (;;) {
        const {value, done} = await reader.read();
        if (done) break;
        if (length + value.length > bytes.length) throw new Error('Preference response too large');
        bytes.set(value, length);
        length += value.length;
      }
    } finally { await reader.cancel().catch(()=>{}); reader.releaseLock(); }
    const data = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,length)));
    if (data?.schemaVersion !== 1 || typeof data.enabled !== 'boolean') throw new Error('Invalid preference');
    return data.enabled;
  }
  async function request(method, enabled, sessionSignal) {
    if (method === 'PUT' && typeof enabled !== 'boolean') throw new TypeError('Invalid preference');
    const controller = new AbortController();
    const cancel = () => controller.abort();
    sessionSignal.addEventListener('abort', cancel, {once:true});
    const timer = setTimeout(cancel, 8000);
    try {
      const cancelled = new Promise((_,reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('Preference request interrupted')), {once:true});
      });
      if (sessionSignal.aborted) cancel();
      return await Promise.race([cancelled, exchange(method, enabled, controller.signal)]);
    } finally {
      clearTimeout(timer);
      sessionSignal.removeEventListener('abort', cancel);
    }
  }
  return {getEnabled:signal=>request('GET',undefined,signal),setEnabled:(enabled,signal)=>request('PUT',enabled,signal)};
}
