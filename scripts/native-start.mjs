// Native startup proof only: no live offers, purchases or microphone claims.
// Only synthetic disposable-runner screens are emitted as bounded PNG records
// in existing CI logs. No artifact-storage service or app release is enabled.
import { spawnSync, spawn } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, copyFileSync, openSync, closeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import {withAndroidPage} from './native-cdp.mjs';
import {androidFlow} from './native-flow-android.mjs';
import {writeScreen} from './native-screens.mjs';

const platform = process.argv[2];
const temp = process.env.RUNNER_TEMP;
assert(temp, 'Run native startup checks on the disposable CI runner.');
const appId = 'stream.soundweave.udi';
async function recordScreen(label,path) {
  await writeScreen(label,readFileSync(path));
}
function run(command, args, timeout = 120000) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout, killSignal: 'SIGKILL', maxBuffer: 8 * 1024 * 1024 });
  assert(!result.error && result.status === 0,
    `${command} ${args.join(' ')} failed: ${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  return result.stdout;
}
function checkSurface(text) {
  console.log('Rendered native surface:\n' + text);
  // The warning is populated by app.mjs; static HTML or a splash screen cannot pass.
  assert(/cannot\s+show\s+current\s+offers|keine\s+aktuellen\s+Angebote/i.test(text), 'Native service warning was not rendered.');
  assert(/Find\s+offers|Angebote\s+suchen/i.test(text), 'Search action was not rendered.');
  assert(/Saved|Gespeichert/i.test(text), 'Saved searches navigation was not rendered.');
  assert(/Describe\s+what\s+you\s+need|Beschreibe\s+deinen\s+Wunsch/i.test(text), 'Native introduction still promises unavailable voice input.');
}

async function androidSurface(port) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(10000) })).json();
  const page = targets.find(target => target.type === 'page' && /^https?:\/\/localhost(?:\/|$)/.test(target.url));
  assert(page, 'No local UDI WebView debugging target; a process alone is not a startup proof.');
  const url = new URL(page.webSocketDebuggerUrl);
  assert(url.protocol === 'ws:' && url.pathname.startsWith('/devtools/page/'), 'Unexpected WebView debugger address.');
  // Always connect to the adb-assigned loopback port, never a host in metadata.
  url.hostname = '127.0.0.1'; url.port = String(port);
  const socket = new WebSocket(url);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebView connection timed out.')), 10000);
      socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('WebView connection failed.')); }, { once: true });
    });
    const expression = `(() => ({ platform: window.Capacitor?.getPlatform(), ready: document.readyState,
      nodes: ['#native-runtime-status', '.primary-search', 'nav a[href="#watchlist"]', '.search-intro p'].map(selector => {
        const node = document.querySelector(selector);
        node?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
        const rect = node?.getBoundingClientRect();
        const inView = !!rect?.width && !!rect?.height && rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
        const hit = inView && document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return { selector, text: node?.textContent, reachable: inView && getComputedStyle(node).visibility !== 'hidden' && (hit === node || node.contains(hit)) };
      }) }))()`;
    const surface = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebView surface probe timed out.')), 10000);
      socket.addEventListener('message', event => {
        const reply = JSON.parse(event.data); if (reply.id !== 1) return;
        clearTimeout(timer);
        if (reply.error || reply.result?.exceptionDetails) reject(new Error(JSON.stringify(reply)));
        else resolve(reply.result?.result?.value);
      });
      socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    });
    console.log('Installed Android WebView:', JSON.stringify(surface));
    assert.equal(surface?.platform, 'android', 'Android bridge did not initialize.');
    assert.equal(surface.ready, 'complete');
    assert(surface.nodes.every(node => node.reachable), 'Native controls cannot be brought into view without obstruction.');
    checkSurface(surface.nodes.map(node => node.text).join('\n'));
  } finally { socket.close(); }
}

if (platform === 'android') {
  const sdk = process.env.ANDROID_HOME;
  assert(sdk, 'Android SDK missing.');
  const adb = join(sdk, 'platform-tools/adb');
  const emulatorPath = join(sdk, 'emulator/emulator');
  console.log(run(emulatorPath, ['-accel-check']));
  const avds = run(emulatorPath, ['-list-avds']);
  console.log('Available Android devices:\n' + avds);
  assert(avds.split(/\r?\n/).includes('udi-smoke'), 'Prepared Android virtual device is missing.');
  const emulator = spawn(emulatorPath, ['-avd', 'udi-smoke', '-no-window', '-no-audio', '-no-boot-anim', '-no-snapshot', '-gpu', 'swiftshader', '-memory', '2048'], { stdio: ['ignore', 'inherit', 'inherit'] });
  let startError;
  emulator.on('error', error => { startError = error; });
  try {
    let booted = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      assert(!startError, startError?.message);
      assert(emulator.exitCode === null, `Android emulator exited with code ${emulator.exitCode}; see startup diagnostics above.`);
      const result = spawnSync(adb, ['-e', 'shell', 'getprop', 'sys.boot_completed'], { encoding: 'utf8', timeout: 5000 });
      if (attempt % 15 === 0) console.log(`Android boot probe ${attempt}: ${result.stdout?.trim() ?? ''} ${result.stderr?.trim() ?? ''}`);
      if (result.status === 0 && result.stdout.trim() === '1') { booted = true; break; }
      await delay(2000);
    }
    assert(booted, 'Android emulator did not finish booting within the startup limit.');
    run(adb, ['-e', 'shell', 'input', 'keyevent', '82']);
    run(adb, ['-e', 'install', '-r', resolve('android/app/build/outputs/apk/debug/app-debug.apk')]);
    console.log(run(adb, ['-e', 'shell', 'am', 'start', '-W', '-n', `${appId}/.MainActivity`]));
    await delay(8000);
    const pid = run(adb, ['-e', 'shell', 'pidof', appId]).trim();
    assert(/^\d+$/.test(pid), 'Android app is not running.');
    // Capacitor enables this only for the debug APK. Android's generic
    // UIAutomator dump did not expose WebView text, so inspect the installed
    // app's own rendered DOM and native bridge; no desktop-browser substitute.
    const port = run(adb, ['-e', 'forward', 'tcp:0', `localabstract:webview_devtools_remote_${pid}`]).trim();
    assert(/^\d+$/.test(port), 'Invalid adb loopback port.');
    try {
      await androidSurface(port);
      await withAndroidPage(port,async page=>{
        await page.evaluate("document.querySelector('main').scrollTop=0");
        assert(await page.evaluate("(()=>{const r=document.querySelector('.primary-search').getBoundingClientRect(),nav=document.querySelector('nav').getBoundingClientRect();return r.top>=0&&r.bottom<=nav.top})()"),'Initial native search action must fit above navigation');
        const png=spawnSync(adb,['-e','exec-out','screencap','-p'],{timeout:15000,maxBuffer:2*1024*1024});
        assert(!png.error&&png.status===0,'Android screenshot failed');
        const shot=join(temp,'udi-android-start.png');writeFileSync(shot,png.stdout);await recordScreen('android-start',shot);
        await androidFlow(page,false);
      });
    }
    catch (error) {
      console.log(run(adb, ['-e', 'logcat', '-d', '-s', 'Capacitor/Console', 'chromium', 'AndroidRuntime']).slice(-12000));
      throw error;
    } finally { spawnSync(adb, ['-e', 'forward', '--remove', `tcp:${port}`], { timeout: 10000, killSignal: 'SIGKILL', stdio: 'ignore' }); }
    run(adb,['-e','shell','am','force-stop',appId]);
    run(adb,['-e','shell','am','start','-W','-n',`${appId}/.MainActivity`]);await delay(3000);
    const restartedPid=run(adb,['-e','shell','pidof',appId]).trim();assert(/^\d+$/.test(restartedPid));
    const restartedPort=run(adb,['-e','forward','tcp:0',`localabstract:webview_devtools_remote_${restartedPid}`]).trim();
    try {await withAndroidPage(restartedPort,page=>androidFlow(page,true));}
    finally {spawnSync(adb,['-e','forward','--remove',`tcp:${restartedPort}`],{timeout:10000,killSignal:'SIGKILL',stdio:'ignore'});}
  } finally {
    spawnSync(adb, ['-e', 'emu', 'kill'], { timeout: 10000, killSignal: 'SIGKILL', stdio: 'ignore' });
    emulator.kill();
  }
} else if (platform === 'ios') {
  const devices = JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'available', '--json'])).devices;
  const candidates = Object.entries(devices).filter(([runtime]) => runtime.includes('iOS')).sort(([a], [b]) => b.localeCompare(a, 'en', { numeric: true }));
  const selected=candidates.map(([runtime,rows])=>({runtime,template:rows.find(row=>row.isAvailable&&row.name.startsWith('iPhone'))})).find(row=>row.template);
  assert(selected,'No available iPhone simulator template.');
  const types=JSON.parse(run('xcrun',['simctl','list','devicetypes','--json'])).devicetypes;
  const deviceType=selected.template.deviceTypeIdentifier??types.find(row=>row.name===selected.template.name)?.identifier;
  assert(deviceType?.startsWith('com.apple.CoreSimulator.SimDeviceType.iPhone'),'Unexpected simulator device type');
  assert(selected.runtime.startsWith('com.apple.CoreSimulator.SimRuntime.iOS-'),'Unexpected simulator runtime');
  // Repeated installs stalled on the image's precreated device. Test a clean
  // device on the same runtime instead of erasing any existing simulator.
  const createdId=run('xcrun',['simctl','create','UDI-UI-'+Date.now(),deviceType,selected.runtime]).trim();
  assert(/^[A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12}$/.test(createdId),'Invalid created simulator ID');
  const device={...selected.template,udid:createdId,state:'Shutdown'};
  console.log(`Starting fresh ${device.name} on ${selected.runtime} (${device.udid}).`);
  try {
    if (device.state !== 'Booted') run('xcrun', ['simctl', 'boot', device.udid]);
    // A fresh hosted simulator performs its own data migration before our app
    // is installed. The first probe exhausted four minutes in locationd's
    // migrator; allow a bounded eight minutes without disabling system services.
    console.log(run('xcrun', ['simctl', 'bootstatus', device.udid, '-b'], 480000));
    try {run('xcrun', ['simctl', 'install', device.udid, join(temp, 'udi-ios/Build/Products/Debug-iphonesimulator/App.app')]);}
    catch(error) {
      // Collect the actual simulator state instead of blindly extending a timeout.
      const services=spawnSync('xcrun',['simctl','spawn',device.udid,'launchctl','list'],{encoding:'utf8',timeout:15000,maxBuffer:256*1024});
      console.log('iOS install diagnostics: '+(services.stdout??'').split('\n').filter(line=>/installd|SpringBoard|backboard|FrontBoard|runningboard|container/i.test(line)).slice(-25).join('\n'));
      const installLog=spawnSync('xcrun',['simctl','spawn',device.udid,'log','show','--last','2m','--style','compact','--predicate','process == "installd"'],{encoding:'utf8',timeout:15000,maxBuffer:256*1024});
      console.log('iOS installd log: '+(installLog.stdout??'').slice(-6000));
      try {const shot=join(temp,'udi-ios-install-timeout.png');run('xcrun',['simctl','io',device.udid,'screenshot',shot],15000);await recordScreen('ios-install-timeout',shot);}
      catch {console.log('iOS installation screenshot unavailable; no visual claim.');}
      throw error;
    }
    // XCTest owns AUT launch, native UI interaction and relaunch. A separate
    // simctl launch gate duplicated it and stalled before tests could run.
    const flow=join(temp,'udi-flow');mkdirSync(flow,{recursive:true});
    for(const name of ['project.yml','UDIFlowTests.swift'])copyFileSync(resolve('scripts/native-tests/ios/'+name),join(flow,name));
    run(join(temp,'udi-tools/xcodegen/bin/xcodegen'),['generate','--spec',join(flow,'project.yml'),'--project',flow]);
    const log=join(temp,'udi-native-flow.log'),fd=openSync(log,'w');let result;
    try {result=spawnSync('xcodebuild',['test','-project',join(flow,'UDIFlow.xcodeproj'),'-scheme','UDIFlow','-destination',`platform=iOS Simulator,id=${device.udid}`,
      '-derivedDataPath',join(temp,'udi-flow-build'),'-resultBundlePath',join(temp,'udi-flow.xcresult'),'-parallel-testing-enabled','NO','CODE_SIGNING_ALLOWED=NO'],
      {stdio:['ignore',fd,fd],timeout:360000,killSignal:'SIGKILL'});}finally{closeSync(fd);}
    console.log(readFileSync(log,'utf8').slice(-18000));
    let captured=false;
    try {
      const screenshot=join(temp,'udi-ios-flow.png');
      run('xcrun',['simctl','io',device.udid,'screenshot',screenshot],15000);
      await recordScreen('ios-flow',screenshot);captured=true;
    } catch {console.log('iOS post-test screenshot unavailable; no visual claim.');}
    assert(!result.error&&result.status===0,'iOS native flow test failed; see Xcode log above.');
    assert(captured,'iOS flow passed but screenshot could not be captured; visual acceptance remains open.');
  } finally {
    spawnSync('xcrun', ['simctl', 'shutdown', device.udid], { timeout: 30000, killSignal: 'SIGKILL', stdio: 'ignore' });
    spawnSync('xcrun',['simctl','delete',createdId],{timeout:30000,killSignal:'SIGKILL',stdio:'ignore'});
  }
} else {
  throw new Error('Choose android or ios.');
}
console.log(`Native ${platform} startup passed. Full device/search/voice acceptance remains separate.`);
