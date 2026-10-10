import { computed, Service, signal } from '@angular/core';

// Counts how many requests are waiting for an answer right now.
@Service()
export class LoadingService {
  private pending = signal(0);
  readonly isLoading = computed(() => this.pending() > 0);

  start() {
    this.pending.update((n) => n + 1);
  }

  stop() {
    this.pending.update((n) => Math.max(0, n - 1));
  }
}
