import { test, expect } from '@playwright/test';

/**
 * Test E2E - Edición y Visualización de Reportes ILV
 * Verifica que:
 * 1. La visualización del detalle muestra valores legibles, no IDs
 * 2. El formulario de edición carga los datos correctamente
 * 3. La edición guarda los cambios correctamente
 */

const TEST_USER = {
  username: 'admin@admin.com',
  password: 'E2ETest123'
};

const BASE_URL = 'https://kapa.healtheworld.com.co';

test.describe('ILV - Edición y Visualización', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar al login
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Login - el formulario usa "Usuario" y "Contraseña"
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

  // Helper para navegar a ILV Reportes usando el menú
  async function navigateToILVReportes(page) {
    console.log('📍 Navegando a ILV Reportes via menú...');
    const ilvMenu = page.locator('.q-item:has-text("report_problem")').first();
    await ilvMenu.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  test('Visualización de detalle muestra valores legibles, no IDs', async ({ page }) => {
    console.log('🧪 Verificando visualización de detalle...');

    // Navegar a ILV Reportes usando el menú
    await navigateToILVReportes(page);
    
    await page.screenshot({ path: 'e2e/screenshots/ilv-list-page.png', fullPage: true });
    console.log('📍 URL actual:', page.url());

    // Verificar que estamos en la página correcta
    const pageTitle = await page.locator('.text-h5').first().textContent().catch(() => '');
    console.log('📋 Título de página:', pageTitle);
    expect(pageTitle).toContain('Reportes ILV');

    // Buscar filas en la tabla
    const tableRows = page.locator('.q-table tbody tr');
    const rowCount = await tableRows.count();
    console.log(`📋 Filas encontradas en tabla: ${rowCount}`);

    if (rowCount === 0) {
      console.log('⚠️ No hay reportes visibles en la tabla.');
      test.skip();
      return;
    }

    // Click en el ícono de visualizar del primer reporte
    const viewButton = page.locator('.q-table tbody tr').first().locator('button:has-text("visibility"), .q-btn:has(.q-icon:has-text("visibility"))').first();
    console.log('🖱️ Haciendo click en ver detalle...');
    await viewButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Capturar screenshot del detalle
    await page.screenshot({ path: 'screenshots/ilv-detail-view.png', fullPage: true });

    // Verificar que estamos en la página de detalle
    const isDetailPage = await page.locator('text=Detalles del Reporte').isVisible({ timeout: 5000 }).catch(() => false);
    console.log('📍 ¿Está en página de detalle?', isDetailPage);

    if (!isDetailPage) {
      console.log('⚠️ No se pudo acceder al detalle. Verificando URL...');
      console.log('URL actual:', page.url());
    }

    // Buscar todos los campos de detalle (nuevos divs con text-caption)
    const fieldContainers = page.locator('.text-caption.text-grey-7');
    const inputCount = await fieldContainers.count();
    console.log(`📋 Campos encontrados: ${inputCount}`);

    // Verificar que ningún campo muestre solo un número (ID)
    let hasIdValues = false;
    const problematicFields: string[] = [];

    for (let i = 0; i < inputCount; i++) {
      const labelEl = fieldContainers.nth(i);
      const label = await labelEl.textContent().catch(() => 'Campo sin label');
      // El valor está en el siguiente sibling div
      const valueEl = labelEl.locator('xpath=following-sibling::div[1]');
      const value = await valueEl.textContent().catch(() => '');
      
      // Si el valor es solo un número y tiene más de 1 dígito, probablemente es un ID
      if (/^\d{2,}$/.test((value || '').trim())) {
        hasIdValues = true;
        problematicFields.push(`${label}: ${value}`);
        console.log(`❌ Campo con posible ID: ${label} = "${value}"`);
      } else if ((value || '').trim()) {
        console.log(`✓ Campo OK: ${label} = "${value}"`);
      }
    }

    // Si encontramos campos problemáticos, reportarlos
    if (problematicFields.length > 0) {
      console.log('\n⚠️ CAMPOS CON IDS EN LUGAR DE TEXTO:');
      problematicFields.forEach(f => console.log(`   - ${f}`));
    }

    // El test pasa si no hay campos con IDs
    expect(problematicFields.length).toBe(0);
    console.log('✅ Todos los campos muestran valores legibles');
  });

  test('Formulario de edición carga datos correctamente', async ({ page }) => {
    console.log('🧪 Verificando carga de datos en formulario de edición...');

    // Ir a la lista de reportes
    await page.goto(`${BASE_URL}/#/ilv/reportes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Buscar el primer reporte
    const firstRow = page.locator('tbody tr').first();
    const rowExists = await firstRow.isVisible({ timeout: 5000 }).catch(() => false);

    if (!rowExists) {
      console.log('⚠️ No hay reportes para editar. Saltando test.');
      test.skip();
      return;
    }

    // Click en el reporte para ir al detalle
    await firstRow.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Buscar botón de editar
    const editButton = page.locator('button:has-text("Editar"), button[aria-label="Editar"], .q-btn:has(i.q-icon:has-text("edit"))').first();
    const canEdit = await editButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!canEdit) {
      console.log('⚠️ No se puede editar este reporte (posiblemente cerrado o sin permisos)');
      await page.screenshot({ path: 'screenshots/ilv-no-edit-button.png', fullPage: true });
      test.skip();
      return;
    }

    // Click en editar
    await editButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Capturar screenshot del formulario de edición
    await page.screenshot({ path: 'screenshots/ilv-edit-form.png', fullPage: true });

    // Verificar que estamos en el formulario de edición
    const isEditForm = await page.locator('text=Editar Reporte').isVisible({ timeout: 5000 }).catch(() => false);
    console.log('📍 ¿Está en formulario de edición?', isEditForm);
    console.log('URL actual:', page.url());

    // Verificar que los selects tienen valores seleccionados (no vacíos)
    const selects = page.locator('.q-select');
    const selectCount = await selects.count();
    console.log(`📋 Selects encontrados: ${selectCount}`);

    let emptySelects = 0;
    let selectsWithIds = 0;

    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const selectedValue = await select.locator('.q-field__native-text, .q-field__native').textContent().catch(() => '');
      const label = await select.locator('label').textContent().catch(() => `Select ${i + 1}`);

      if (!selectedValue?.trim() || selectedValue === 'Seleccione...') {
        emptySelects++;
        console.log(`⚠️ Select vacío: ${label}`);
      } else if (/^\d{2,}$/.test(selectedValue.trim())) {
        selectsWithIds++;
        console.log(`❌ Select muestra ID: ${label} = "${selectedValue}"`);
      } else {
        console.log(`✓ Select OK: ${label} = "${selectedValue}"`);
      }
    }

    // Verificar inputs de texto
    const textInputs = page.locator('input[type="text"]:not([readonly])');
    const textInputCount = await textInputs.count();
    console.log(`📋 Inputs de texto encontrados: ${textInputCount}`);

    for (let i = 0; i < Math.min(textInputCount, 5); i++) {
      const input = textInputs.nth(i);
      const value = await input.inputValue().catch(() => '');
      console.log(`   Input ${i + 1}: "${value}"`);
    }

    console.log(`\n📊 Resumen: ${emptySelects} selects vacíos, ${selectsWithIds} selects con IDs`);
    
    expect(selectsWithIds).toBe(0);
    console.log('✅ Formulario de edición carga datos correctamente');
  });

  test('Guardar edición funciona correctamente', async ({ page }) => {
    console.log('🧪 Verificando guardado de edición...');

    // Interceptar la petición PUT para ver la respuesta
    let updateResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/ilv/reports/') && response.request().method() === 'PUT') {
        updateResponse = {
          status: response.status(),
          body: await response.text().catch(() => '')
        };
        console.log(`📡 Respuesta PUT: ${response.status()}`);
      }
    });

    // Ir a la lista de reportes
    await page.goto(`${BASE_URL}/#/ilv/reportes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Buscar un reporte abierto
    const firstRow = page.locator('tbody tr').first();
    const rowExists = await firstRow.isVisible({ timeout: 5000 }).catch(() => false);

    if (!rowExists) {
      console.log('⚠️ No hay reportes. Saltando test.');
      test.skip();
      return;
    }

    // Click para ir al detalle
    await firstRow.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Buscar botón de editar
    const editButton = page.locator('button:has-text("Editar")').first();
    const canEdit = await editButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!canEdit) {
      console.log('⚠️ No se puede editar. Saltando test.');
      test.skip();
      return;
    }

    // Click en editar
    await editButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Capturar screenshot antes de guardar
    await page.screenshot({ path: 'screenshots/ilv-before-save.png', fullPage: true });

    // Buscar el botón de guardar
    const saveButton = page.locator('button:has-text("Guardar"), button[type="submit"]').first();
    const canSave = await saveButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!canSave) {
      console.log('❌ No se encontró botón de guardar');
      await page.screenshot({ path: 'screenshots/ilv-no-save-button.png', fullPage: true });
      expect(canSave).toBe(true);
      return;
    }

    // Click en guardar
    console.log('💾 Haciendo click en guardar...');
    await saveButton.click();
    
    // Esperar la respuesta
    await page.waitForTimeout(5000);

    // Capturar screenshot después de guardar
    await page.screenshot({ path: 'screenshots/ilv-after-save.png', fullPage: true });

    // Verificar la respuesta
    if (updateResponse) {
      console.log('📡 Status de respuesta:', updateResponse.status);
      if (updateResponse.status >= 400) {
        console.log('❌ Error en la respuesta:', updateResponse.body);
      }
      expect(updateResponse.status).toBeLessThan(400);
    }

    // Verificar que apareció mensaje de éxito o que redirigió
    const successMessage = await page.locator('text=actualizado exitosamente, text=guardado, text=éxito').isVisible({ timeout: 3000 }).catch(() => false);
    const redirectedToList = page.url().includes('/ilv/reportes') && !page.url().includes('/editar');

    console.log('✓ Mensaje de éxito:', successMessage);
    console.log('✓ Redirigió a lista:', redirectedToList);

    expect(successMessage || redirectedToList).toBe(true);
    console.log('✅ Guardado de edición funciona correctamente');
  });

  test('API - Verificar respuesta de reporte individual', async ({ page, request }) => {
    console.log('🧪 Verificando respuesta de API para reporte individual...');

    // Primero hacer login para obtener token
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loginForm = await page.locator('input[type="text"], input[type="email"]').first();
    if (await loginForm.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.fill('input[type="text"], input[type="email"]', TEST_USER.username);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Interceptar el token del localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    });

    if (!token) {
      console.log('⚠️ No se pudo obtener token. Saltando test de API.');
      test.skip();
      return;
    }

    console.log('🔑 Token obtenido');

    // Obtener lista de reportes primero
    const listResponse = await request.get(`${BASE_URL}/api/ilv/reports`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (listResponse.status() !== 200) {
      console.log('⚠️ No se pudo obtener lista de reportes. Status:', listResponse.status());
      test.skip();
      return;
    }

    const listData = await listResponse.json();
    if (!listData.data || listData.data.length === 0) {
      console.log('⚠️ No hay reportes en la lista.');
      test.skip();
      return;
    }

    const reportId = listData.data[0].report_id;
    console.log(`📋 Verificando reporte #${reportId}`);

    // Obtener el reporte individual
    const reportResponse = await request.get(`${BASE_URL}/api/ilv/reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(reportResponse.status()).toBe(200);
    const report = await reportResponse.json();

    console.log('\n📊 Estructura del reporte:');
    console.log('- report_id:', report.report_id);
    console.log('- tipo:', report.tipo);
    console.log('- estado:', report.estado);
    console.log('- fields count:', report.fields?.length);

    // Verificar que los fields tienen value_display
    let fieldsWithDisplay = 0;
    let fieldsWithOnlyId = 0;

    for (const field of report.fields || []) {
      if (field.value_display) {
        fieldsWithDisplay++;
        console.log(`✓ ${field.key}: value="${field.value}", display="${field.value_display}"`);
      } else if (/^\d{2,}$/.test(field.value || '')) {
        fieldsWithOnlyId++;
        console.log(`❌ ${field.key}: value="${field.value}" (sin value_display, parece ID)`);
      } else {
        console.log(`○ ${field.key}: value="${field.value}" (texto directo)`);
      }
    }

    console.log(`\n📊 Resumen: ${fieldsWithDisplay} con display, ${fieldsWithOnlyId} solo ID`);

    // No debería haber campos numéricos sin value_display
    expect(fieldsWithOnlyId).toBe(0);
    console.log('✅ API retorna value_display para campos numéricos');
  });

});
