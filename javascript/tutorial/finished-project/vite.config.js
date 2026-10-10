import { defineConfig } from 'vitest/config';

// While developing, Vite serves the page and hands anything starting with /api to our own server.
const api = { '/api': 'http://localhost:3000' };

export default defineConfig({
  server: { proxy: api },
  preview: { proxy: api },
  test: { include: ['tests/**/*.test.js'] }, // Vitest looks for tests here
});
