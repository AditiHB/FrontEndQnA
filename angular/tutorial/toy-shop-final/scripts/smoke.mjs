// A quick "is the shop really up?" check. Run it right after a deployment:
//   node scripts/smoke.mjs https://shop.example.com
const base = (process.argv[2] ?? 'http://localhost:4000').replace(/\/$/, '');

const checks = [
  {
    name: 'the health page says ok',
    path: '/healthz',
    test: async (res) => (await res.json()).status === 'ok',
  },
  {
    name: 'the home page already contains the toys (server rendering works)',
    path: '/',
    test: async (res) => (await res.text()).includes('Racing Car'),
  },
  {
    name: 'a product page opens',
    path: '/product/1',
    test: async (res) => res.ok,
  },
  {
    name: 'config.json is never cached for long',
    path: '/config.json',
    test: async (res) => res.headers.get('cache-control') === 'no-cache',
  },
  {
    name: 'the service worker file is never cached for long',
    path: '/ngsw-worker.js',
    test: async (res) => res.headers.get('cache-control') === 'no-cache',
  },
  {
    name: 'the security policy uses the same nonce as the page',
    path: '/',
    test: async (res) => {
      const policy = res.headers.get('content-security-policy') ?? '';
      const nonce = /'nonce-([^']+)'/.exec(policy)?.[1];
      return !!nonce && (await res.text()).includes(`nonce="${nonce}"`);
    },
  },
];

let failed = 0;
for (const check of checks) {
  try {
    const res = await fetch(base + check.path);
    const ok = res.ok && (await check.test(res));
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${check.name}  (${check.path})`);
    if (!ok) failed++;
  } catch (error) {
    console.log(`FAIL  ${check.name}  (${check.path}) -> ${error.message}`);
    failed++;
  }
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll good.');
process.exit(failed ? 1 : 0);
