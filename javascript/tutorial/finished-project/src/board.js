import { PickupTimer, kitchenUpdates } from './index.js';
import { addBoardLine } from './ui.js';

// Private notes about each order, kept OUTSIDE the order. A WeakMap never stops an order from
// being cleaned up: when the order goes away, its note goes with it.
const startedAt = new WeakMap();

// The kitchen board: stream the updates, then count down to pickup.
export async function watchKitchen(board, order) {
  startedAt.set(order, performance.now());
  addBoardLine(board, `Order #${order.id} for ${order.customer}: the kitchen is cooking...`);
  for await (const update of kitchenUpdates(order)) {
    addBoardLine(board, `   ${update}`);
  }

  const status = addBoardLine(board, `Order #${order.id}: calling your name in 3...`);
  new PickupTimer(3, {
    onTick: (secondsLeft) => {
      status.textContent = `Order #${order.id}: calling your name in ${secondsLeft}...`;
    },
    onDone: () => {
      order.markReady();
      const seconds = ((performance.now() - startedAt.get(order)) / 1000).toFixed(1);
      status.textContent = `Order #${order.id} is ready! 🎉 (took ${seconds} s)`;
      status.classList.add('done');
    },
  }).start();
}
