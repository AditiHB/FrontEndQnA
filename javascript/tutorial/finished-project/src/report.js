import menu from './menu.js';
import { lineTotal } from './money.js';

// Pretend sales for testing. No randomness, so the answer is always the same.
export function makeSales(count) {
  return Array.from({ length: count }, (_, i) => ({
    itemId: menu[i % menu.length].id,
    quantity: (i % 3) + 1,
  }));
}

const emptyReport = () => ({ totalPaise: 0, byItem: {} });

function addSale(report, { itemId, quantity }) {
  const item = menu.find((candidate) => candidate.id === itemId);
  const paise = lineTotal(item.pricePaise, quantity);
  report.totalPaise += paise;
  report.byItem[itemId] = (report.byItem[itemId] ?? 0) + paise;
}

// Does ALL the work in one go. Nothing else can run until it is finished.
export function buildReport(sales) {
  const report = emptyReport();
  for (const sale of sales) {
    addSale(report, sale);
  }
  return report;
}

// Does the work in small chunks and lets the event loop breathe in between.
export function buildReportInChunks(sales, chunkSize = 10_000) {
  return new Promise((resolve) => {
    const report = emptyReport();
    let index = 0;

    function doChunk() {
      const end = Math.min(index + chunkSize, sales.length);
      for (; index < end; index++) {
        addSale(report, sales[index]);
      }
      if (index < sales.length) {
        setTimeout(doChunk, 0); // go to the back of the line: others get a turn
      } else {
        resolve(report);
      }
    }

    doChunk();
  });
}
