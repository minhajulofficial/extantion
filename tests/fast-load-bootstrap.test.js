const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const workerSource = fs.readFileSync('reader-worker.js', 'utf8');
const bootstrapEnd = workerSource.indexOf('\n})();') + '\n})();'.length;
assert(bootstrapEnd > 0, 'fast-load bootstrap block should exist');
const bootstrapSource = workerSource.slice(0, bootstrapEnd);

function createContext({ cacheEntries = new Map(), fetchImpl }) {
  const runtimeListeners = [];
  class FakeRequest {
    constructor(input, init = {}) {
      if (input instanceof FakeRequest) {
        this.url = input.url;
        this.method = (init.method || input.method || 'GET').toUpperCase();
      } else {
        this.url = String(input);
        this.method = (init.method || 'GET').toUpperCase();
      }
    }
    clone() {
      return new FakeRequest(this);
    }
  }
  class FakeResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
    }
    async text() {
      return this.body;
    }
    clone() {
      return new FakeResponse(this.body, { status: this.status });
    }
  }
  const cache = {
    async put(request, response) {
      cacheEntries.set(request.url, response.clone());
    },
    async match(request) {
      const response = cacheEntries.get(request.url);
      return response ? response.clone() : undefined;
    },
  };
  const context = {
    assert,
    URL,
    Request: FakeRequest,
    Response: FakeResponse,
    fetch: fetchImpl,
    caches: {
      async open(name) {
        assert.strictEqual(name, 'photoroom-fast-load-v1');
        return cache;
      },
    },
    chrome: {
      runtime: {
        onInstalled: {
          addListener(listener) {
            runtimeListeners.push(listener);
          },
        },
      },
    },
    __runtimeListeners: runtimeListeners,
    globalThis: null,
  };
  context.globalThis = context;
  return vm.createContext(context);
}

async function run() {
  {
    const calls = [];
    const context = createContext({
      fetchImpl: async (input) => {
        calls.push(input.url || String(input));
        return new context.Response('network-settings');
      },
    });
    vm.runInContext(bootstrapSource, context);

    const response = await context.fetch('https://photoroomai.onrender.com/api/extension/settings');
    assert.strictEqual(await response.text(), 'network-settings');
    assert.strictEqual(calls.length, 1, 'first cacheable request should hit network');
  }

  {
    const cacheEntries = new Map([
      ['https://photoroomai.onrender.com/api/products', { body: 'cached-products', status: 200, ok: true, clone() { return this; }, text: async () => 'cached-products' }],
    ]);
    const calls = [];
    const context = createContext({
      cacheEntries,
      fetchImpl: async (input) => {
        calls.push(input.url || String(input));
        return new context.Response('fresh-products');
      },
    });
    vm.runInContext(bootstrapSource, context);

    const response = await context.fetch('https://photoroomai.onrender.com/api/products');
    assert.strictEqual(await response.text(), 'cached-products');
    await new Promise((resolve) => setImmediate(resolve));
    assert.strictEqual(calls.length, 1, 'cached request should refresh in background');
  }

  {
    const calls = [];
    const context = createContext({
      fetchImpl: async (input) => {
        calls.push(input.url || String(input));
        return new context.Response('license-response');
      },
    });
    vm.runInContext(bootstrapSource, context);

    const response = await context.fetch('https://photoroomai.onrender.com/api/validate', { method: 'POST' });
    assert.strictEqual(await response.text(), 'license-response');
    assert.strictEqual(calls.length, 1, 'non-cacheable POST should pass through unchanged');
  }

  {
    const prefetched = [];
    const context = createContext({
      fetchImpl: async (input) => {
        prefetched.push(input.url || String(input));
        return new context.Response('prefetched');
      },
    });
    vm.runInContext(bootstrapSource, context);
    assert.strictEqual(context.__runtimeListeners.length, 1, 'onInstalled prefetch listener should be registered');
    context.__runtimeListeners[0]();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepStrictEqual(prefetched.sort(), [
      'https://photoroomai.onrender.com/api/extension/settings',
      'https://photoroomai.onrender.com/api/products',
    ]);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
