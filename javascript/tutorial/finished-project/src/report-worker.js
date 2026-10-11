import { buildReport, makeSales } from './report.js';

// A worker has no `document` or `window`, only `self`. It talks by messages.
self.onmessage = (event) => {
  const { count } = event.data;
  self.postMessage(buildReport(makeSales(count)));
};
