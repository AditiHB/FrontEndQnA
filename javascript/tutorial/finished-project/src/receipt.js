import { formatMoney, formatTime } from './format.js';
import { lineTotal } from './money.js';
import { Order } from './order.js';

// A plain-text receipt, `width` characters wide, like a real till roll.
export function formatReceipt(order, { width = 32, timeZone } = {}) {
  const dash = '-'.repeat(width);
  const center = (text) => text.padStart(Math.floor((width + text.length) / 2));
  const row = (left, right) => left.padEnd(width - right.length) + right;

  const lines = [
    center('SUNNY LEMONADE STAND'),
    `Order #${order.id} for ${order.customer}`,
    `Placed at ${formatTime(order.placedAt, { timeZone })}`,
    dash,
    ...order.lines.map(({ quantity, name, pricePaise }) =>
      row(`${quantity} x ${name}`, formatMoney(lineTotal(pricePaise, quantity))),
    ),
    dash,
    row('Items', formatMoney(order.subtotal)),
  ];

  const discount = order.subtotal - order.afterDiscounts;
  if (discount > 0) {
    lines.push(row('Discounts', `-${formatMoney(discount)}`));
  }
  lines.push(row(`Tax (${Math.round(Order.taxRate * 100)}%)`, formatMoney(order.tax)));
  const boxFee = order.total - order.afterDiscounts - order.tax;
  if (boxFee > 0) {
    lines.push(row('Take-away box', formatMoney(boxFee)));
  }
  lines.push(row('TOTAL', formatMoney(order.total)), dash, center(`Thank you, ${order.customer}!`));

  return lines.join('\n');
}
