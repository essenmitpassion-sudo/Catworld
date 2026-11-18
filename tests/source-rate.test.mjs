import test from 'node:test';
import assert from 'node:assert/strict';
import dns from 'node:dns/promises';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import { EventEmitter } from 'node:events';
import { pageVerifier } from '../scripts/verification.mjs';

test('langsame DNS-Auflösung verkürzt die veröffentlichte Quellenpause nicht', async () => {
  const originals = { now: Date.now, lookup: dns.lookup, request: https.request };
  const startedAt = 1_800_000_000_000;
  let now = startedAt;
  let resolutions = 0;
  const requests = [];
  try {
    Date.now = () => now;
    dns.lookup = async () => {
      if (!resolutions++) now += 2000;
      return [{ address: '93.184.216.34', family: 4 }];
    };
    https.request = (_url, _options, callback) => {
      requests.push(now);
      const request = new EventEmitter();
      request.end = () => {
        const response = new EventEmitter();
        response.statusCode = 200;
        response.headers = { 'content-type': 'text/html' };
        callback(response);
        queueMicrotask(() => response.emit('end'));
      };
      return request;
    };
    syncBuiltinESMExports();
    const verify = pageVerifier(['dq-solutions.ch']);
    await verify({ url: 'https://www.dq-solutions.ch/de/test-hs1' });
    now = startedAt + 10_000;
    const early = await verify({ url: 'https://www.dq-solutions.ch/de/test-hs2' });
    assert.equal(early.reason, 'source-cooldown');
    assert.equal(requests.length, 1);
    now = startedAt + 12_000;
    await verify({ url: 'https://www.dq-solutions.ch/de/test-hs2' });
    assert.deepEqual(requests, [startedAt + 2000, startedAt + 12_000]);
  } finally {
    Date.now = originals.now;
    dns.lookup = originals.lookup;
    https.request = originals.request;
    syncBuiltinESMExports();
  }
});
