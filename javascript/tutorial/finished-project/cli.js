// cli.js - the Lemonade Stand, version 0.15 (now with proper formatting!)
import {
  stand,
  menu,
  createCashbox,
  orderNumbers,
  addToCart,
  reduceStock,
  initialStock,
  Order,
  TakeAwayOrder,
  kitchenUpdates,
  formatMoney,
  formatTime,
  timeAgo,
  lineTotal,
} from './src/index.js';

const orderIds = orderNumbers();
const nextOrderNumber = () => orderIds.next().value;
const cashbox = createCashbox();

const menuLine = ({ emoji, name, pricePaise }) => `${emoji} ${name} - ${formatMoney(pricePaise)}`;

function placeOrder(OrderType, { customer, cart, discountNames = [], placedAt }) {
  const order = OrderType.fromCart({
    id: nextOrderNumber(),
    customer,
    cart,
    discountNames,
    placedAt,
  });
  cashbox.deposit(order.total);

  console.log(order.describe());
  for (const { quantity, emoji, name, pricePaise } of order) {
    console.log(
      `  ${quantity} x ${emoji} ${name} = ${formatMoney(lineTotal(pricePaise, quantity))}`,
    );
  }
  const { subtotal, afterDiscounts, tax } = order;
  console.log(
    `  Items ${formatMoney(subtotal)}, after discounts ${formatMoney(afterDiscounts)}, tax ${formatMoney(tax)}`,
  );
  return order;
}

// Dynamic import (Step 9): the banner file is only loaded if asked: node cli.js --banner
if (process.argv.includes('--banner')) {
  const { showBanner } = await import('./src/banner.js');
  showBanner(stand);
}

// --- Open the stand ---
console.log(stand.describe());
console.log('--- Menu ---');
for (const item of menu) {
  console.log(menuLine(item));
}

// --- Two orders, at a pretend time: 10 October 2026, 09:30 UTC (month 9 is October!) ---
const opening = Date.UTC(2026, 9, 10, 9, 30);
console.log('--- Orders ---');

let cart = addToCart([], 'lemonade', 3);
cart = addToCart(cart, 'cookie');
cart = addToCart(cart, 'sandwich');
const first = placeOrder(Order, { customer: 'Asha', cart, placedAt: new Date(opening) });

const second = placeOrder(TakeAwayOrder, {
  customer: 'Ravi',
  cart: addToCart([], 'cookie', 4),
  discountNames: ['kids', 'happyHour'],
  placedAt: new Date(opening + 5 * 60 * 1000), // five minutes later
});

const stock = reduceStock(reduceStock(initialStock, first.lines), second.lines);
console.log('Lemonade left:', stock.lemonade, '| Cookies left:', stock.cookie);
console.log('Cash box now holds', formatMoney(cashbox.balance));

// --- Dates ---
const now = opening + 12 * 60 * 1000; // pretend it is now 12 minutes after opening
console.log(
  `Asha ordered ${timeAgo(first.placedAt, now)}, Ravi ordered ${timeAgo(second.placedAt, now)}`,
);
console.log('Asha ordered at', formatTime(first.placedAt, { timeZone: 'UTC' }), 'UTC');
console.log('As data:', JSON.stringify(second).slice(0, 78) + '...');

// Dynamic import (Step 9): the receipt code is only loaded if asked: node cli.js --receipt
if (process.argv.includes('--receipt')) {
  const { formatReceipt } = await import('./src/receipt.js');
  console.log();
  console.log(formatReceipt(first, { timeZone: 'UTC' }));
  console.log();
  console.log(formatReceipt(second, { timeZone: 'UTC' }));
  console.log();
}

// --- The kitchen calls out each dish as it is finished ---
console.log('--- Kitchen board ---');
for await (const update of kitchenUpdates(first)) {
  console.log('  ' + update);
}
first.markReady();
console.log(`Order #${first.id} is ready! 🎉 (status: ${first.status})`);
