import {searchStorageKey,legacySearchStorageKey} from './saved-searches.mjs';
export const nativeSearchKey='udi.searches.native.v1';
const keys=[searchStorageKey,legacySearchStorageKey];
const invalid=()=>new Error('Gespeicherte Suchen konnten nicht gelesen werden.');
// Capacitor 8.6.2 injects native JSExport methods before loading our modules.
// No registerPlugin function from an unbundled @capacitor/core is assumed.
export function nativeSearchPreferences(bridge) {
  const plugin=bridge?.Plugins?.Preferences;
  if(!plugin||typeof plugin.get!=='function'||typeof plugin.set!=='function')throw invalid();
  return plugin;
}
function decode(value) {
  if(typeof value!=='string'||value.length>65536)throw invalid();
  const record=JSON.parse(value);
  if(record?.version!==1||Object.keys(record).sort().join()!=='values,version'||!record.values||Array.isArray(record.values)
    ||Object.keys(record.values).sort().join()!==[...keys].sort().join()
    ||keys.some(key=>record.values[key]!==null&&typeof record.values[key]!=='string'))throw invalid();
  return record.values;
}
export async function createSearchPersistence({storage,preferences}) {
  let values;
  if(preferences) {
    const response=await preferences.get({key:nativeSearchKey});
    if(!response||!Object.hasOwn(response,'value')||(response.value!==null&&typeof response.value!=='string'))throw invalid();
    values=response.value===null?Object.fromEntries(keys.map(key=>[key,storage.getItem(key)])):decode(response.value);
  }
  const view=record=>({
    getItem:key=>{if(!keys.includes(key))throw invalid();return record[key];},
    setItem:(key,value)=>{if(!keys.includes(key)||typeof value!=='string')throw invalid();record[key]=value;},
  });
  const readable=preferences?{getItem:key=>view(values).getItem(key)}:storage;
  let queue=Promise.resolve();
  return {storage:readable,update(operation) {
    const run=async()=>{
      if(!preferences)return operation(storage);
      const draft={...values},result=operation(view(draft));
      const payload=JSON.stringify({version:1,values:draft});
      if(payload.length>65536)throw invalid();
      await preferences.set({key:nativeSearchKey,value:payload});
      // Existing WebView copies remain recovery inputs. Explicit mutations,
      // especially removal, also update those copies; never create new ones.
      // Compare actual copies on every retry, including after a prior partial
      // cleanup. Publish only after cleanup so a failed removal stays retryable.
      for(const key of keys)if(storage.getItem(key)!==null&&storage.getItem(key)!==draft[key]) {
        if(draft[key]===null)storage.removeItem(key);else storage.setItem(key,draft[key]);
      }
      values=draft;
      return result;
    };
    const pending=queue.then(run);queue=pending.catch(()=>{});return pending;
  }};
}
