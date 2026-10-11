import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// axe is a robot that checks a page for common accessibility mistakes
// (missing labels, low color contrast, bad heading order, and more).
for (const path of ['/', '/cart', '/login', '/wishlist', '/product/1']) {
  test(`${path} has no automatic accessibility problems`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
