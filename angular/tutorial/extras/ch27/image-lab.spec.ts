import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// NgOptimizedImage is a directive for <img>: you write ngSrc instead of src, and Angular
// adds the performance best practices for you.
@Component({
  imports: [NgOptimizedImage],
  template: `
    <img id="hero" ngSrc="toy-hero.png" width="400" height="300" priority alt="A big toy" />
    <img id="below" ngSrc="toy-small.png" width="100" height="100" alt="A small toy" />
  `,
})
class Host {}

describe('NgOptimizedImage lab', () => {
  it('gives the main picture high priority and lazy-loads the others', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const hero: HTMLImageElement = fixture.nativeElement.querySelector('#hero');
    const below: HTMLImageElement = fixture.nativeElement.querySelector('#below');

    expect(hero.getAttribute('fetchpriority')).toBe('high'); // load it first: it is what people see first
    expect(hero.getAttribute('loading')).toBe('eager');
    expect(below.getAttribute('loading')).toBe('lazy'); // wait until it scrolls into view
    expect(below.getAttribute('src')).toBe('toy-small.png');
    // width and height are required: the browser can reserve the space, so the page does not jump
    expect(hero.getAttribute('width')).toBe('400');
  });
});
