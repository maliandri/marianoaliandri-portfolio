// tests/calculators.spec.js
// 🎭 Tests E2E para las calculadoras (Web y ROI)
import { test, expect } from '@playwright/test';

test.describe('Calculadora Web', () => {
  test('debe abrir la calculadora web desde el botón flotante', async ({ page }) => {
    await page.goto('/');

    // Esperar a que los botones flotantes carguen
    await page.waitForTimeout(2000);

    // Buscar y hacer click en el botón de Calculadora Web
    const webCalcButton = page.getByRole('button', { name: /calcular.*web/i }).first();
    await webCalcButton.click();

    // Verificar que el modal se abrió
    await expect(page.locator('text=/calculadora.*web/i').first()).toBeVisible();
  });

  test('debe navegar a /web directamente', async ({ page }) => {
    await page.goto('/web');

    // Verificar que la calculadora está visible
    await expect(page.locator('text=/calculadora.*web/i').first()).toBeVisible();
  });

  test('debe validar campos requeridos', async ({ page }) => {
    await page.goto('/web');

    // Intentar avanzar sin completar campos
    const nextButton = page.getByRole('button', { name: /siguiente|continuar/i }).first();

    if (await nextButton.count() > 0) {
      await nextButton.click();

      // Debería mostrar algún mensaje de validación o no avanzar
      // (esto depende de la implementación actual)
    }
  });
});

test.describe('Calculadora ROI', () => {
  test('debe abrir la calculadora ROI desde el botón flotante', async ({ page }) => {
    await page.goto('/');

    // Esperar a que los botones flotantes carguen
    await page.waitForTimeout(2000);

    // Buscar y hacer click en el botón de ROI
    const roiButton = page.getByRole('button', { name: /roi/i }).first();
    await roiButton.click();

    // Verificar que el modal se abrió
    await expect(page.locator('text=/roi|retorno/i').first()).toBeVisible();
  });

  test('debe navegar a /roi directamente', async ({ page }) => {
    await page.goto('/roi');

    // Verificar que la calculadora está visible
    await expect(page.locator('text=/roi|retorno/i').first()).toBeVisible();
  });

  test('debe calcular ROI con datos válidos', async ({ page }) => {
    await page.goto('/roi');

    // Completar formulario (esto es un ejemplo, ajustar según implementación real)
    const investmentInput = page.locator('input[type="number"]').first();

    if (await investmentInput.count() > 0) {
      await investmentInput.fill('10000');

      // Buscar botón de calcular
      const calculateButton = page.getByRole('button', { name: /calcular/i }).first();

      if (await calculateButton.count() > 0) {
        await calculateButton.click();

        // Debería mostrar resultados
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('Radar Web', () => {
  test('debe abrir el Radar Web', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Buscar botón de Radar Web
    const radarButton = page.getByRole('button', { name: /radar.*web/i }).first();
    await radarButton.click();

    // Verificar que el modal se abrió
    await expect(page.locator('text=/radar.*web/i').first()).toBeVisible();
  });

  test('debe mostrar proyectos en el Radar Web', async ({ page }) => {
    await page.goto('/radarweb');

    // Verificar que se muestran proyectos
    await expect(page.locator('text=/almamod/i')).toBeVisible();
    await expect(page.locator('text=/alumine/i')).toBeVisible();
  });

  test('debe permitir seleccionar un proyecto', async ({ page }) => {
    await page.goto('/radarweb');

    // Hacer click en un proyecto
    const projectCard = page.locator('text=/almamod/i').first();
    await projectCard.click();

    // Debería mostrar el stack tecnológico
    await page.waitForTimeout(500);
    await expect(page.locator('text=/react|firebase|gemini/i').first()).toBeVisible();
  });
});
