// Operator-owned local SQLite ledger. No client plan, billing token or query text.
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {dirname,isAbsolute} from 'node:path';
import {defaultPlanPolicy} from './plan-policy.mjs';

const digest=value=>createHash('sha256').update(value).digest('hex');
const retentionMs=7*86400000;
const canonical=value=>JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)
  ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);

export function utcMonthlyEntitlement(limit=defaultPlanPolicy.freeSearches,at=Date.now()) {
  if(!Number.isSafeInteger(at)||at<0||!Number.isSafeInteger(limit)||limit<0||limit>100000)throw new Error('Invalid free entitlement');
  const date=new Date(at),startsAt=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1)).toISOString();
  return {periodId:'utc:'+startsAt.slice(0,7),startsAt,endsAt:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1)).toISOString(),limit};
}
function timestamp(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))return NaN;
  const parsed=Date.parse(value);return Number.isFinite(parsed)&&new Date(parsed).toISOString()===value?parsed:NaN;
}

export function createAccountQuota({databasePath,now=Date.now,replayMs=60000,maxEntriesPerPeriod=10000}={}) {
  if(typeof databasePath!=='string'||!isAbsolute(databasePath)||databasePath.includes(':memory:')
    ||!Number.isSafeInteger(replayMs)||replayMs<1||replayMs>60000
    ||!Number.isSafeInteger(maxEntriesPerPeriod)||maxEntriesPerPeriod<1||maxEntriesPerPeriod>100000)throw new Error('Invalid quota configuration');
  mkdirSync(dirname(databasePath),{recursive:true,mode:0o700});
  const db=new DatabaseSync(databasePath);
  try {
    db.exec(`PRAGMA busy_timeout=100; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS account_quota_requests (
        subject TEXT NOT NULL, request_id TEXT NOT NULL, period TEXT NOT NULL,
        fingerprint TEXT NOT NULL, token TEXT NOT NULL, state TEXT NOT NULL,
        charged INTEGER NOT NULL CHECK(charged IN (0,1)), reply TEXT, replay_until INTEGER,
        PRIMARY KEY(subject,request_id));
      CREATE INDEX IF NOT EXISTS account_quota_period ON account_quota_requests(subject,period);
      CREATE INDEX IF NOT EXISTS account_quota_reply_end ON account_quota_requests(replay_until) WHERE reply IS NOT NULL;`);
    db.exec(`CREATE TABLE IF NOT EXISTS account_quota_periods (
      subject TEXT NOT NULL,period TEXT NOT NULL,starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,
      PRIMARY KEY(subject,period));
      CREATE INDEX IF NOT EXISTS account_quota_period_end ON account_quota_periods(ends_at);
      CREATE INDEX IF NOT EXISTS account_quota_window ON account_quota_periods(subject,starts_at,ends_at);`);
  } catch(error) {db.close();throw error;}
  function transaction(operation) {
    db.exec('BEGIN IMMEDIATE');
    try {const result=operation();db.exec('COMMIT');return result;}
    catch(error){try{db.exec('ROLLBACK');}catch{}throw error;}
  }
  function time() {const value=now();if(!Number.isSafeInteger(value)||value<0)throw new Error('Invalid quota clock');return value;}
  function prune(at) {
    const cutoff=new Date(at-retentionMs).toISOString();
    db.prepare('UPDATE account_quota_requests SET reply=NULL WHERE reply IS NOT NULL AND replay_until<=?').run(at);
    db.prepare(`DELETE FROM account_quota_requests WHERE (subject,period) IN (
      SELECT subject,period FROM account_quota_periods WHERE ends_at<=?)`).run(cutoff);
    db.prepare('DELETE FROM account_quota_periods WHERE ends_at<=?').run(cutoff);
  }
  return Object.freeze({
    durable:true,
    reserve({subject,requestId,input,entitlement}) {
      const at=time();
      const starts=timestamp(entitlement?.startsAt),ends=timestamp(entitlement?.endsAt);
      if(typeof subject!=='string'||!/^[A-Za-z0-9:_|.-]{1,128}$/.test(subject)
        ||typeof requestId!=='string'||!/^[a-f0-9]{32}$/.test(requestId)
        ||typeof entitlement?.periodId!=='string'||!/^[A-Za-z0-9:_|.-]{1,128}$/.test(entitlement.periodId)
        ||!Number.isSafeInteger(starts)||!Number.isSafeInteger(ends)||starts>at||ends<=at||ends-starts>32*86400000
        ||!Number.isSafeInteger(entitlement.limit)||entitlement.limit<0||entitlement.limit>maxEntriesPerPeriod)throw new Error('Invalid account entitlement');
      const account=digest(subject),fingerprint=digest(canonical(input));
      return transaction(()=>{
        prune(at);
        const matching=db.prepare('SELECT period FROM account_quota_periods WHERE subject=? AND starts_at=? AND ends_at=?')
          .all(account,entitlement.startsAt,entitlement.endsAt);
        if(matching.some(row=>row.period!==entitlement.periodId))throw new Error('Changed account period ID');
        db.prepare('INSERT OR IGNORE INTO account_quota_periods(subject,period,starts_at,ends_at) VALUES(?,?,?,?)')
          .run(account,entitlement.periodId,entitlement.startsAt,entitlement.endsAt);
        const period=db.prepare('SELECT starts_at,ends_at FROM account_quota_periods WHERE subject=? AND period=?').get(account,entitlement.periodId);
        if(period.starts_at!==entitlement.startsAt||period.ends_at!==entitlement.endsAt)throw new Error('Changed account period');
        const previous=db.prepare('SELECT * FROM account_quota_requests WHERE subject=? AND request_id=?').get(account,requestId);
        if(previous) {
          if(previous.fingerprint!==fingerprint)return {kind:'conflict'};
          if(previous.state==='reserved')return {kind:'pending'};
          if(previous.period===entitlement.periodId&&previous.reply&&previous.replay_until>at)return {kind:'replay',reply:JSON.parse(previous.reply)};
          return {kind:'request-reused'};
        }
        const usage=db.prepare('SELECT count(*) AS entries,coalesce(sum(charged),0) AS used FROM account_quota_requests WHERE subject=? AND period=?').get(account,entitlement.periodId);
        if(usage.used>=entitlement.limit||usage.entries>=maxEntriesPerPeriod) {
          return {kind:'quota-exceeded',retryAfter:Math.max(1,Math.ceil((ends-at)/1000))};
        }
        const token=randomUUID();
        db.prepare("INSERT INTO account_quota_requests(subject,request_id,period,fingerprint,token,state,charged) VALUES(?,?,?,?,?,'reserved',1)")
          .run(account,requestId,entitlement.periodId,fingerprint,token);
        return {kind:'reserved',account,requestId,token};
      });
    },
    prune() { transaction(()=>prune(time())); },
    // Revoke the identity and drain all authenticated requests first, including
    // any between authentication and reserve. Never reuse a deleted subject.
    deleteAccount(subject) {
      if(typeof subject!=='string'||!/^[A-Za-z0-9:_|.-]{1,128}$/.test(subject))throw new Error('Invalid account');
      const account=digest(subject);
      transaction(()=>{
        prune(time());
        if(db.prepare("SELECT 1 FROM account_quota_requests WHERE subject=? AND state='reserved'").get(account))throw new Error('Account still has reserved searches');
        db.prepare('DELETE FROM account_quota_requests WHERE subject=?').run(account);
        db.prepare('DELETE FROM account_quota_periods WHERE subject=?').run(account);
      });
    },
    finish(reservation,{reply,charge=false}={}) {
      if(reservation?.kind!=='reserved'||typeof charge!=='boolean')throw new Error('Invalid quota settlement');
      const at=time(),encoded=reply===undefined?null:JSON.stringify(reply);
      if(encoded!==null&&Buffer.byteLength(encoded)>65536)throw new Error('Invalid quota response');
      const deadlines=[at+replayMs];
      if(reply?.kind==='results') {
        deadlines.push(Date.parse(reply.completedAt)+300000);
        for(const item of reply.items??[])deadlines.push(Date.parse(item.expiresAt));
      }
      const replayUntil=Math.min(...deadlines);
      if(encoded!==null&&(!Number.isSafeInteger(replayUntil)||replayUntil<=at))throw new Error('Expired quota response');
      return transaction(()=>{
        const changed=db.prepare("UPDATE account_quota_requests SET state=?,charged=?,reply=?,replay_until=? WHERE subject=? AND request_id=? AND token=? AND state='reserved'")
          .run(encoded===null?'failed':'complete',charge?1:0,encoded,replayUntil,reservation.account,reservation.requestId,reservation.token);
        if(changed.changes!==1)throw new Error('Quota reservation no longer owned');
      });
    },
    close(){db.close();},
  });
}
