import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { NotificationService } from './notification-service';
import { UpdateService } from './update-service';

describe('UpdateService', () => {
  // We play the parts of the service worker, the pop-up, and the page reload.
  function setup(isEnabled = true) {
    const versionUpdates = new Subject<{ type: string }>();
    const pressed = new Subject<void>();
    const notify = { show: vi.fn(() => ({ onAction: () => pressed })) };
    const reload = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: { isEnabled, versionUpdates } },
        { provide: NotificationService, useValue: notify },
        { provide: DOCUMENT, useValue: { location: { reload } } },
      ],
    });
    TestBed.inject(UpdateService);
    return { versionUpdates, pressed, notify, reload };
  }

  it('offers a Reload button when a new version is ready, and reloads when it is pressed', () => {
    const { versionUpdates, pressed, notify, reload } = setup();

    versionUpdates.next({ type: 'VERSION_READY' });
    expect(notify.show).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();

    pressed.next(); // the person pressed "Reload"
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('ignores other kinds of version news', () => {
    const { versionUpdates, notify } = setup();
    versionUpdates.next({ type: 'VERSION_DETECTED' });
    expect(notify.show).not.toHaveBeenCalled();
  });

  it('does nothing when the service worker is switched off (development)', () => {
    const { versionUpdates, notify } = setup(false);
    versionUpdates.next({ type: 'VERSION_READY' });
    expect(notify.show).not.toHaveBeenCalled();
  });
});
