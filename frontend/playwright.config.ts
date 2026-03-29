import { defineConfig, devices } from '@playwright/test';

/**
 * Execute com frontend + backend já rodando (ver docs/MANUAL-RUNBOOK.md), ou defina
 * PLAYWRIGHT_BASE_URL / PLAYWRIGHT_API_URL se usar portas diferentes.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Pixel 5'] } }],
});
