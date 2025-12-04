import { test, expect } from '@playwright/test';

/**
 * Test de diagnóstico para ILV
 */

const TEST_USER = {
  username: 'admin@admin.com',
  password: 'E2ETest123'
};

const BASE_URL = 'https://kapa.healtheworld.com.co';

test.describe('ILV - Diagnóstico', () => {

  test('Diagnóstico completo de navegación y datos', async ({ page }) => {
    console.log('🔍 Iniciando diagnóstico...\n');

    // 1. Ir al login
    console.log('1️⃣ Navegando al login...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. Hacer login
    console.log('2️⃣ Haciendo login...');
    const usernameField = page.locator('input[aria-label="Usuario"], input').first();
    await usernameField.fill(TEST_USER.username);
    
    const passwordField = page.locator('input[type="password"]').first();
    await passwordField.fill(TEST_USER.password);
    
    const loginButton = page.locator('button:has-text("Ingresar")');
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('   URL después de login:', page.url());
    
    // Verificar si el token se guardó
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    console.log('   ¿Token guardado?:', authToken ? 'Sí (' + authToken.substring(0, 20) + '...)' : 'NO');
    
    // Verificar estado de Pinia
    const piniaState = await page.evaluate(() => {
      const pinia = (window as any).__pinia;
      if (pinia && pinia.state.value?.auth) {
        return {
          isAuthenticated: pinia.state.value.auth.isAuthenticated,
          user: pinia.state.value.auth.user?.email,
          permissionsCount: pinia.state.value.auth.permissions?.length || 0
        };
      }
      return null;
    });
    console.log('   Estado Pinia:', JSON.stringify(piniaState));
    
    await page.screenshot({ path: 'e2e/screenshots/diag-1-after-login.png', fullPage: true });

    // 3. Navegar a ILV Reportes usando el menú de la app
    console.log('3️⃣ Navegando a ILV Reportes...');
    
    // Primero esperar que la página home cargue completamente
    await page.waitForTimeout(2000);
    
    // Listar todos los items del menú para ver cuál es ILV
    const menuItems = page.locator('.q-list .q-item, .q-drawer .q-item, nav .q-item');
    const menuCount = await menuItems.count();
    console.log('   Items de menú encontrados:', menuCount);
    
    // Mostrar los primeros items
    for (let i = 0; i < Math.min(menuCount, 15); i++) {
      const text = await menuItems.nth(i).textContent().catch(() => '');
      console.log(`   Menu ${i}: ${text?.trim().substring(0, 50)}`);
    }
    
    // Buscar específicamente el ícono report_problem que es ILV
    const reportProblemIcon = page.locator('.q-item:has-text("report_problem"), .q-item .q-icon:has-text("report_problem")').first();
    const hasReportProblem = await reportProblemIcon.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('   ¿Hay item con report_problem?:', hasReportProblem);
    
    if (hasReportProblem) {
      console.log('   Haciendo click en ILV...');
      await reportProblemIcon.click();
      await page.waitForTimeout(2000);
      console.log('   URL después de click:', page.url());
    }
    
    // Si hay un submenú, buscar "Reportes"
    const reportesLink = page.locator('text=Reportes').first();
    const hasReportes = await reportesLink.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('   ¿Hay enlace "Reportes"?:', hasReportes);
    
    if (hasReportes) {
      await reportesLink.click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'e2e/screenshots/diag-2-ilv-page.png', fullPage: true });
    console.log('   URL final:', page.url());

    // 4. Verificar contenido de la página
    console.log('4️⃣ Analizando contenido de la página...');
    
    const pageTitle = await page.locator('.text-h5').first().textContent().catch(() => 'N/A');
    console.log('   Título H4:', pageTitle);
    
    const hasReportesTitle = await page.locator('text=Reportes ILV').isVisible({ timeout: 3000 }).catch(() => false);
    console.log('   ¿Tiene título "Reportes ILV"?:', hasReportesTitle);

    // 5. Buscar la tabla
    console.log('5️⃣ Buscando tabla...');
    
    const qTable = page.locator('.q-table');
    const hasQTable = await qTable.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('   ¿Hay .q-table?:', hasQTable);
    
    if (hasQTable) {
      const rows = page.locator('.q-table tbody tr');
      const rowCount = await rows.count();
      console.log('   Filas en la tabla:', rowCount);
      
      // Mostrar contenido de las primeras filas
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const rowText = await rows.nth(i).textContent().catch(() => '');
        console.log(`   Fila ${i + 1}:`, rowText?.substring(0, 100));
      }
    }

    // 6. Verificar si hay spinner de carga
    const hasSpinner = await page.locator('.q-loading, .q-spinner, [class*="loading"]').isVisible({ timeout: 1000 }).catch(() => false);
    console.log('   ¿Hay spinner de carga?:', hasSpinner);

    // 7. Verificar consola de errores
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Recargar para capturar errores
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      console.log('   ❌ Errores de consola:');
      consoleErrors.forEach(e => console.log('      -', e.substring(0, 100)));
    } else {
      console.log('   ✓ Sin errores de consola');
    }

    // 8. Verificar respuesta de API
    console.log('6️⃣ Verificando API...');
    
    // Interceptar peticiones
    const apiResponses: any[] = [];
    page.on('response', async response => {
      if (response.url().includes('/ilv/reports')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          body: await response.text().catch(() => '')
        });
      }
    });
    
    // Recargar y esperar API
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('   Respuestas de API ILV:');
    if (apiResponses.length === 0) {
      console.log('      ⚠️ No se interceptaron peticiones a /ilv/reports');
    } else {
      apiResponses.forEach(r => {
        console.log(`      ${r.status}: ${r.url}`);
        if (r.status >= 400) {
          console.log('      Body:', r.body.substring(0, 200));
        }
      });
    }

    await page.screenshot({ path: 'e2e/screenshots/diag-3-final.png', fullPage: true });
    
    console.log('\n✅ Diagnóstico completado. Ver screenshots en e2e/screenshots/');
    
    // El test siempre pasa, es solo para diagnóstico
    expect(true).toBe(true);
  });

});
