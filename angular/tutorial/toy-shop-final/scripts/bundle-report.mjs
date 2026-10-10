// usage: node bundle-report.mjs dist/toy-shop/browser-stats.json
// Adds up how many bytes each package (and each of our own folders) puts in the download.
import { readFileSync } from 'node:fs';

const stats = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const totals = new Map();

for (const output of Object.values(stats.outputs)) {
  for (const [file, info] of Object.entries(output.inputs ?? {})) {
    const m = file.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    const owner = m
      ? m[1]
      : file.startsWith('src/app/')
        ? 'our code: ' + file.split('/').slice(0, 3).join('/')
        : 'other';
    totals.set(owner, (totals.get(owner) ?? 0) + info.bytesInOutput);
  }
}

const rows = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 12);
for (const [name, bytes] of rows)
  console.log((bytes / 1024).toFixed(1).padStart(8) + ' kB  ' + name);
