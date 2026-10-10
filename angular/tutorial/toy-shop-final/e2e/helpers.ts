import type { Page } from '@playwright/test';

// The server sends a finished page quickly, but it only starts to react to typing and clicking
// after the browser has "woken it up" (hydration). If a test types too early, the words are lost.
// So we open pages with this helper, which waits for the "data-ready" flag set by the App component.
export async function open(page: Page, path: string) {
  await page.goto(path);
  await page.locator('app-root[data-ready]').waitFor();
}
