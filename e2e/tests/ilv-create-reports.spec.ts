import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

/**
 * E2E Tests para Creación de Reportes ILV
 * Verifica que todos los campos requeridos sean visibles y completables
 * 
 * ANTES DE EJECUTAR: Actualiza las credenciales en e2e/test-config.ts
 */

test.describe('ILV - Creación de Reportes', () => {

    test.beforeEach(async ({ page }) => {
        // Login antes de cada test
        await page.goto(TEST_CONFIG.urls.login);
        await page.fill(TEST_CONFIG.selectors.emailInput, TEST_CONFIG.user.email);
        await page.fill(TEST_CONFIG.selectors.passwordInput, TEST_CONFIG.user.password);
        await page.click(TEST_CONFIG.selectors.submitButton);

        // Esperar a que cargue el dashboard
        await page.waitForURL(/dashboard|inicio/);

        // Navegar al formulario de nuevo reporte
        await page.goto(TEST_CONFIG.urls.ilvNuevoReporte);
        await page.waitForLoadState('networkidle');
    });

    test('01. HID - Identificación de Peligros: Verificar campos requeridos', async ({ page }) => {
        console.log('🧪 Test HID: Verificando campos requeridos');

        // Seleccionar tipo de reporte
        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Identificación de Peligros (HID)');
        await page.waitForTimeout(500);

        // Verificar que los campos requeridos sean visibles
        const requiredFields = [
            'Nombre Quien Reporta',
            'Ubicación',
            'Tipo de Reporte HID',
            'Categoría',
            'Subcategoría',
            'Fecha del Evento',
            'Severidad',
            'Área',
            'Descripción de la Condición'
        ];

        console.log('✅ Verificando visibilidad de campos requeridos...');
        for (const fieldLabel of requiredFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo visible: ${fieldLabel}`);
        }

        // Verificar campos opcionales
        const optionalFields = [
            'Causa Probable',
            'Acción Inmediata',
            'Nombre EHS Contratista',
            'Nombre Supervisor de Obra',
            'Observación'
        ];

        console.log('✅ Verificando visibilidad de campos opcionales...');
        for (const fieldLabel of optionalFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo opcional visible: ${fieldLabel}`);
        }

        console.log('✅ HID: Todos los campos están visibles');
    });

    test('02. HID - Completar todos los campos y crear reporte', async ({ page }) => {
        console.log('🧪 Test HID: Creando reporte completo');

        // Seleccionar tipo
        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Identificación de Peligros (HID)');
        await page.waitForTimeout(500);

        // Seleccionar proyecto
        await page.click('label:has-text("Proyecto")');
        await page.click('.q-item >> nth=0'); // Seleccionar primer proyecto
        await page.waitForTimeout(500);

        // Seleccionar contratista
        await page.click('label:has-text("Contratista")');
        await page.waitForTimeout(500);
        await page.click('.q-item >> nth=0'); // Seleccionar primer contratista
        await page.waitForTimeout(500);

        // Completar campos requeridos
        await page.fill('input[aria-label*="Nombre Quien Reporta"]', 'Juan Pérez (Test E2E)');
        await page.fill('input[aria-label*="Ubicación"]', 'Zona Industrial A - Sector 3');

        // Tipo de Reporte HID
        await page.click('label:has-text("Tipo de Reporte HID")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Categoría
        await page.click('label:has-text("Categoría")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(1000); // Esperar carga de subcategorías

        // Subcategoría
        await page.click('label:has-text("Subcategoría")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Fecha del evento
        const today = new Date().toISOString().split('T')[0];
        await page.fill('input[type="date"]', today);

        // Severidad
        await page.click('label:has-text("Severidad")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Área
        await page.click('label:has-text("Área")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Descripción
        await page.fill('textarea[aria-label*="Descripción de la Condición"]',
            'Se observó cable eléctrico expuesto en zona de alto tránsito. Riesgo de contacto eléctrico.');

        // Campos opcionales
        await page.fill('textarea[aria-label*="Causa Probable"]',
            'Deterioro por uso y falta de mantenimiento preventivo.');
        await page.fill('textarea[aria-label*="Acción Inmediata"]',
            'Señalización del área y aislamiento temporal del cable.');
        await page.fill('input[aria-label*="Nombre EHS Contratista"]', 'Carlos Gómez');
        await page.fill('input[aria-label*="Nombre Supervisor de Obra"]', 'María López');
        await page.fill('textarea[aria-label*="Observación"]',
            'Test E2E - Reporte de prueba automatizada.');

        console.log('✅ Todos los campos completados');

        // Hacer screenshot antes de enviar
        await page.screenshot({ path: 'e2e/screenshots/hid-form-filled.png', fullPage: true });

        // Enviar formulario
        await page.click('button:has-text("Crear Reporte")');

        // Verificar redirección exitosa
        await expect(page).toHaveURL(/\/ilv\/reportes/, { timeout: 10000 });

        // Verificar notificación de éxito
        await expect(page.locator('.q-notification--positive')).toBeVisible({ timeout: 5000 });

        console.log('✅ HID: Reporte creado exitosamente');
    });

    test('03. W&T - Walk & Talk: Verificar campos requeridos', async ({ page }) => {
        console.log('🧪 Test W&T: Verificando campos requeridos');

        // Seleccionar tipo
        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Walk & Talk (W&T)');
        await page.waitForTimeout(500);

        const requiredFields = [
            'Nombre Quien Reporta',
            'Descripción de la Conversación Sostenida',
            'Riesgo Asociado',
            'Plan de Acción Generado o Compromisos',
            'Responsable'
        ];

        console.log('✅ Verificando visibilidad de campos requeridos...');
        for (const fieldLabel of requiredFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo visible: ${fieldLabel}`);
        }

        // Campos opcionales
        const optionalFields = ['Testigo', 'Observación'];
        console.log('✅ Verificando visibilidad de campos opcionales...');
        for (const fieldLabel of optionalFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo opcional visible: ${fieldLabel}`);
        }

        console.log('✅ W&T: Todos los campos están visibles');
    });

    test('04. W&T - Completar y crear reporte', async ({ page }) => {
        console.log('🧪 Test W&T: Creando reporte completo');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Walk & Talk (W&T)');
        await page.waitForTimeout(500);

        // Proyecto y contratista
        await page.click('label:has-text("Proyecto")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Contratista")');
        await page.waitForTimeout(500);
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Campos requeridos
        await page.fill('input[aria-label*="Nombre Quien Reporta"]', 'Ana Martínez (Test E2E)');
        await page.fill('textarea[aria-label*="Descripción de la Conversación"]',
            'Se conversó con el operario sobre la importancia del uso correcto del EPP durante trabajos en altura.');

        await page.click('label:has-text("Riesgo Asociado")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.fill('textarea[aria-label*="Plan de Acción"]',
            'Reforzar capacitación en uso de EPP y realizar seguimiento semanal.');
        await page.fill('input[aria-label*="Responsable"]', 'Supervisor de Seguridad');

        // Campos opcionales
        await page.fill('input[aria-label*="Testigo"]', 'Pedro Ramírez');
        await page.fill('textarea[aria-label*="Observación"]', 'Test E2E W&T');

        console.log('✅ Campos completados');
        await page.screenshot({ path: 'e2e/screenshots/wt-form-filled.png', fullPage: true });

        await page.click('button:has-text("Crear Reporte")');
        await expect(page).toHaveURL(/\/ilv\/reportes/, { timeout: 10000 });
        await expect(page.locator('.q-notification--positive')).toBeVisible({ timeout: 5000 });

        console.log('✅ W&T: Reporte creado exitosamente');
    });

    test('05. SWA - Stop Work Authority: Verificar campos requeridos', async ({ page }) => {
        console.log('🧪 Test SWA: Verificando campos requeridos');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Stop Work Authority (SWA)');
        await page.waitForTimeout(500);

        const requiredFields = [
            'Nombre Quien Reporta',
            'Nombre EHS del Contratista',
            'Nombre Supervisor Obra del Contratista',
            'Descripción de Hallazgo',
            'Tipo de SWA',
            'Hora de Inicio de la Detención',
            'Hora de Reinicio de la Actividad',
            'Área',
            'Responsable'
        ];

        console.log('✅ Verificando visibilidad de campos requeridos...');
        for (const fieldLabel of requiredFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo visible: ${fieldLabel}`);
        }

        const optionalFields = ['Observación'];
        console.log('✅ Verificando campo opcional...');
        for (const fieldLabel of optionalFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo opcional visible: ${fieldLabel}`);
        }

        console.log('✅ SWA: Todos los campos están visibles');
    });

    test('06. SWA - Completar y crear reporte', async ({ page }) => {
        console.log('🧪 Test SWA: Creando reporte completo');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Stop Work Authority (SWA)');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Proyecto")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Contratista")');
        await page.waitForTimeout(500);
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.fill('input[aria-label*="Nombre Quien Reporta"]', 'Luis Torres (Test E2E)');
        await page.fill('input[aria-label*="Nombre EHS del Contratista"]', 'Roberto Sánchez');
        await page.fill('input[aria-label*="Nombre Supervisor Obra"]', 'Patricia Vargas');
        await page.fill('textarea[aria-label*="Descripción de Hallazgo"]',
            'Se detuvo trabajo de soldadura por falta de extintores en el área. Procedimiento HSE-005 incumplido.');

        await page.click('label:has-text("Tipo de SWA")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.fill('input[type="time"] >> nth=0', '08:30');
        await page.fill('input[type="time"] >> nth=1', '10:15');

        await page.click('label:has-text("Área")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.fill('input[aria-label*="Responsable"]', 'Jefe de Obra');
        await page.fill('textarea[aria-label*="Observación"]', 'Test E2E SWA');

        console.log('✅ Campos completados');
        await page.screenshot({ path: 'e2e/screenshots/swa-form-filled.png', fullPage: true });

        await page.click('button:has-text("Crear Reporte")');
        await expect(page).toHaveURL(/\/ilv\/reportes/, { timeout: 10000 });
        await expect(page.locator('.q-notification--positive')).toBeVisible({ timeout: 5000 });

        console.log('✅ SWA: Reporte creado exitosamente');
    });

    test('07. Safety Cards (FDKAR): Verificar campos requeridos', async ({ page }) => {
        console.log('🧪 Test Safety Cards: Verificando campos requeridos');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Safety Cards');
        await page.waitForTimeout(500);

        const requiredFields = [
            'Quién Reporta',
            'Tipo de Tarjeta',
            'Descripción de Hallazgo'
        ];

        console.log('✅ Verificando visibilidad de campos requeridos...');
        for (const fieldLabel of requiredFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo visible: ${fieldLabel}`);
        }

        const optionalFields = ['Observación'];
        console.log('✅ Verificando campo opcional...');
        for (const fieldLabel of optionalFields) {
            const field = page.locator(`label:has-text("${fieldLabel}")`);
            await expect(field).toBeVisible({ timeout: 5000 });
            console.log(`  ✓ Campo opcional visible: ${fieldLabel}`);
        }

        // Verificar que plan_accion_propuesto NO esté visible en creación
        const planAccionField = page.locator('label:has-text("Plan de Acción Propuesto")');
        await expect(planAccionField).not.toBeVisible();
        console.log('  ✓ Plan de Acción Propuesto correctamente ausente en creación');

        console.log('✅ Safety Cards: Todos los campos están visibles correctamente');
    });

    test('08. Safety Cards - Completar y crear reporte', async ({ page }) => {
        console.log('🧪 Test Safety Cards: Creando reporte completo');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Safety Cards');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Proyecto")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Contratista")');
        await page.waitForTimeout(500);
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.fill('input[aria-label*="Quién Reporta"]', 'Diego Morales (Test E2E)');

        await page.click('label:has-text("Tipo de Tarjeta")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        await page.fill('textarea[aria-label*="Descripción de Hallazgo"]',
            'Se observó acto inseguro: trabajador sin casco en zona de riesgo. Violación de normativa de seguridad básica.');
        await page.fill('textarea[aria-label*="Observación"]', 'Test E2E Safety Cards');

        console.log('✅ Campos completados');
        await page.screenshot({ path: 'e2e/screenshots/safety-cards-form-filled.png', fullPage: true });

        await page.click('button:has-text("Crear Reporte")');
        await expect(page).toHaveURL(/\/ilv\/reportes/, { timeout: 10000 });
        await expect(page.locator('.q-notification--positive')).toBeVisible({ timeout: 5000 });

        console.log('✅ Safety Cards: Reporte creado exitosamente');
    });

    test('09. Validación de campos requeridos - HID', async ({ page }) => {
        console.log('🧪 Test: Validación de campos requeridos en HID');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Identificación de Peligros (HID)');
        await page.waitForTimeout(500);

        // Intentar enviar sin completar campos
        await page.click('button:has-text("Crear Reporte")');

        // Verificar que NO se envía el formulario
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/\/ilv\/reportes\/nuevo/);

        console.log('✅ Validación funcionando: formulario no se envía sin campos requeridos');
    });

    test('10. Jerarquía Categoría-Subcategoría en HID', async ({ page }) => {
        console.log('🧪 Test: Jerarquía Categoría-Subcategoría');

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Identificación de Peligros (HID)');
        await page.waitForTimeout(500);

        // Verificar que subcategoría esté deshabilitada inicialmente
        const subcategoriaSelect = page.locator('label:has-text("Subcategoría")').locator('..');
        await expect(subcategoriaSelect).toHaveClass(/disabled|q-field--disabled/);
        console.log('✅ Subcategoría deshabilitada sin categoría seleccionada');

        // Seleccionar categoría
        await page.click('label:has-text("Categoría")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(1500); // Esperar carga de subcategorías

        // Verificar que subcategoría se habilite
        await expect(subcategoriaSelect).not.toHaveClass(/disabled|q-field--disabled/);
        console.log('✅ Subcategoría habilitada después de seleccionar categoría');

        // Verificar que se cargaron opciones de subcategoría
        await page.click('label:has-text("Subcategoría")');
        const subcategoriaOptions = page.locator('.q-item');
        await expect(subcategoriaOptions.first()).toBeVisible({ timeout: 5000 });
        const count = await subcategoriaOptions.count();
        console.log(`✅ Se cargaron ${count} subcategorías`);

        expect(count).toBeGreaterThan(0);
    });
});
