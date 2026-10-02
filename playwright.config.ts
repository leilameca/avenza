import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    channel: "msedge",
    timezoneId: "America/Santo_Domingo",
  },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }],
});
