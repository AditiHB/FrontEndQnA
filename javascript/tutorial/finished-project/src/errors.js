// The base: anything our stand complains about.
export class StandError extends Error {
  constructor(message, options) {
    super(message, options); // `options` can carry { cause }
    this.name = 'StandError';
  }
}

export class InvalidQuantityError extends StandError {
  constructor(value) {
    super(`"${value}" is not a good number of items`);
    this.name = 'InvalidQuantityError';
    this.value = value;
  }
}

export class UnknownItemError extends StandError {
  constructor(itemId) {
    super(`We do not sell "${itemId}"`);
    this.name = 'UnknownItemError';
    this.itemId = itemId;
  }
}

export class OutOfStockError extends StandError {
  constructor(item, requested, available) {
    super(`Only ${available} ${item.name} left (you asked for ${requested})`);
    this.name = 'OutOfStockError';
    this.itemId = item.id;
  }
}
