import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e/tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 1,
    reporter: 'html',
    timeout: 60000, // 60 segundos por test

    use: {
        baseURL: 'https://kapa.healtheworld.com.co',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15000, // 15 segundos por acción
        navigationTimeout: 30000, // 30 segundos para navegación
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: undefined, // Ya está corriendo en producción
});
