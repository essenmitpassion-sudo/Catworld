import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {appFiles} from './public-files.mjs';

const config=JSON.parse(await readFile(new URL('../capacitor.config.json',import.meta.url),'utf8'));
assert.equal(config.webDir,'native-dist');assert.equal(config.server.cleartext,false);
assert(!config.server.url&&!config.server.allowNavigation);assert.equal(config.loggingBehavior,'none');
assert.deepEqual(config.includePlugins,['@capacitor/preferences']);
assert.deepEqual(JSON.parse(await readFile(new URL('../android/app/src/main/assets/capacitor.plugins.json',import.meta.url),'utf8')),[{pkg:'@capacitor/preferences',classpath:'com.capacitorjs.plugins.preferences.PreferencesPlugin'}]);
assert.deepEqual(JSON.parse(await readFile(new URL('../ios/App/App/capacitor.config.json',import.meta.url),'utf8')).packageClassList,['PreferencesPlugin']);
const destinations=['android/app/src/main/assets/public/','ios/App/App/public/'];
const files=appFiles.map(([file])=>file).filter(file=>file!=='observations.json');
for(const file of files) {
  const original=await readFile(new URL('../native-dist/'+file,import.meta.url));
  for(const destination of destinations)assert.equal(createHash('sha256').update(await readFile(new URL('../'+destination+file,import.meta.url))).digest('hex'),createHash('sha256').update(original).digest('hex'),destination+file);
}
for(const destination of ['native-dist/',...destinations]) {
  const index=await readFile(new URL('../'+destination+'index.html',import.meta.url),'utf8');
  assert(index.includes('name="udi-runtime" content="native"'));assert(index.includes("connect-src 'none'"));
  assert(index.includes('data-native-ui=""'));
  await assert.rejects(lstat(new URL('../'+destination+'observations.json',import.meta.url)),{code:'ENOENT'});
}
const manifest=await readFile(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
for(const file of ['android/capacitor-cordova-android-plugins/build.gradle','android/capacitor-cordova-android-plugins/cordova.variables.gradle'])assert((await readFile(new URL('../'+file,import.meta.url),'utf8')).length>0,'Missing generated Android build input: '+file);
assert(manifest.includes('android:allowBackup="false"'));assert(manifest.includes('android:usesCleartextTraffic="false"'));
const packageFile=await readFile(new URL('../ios/App/CapApp-SPM/Package.swift',import.meta.url),'utf8');
const deps=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).dependencies;
assert(packageFile.includes('exact: "'+deps['@capacitor/ios']+'"'));
assert(packageFile.includes('CapacitorPreferences'));
const privacy=await readFile(new URL('../ios/App/App/PrivacyInfo.xcprivacy',import.meta.url),'utf8');
assert(privacy.includes('NSPrivacyAccessedAPICategoryUserDefaults')&&privacy.includes('CA92.1'));
assert((await readFile(new URL('../ios/App/App.xcodeproj/project.pbxproj',import.meta.url),'utf8')).includes('PrivacyInfo.xcprivacy in Resources'));
const icon=await readFile(new URL('../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',import.meta.url));
assert.equal(icon.readUInt32BE(16),1024);assert.equal(icon.readUInt32BE(20),1024);assert.equal(icon[25],2,'iOS icon is RGB without alpha channel');
console.log(JSON.stringify({filesPerPlatform:files.length,identicalBundledUi:true,networkDisabled:true,observationSnapshotsExcluded:true,nativeCompilationVerified:false,deviceParityVerified:false}));
