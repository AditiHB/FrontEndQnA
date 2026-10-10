// The kitchen cooks slowly. Everything here returns a PROMISE.
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prepTimeMs = { drink: 300, snack: 600 };

// Make one order line. `broken` is a list of item ids we cannot make today.
export async function prepareLine(line, { broken = [] } = {}) {
  const { itemId, emoji, name, quantity, category } = line;
  await wait(prepTimeMs[category] ?? 400);
  if (broken.includes(itemId)) {
    throw new Error(`Sorry, we cannot make ${name} right now`);
  }
  return `${emoji} ${name} x${quantity} is ready`;
}

// One line after another (slow).
export async function prepareInOrder(order, options) {
  const messages = [];
  for (const line of order.lines) {
    messages.push(await prepareLine(line, options));
  }
  return messages;
}

// Everybody works at the same time (fast). Fails if any line fails.
export function prepareTogether(order, options) {
  return Promise.all(order.lines.map((line) => prepareLine(line, options)));
}

// Everybody works at the same time, and we report what worked and what did not.
export async function prepareWhatWeCan(order, options) {
  const results = await Promise.allSettled(order.lines.map((line) => prepareLine(line, options)));
  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : `❌ ${result.reason.message}`,
  );
}

// Give up if the promise takes too long.
export function withTimeout(promise, ms) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`Took longer than ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}

// An async generator: the kitchen calls out each dish as soon as it is done.
export async function* kitchenUpdates(order, options) {
  for (const line of order) {
    try {
      yield await prepareLine(line, options);
    } catch (error) {
      yield `❌ ${error.message}`;
    }
  }
}
