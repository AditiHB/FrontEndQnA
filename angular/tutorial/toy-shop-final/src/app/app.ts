import {
  afterNextRender,
  ApplicationRef,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { SiteHeader } from './components/site-header/site-header';
import { ConnectionService } from './services/connection-service';
import { LoadingService } from './services/loading-service';
import { UpdateService } from './services/update-service';

@Component({
  imports: [RouterOutlet, SiteHeader],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  // Browser tests wait for this little flag (see e2e/helpers.ts).
  host: { '[attr.data-ready]': 'ready() ? "" : null' },
})
export class App {
  loading = inject(LoadingService);
  connection = inject(ConnectionService);
  // The server draws the page first. "ready" turns on once the browser has woken the page up.
  protected ready = signal(false);
  private main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    // "Stable" means: the page is drawn and nothing is still loading.
    const appRef = inject(ApplicationRef);
    afterNextRender(() => appRef.whenStable().then(() => this.ready.set(true)));
    inject(UpdateService); // starts listening for new versions

    // A web page that "changes" without reloading is silent for people who cannot see it.
    // So after every move to a new page we move the keyboard focus to the top of the new page.
    // (The new title is announced by AnnouncingTitleStrategy, see title-strategy.ts.)
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        skip(1), // not for the very first page
        takeUntilDestroyed(),
      )
      .subscribe(() => this.main().nativeElement.focus());
  }

  skipToMain(event: Event) {
    event.preventDefault(); // do not change the address, just move the focus
    this.main().nativeElement.focus();
  }
}
