import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

const attack = 'Hi <b>Sam</b><img src="x" onerror="alert(1)"><script>alert(2)</script>';

@Component({
  template: `
    <p id="text">{{ evil() }}</p>
    <p id="html" [innerHTML]="evil()"></p>
    <p id="bypassed" [innerHTML]="trusted"></p>
    <a id="link" [href]="badLink()">click</a>
  `,
})
class Host {
  evil = signal(attack);
  badLink = signal('javascript:alert(1)');
  // DANGER: this tells Angular "I promise this is safe", and turns the protection OFF.
  trusted = inject(DomSanitizer).bypassSecurityTrustHtml(attack);
}

describe('XSS lab: what Angular does with dangerous text', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('{{ }} turns everything into plain text', async () => {
    const page = await render();
    expect(page.querySelector('#text')!.textContent).toBe(attack); // shown as letters
    expect(page.querySelector('#text')!.innerHTML).toContain('&lt;script&gt;');
  });

  it('[innerHTML] keeps harmless tags and removes dangerous parts', async () => {
    const html = (await render()).querySelector('#html')!.innerHTML;
    expect(html).toContain('<b>Sam</b>');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('script');
  });

  it('javascript: links are defused', async () => {
    const link = (await render()).querySelector('#link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('unsafe:javascript:alert(1)');
  });

  it('bypassSecurityTrustHtml turns the protection OFF (never do this with user text)', async () => {
    const html = (await render()).querySelector('#bypassed')!.innerHTML;
    expect(html).toContain('onerror="alert(1)"'); // the attack is still there
  });
});
