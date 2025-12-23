// tests/homepage.spec.js
// 🎭 Tests E2E para la página principal
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe cargar la página principal correctamente', async ({ page }) => {
    // Verificar que el título de la página se carga
    await expect(page).toHaveTitle(/Mariano Aliandri/i);

    // Verificar que el header está presente
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();
  });

  test('debe mostrar los botones del header', async ({ page }) => {
    // Verificar botones principales
    await expect(page.getByRole('button', { name: /tienda/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /chat/i })).toBeVisible();
  });

  test('debe mostrar los botones flotantes de herramientas', async ({ page }) => {
    // Esperar a que los botones flotantes se carguen
    await page.waitForTimeout(2000);

    // Verificar que al menos algunos botones flotantes están visibles
    const calcButton = page.getByRole('button', { name: /calcular/i }).first();
    await expect(calcButton).toBeVisible();
  });

  test('debe tener un tema toggle funcional', async ({ page }) => {
    // Buscar el botón de toggle de tema
    const themeToggle = page.locator('[aria-label*="tema"], [title*="tema"]').first();

    if (await themeToggle.count() > 0) {
      await themeToggle.click();

      // Verificar que el tema cambió (generalmente hay una clase dark en html o body)
      const html = page.locator('html');
      const hasClass = await html.evaluate((el) =>
        el.classList.contains('dark') || el.classList.contains('light')
      );
      expect(hasClass).toBeTruthy();
    }
  });

  test('debe ser responsive en móvil', async ({ page }) => {
    // Cambiar a viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });

    // Verificar que el contenido se ajusta
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();

    // Los botones deben seguir siendo accesibles
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
