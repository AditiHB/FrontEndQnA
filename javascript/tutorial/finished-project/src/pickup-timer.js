export class PickupTimer {
  #intervalId = null;

  constructor(seconds, { onTick = () => {}, onDone = () => {} } = {}) {
    this.secondsLeft = seconds;
    this.onTick = onTick;
    this.onDone = onDone;
  }

  start() {
    // An ARROW function: it borrows `this` from start(), so `this` is the timer.
    // (A regular `function () {}` here would get the wrong `this`.)
    this.#intervalId = setInterval(() => {
      this.secondsLeft -= 1;
      this.onTick(this.secondsLeft);
      if (this.secondsLeft <= 0) {
        this.stop();
        this.onDone();
      }
    }, 1000);
    return this;
  }

  stop() {
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }
}
