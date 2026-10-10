import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FancyNote } from './fancy-note';
import { Repeat } from './repeat';

@Component({
  imports: [Repeat, FancyNote],
  template: `
    <p><span *appRepeat="count; let i" class="star">⭐{{ i }}</span></p>
    <app-fancy-note color="#ff0000">Hi</app-fancy-note>
  `,
})
class Host {
  count = 3;
}

describe('extra directives', () => {
  it('*appRepeat draws the template N times', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.star').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.star').textContent).toContain('⭐0');
  });

  it('the host directive paints the component on hover', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const note: HTMLElement = fixture.nativeElement.querySelector('app-fancy-note');
    note.dispatchEvent(new Event('mouseenter'));
    await fixture.whenStable();
    expect(note.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });
});
