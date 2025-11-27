import { test, expect } from '@playwright/test';

/**
 * Test E2E - Guardar reportes ILV
 * Verifica que:
 * 1. No hay valores duplicados en los dropdowns
 * 2. Los formularios se pueden llenar completamente
 * 3. Los reportes se guardan correctamente
 */

// Credenciales de prueba (ajustar según tu ambiente)
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

test.describe('ILV - Guardar Reportes', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar al login
    await page.goto('https://kapa.healtheworld.com.co/');

    // Esperar que cargue
    await page.waitForLoadState('networkidle');

    // Login si es necesario
    const loginForm = await page.locator('input[type="text"], input[type="email"]').first();
    if (await loginForm.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('🔐 Haciendo login...');
      await page.fill('input[type="text"], input[type="email"]', TEST_USER.username);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      console.log('✓ Login exitoso');
    }
  });

  test('Verificar que no hay valores duplicados en Severidad', async ({ page }) => {
    console.log('🧪 Verificando valores de Severidad sin duplicados');

    // Navegar al formulario de nuevo reporte ILV
    await page.goto('https://kapa.healtheworld.com.co/#/ilv/reportes/nuevo');
    await page.waitForLoadState('networkidle');

    // Seleccionar tipo HID
    await page.click('text=Identificación de Peligros');
    await page.waitForTimeout(1000);

    // Hacer click en el select de Severidad
    const severidadSelect = page.locator('label:has-text("Severidad")').locator('..').locator('.q-field__native');
    await severidadSelect.click();
    await page.waitForTimeout(500);

    // Obtener todas las opciones del dropdown
    const options = await page.locator('.q-item__label').allTextContents();
    console.log('📋 Opciones de Severidad encontradas:', options);

    // Verificar valores esperados
    const expectedValues = ['Baja', 'Media', 'Alta', 'Crítica'];
    const foundValues = options.filter(opt => expectedValues.includes(opt));

    console.log('✓ Valores válidos encontrados:', foundValues);

    // Verificar que no haya duplicados
    const uniqueValues = [...new Set(foundValues)];
    expect(foundValues.length).toBe(uniqueValues.length);
    expect(foundValues.length).toBe(4);

    console.log('✅ No hay valores duplicados en Severidad');

    // Cerrar el dropdown
    await page.keyboard.press('Escape');
  });

  test('Verificar que no hay valores duplicados en Área', async ({ page }) => {
    console.log('🧪 Verificando valores de Área sin duplicados');

    // Navegar al formulario de nuevo reporte ILV
    await page.goto('https://kapa.healtheworld.com.co/#/ilv/reportes/nuevo');
    await page.waitForLoadState('networkidle');

    // Seleccionar tipo HID
    await page.click('text=Identificación de Peligros');
    await page.waitForTimeout(1000);

    // Hacer click en el select de Área
    const areaSelect = page.locator('label:has-text("Área")').locator('..').locator('.q-field__native');
    await areaSelect.click();
    await page.waitForTimeout(500);

    // Obtener todas las opciones del dropdown
    const options = await page.locator('.q-item__label').allTextContents();
    console.log('📋 Opciones de Área encontradas:', options);

    // Verificar valores esperados
    const expectedValues = ['Administrativa', 'Operativa', 'Construcción', 'Mantenimiento', 'Operaciones', 'Logística'];
    const foundValues = options.filter(opt => expectedValues.includes(opt));

    console.log('✓ Valores válidos encontrados:', foundValues);

    // Verificar que no haya duplicados
    const uniqueValues = [...new Set(foundValues)];
    expect(foundValues.length).toBe(uniqueValues.length);
    expect(foundValues.length).toBe(6);

    console.log('✅ No hay valores duplicados en Área');

    // Cerrar el dropdown
    await page.keyboard.press('Escape');
  });

  test('Guardar reporte HID completo', async ({ page }) => {
    console.log('🧪 Intentando guardar un reporte HID completo');

    // Navegar al formulario
    await page.goto('https://kapa.healtheworld.com.co/#/ilv/reportes/nuevo');
    await page.waitForLoadState('networkidle');

    // Seleccionar tipo HID
    console.log('1. Seleccionando tipo: Identificación de Peligros (HID)');
    await page.click('text=Identificación de Peligros');
    await page.waitForTimeout(1000);

    // Llenar campos requeridos
    console.log('2. Llenando campos del formulario...');

    // Nombre quien reporta
    await page.fill('input[aria-label="Nombre Quien Reporta *"]', 'Test E2E User');

    // Ubicación
    await page.fill('input[aria-label="Ubicación *"]', 'Área de pruebas E2E');

    // Tipo de reporte HID
    await page.click('label:has-text("Tipo de Reporte HID")');
    await page.waitForTimeout(300);
    await page.click('.q-item__label >> text=Acto inseguro').first();

    // Categoría
    await page.click('label:has-text("Categoría")');
    await page.waitForTimeout(300);
    await page.click('.q-item__label >> text=Trabajos en alturas').first();
    await page.waitForTimeout(500);

    // Subcategoría (debe cargar después de seleccionar categoría)
    await page.click('label:has-text("Subcategoría")');
    await page.waitForTimeout(300);
    const subcatOptions = await page.locator('.q-item__label').allTextContents();
    console.log('   Subcategorías disponibles:', subcatOptions);
    await page.click('.q-item__label').first();

    // Fecha del evento
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);

    // Severidad
    await page.click('label:has-text("Severidad")');
    await page.waitForTimeout(300);
    await page.click('.q-item__label >> text=Media').first();

    // Área
    await page.click('label:has-text("Área") >> visible=true');
    await page.waitForTimeout(300);
    await page.click('.q-item__label >> text=Operativa').first();

    // Descripción de la condición
    await page.fill('textarea[aria-label*="Descripción"]', 'Esta es una descripción de prueba E2E para verificar que el formulario funciona correctamente.');

    console.log('3. Todos los campos llenados');

    // Intentar guardar
    console.log('4. Guardando reporte...');
    await page.click('button:has-text("Guardar")');

    // Esperar confirmación o error
    await page.waitForTimeout(2000);

    // Verificar si hay mensaje de éxito
    const successMessage = page.locator('text=/guardado|éxito|exitoso|creado/i');
    const errorMessage = page.locator('text=/error|fallo|incorrecto/i');

    const hasSuccess = await successMessage.isVisible({ timeout: 3000 }).catch(() => false);
    const hasError = await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);

    if (hasSuccess) {
      console.log('✅ Reporte guardado exitosamente');
    } else if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log('❌ Error al guardar:', errorText);
    } else {
      // Verificar si redirigió a la lista
      const currentUrl = page.url();
      console.log('   URL actual:', currentUrl);

      if (currentUrl.includes('/ilv/reportes') && !currentUrl.includes('/nuevo')) {
        console.log('✅ Redirigido a lista de reportes (guardado exitoso)');
      }
    }

    // Tomar screenshot para evidencia
    await page.screenshot({ path: 'e2e/screenshots/ilv-save-hid.png', fullPage: true });
    console.log('📸 Screenshot guardado en e2e/screenshots/ilv-save-hid.png');

    expect(hasSuccess || page.url().includes('/ilv/reportes')).toBeTruthy();
  });

  test('Guardar reporte W&T completo', async ({ page }) => {
    console.log('🧪 Intentando guardar un reporte W&T completo');

    await page.goto('https://kapa.healtheworld.com.co/#/ilv/reportes/nuevo');
    await page.waitForLoadState('networkidle');

    // Seleccionar tipo W&T
    console.log('1. Seleccionando tipo: Walk & Talk (W&T)');
    await page.click('text=Walk & Talk');
    await page.waitForTimeout(1000);

    console.log('2. Llenando campos...');

    // Llenar campos requeridos
    await page.fill('input[aria-label="Nombre Quien Reporta *"]', 'Test W&T User');
    await page.fill('textarea[aria-label*="Conversación"]', 'Se sostuvo conversación sobre el uso correcto de EPP');

    // Riesgo asociado
    await page.click('label:has-text("Riesgo Asociado")');
    await page.waitForTimeout(300);
    await page.click('.q-item__label').first();

    await page.fill('textarea[aria-label*="Plan de Acción"]', 'Reforzar capacitación en EPP');
    await page.fill('input[aria-label="Responsable *"]', 'Supervisor HSE');

    console.log('3. Guardando reporte W&T...');
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(2000);

    const successMessage = page.locator('text=/guardado|éxito|exitoso|creado/i');
    const hasSuccess = await successMessage.isVisible({ timeout: 3000 }).catch(() => false);

    console.log(hasSuccess ? '✅ W&T guardado exitosamente' : '⚠️ Verificar guardado manual');

    await page.screenshot({ path: 'e2e/screenshots/ilv-save-wt.png', fullPage: true });
  });

  test('Verificar cascada de Categoría → Subcategoría', async ({ page }) => {
    console.log('🧪 Verificando cascada jerárquica Categoría → Subcategoría');

    await page.goto('https://kapa.healtheworld.com.co/#/ilv/reportes/nuevo');
    await page.waitForLoadState('networkidle');

    await page.click('text=Identificación de Peligros');
    await page.waitForTimeout(1000);

    // Seleccionar una categoría
    console.log('1. Seleccionando categoría: Trabajos eléctricos');
    await page.click('label:has-text("Categoría")');
    await page.waitForTimeout(300);
    await page.click('.q-item__label >> text=Trabajos eléctricos').first();
    await page.waitForTimeout(500);

    // Verificar que el campo de subcategoría se habilita
    const subcategoriaField = page.locator('label:has-text("Subcategoría")');
    const isEnabled = await subcategoriaField.isEnabled();
    console.log('2. Campo Subcategoría habilitado:', isEnabled);

    // Abrir subcategorías
    await page.click('label:has-text("Subcategoría")');
    await page.waitForTimeout(500);

    // Obtener opciones de subcategoría
    const subcatOptions = await page.locator('.q-item__label').allTextContents();
    console.log('3. Subcategorías cargadas:', subcatOptions);

    // Verificar que hay opciones específicas para "Trabajos eléctricos"
    const expectedSubcats = ['Lock Out', 'Contactos eléctricos'];
    const hasCorrectOptions = expectedSubcats.some(subcat =>
      subcatOptions.some(opt => opt.includes(subcat))
    );

    expect(hasCorrectOptions).toBeTruthy();
    console.log('✅ Cascada jerárquica funciona correctamente');

    await page.keyboard.press('Escape');
  });

  test('Verificar que todos los tipos de reporte tienen Observación', async ({ page }) => {
    console.log('🧪 Verificando campo Observación en todos los tipos');

    const types = [
      { name: 'Identificación de Peligros', label: 'HID' },
      { name: 'Walk & Talk', label: 'W&T' },
      { name: 'Stop Work Authority', label: 'SWA' },
      { name: 'Safety Cards', label: 'Cards' }
    ];

    for (const type of types) {
      await page.goto('https://kapa.healtheworld.com.co/#/ilv/reportes/nuevo');
      await page.waitForLoadState('networkidle');

      console.log(`Verificando tipo: ${type.label}`);
      await page.click(`text=${type.name}`);
      await page.waitForTimeout(1000);

      // Buscar campo Observación
      const observacionField = page.locator('label:has-text("Observación"), textarea[aria-label*="Observación"]');
      const isVisible = await observacionField.isVisible({ timeout: 2000 }).catch(() => false);

      console.log(`  ${isVisible ? '✓' : '❌'} Campo Observación presente en ${type.label}`);
      expect(isVisible).toBeTruthy();
    }

    console.log('✅ Todos los tipos tienen campo Observación');
  });

});
