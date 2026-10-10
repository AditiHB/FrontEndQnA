import { defineConfig, devices } from '@playwright/test';

// Set BASE_URL to test a server that is already running (for example a preview deployment).
const baseURL = process.env['BASE_URL'] ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Some build machines run as "root" and need this switch for Chromium to start.
    launchOptions: { args: process.env['CI'] ? ['--no-sandbox'] : [] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright starts the app for us (or reuses it if it is already running),
  // unless BASE_URL points at a server that is already up.
  webServer: process.env['BASE_URL']
    ? undefined
    : { command: 'npm start', url: baseURL, reuseExistingServer: true },
});
