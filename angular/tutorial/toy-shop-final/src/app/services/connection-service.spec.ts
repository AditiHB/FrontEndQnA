import { TestBed } from '@angular/core/testing';
import { ConnectionService } from './connection-service';

describe('ConnectionService', () => {
  it('notices when the internet goes away and comes back', () => {
    const connection = TestBed.inject(ConnectionService);
    expect(connection.online()).toBe(true);

    window.dispatchEvent(new Event('offline'));
    expect(connection.online()).toBe(false);

    window.dispatchEvent(new Event('online'));
    expect(connection.online()).toBe(true);
  });
});
