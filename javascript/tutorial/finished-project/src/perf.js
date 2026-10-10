// Wait until calls STOP for `ms`, then run once with the latest arguments.
export function debounce(fn, ms) {
  let timerId;
  const debounced = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timerId); // throw away a pending call
  return debounced;
}

// Run at most once every `ms`. Extra calls in between are dropped.
export function throttle(fn, ms, now = Date.now) {
  let last = -Infinity;
  return (...args) => {
    const current = now();
    if (current - last >= ms) {
      last = current;
      fn(...args);
    }
  };
}
