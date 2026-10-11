import { describe, expect, it } from 'vitest';
import { StandError } from '../src/errors.js';
import { escapeHtml, safeMerge, safeUrl } from '../src/security.js';
import { defaultSettings, parseSettings } from '../src/settings.js';

describe('escapeHtml', () => {
  it('turns markup into harmless text', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
  });

  it('also escapes & and single quotes', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
  });
});

describe('safeUrl', () => {
  it.each([
    ['https://example.com/party', 'https://example.com/party'],
    ['http://localhost:3000/', 'http://localhost:3000/'],
    ['javascript:alert(1)', null],
    ['  javascript:alert(1)', null],
    ['data:text/html,<h1>hi</h1>', null],
    ['/relative/path', null],
    ['not a url', null],
    [null, null],
  ])('%j becomes %j', (input, expected) => {
    expect(safeUrl(input)).toBe(expected);
  });
});

describe('safeMerge', () => {
  it('merges deeply and leaves its inputs alone', () => {
    const defaults = { theme: 'light', notifications: { sound: true, badge: true } };
    const merged = safeMerge(defaults, { notifications: { sound: false } });
    expect(merged).toEqual({ theme: 'light', notifications: { sound: false, badge: true } });
    expect(defaults.notifications.sound).toBe(true);
  });

  it('refuses to poison Object.prototype', () => {
    const evil = JSON.parse('{ "__proto__": { "isAdmin": true }, "theme": "dark" }');
    const merged = safeMerge({ theme: 'light' }, evil);
    expect({}.isAdmin).toBeUndefined();
    expect(merged).toEqual({ theme: 'dark' });
  });
});

describe('parseSettings', () => {
  it('uses the defaults when nothing was saved', () => {
    expect(parseSettings(null)).toEqual(defaultSettings);
  });

  it('keeps default values the saved text did not mention', () => {
    expect(parseSettings('{"theme":"dark"}')).toEqual({ ...defaultSettings, theme: 'dark' });
  });

  it('explains broken text, and keeps the real reason as the cause', () => {
    let caught;
    try {
      parseSettings('{ nope');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(StandError);
    expect(caught.message).toBe('The saved settings are broken');
    expect(caught.cause).toBeInstanceOf(SyntaxError);
  });

  it('rejects saved text that is not an object', () => {
    expect(() => parseSettings('[1, 2, 3]')).toThrow(StandError);
  });
});
