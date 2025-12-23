// playwright.config.js
// 🎭 Configuración de Playwright para E2E testing
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright optimizada para proyecto React + Vite
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directorio donde están los tests
  testDir: './tests',

  // Timeout por test (30 segundos)
  timeout: 30000,

  // Configuración de expects
  expect: {
    timeout: 5000,
  },

  // Ejecutar tests en paralelo
  fullyParallel: true,

  // Fallar build si hay tests con .only
  forbidOnly: !!process.env.CI,

  // Reintentar tests fallidos en CI
  retries: process.env.CI ? 2 : 0,

  // Workers en paralelo
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Configuración compartida para todos los tests
  use: {
    // URL base de la app
    baseURL: 'http://localhost:5173',

    // Recopilar trace en primer reintento
    trace: 'on-first-retry',

    // Screenshots en fallos
    screenshot: 'only-on-failure',

    // Video en fallos
    video: 'retain-on-failure',

    // Configuración de navegador
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  },

  // Proyectos de testing (diferentes navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Tests móviles
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web Server - Inicia Vite antes de los tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
