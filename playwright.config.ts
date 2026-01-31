import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_STATE = path.join(__dirname, 'tests/.auth/storageState.json');
const APPROVER_STORAGE_STATE = path.join(__dirname, 'tests/.auth/approverStorageState.json');
const REVIEWER_STORAGE_STATE = path.join(__dirname, 'tests/.auth/reviewerStorageState.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /^auth\.setup\.ts$/,
    },
    {
      name: 'approver-setup',
      testMatch: /approver-auth\.setup\.ts/,
    },
    {
      name: 'reviewer-setup',
      testMatch: /reviewer-auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'approver',
      use: {
        ...devices['Desktop Chrome'],
        storageState: APPROVER_STORAGE_STATE,
      },
      dependencies: ['approver-setup'],
    },
    {
      name: 'reviewer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: REVIEWER_STORAGE_STATE,
      },
      dependencies: ['reviewer-setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
