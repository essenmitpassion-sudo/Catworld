// Native startup and isolated fixture proof: no live offers, purchases or microphone claims.
// Only synthetic disposable-runner screens are emitted as bounded PNG records
// in existing CI logs. No artifact-storage service or app release is enabled.
import { spawnSync, spawn } from 'node:child_process';
import { writeFileSync, readFileSync, openSync, closeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import {withAndroidPage} from './native-cdp.mjs';
import {androidFlow} from './native-flow-android.mjs';
import {androidFixtureFlow} from './native-flow-fixture-android.mjs';
import {writeScreen,resultScreenshotName} from './native-screens.mjs';

const platform = process.argv[2];
const profile = process.argv[3] ?? 'unconnected';
assert(profile === 'unconnected' || profile === 'fixture', 'Choose unconnected or fixture.');
const fixture = profile === 'fixture';
const temp = process.env.RUNNER_TEMP;
assert(temp, 'Run native startup checks on the disposable CI runner.');
const appId = 'stream.soundweave.udi';
const fixturePort = 4175;
const flow = fixture ? androidFixtureFlow : androidFlow;
const fixtureCoverage={otp:2,verify:1,partial:1,confirmed:1,unavailable:1,list:1,save:1};

async function readFixtureCounters() {
  const response=await fetch('http://127.0.0.1:'+fixturePort+'/healthz',{signal:AbortSignal.timeout(3000),redirect:'error'});
  assert(response.ok,'Isolated fixture service must respond on runner loopback');
  const {test,counts}=await response.json();
  assert.equal(test,true,'Unexpected service on runner loopback');
  const observed={};
  for(const route of Object.keys(fixtureCoverage)) {
    assert(Number.isSafeInteger(counts?.[route])&&counts[route]>=0,'Invalid fixture counter: '+route);
    observed[route]=counts[route];
  }
  return observed;
}
async function checkFixtureService(finished) {
  const observed=await readFixtureCounters();
  for(const [route,minimum] of Object.entries(fixtureCoverage)) {
    if(finished)assert(observed[route]>=minimum,'Missing native fixture coverage: '+route);
    else assert.equal(observed[route],0,'Each platform requires its own unused fixture service');
  }
  if(finished)console.log('Runner loopback fixture requests: '+JSON.stringify(observed));
}
async function reportFixtureCounters() {
  try {
    console.log('Runner loopback fixture requests at failure: '+JSON.stringify(await readFixtureCounters()));
  } catch {
    console.log('Runner loopback fixture counters unavailable at failure');
  }
}
function reportAndroidClock(adb) {
  try {
    const before=Date.now();
    const value=run(adb,['-e','shell','date','+%s%N'],4000).trim();
    const after=Date.now();
    if(/^\d{19}$/.test(value)) {
      const guest=Math.floor(Number(value.slice(0,13)));
      console.log('Android fixture wall clock minus runner, milliseconds: '+JSON.stringify({lower:guest-after,upper:guest-before+1}));
      return;
    }
  } catch {/* Failed samples are excluded from evidence. */}
  console.log('Android fixture wall clock offset unavailable');
}

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

if (fixture) await checkFixtureService(false);

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
    if(fixture) {
      reportAndroidClock(adb);
      run(adb,['-e','reverse','tcp:'+fixturePort,'tcp:'+fixturePort]);
    }
    run(adb, ['-e', 'install', '-r', resolve('android/app/build/outputs/apk/debug/app-debug.apk')]);
    if(fixture)console.log('Android fixture: APK installed on the disposable emulator');
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
      if(!fixture)await androidSurface(port);
      await withAndroidPage(port,async page=>{
        if(!fixture) {
          await page.evaluate("document.querySelector('main').scrollTop=0");
          assert(await page.evaluate("(()=>{const r=document.querySelector('.primary-search').getBoundingClientRect(),nav=document.querySelector('nav').getBoundingClientRect();return r.top>=0&&r.bottom<=nav.top})()"),'Initial native search action must fit above navigation');
          const png=spawnSync(adb,['-e','exec-out','screencap','-p'],{timeout:15000,maxBuffer:2*1024*1024});
          assert(!png.error&&png.status===0,'Android screenshot failed');
          const shot=join(temp,'udi-android-start.png');writeFileSync(shot,png.stdout);await recordScreen('android-start',shot);
        }
        await flow(page,false);
      });
    }
    catch (error) {
      if(!fixture)console.log(run(adb, ['-e', 'logcat', '-d', '-s', 'Capacitor/Console', 'chromium', 'AndroidRuntime']).slice(-12000));
      throw error;
    } finally { spawnSync(adb, ['-e', 'forward', '--remove', `tcp:${port}`], { timeout: 10000, killSignal: 'SIGKILL', stdio: 'ignore' }); }
    run(adb,['-e','shell','am','force-stop',appId]);
    run(adb,['-e','shell','am','start','-W','-n',`${appId}/.MainActivity`]);await delay(3000);
    const restartedPid=run(adb,['-e','shell','pidof',appId]).trim();assert(/^\d+$/.test(restartedPid));
    const restartedPort=run(adb,['-e','forward','tcp:0',`localabstract:webview_devtools_remote_${restartedPid}`]).trim();
    try {await withAndroidPage(restartedPort,page=>flow(page,true));}
    finally {spawnSync(adb,['-e','forward','--remove',`tcp:${restartedPort}`],{timeout:10000,killSignal:'SIGKILL',stdio:'ignore'});}
  } catch(error) {
    if(fixture) {
      reportAndroidClock(adb);
      await reportFixtureCounters();
    }
    throw error;
  } finally {
    if(fixture)spawnSync(adb,['-e','reverse','--remove','tcp:'+fixturePort],{timeout:10000,killSignal:'SIGKILL',stdio:'ignore'});
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
    const boot=run('xcrun', ['simctl', 'bootstatus', device.udid, '-b'], 480000);
    writeFileSync(join(temp,'udi-ios-boot.log'),boot);
    await new Promise((done,fail)=>process.stdout.write('iOS boot status tail:\n'+boot.slice(-4000)+'\n',error=>error?fail(error):done()));
    const derivedData=join(temp,'udi-ios');
    if(fixture) {
      run('xcrun',['simctl','install',device.udid,join(derivedData,'Build','Products','Debug-iphonesimulator','App.app')]);
      assert(run('xcrun',['simctl','get_app_container',device.udid,appId]).trim(),'Fixture app must be installed');
      console.log('iOS fixture: app installed on the disposable simulator');
    }
    // The App scheme launches its UI-test target against the installed app.
    const testMethod=fixture?'testProtectedFixtureSearchAndRestoration':'testUnconnectedSearchAndPersistenceInBothLanguages';
    const settings=fixture?['UDI_INFOPLIST_FILE=App/Info.fixture.plist']:[];
    const log=join(temp,'udi-native-flow.log'),fd=openSync(log,'w');let result;
    try {result=spawnSync('xcodebuild',['test','-project',resolve('ios/App/App.xcodeproj'),'-scheme','App','-destination',`platform=iOS Simulator,id=${device.udid}`,
      '-derivedDataPath',derivedData,'-resultBundlePath',join(temp,'udi-flow.xcresult'),'-parallel-testing-enabled','NO','CODE_SIGNING_ALLOWED=NO',
      '-only-testing:UDIFlowTests/UDIFlowTests/'+testMethod,...settings],
      {stdio:['ignore',fd,fd],timeout:480000,killSignal:'SIGKILL'});}finally{closeSync(fd);}
    const flowLog=readFileSync(log,'utf8');
    const milestones=fixture?/^iOS fixture:/:/\biOS(?::| (?:English:|Deutsch:))/;
    console.log('iOS flow milestones:\n'+flowLog.split(/\r?\n/).filter(line=>milestones.test(line)).slice(-15).map(line=>line.slice(0,400)).join('\n'));
    if(!fixture)console.log(flowLog.slice(-18000));
    else if(result.error||result.status!==0) {
      const errors=flowLog.split(/\r?\n/).filter(line=>/error:|failed:|TEST FAILED/.test(line));
      console.log(errors.slice(-15).map(line=>line.replaceAll('plus@udi.test','[fixture account]').replace(/\b\d{6}\b/g,'[fixture code]').slice(0,500)).join('\n'));
    }
    console.log('iOS runner result: '+JSON.stringify({status:result.status,signal:result.signal,error:result.error?.code}));
    if(fixture) {
      if(result.error||result.status!==0)await reportFixtureCounters();
      assert(!result.error&&result.status===0&&flowLog.includes('iOS fixture: sign-in, Plus usage and protected saved search restored'),
        'iOS fixture acceptance failed or was not executed; see bounded diagnostics above.');
    } else {
      let captured=false;
      try {
        // Capture while XCTest still owns the foreground app. Only the explicitly
        // named UDI attachment is selected, not an arbitrary exported diagnostic.
        const directory=join(temp,'udi-flow-attachments');
        run('xcrun',['xcresulttool','export','attachments','--path',join(temp,'udi-flow.xcresult'),'--output-path',directory],30000);
        const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
        const screenshot=resultScreenshotName(manifest);
        await recordScreen('ios-flow',join(directory,screenshot));captured=true;
        console.log('iOS image source: explicitly marked XCTest app attachment.');
      } catch(error) {console.log('iOS XCTest image unavailable: '+String(error?.message??error).slice(-1500));}
      if(!captured) {
        try {
          const screenshot=join(temp,'udi-ios-flow.png');
          run('xcrun',['simctl','io',device.udid,'screenshot',screenshot],15000);
          await recordScreen('ios-flow',screenshot);captured=true;
        } catch(error) {console.log('iOS post-test screenshot unavailable; no visual claim. '+String(error?.message??error).slice(-1500));}
      }
      assert(!result.error&&result.status===0,'iOS native flow test failed; see Xcode log above.');
      assert(captured,'iOS flow passed but screenshot could not be captured; visual acceptance remains open.');
    }
  } finally {
    spawnSync('xcrun', ['simctl', 'shutdown', device.udid], { timeout: 30000, killSignal: 'SIGKILL', stdio: 'ignore' });
    spawnSync('xcrun',['simctl','delete',createdId],{timeout:30000,killSignal:'SIGKILL',stdio:'ignore'});
  }
} else {
  throw new Error('Choose android or ios.');
}
if(fixture) {
  await checkFixtureService(true);
  console.log(`Native ${platform} fixture flow passed with synthetic accounts, searches and prices.`);
} else console.log(`Native ${platform} startup passed. Full device/search/voice acceptance remains separate.`);
