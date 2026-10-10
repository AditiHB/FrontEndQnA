import { InvalidQuantityError, OutOfStockError, UnknownItemError } from './errors.js';
import { findItem, initialStock } from './menu.js';
import { lineTotal } from './money.js';

// Typed text in, a good whole number out, or an InvalidQuantityError.
export function parseQuantity(text) {
  const quantity = Number(text);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(text);
  }
  return quantity;
}

function quantityInCart(cart, itemId) {
  return cart.find((line) => line.itemId === itemId)?.quantity ?? 0;
}

// Remove an item. If it was not in the cart, give back the SAME cart (nothing changed).
export function removeFromCart(cart, itemId) {
  const next = cart.filter((line) => line.itemId !== itemId);
  return next.length === cart.length ? cart : next;
}

// Make the quantity of one item exactly `quantity` (0 removes it). Returns a NEW cart.
export function setQuantity(cart, itemId, quantity, stock = initialStock) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new InvalidQuantityError(quantity);
  }
  const item = findItem(itemId);
  if (!item) {
    throw new UnknownItemError(itemId);
  }
  const available = stock[itemId] ?? 0;
  if (quantity > available) {
    throw new OutOfStockError(item, quantity, available);
  }
  if (quantity === 0) {
    return removeFromCart(cart, itemId);
  }
  if (quantityInCart(cart, itemId) === 0) {
    return [...cart, { itemId, quantity }];
  }
  return cart.map((line) => (line.itemId === itemId ? { ...line, quantity } : line));
}

// Add some more of an item. Same items MERGE into one line, and stock includes what is in the cart.
export function addToCart(cart, itemId, quantity = 1, stock = initialStock) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
  return setQuantity(cart, itemId, quantityInCart(cart, itemId) + quantity, stock);
}

// After an order, how much is left? Returns a NEW stock object.
export function reduceStock(stock, lines) {
  const next = { ...stock }; // it is fine to change a copy that nobody else has seen yet
  for (const { itemId, quantity } of lines) {
    next[itemId] = (next[itemId] ?? 0) - quantity;
  }
  return next;
}

export function cartSubtotal(cart) {
  return cart.reduce(
    (sum, { itemId, quantity }) => sum + lineTotal(findItem(itemId).pricePaise, quantity),
    0,
  );
}

// Turn cart lines into "snapshot" lines that remember name and price at this moment.
export function cartLines(cart) {
  return cart.map(({ itemId, quantity }) => {
    const { name, emoji, pricePaise, category } = findItem(itemId);
    return { itemId, name, emoji, pricePaise, category, quantity };
  });
}
