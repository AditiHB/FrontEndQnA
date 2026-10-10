import { cartLines, cartSubtotal, formatMoney, lineTotal, timeAgo } from './index.js';

// A tiny helper to build an element. `dataset` is handled separately because it cannot be assigned.
// Usage: el('li', { className: 'row' }, 'some text', anotherElement)
function el(tag, { dataset = {}, ...props } = {}, ...children) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  Object.assign(element.dataset, dataset);
  element.append(...children);
  return element;
}

function actionButton(text, action, label, disabled = false) {
  const button = el('button', { type: 'button', textContent: text, disabled, dataset: { action } });
  button.setAttribute('aria-label', label);
  return button;
}

export function renderMenu(listElement, menu, stock) {
  const rows = menu.map(({ id, name, emoji, pricePaise }) => {
    const left = stock[id] ?? 0;
    return el(
      'li',
      { className: 'row', dataset: { id } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      el('span', { className: 'stock', textContent: `${left} left` }),
      el('span', { textContent: formatMoney(pricePaise) }),
      actionButton(left > 0 ? 'Add' : 'Sold out', 'add', `Add ${name} to cart`, left === 0),
    );
  });
  listElement.replaceChildren(...rows);
}

export function renderCart(listElement, totalElement, cart) {
  const rows = cartLines(cart).map(({ itemId, quantity, emoji, name, pricePaise }) =>
    el(
      'li',
      { className: 'row', dataset: { id: itemId } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      actionButton('−', 'dec', `Fewer ${name}`),
      el('span', { className: 'qty', textContent: String(quantity) }),
      actionButton('+', 'inc', `More ${name}`),
      el('span', { textContent: formatMoney(lineTotal(pricePaise, quantity)) }),
      actionButton('✕', 'remove', `Remove ${name} from cart`),
    ),
  );
  listElement.replaceChildren(...rows);
  totalElement.textContent =
    cart.length === 0 ? 'Your cart is empty.' : `Total: ${formatMoney(cartSubtotal(cart))}`;
}

export function setMessage(element, text, kind = 'info') {
  element.textContent = text;
  element.dataset.kind = kind;
}

export function addBoardLine(board, text) {
  const line = el('li', { textContent: text });
  board.append(line);
  return line;
}

export function renderServerOrders(listElement, orders) {
  const rows = orders.map(({ id, customer, takeAway, table, lines, receivedAt }) => {
    const extras = [takeAway ? 'take-away' : null, table ? `table ${table}` : null].filter(Boolean);
    const suffix = extras.length > 0 ? ` (${extras.join(', ')})` : '';
    return el('li', {
      className: 'row',
      textContent: `#${id} ${customer}${suffix}: ${lines.length} line(s), ${timeAgo(receivedAt)}`,
    });
  });
  if (rows.length === 0) {
    rows.push(el('li', { className: 'row', textContent: 'No orders yet.' }));
  }
  listElement.replaceChildren(...rows);
}

export function renderReport(listElement, { totalPaise, byItem }) {
  const rows = Object.entries(byItem).map(([itemId, paise]) =>
    el('li', { className: 'row', textContent: `${itemId}: ${formatMoney(paise)}` }),
  );
  rows.unshift(el('li', { className: 'row', textContent: `Total: ${formatMoney(totalPaise)}` }));
  listElement.replaceChildren(...rows);
}
