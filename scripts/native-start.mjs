// Native startup proof only: no live offers, purchases or microphone claims.
// Screenshots/accessibility dumps stay in the ephemeral CI runner.
import { spawnSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const platform = process.argv[2];
const temp = process.env.RUNNER_TEMP;
assert(temp, 'Run native startup checks on the disposable CI runner.');
const appId = 'stream.soundweave.udi';
function run(command, args, timeout = 120000) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout, killSignal: 'SIGKILL', maxBuffer: 8 * 1024 * 1024 });
  assert(!result.error && result.status === 0,
    `${command} ${args.join(' ')} failed: ${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  return result.stdout;
}
function checkSurface(text) {
  // The warning is populated by app.mjs; static HTML or a splash screen cannot pass.
  assert(/not\s+connected|noch\s+nicht\s+verbunden/i.test(text), 'Native service warning was not rendered.');
  assert(/Find\s+offers|Angebote\s+suchen/i.test(text), 'Search action was not rendered.');
  assert(/Watchlist/i.test(text), 'Watchlist navigation was not rendered.');
  console.log(text);
}

if (platform === 'android') {
  const sdk = process.env.ANDROID_HOME;
  assert(sdk, 'Android SDK missing.');
  const adb = join(sdk, 'platform-tools/adb');
  const emulator = spawn(join(sdk, 'emulator/emulator'), ['-avd', 'udi-smoke', '-no-window', '-no-audio', '-no-boot-anim', '-no-snapshot', '-gpu', 'swiftshader', '-memory', '2048'], { stdio: 'ignore' });
  let startError;
  emulator.on('error', error => { startError = error; });
  try {
    let booted = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      assert(!startError, startError?.message);
      const result = spawnSync(adb, ['-e', 'shell', 'getprop', 'sys.boot_completed'], { encoding: 'utf8', timeout: 5000 });
      if (result.status === 0 && result.stdout.trim() === '1') { booted = true; break; }
      await delay(2000);
    }
    assert(booted, 'Android emulator did not finish booting within the startup limit.');
    run(adb, ['-e', 'shell', 'input', 'keyevent', '82']);
    run(adb, ['-e', 'install', '-r', resolve('android/app/build/outputs/apk/debug/app-debug.apk')]);
    console.log(run(adb, ['-e', 'shell', 'am', 'start', '-W', '-n', `${appId}/.MainActivity`]));
    await delay(8000);
    assert(run(adb, ['-e', 'shell', 'pidof', appId]).trim(), 'Android app is not running.');
    run(adb, ['-e', 'shell', 'uiautomator', 'dump', '/sdcard/udi-window.xml']);
    const dump = join(temp, 'udi-window.xml');
    run(adb, ['-e', 'pull', '/sdcard/udi-window.xml', dump]);
    const $ = load(readFileSync(dump, 'utf8'), { xmlMode: true });
    checkSurface($('node').map((_, node) => `${$(node).attr('text') ?? ''} ${$(node).attr('content-desc') ?? ''}`).get().join('\n'));
  } finally {
    spawnSync(adb, ['-e', 'emu', 'kill'], { timeout: 10000, stdio: 'ignore' });
    emulator.kill();
  }
} else if (platform === 'ios') {
  const devices = JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'available', '--json'])).devices;
  const candidates = Object.entries(devices).filter(([runtime]) => runtime.includes('iOS')).sort(([a], [b]) => b.localeCompare(a, 'en', { numeric: true }));
  const device = candidates.flatMap(([, rows]) => rows).find(row => row.isAvailable && row.name.startsWith('iPhone'));
  assert(device, 'No available iPhone simulator.');
  console.log(`Starting ${device.name} (${device.udid}).`);
  try {
    if (device.state !== 'Booted') run('xcrun', ['simctl', 'boot', device.udid]);
    // A fresh hosted simulator performs its own data migration before our app
    // is installed. The first probe exhausted four minutes in locationd's
    // migrator; allow a bounded eight minutes without disabling system services.
    run('xcrun', ['simctl', 'bootstatus', device.udid, '-b'], 480000);
    run('xcrun', ['simctl', 'install', device.udid, join(temp, 'udi-ios/Build/Products/Debug-iphonesimulator/App.app')]);
    console.log(run('xcrun', ['simctl', 'launch', device.udid, appId]));
    await delay(8000);
    const screenshot = join(temp, 'udi-ios-start.png');
    run('xcrun', ['simctl', 'io', device.udid, 'screenshot', screenshot]);
    const recognizer = join(temp, 'udi-recognize.swift');
    writeFileSync(recognizer, `import Foundation
import Vision
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["en-US", "de-DE"]
try VNImageRequestHandler(url: URL(fileURLWithPath: CommandLine.arguments[1]), options: [:]).perform([request])
print((request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\\n"))
`);
    checkSurface(run('swift', [recognizer, screenshot]));
  } finally {
    spawnSync('xcrun', ['simctl', 'shutdown', device.udid], { timeout: 30000, stdio: 'ignore' });
  }
} else {
  throw new Error('Choose android or ios.');
}
console.log(`Native ${platform} startup passed. Full device/search/voice acceptance remains separate.`);
