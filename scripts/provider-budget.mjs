// Operator-wide reservations for a single durable SQLite file. Units are
// millionths of USD, avoiding rounding away the cost of small requests.
import {DatabaseSync} from 'node:sqlite';
import {isAbsolute} from 'node:path';

export function openProviderBudget({databasePath, monthlyMicros, requestMicros, now=Date.now}) {
  if (typeof databasePath!=='string' || !isAbsolute(databasePath) ||
      !Number.isSafeInteger(monthlyMicros) || !Number.isSafeInteger(requestMicros) ||
      requestMicros<=0 || requestMicros>monthlyMicros) throw new Error('Invalid provider budget');
  const db=new DatabaseSync(databasePath);
  try {
    db.exec(`PRAGMA busy_timeout=100; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS provider_spend (
        month TEXT PRIMARY KEY, reserved INTEGER NOT NULL CHECK(reserved>=0)
      ) STRICT;`);
  } catch(error) { db.close();throw error; }
  const add=db.prepare(`INSERT INTO provider_spend(month,reserved) VALUES(?,?)
    ON CONFLICT(month) DO UPDATE SET reserved=reserved+excluded.reserved
    WHERE reserved<=?`);
  return {
    reserve() {
      const month=new Date(now()).toISOString().slice(0,7);
      return add.run(month,requestMicros,monthlyMicros-requestMicros).changes===1;
    },
    close() { db.close(); },
  };
}
