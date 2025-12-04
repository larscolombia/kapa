import { test, expect } from '@playwright/test';

/**
 * Test E2E - Verificación del botón Visualizar en ILV Reportes
 * Verifica que el botón de visualizar está habilitado y funciona
 * en todos los estados (abierto y cerrado)
 */

const TEST_USER = {
  username: 'admin@admin.com',
  password: 'E2ETest123'
};

const BASE_URL = 'https://kapa.healtheworld.com.co';

test.describe('ILV - Acción Visualizar', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar al login
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Login
    const usernameField = page.locator('input').first();
    if (await usernameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('🔐 Haciendo login...');
      
      await usernameField.fill(TEST_USER.username);
      const passwordField = page.locator('input[type="password"]').first();
      await passwordField.fill(TEST_USER.password);
      
      const loginButton = page.locator('button:has-text("Ingresar")');
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✓ Login completado');
    }
  });

  async function navigateToILVReportes(page) {
    console.log('📍 Navegando a ILV Reportes via menú...');
    const ilvMenu = page.locator('.q-item:has-text("report_problem")').first();
    await ilvMenu.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  test('Verificar botones de acción en la lista', async ({ page }) => {
    console.log('🧪 Verificando botones de acción en la lista...');

    await navigateToILVReportes(page);
    await page.screenshot({ path: 'e2e/screenshots/ilv-actions-list.png', fullPage: true });

    // Verificar que estamos en la página correcta
    const pageTitle = await page.locator('.text-h5').first().textContent().catch(() => '');
    expect(pageTitle).toContain('Reportes ILV');

    // Obtener todas las filas
    const tableRows = page.locator('.q-table tbody tr');
    const rowCount = await tableRows.count();
    console.log(`📋 Total de filas en tabla: ${rowCount}`);

    expect(rowCount).toBeGreaterThan(0);

    // Analizar cada fila
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = tableRows.nth(i);
      const rowText = await row.textContent();
      
      // Obtener estado
      const estadoChip = row.locator('.q-chip').nth(1); // El segundo chip es el estado
      const estado = await estadoChip.textContent().catch(() => 'desconocido');
      
      // Verificar botón de visualizar
      const viewBtn = row.locator('button .q-icon:has-text("visibility")').first();
      const viewBtnParent = row.locator('button:has(.q-icon:has-text("visibility"))').first();
      const hasViewBtn = await viewBtn.isVisible({ timeout: 1000 }).catch(() => false);
      
      // Verificar si está deshabilitado
      const isViewDisabled = await viewBtnParent.isDisabled().catch(() => false);
      
      // Verificar botón de editar
      const editBtn = row.locator('button .q-icon:has-text("edit")').first();
      const editBtnParent = row.locator('button:has(.q-icon:has-text("edit"))').first();
      const hasEditBtn = await editBtn.isVisible({ timeout: 1000 }).catch(() => false);
      const isEditDisabled = await editBtnParent.isDisabled().catch(() => false);

      console.log(`Fila ${i + 1}:`);
      console.log(`   Estado: ${estado?.trim()}`);
      console.log(`   Visualizar: ${hasViewBtn ? '✓ presente' : '✗ ausente'} - ${isViewDisabled ? '❌ DESHABILITADO' : '✓ habilitado'}`);
      console.log(`   Editar: ${hasEditBtn ? '✓ presente' : '✗ ausente'} - ${isEditDisabled ? '❌ deshabilitado' : '✓ habilitado'}`);

      // El botón de visualizar SIEMPRE debe estar presente y habilitado
      expect(hasViewBtn).toBe(true);
      expect(isViewDisabled).toBe(false);
    }

    console.log('✅ Todos los botones de visualizar están presentes y habilitados');
  });

  test('Botón visualizar funciona en reporte ABIERTO', async ({ page }) => {
    console.log('🧪 Probando visualizar en reporte ABIERTO...');

    await navigateToILVReportes(page);

    // Buscar una fila con estado "abierto"
    const abiertoRow = page.locator('.q-table tbody tr:has(.q-chip:has-text("abierto"))').first();
    const hasAbierto = await abiertoRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasAbierto) {
      console.log('⚠️ No hay reportes abiertos para probar. Saltando test.');
      test.skip();
      return;
    }

    const reportId = await abiertoRow.locator('td').first().textContent();
    console.log(`📋 Probando con reporte abierto ID: ${reportId}`);

    // Click en el botón de visualizar
    const viewBtn = abiertoRow.locator('button:has(.q-icon:has-text("visibility"))').first();
    
    // Verificar que está habilitado
    const isDisabled = await viewBtn.isDisabled();
    expect(isDisabled).toBe(false);
    console.log('✓ Botón visualizar está habilitado');

    await viewBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/ilv-view-abierto.png', fullPage: true });

    // Verificar que llegamos al detalle
    const urlContainsId = page.url().includes('/ilv/reportes/');
    console.log('📍 URL actual:', page.url());
    expect(urlContainsId).toBe(true);

    // Verificar contenido del detalle
    const detailTitle = await page.locator('h4, h5, h6').first().textContent().catch(() => '');
    console.log('📋 Título de página:', detailTitle);

    console.log('✅ Visualización de reporte ABIERTO funciona correctamente');
  });

  test('Botón visualizar funciona en reporte CERRADO', async ({ page }) => {
    console.log('🧪 Probando visualizar en reporte CERRADO...');

    await navigateToILVReportes(page);

    // Buscar una fila con estado "cerrado"
    const cerradoRow = page.locator('.q-table tbody tr:has(.q-chip:has-text("cerrado"))').first();
    const hasCerrado = await cerradoRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasCerrado) {
      console.log('⚠️ No hay reportes cerrados para probar. Saltando test.');
      test.skip();
      return;
    }

    const reportId = await cerradoRow.locator('td').first().textContent();
    console.log(`📋 Probando con reporte cerrado ID: ${reportId}`);

    // Click en el botón de visualizar
    const viewBtn = cerradoRow.locator('button:has(.q-icon:has-text("visibility"))').first();
    
    // Verificar que está habilitado
    const isDisabled = await viewBtn.isDisabled();
    expect(isDisabled).toBe(false);
    console.log('✓ Botón visualizar está habilitado');

    await viewBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/ilv-view-cerrado.png', fullPage: true });

    // Verificar que llegamos al detalle
    const urlContainsId = page.url().includes('/ilv/reportes/');
    console.log('📍 URL actual:', page.url());
    expect(urlContainsId).toBe(true);

    // Verificar contenido del detalle
    const detailTitle = await page.locator('h4, h5, h6').first().textContent().catch(() => '');
    console.log('📋 Título de página:', detailTitle);

    console.log('✅ Visualización de reporte CERRADO funciona correctamente');
  });

  test('Admin puede editar reporte CERRADO', async ({ page }) => {
    console.log('🧪 Verificando que admin puede editar reportes cerrados...');

    await navigateToILVReportes(page);

    // Buscar una fila con estado "cerrado"
    const cerradoRow = page.locator('.q-table tbody tr:has(.q-chip:has-text("cerrado"))').first();
    const hasCerrado = await cerradoRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasCerrado) {
      console.log('⚠️ No hay reportes cerrados para probar. Saltando test.');
      test.skip();
      return;
    }

    const reportId = await cerradoRow.locator('td').first().textContent();
    console.log(`📋 Probando edición de reporte cerrado ID: ${reportId}`);

    // Verificar que el botón de editar está presente (como admin)
    const editBtn = cerradoRow.locator('button:has(.q-icon:has-text("edit"))').first();
    const hasEditBtn = await editBtn.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasEditBtn).toBe(true);
    console.log('✓ Botón editar está visible para admin en reporte cerrado');

    // Verificar que no está deshabilitado
    const isDisabled = await editBtn.isDisabled();
    expect(isDisabled).toBe(false);
    console.log('✓ Botón editar está habilitado');

    // Hacer click en editar y verificar que llegamos al formulario (no error)
    await editBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/ilv-admin-edit-cerrado-form.png', fullPage: true });

    // Verificar que estamos en el formulario de edición (no mensaje de error)
    const currentUrl = page.url();
    console.log('📍 URL actual:', currentUrl);
    
    // Verificar que llegamos al formulario de edición
    expect(currentUrl).toContain('/ilv/reportes/');
    expect(currentUrl).toContain('/editar');
    
    // Verificar que no hay mensaje de error "Solo se pueden editar reportes abiertos"
    const errorMessage = await page.locator('text=Solo se pueden editar reportes abiertos').isVisible({ timeout: 2000 }).catch(() => false);
    expect(errorMessage).toBe(false);
    console.log('✓ No hay mensaje de error de restricción');

    // Verificar que el formulario cargó correctamente
    const formTitle = await page.locator('text=Editar Reporte').isVisible({ timeout: 3000 }).catch(() => false);
    console.log('✓ Formulario de edición cargado:', formTitle);

    console.log('✅ Admin puede editar reportes cerrados correctamente');
  });

});
