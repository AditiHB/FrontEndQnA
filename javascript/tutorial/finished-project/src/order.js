import { cartLines } from './cart.js';
import { discountRules } from './discounts.js';
import { StandError } from './errors.js';
import { formatMoney } from './format.js';
import { lineTotal } from './money.js';

export class Order {
  static taxRate = 0.05; // ONE tax rate shared by every order

  #lines; // hidden: only code inside this class can touch these
  #discountNames;
  #status = 'new';

  constructor({ id, customer = 'friend', lines, discountNames = [], placedAt = new Date() }) {
    if (lines.length === 0) {
      throw new StandError('An order needs at least one item');
    }
    this.id = id;
    this.customer = customer;
    this.placedAt = placedAt;
    this.#lines = lines.map((line) => ({ ...line })); // our own copies
    this.#discountNames = [...discountNames];
  }

  // A static method belongs to the class. `this` is the class that was called (Order or a child).
  static fromCart({ id, customer, cart, discountNames, placedAt }) {
    return new this({ id, customer, lines: cartLines(cart), discountNames, placedAt });
  }

  // `for (const line of order)` works. It hands out copies of the lines.
  *[Symbol.iterator]() {
    yield* this.lines;
  }

  get lines() {
    return this.#lines.map((line) => ({ ...line })); // hand out copies, never our own
  }

  get status() {
    return this.#status;
  }

  get subtotal() {
    return this.#lines.reduce(
      (sum, { pricePaise, quantity }) => sum + lineTotal(pricePaise, quantity),
      0,
    );
  }

  get afterDiscounts() {
    return this.#discountNames.reduce(
      (amountPaise, name) => discountRules[name](amountPaise),
      this.subtotal,
    );
  }

  get tax() {
    return Math.round(this.afterDiscounts * Order.taxRate);
  }

  get total() {
    return this.afterDiscounts + this.tax;
  }

  markReady() {
    this.#status = 'ready';
    return this;
  }

  describe() {
    const { id, customer, total } = this;
    return `Order #${id} for ${customer}: ${this.#lines.length} line(s), total ${formatMoney(total)}`;
  }

  // JSON.stringify(order) calls this. Private fields are not copied by default, so we choose what to share.
  toJSON() {
    return {
      id: this.id,
      customer: this.customer,
      status: this.#status,
      placedAt: this.placedAt.toISOString(), // dates travel as ISO strings in UTC
      lines: this.lines,
      total: this.total,
    };
  }
}

// A fancier order: it costs a little extra for the box.
export class TakeAwayOrder extends Order {
  static packagingFeePaise = 500;

  get total() {
    return super.total + TakeAwayOrder.packagingFeePaise;
  }

  describe() {
    const fee = formatMoney(TakeAwayOrder.packagingFeePaise);
    return `${super.describe()} [take-away, includes ${fee} box fee]`;
  }
}
