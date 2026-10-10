// report-cli.js - the end-of-day report. Run it with: node report-cli.js
import { makeSales, buildReport, buildReportInChunks, formatMoney } from './src/index.js';

// Count how many times a "heartbeat" timer manages to tick while the work is happening.
async function countHeartbeats(work) {
  let ticks = 0;
  const heartbeat = setInterval(() => {
    ticks += 1;
  }, 5);
  const result = await work();
  clearInterval(heartbeat);
  return { ticks, result };
}

const describe = ({ ticks }) => (ticks > 0 ? 'yes' : 'no (frozen!)');

const sales = makeSales(400_000);
console.log(`Built ${sales.length} pretend sales.`);

const blocking = await countHeartbeats(() => buildReport(sales));
console.log('Blocking report: did the heartbeat keep ticking?', describe(blocking));

const chunked = await countHeartbeats(() => buildReportInChunks(sales, 20_000));
console.log('Chunked report:  did the heartbeat keep ticking?', describe(chunked));

console.log(
  'Same answer both ways?',
  JSON.stringify(blocking.result) === JSON.stringify(chunked.result),
);

const { totalPaise, byItem } = chunked.result;
console.log('Total sales:', formatMoney(totalPaise));
for (const [itemId, paise] of Object.entries(byItem)) {
  console.log(`  ${itemId}: ${formatMoney(paise)}`);
}
