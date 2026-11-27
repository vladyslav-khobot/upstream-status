import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTtlCache } from '../src/lib/ttl-cache.ts';

describe('createTtlCache', () => {
  it('shares one in-flight load between concurrent callers', async () => {
    const cache = createTtlCache<number>(1_000);
    let calls = 0;
    const load = () => Promise.resolve(++calls);

    const [a, b] = await Promise.all([cache.getOrLoad('k', load), cache.getOrLoad('k', load)]);

    assert.equal(a, 1);
    assert.equal(b, 1);
    assert.equal(calls, 1);
  });

  it('reloads after the TTL expires', async () => {
    let now = 0;
    const cache = createTtlCache<number>(1_000, () => now);
    let calls = 0;
    const load = () => Promise.resolve(++calls);

    await cache.getOrLoad('k', load);
    now = 999;
    assert.equal(await cache.getOrLoad('k', load), 1);
    now = 1_000;
    assert.equal(await cache.getOrLoad('k', load), 2);
  });

  it('does not cache failures', async () => {
    const cache = createTtlCache<number>(1_000);

    await assert.rejects(cache.getOrLoad('k', () => Promise.reject(new Error('boom'))));
    assert.equal(await cache.getOrLoad('k', () => Promise.resolve(42)), 42);
  });
});
