// A generator that never ends: 1, 2, 3, ... (it only makes the next number when asked)
export function* orderNumbers(start = 1) {
  let next = start;
  while (true) {
    yield next;
    next += 1;
  }
}
