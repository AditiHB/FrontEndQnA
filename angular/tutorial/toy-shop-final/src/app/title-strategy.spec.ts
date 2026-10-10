import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { AnnouncingTitleStrategy } from './title-strategy';

@Component({ template: '' })
class Page {}

describe('AnnouncingTitleStrategy', () => {
  it('sets the tab title and says it out loud, but not for the very first page', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Page, title: 'Home page' },
          { path: 'cart', component: Page, title: 'Your cart' },
        ]),
        { provide: TitleStrategy, useExisting: AnnouncingTitleStrategy },
      ],
    });
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce');
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    expect(document.title).toBe('Home page');
    expect(announce).not.toHaveBeenCalled();

    await router.navigateByUrl('/cart');
    expect(document.title).toBe('Your cart');
    expect(announce).toHaveBeenCalledWith('Your cart');
  });
});
