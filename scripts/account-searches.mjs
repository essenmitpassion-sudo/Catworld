import {DatabaseSync} from 'node:sqlite';
import {normalizeSearch,readSearches,removeSearch,searchStorageKey,storeSearch} from '../src/saved-searches.mjs';
import {prepareSearch} from '../src/deal-contract.mjs';

export function readSavedSearch(value) {
  if(value?.schemaVersion!==2)throw new Error('Invalid account search version');
  const entry=normalizeSearch(value);
  const {schemaVersion,...input}=entry;
  prepareSearch(input);
  return entry;
}

export function createAccountSearches(databasePath) {
  const db=new DatabaseSync(databasePath);
  try {
    db.exec(`PRAGMA busy_timeout=100;
      CREATE TABLE IF NOT EXISTS account_saved_searches(
        subject TEXT PRIMARY KEY,
        searches TEXT NOT NULL
      ) STRICT;`);
  } catch(error) {
    db.close();
    throw error;
  }
  const select=db.prepare('SELECT searches FROM account_saved_searches WHERE subject=?');
  const upsert=db.prepare(`INSERT INTO account_saved_searches(subject,searches) VALUES(?,?)
    ON CONFLICT(subject) DO UPDATE SET searches=excluded.searches`);
  const remove=db.prepare('DELETE FROM account_saved_searches WHERE subject=?');
  const storage=subject=>{
    let value=select.get(subject)?.searches??null;
    return {
      getItem:key=>key===searchStorageKey?value:null,
      setItem(_key,data) {value=data;},
    };
  };
  function update(subject,entry,operation) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const view=storage(subject);
      const items=operation(view,entry);
      if(items.length)upsert.run(subject,view.getItem(searchStorageKey));
      else remove.run(subject);
      db.exec('COMMIT');
      return items;
    } catch(error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  return {
    list:subject=>readSearches(storage(subject)),
    save:(subject,entry)=>update(subject,entry,storeSearch),
    remove:(subject,entry)=>update(subject,entry,removeSearch),
    deleteAccount:subject=>remove.run(subject),
    close:()=>db.close(),
  };
}
