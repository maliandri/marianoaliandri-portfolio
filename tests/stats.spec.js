// tests/stats.spec.js
// 🎭 Tests E2E para el dashboard de estadísticas
import { test, expect } from '@playwright/test';

test.describe('Dashboard de Estadísticas', () => {
  test('debe abrir el dashboard desde el botón flotante', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Buscar botón de estadísticas
    const statsButton = page.getByRole('button', { name: /estadísticas/i }).first();
    await statsButton.click();

    // Verificar que el modal se abrió
    await expect(page.locator('text=/estadísticas/i').first()).toBeVisible();
  });

  test('debe navegar a /stats directamente', async ({ page }) => {
    await page.goto('/stats');

    // Verificar que el dashboard está visible
    await expect(page.locator('text=/estadísticas/i').first()).toBeVisible();
  });

  test('debe mostrar métricas básicas', async ({ page }) => {
    await page.goto('/stats');

    // Esperar a que carguen las estadísticas
    await page.waitForTimeout(2000);

    // Verificar que se muestran métricas
    await expect(page.locator('text=/visitas/i').first()).toBeVisible();
    await expect(page.locator('text=/visitantes/i').first()).toBeVisible();
  });

  test('debe mostrar indicador de conexión a Firebase', async ({ page }) => {
    await page.goto('/stats');

    // Esperar a que se conecte
    await page.waitForTimeout(3000);

    // Debería mostrar "Conectado" o "Sincronizando"
    const connectionStatus = page.locator('text=/conectado|sincronizando/i').first();
    await expect(connectionStatus).toBeVisible();
  });

  test('debe cerrar el modal correctamente', async ({ page }) => {
    await page.goto('/stats');

    // Buscar botón de cerrar
    const closeButton = page.getByRole('button', { name: /cerrar/i }).first();
    await closeButton.click();

    // Debería volver a la home
    await expect(page).toHaveURL('/');
  });
});

test.describe('Sistema de Likes', () => {
  test('debe mostrar botones de like/dislike', async ({ page }) => {
    await page.goto('/');

    // Buscar botones de like
    const likeButton = page.locator('[aria-label*="gusta"], [title*="gusta"]').first();
    await expect(likeButton).toBeVisible();
  });

  test('debe permitir dar like', async ({ page }) => {
    await page.goto('/');

    // Hacer click en like
    const likeButton = page.locator('[aria-label*="gusta"], [title*="gusta"]').first();
    await likeButton.click();

    // Debería mostrar feedback visual
    await page.waitForTimeout(500);
  });
});

test.describe('Contador de Visitantes', () => {
  test('debe mostrar el contador de visitantes', async ({ page }) => {
    await page.goto('/');

    // Esperar a que cargue el contador
    await page.waitForTimeout(2000);

    // Verificar que hay un número visible
    const visitorCount = page.locator('text=/\\d+/').first();
    await expect(visitorCount).toBeVisible();
  });
});
