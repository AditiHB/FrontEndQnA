import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('shows badges and stars from the toy-ui library', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('New!');
    expect(fixture.nativeElement.querySelector('toy-stars')).not.toBeNull();
  });
});
