import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading-service';

describe('LoadingService', () => {
  it('is loading while at least one request is waiting', () => {
    const loading = TestBed.inject(LoadingService);
    expect(loading.isLoading()).toBe(false);

    loading.start();
    loading.start();
    expect(loading.isLoading()).toBe(true);

    loading.stop();
    expect(loading.isLoading()).toBe(true); // one is still waiting

    loading.stop();
    expect(loading.isLoading()).toBe(false);
  });
});
