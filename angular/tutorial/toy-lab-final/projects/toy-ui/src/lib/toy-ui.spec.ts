import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToyBadge } from './toy-badge/toy-badge';
import { ToyStars } from './toy-stars/toy-stars';

@Component({
  imports: [ToyBadge, ToyStars],
  template: `
    <toy-badge tone="warning">Only 2 left</toy-badge>
    <toy-stars [rating]="4" />
  `,
})
class Host {}

describe('toy-ui', () => {
  it('shows what is written inside a badge, with the warning look', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent).toContain('Only 2 left');
    expect(badge.classList).toContain('warning');
  });

  it('fills four fifths of the stars for a rating of 4', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.fill').style.width).toBe('80%');
    expect(fixture.nativeElement.querySelector('.stars').getAttribute('aria-label')).toBe(
      'Rated 4 out of 5',
    );
  });
});
