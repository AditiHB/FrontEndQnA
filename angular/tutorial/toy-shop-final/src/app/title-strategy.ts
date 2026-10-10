import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject, Service } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

// The router already writes each route's `title` into the browser tab.
// This version also says the new title OUT LOUD, so people who cannot see the page know
// they arrived somewhere new. (The router calls us at exactly the right moment,
// when the new title is known.)
@Service()
export class AnnouncingTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  private announcer = inject(LiveAnnouncer);
  private first = true;

  override updateTitle(snapshot: RouterStateSnapshot) {
    const title = this.buildTitle(snapshot);
    if (title === undefined) return;

    this.title.setTitle(title);
    if (!this.first) this.announcer.announce(title); // not for the very first page
    this.first = false;
  }
}
