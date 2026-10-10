import { StandError } from './errors.js';

// Do `load` only the first time `element` scrolls into view.
export function loadWhenVisible(element, load, { signal } = {}) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect(); // we only need this once
    load();
  });
  observer.observe(element);
  signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
}

// Run the end-of-day report in a Web Worker (a second cook) and wrap it in a promise.
export function runReportInWorker(count) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./report-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = () => {
      reject(new StandError('The report worker failed'));
      worker.terminate();
    };
    worker.postMessage({ count });
  });
}
