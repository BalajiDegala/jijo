import { defineConfig } from '@playwright/test';

const url = 'http://127.0.0.1:4179';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45000,
  workers: 2,
  use: {
    baseURL: url, viewport: { width: 1440, height: 960 },
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
    trace: 'retain-on-failure',
  },
  webServer: { command: 'npm run preview -- --port 4179 --strictPort', url, reuseExistingServer: !process.env.CI },
});
