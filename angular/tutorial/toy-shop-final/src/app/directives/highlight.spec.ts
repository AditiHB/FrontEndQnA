import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Highlight } from './highlight';

@Component({
  imports: [Highlight],
  template: `<p appHighlight="#ff0000">Hover me</p>`,
})
class TestHost {}

describe('Highlight', () => {
  it('paints the element when the mouse comes in, and clears it when it leaves', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const p: HTMLElement = fixture.nativeElement.querySelector('p');

    p.dispatchEvent(new Event('mouseenter'));
    await fixture.whenStable();
    expect(p.style.backgroundColor).toBe('rgb(255, 0, 0)');

    p.dispatchEvent(new Event('mouseleave'));
    await fixture.whenStable();
    expect(p.style.backgroundColor).toBe('');
  });
});
