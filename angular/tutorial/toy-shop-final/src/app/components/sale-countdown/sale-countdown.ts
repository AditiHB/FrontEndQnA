import { afterNextRender, Component, input, OnDestroy, OnInit, signal } from '@angular/core';
import { debug } from '../../utils/debug';

@Component({
  imports: [],
  selector: 'app-sale-countdown',
  styleUrl: './sale-countdown.css',
  templateUrl: './sale-countdown.html',
})
export class SaleCountdown implements OnInit, OnDestroy {
  endsAt = input.required<Date>();
  remaining = signal('');

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    // The constructor is only for getting helpers. Real work waits for later hooks.
    debug('1. constructor: I was just born');

    // afterNextRender runs once, after the first drawing is really on the screen.
    // It never runs on a server, so a server never starts a clock that nobody stops.
    afterNextRender(() => {
      debug('3. afterNextRender: I am on the screen, start the clock');
      this.timer = setInterval(() => this.tick(), 1000);
    });
  }

  ngOnInit() {
    debug('2. ngOnInit: my inputs are ready, show the time');
    this.tick();
  }

  ngOnDestroy() {
    debug('4. ngOnDestroy: I am leaving, stop the clock');
    clearInterval(this.timer);
  }

  private tick() {
    const ms = Math.max(0, this.endsAt().getTime() - Date.now());
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    this.remaining.set(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }
}
