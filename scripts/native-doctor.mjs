import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
async function probe(command,args){try{const {stdout,stderr}=await run(command,args,{windowsHide:true,timeout:10000});return {found:true,version:(stdout+'\n'+stderr).trim().split('\n').slice(0,3).join(' ')}}catch(error){return {found:false,reason:error.code??'unavailable'}}}
const java=await probe('java',['-version']),adb=await probe('adb',['version']);
const xcode=process.platform==='darwin'?await probe('xcodebuild',['-version']):{found:false,reason:'macOS required'};
console.log(JSON.stringify({host:process.platform,node:process.version,android:{java,adb,requires:'JDK 21 and Android SDK platform 36; emulator/device and build still need verification'},ios:{xcode,requires:'Mac with Xcode 26+, simulator/device and build still need verification'},nativeCompilationVerified:false,deviceParityVerified:false},null,2));
