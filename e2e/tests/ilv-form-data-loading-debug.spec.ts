import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

/**
 * E2E Tests para DIAGNOSTICAR el problema de carga de datos en formularios ILV
 * 
 * Este test está diseñado para:
 * 1. Interceptar llamadas API a /clients/:id/projects y /clients/:id/contractors
 * 2. Verificar que las respuestas contengan datos reales de Cogua (client_id=2)
 * 3. Confirmar que los dropdowns se pueblan correctamente
 * 4. Diagnosticar exactamente dónde está fallando el flujo
 * 
 * ANTES DE EJECUTAR: Actualiza credenciales en e2e/test-config.ts
 */

test.describe('ILV - DEBUG: Carga de Datos con Cogua', () => {

    test.beforeEach(async ({ page }) => {
        // Habilitar logs de consola para debugging
        page.on('console', msg => {
            const type = msg.type();
            if (type === 'error' || type === 'warning') {
                console.log(`🔴 [BROWSER ${type.toUpperCase()}]:`, msg.text());
            }
        });

        // Capturar errores no manejados
        page.on('pageerror', error => {
            console.log('🔴 [PAGE ERROR]:', error.message);
        });

        // Login
        await page.goto(TEST_CONFIG.urls.login);
        await page.fill(TEST_CONFIG.selectors.emailInput, TEST_CONFIG.user.email);
        await page.fill(TEST_CONFIG.selectors.passwordInput, TEST_CONFIG.user.password);
        await page.click(TEST_CONFIG.selectors.submitButton);

        // Esperar a que cargue el dashboard o home
        await page.waitForURL(/dashboard|inicio|\/$/, { timeout: 10000 });
        console.log('✅ Login exitoso');

        // Navegar al formulario de nuevo reporte
        await page.goto(TEST_CONFIG.urls.ilvNuevoReporte);
        await page.waitForLoadState('networkidle');
        console.log('✅ Formulario ILV cargado');
    });

    test('DEBUG: HID - Interceptar API calls y verificar carga de datos de Cogua', async ({ page }) => {
        console.log('\n🧪 Test DEBUG: HID con datos reales de Cogua (client_id=170)\n');

        // Variables para capturar respuestas de API
        let projectsResponse: any = null;
        let contractorsResponse: any = null;
        let projectsApiCalled = false;
        let contractorsApiCalled = false;

        // Interceptar llamada a /clients/170/projects
        await page.route('**/clients/170/projects', async (route, request) => {
            console.log('🌐 Interceptando: GET /clients/170/projects');
            projectsApiCalled = true;

            const response = await route.fetch();
            const data = await response.json();
            projectsResponse = data;

            console.log(`📦 Respuesta /clients/170/projects: ${JSON.stringify(data, null, 2)}`);
            console.log(`📊 Total proyectos recibidos: ${data?.length || 0}`);

            await route.fulfill({ response });
        });

        // Interceptar llamada a /clients/170/contractors
        await page.route('**/clients/170/contractors', async (route, request) => {
            console.log('🌐 Interceptando: GET /clients/170/contractors');
            contractorsApiCalled = true;

            const response = await route.fetch();
            const data = await response.json();
            contractorsResponse = data;

            console.log(`📦 Respuesta /clients/170/contractors: ${JSON.stringify(data, null, 2)}`);
            console.log(`📊 Total contratistas recibidos: ${data?.length || 0}`);

            await route.fulfill({ response });
        });

        // Paso 1: Seleccionar tipo de reporte HID
        console.log('\n📝 Seleccionando tipo de reporte: HID');
        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Identificación de Peligros (HID)');
        await page.waitForTimeout(500);
        console.log('✅ Tipo HID seleccionado');

        // Paso 2: Abrir dropdown de cliente y seleccionar Cogua
        console.log('\n📝 Buscando "Owens Illinois (Planta Peldar Cogua)" en dropdown...');
        await page.click('label:has-text("Centro de Trabajo")');

        // Esperar a que se abran las opciones
        await page.waitForTimeout(1000);

        // Buscar Cogua en el dropdown
        const coguaOption = page.locator('.q-item').filter({ hasText: /Owens Illinois.*Cogua/i });
        await expect(coguaOption).toBeVisible({ timeout: 5000 });
        console.log('✅ Opción "Cogua" encontrada en dropdown');

        // Capturar screenshot antes de seleccionar
        await page.screenshot({
            path: 'e2e/screenshots/debug-cogua-dropdown-antes.png',
            fullPage: true
        });

        // Seleccionar Cogua
        console.log('\n🎯 Seleccionando "Owens Illinois (Planta Peldar Cogua)"...');
        await coguaOption.click();

        // Esperar a que se disparen las llamadas API
        console.log('⏳ Esperando llamadas API...');
        await page.waitForTimeout(3000);

        // Capturar screenshot después de seleccionar
        await page.screenshot({
            path: 'e2e/screenshots/debug-cogua-dropdown-despues.png',
            fullPage: true
        });

        // VERIFICACIONES
        console.log('\n🔍 VERIFICANDO RESULTADOS:\n');

        // Verificar que las API fueron llamadas
        console.log(`1️⃣ API /clients/170/projects llamada: ${projectsApiCalled ? '✅ SÍ' : '❌ NO'}`);
        console.log(`2️⃣ API /clients/170/contractors llamada: ${contractorsApiCalled ? '✅ SÍ' : '❌ NO'}`);

        expect(projectsApiCalled).toBe(true);
        expect(contractorsApiCalled).toBe(true);

        // Verificar que las respuestas contienen datos
        console.log(`\n3️⃣ Proyectos recibidos: ${projectsResponse?.length || 0}`);
        if (projectsResponse && projectsResponse.length > 0) {
            console.log('   Primer proyecto:', projectsResponse[0]);
        }
        expect(projectsResponse).toBeDefined();
        expect(projectsResponse.length).toBeGreaterThan(0);

        console.log(`4️⃣ Contratistas recibidos: ${contractorsResponse?.length || 0}`);
        if (contractorsResponse && contractorsResponse.length > 0) {
            console.log('   Primer contratista:', contractorsResponse[0]);
        }
        expect(contractorsResponse).toBeDefined();
        expect(contractorsResponse.length).toBeGreaterThan(0);

        // Verificar que no hay notificación de error visible
        console.log('\n5️⃣ Verificando que NO aparezca mensaje de error...');
        const errorNotification = page.locator('.q-notification--warning, .q-notification--negative');
        const hasError = await errorNotification.isVisible().catch(() => false);

        if (hasError) {
            const errorText = await errorNotification.textContent();
            console.log(`❌ ERROR VISIBLE: "${errorText}"`);

            // Capturar screenshot del error
            await page.screenshot({
                path: 'e2e/screenshots/debug-cogua-error-notification.png',
                fullPage: true
            });

            expect(hasError).toBe(false); // Fallar el test si hay error
        } else {
            console.log('✅ No hay notificación de error visible');
        }

        // Verificar que los dropdowns de proyecto y contratista se habiliten
        console.log('\n6️⃣ Verificando que dropdown "Proyecto" esté habilitado...');
        await page.click('label:has-text("Proyecto")');
        await page.waitForTimeout(1000);

        const projectOptions = page.locator('.q-item').filter({ hasText: /PORTAFOLIO|Zipaquira|Fuel Conversion/i });
        const hasProjectOptions = await projectOptions.first().isVisible().catch(() => false);

        if (hasProjectOptions) {
            const projectCount = await projectOptions.count();
            console.log(`✅ Dropdown "Proyecto" poblado con ${projectCount} opciones`);
        } else {
            console.log('❌ Dropdown "Proyecto" NO tiene opciones visibles');
            await page.screenshot({
                path: 'e2e/screenshots/debug-cogua-proyecto-vacio.png',
                fullPage: true
            });
        }

        expect(hasProjectOptions).toBe(true);

        // Cerrar dropdown de proyecto
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        console.log('\n7️⃣ Verificando que dropdown "Empresa a quien se le genera el reporte" esté habilitado...');
        await page.click('label:has-text("Empresa a quien se le genera el reporte")');
        await page.waitForTimeout(1000);

        const contractorOptions = page.locator('.q-item').filter({ hasText: /KAPA|INSTRUMENTACION|SIMECO/i });
        const hasContractorOptions = await contractorOptions.first().isVisible().catch(() => false);

        if (hasContractorOptions) {
            const contractorCount = await contractorOptions.count();
            console.log(`✅ Dropdown "Empresa a quien se le genera el reporte" poblado con ${contractorCount} opciones`);
        } else {
            console.log('❌ Dropdown "Empresa a quien se le genera el reporte" NO tiene opciones visibles');
            await page.screenshot({
                path: 'e2e/screenshots/debug-cogua-contratista-vacio.png',
                fullPage: true
            });
        }

        expect(hasContractorOptions).toBe(true);

        console.log('\n✅ TEST COMPLETO: Todos los datos se cargaron correctamente\n');
    });

    test('DEBUG: W&T - Verificar carga de datos de Cogua', async ({ page }) => {
        console.log('\n🧪 Test DEBUG: W&T con datos reales de Cogua (client_id=170)\n');

        let apiCallsSuccessful = true;

        await page.route('**/clients/170/projects', async (route) => {
            console.log('🌐 API /clients/170/projects llamada');
            const response = await route.fetch();
            const data = await response.json();
            console.log(`📦 Proyectos: ${data.length} recibidos`);
            apiCallsSuccessful = apiCallsSuccessful && data.length > 0;
            await route.fulfill({ response });
        });

        await page.route('**/clients/170/contractors', async (route) => {
            console.log('🌐 API /clients/170/contractors llamada');
            const response = await route.fetch();
            const data = await response.json();
            console.log(`📦 Contratistas: ${data.length} recibidos`);
            apiCallsSuccessful = apiCallsSuccessful && data.length > 0;
            await route.fulfill({ response });
        });

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Walk & Talk (W&T)');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Centro de Trabajo")');
        const coguaOption = page.locator('.q-item').filter({ hasText: /Owens Illinois.*Cogua/i });
        await coguaOption.click();
        await page.waitForTimeout(3000);

        const errorNotification = page.locator('.q-notification--warning, .q-notification--negative');
        const hasError = await errorNotification.isVisible().catch(() => false);

        expect(hasError).toBe(false);
        expect(apiCallsSuccessful).toBe(true);

        console.log('✅ W&T: Datos cargados correctamente\n');
    });

    test('DEBUG: SWA - Verificar carga de datos de Cogua', async ({ page }) => {
        console.log('\n🧪 Test DEBUG: SWA con datos reales de Cogua (client_id=170)\n');

        let apiCallsSuccessful = true;

        await page.route('**/clients/170/projects', async (route) => {
            console.log('🌐 API /clients/170/projects llamada');
            const response = await route.fetch();
            const data = await response.json();
            console.log(`📦 Proyectos: ${data.length} recibidos`);
            apiCallsSuccessful = apiCallsSuccessful && data.length > 0;
            await route.fulfill({ response });
        });

        await page.route('**/clients/170/contractors', async (route) => {
            console.log('🌐 API /clients/170/contractors llamada');
            const response = await route.fetch();
            const data = await response.json();
            console.log(`📦 Contratistas: ${data.length} recibidos`);
            apiCallsSuccessful = apiCallsSuccessful && data.length > 0;
            await route.fulfill({ response });
        });

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Stop Work Authority (SWA)');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Centro de Trabajo")');
        const coguaOption = page.locator('.q-item').filter({ hasText: /Owens Illinois.*Cogua/i });
        await coguaOption.click();
        await page.waitForTimeout(3000);

        const errorNotification = page.locator('.q-notification--warning, .q-notification--negative');
        const hasError = await errorNotification.isVisible().catch(() => false);

        expect(hasError).toBe(false);
        expect(apiCallsSuccessful).toBe(true);

        console.log('✅ SWA: Datos cargados correctamente\n');
    });

    test('DEBUG: Safety Cards - Verificar carga de datos de Cogua', async ({ page }) => {
        console.log('\n🧪 Test DEBUG: Safety Cards con datos reales de Cogua (client_id=170)\n');

        let apiCallsSuccessful = true;

        await page.route('**/clients/170/projects', async (route) => {
            console.log('🌐 API /clients/170/projects llamada');
            const response = await route.fetch();
            const data = await response.json();
            console.log(`📦 Proyectos: ${data.length} recibidos`);
            apiCallsSuccessful = apiCallsSuccessful && data.length > 0;
            await route.fulfill({ response });
        });

        await page.route('**/clients/170/contractors', async (route) => {
            console.log('🌐 API /clients/170/contractors llamada');
            const response = await route.fetch();
            const data = await response.json();
            console.log(`📦 Contratistas: ${data.length} recibidos`);
            apiCallsSuccessful = apiCallsSuccessful && data.length > 0;
            await route.fulfill({ response });
        });

        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Safety Cards');
        await page.waitForTimeout(500);

        await page.click('label:has-text("Centro de Trabajo")');
        const coguaOption = page.locator('.q-item').filter({ hasText: /Owens Illinois.*Cogua/i });
        await coguaOption.click();
        await page.waitForTimeout(3000);

        const errorNotification = page.locator('.q-notification--warning, .q-notification--negative');
        const hasError = await errorNotification.isVisible().catch(() => false);

        expect(hasError).toBe(false);
        expect(apiCallsSuccessful).toBe(true);

        console.log('✅ Safety Cards: Datos cargados correctamente\n');
    });

    test('DEBUG: HID - Completar formulario con datos reales de Cogua', async ({ page }) => {
        console.log('\n🧪 Test DEBUG: HID - Formulario completo con datos reales\n');

        // Verificar que datos estén disponibles
        await page.route('**/clients/170/**', async (route) => {
            const url = route.request().url();
            console.log(`🌐 API llamada: ${url}`);
            await route.continue();
        });

        // Seleccionar HID
        await page.click('label:has-text("Tipo de Reporte")');
        await page.click('text=Identificación de Peligros (HID)');
        await page.waitForTimeout(500);

        // Seleccionar Cogua
        await page.click('label:has-text("Centro de Trabajo")');
        const coguaOption = page.locator('.q-item').filter({ hasText: /Owens Illinois.*Cogua/i });
        await coguaOption.click();
        await page.waitForTimeout(3000);

        // Seleccionar primer proyecto disponible
        console.log('📝 Seleccionando proyecto...');
        await page.click('label:has-text("Proyecto")');
        await page.waitForTimeout(1000);
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Seleccionar primer contratista en "Empresa a quien se le genera el reporte"
        console.log('📝 Seleccionando empresa a quien se le genera el reporte...');
        await page.click('label:has-text("Empresa a quien se le genera el reporte")', { timeout: 20000 });
        await page.waitForTimeout(1000);
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Seleccionar primer contratista en "Seleccione la empresa a la que pertenece"
        console.log('📝 Seleccionando empresa a la que pertenece...');
        await page.click('label:has-text("Seleccione la empresa a la que pertenece")');
        await page.waitForTimeout(1000);
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Completar campos de texto
        console.log('📝 Completando campos de texto...');
        await page.fill('label:has-text("Nombre de quien reporta")', 'Test E2E Automatizado - Cogua');

        // Completar otros campos requeridos
        await page.fill('label:has-text("Nombre EHS del contratista")', 'Ingeniero EHS Test');
        await page.fill('label:has-text("Nombre Supervisor obra del contratista")', 'Supervisor Test');

        // Tipo de Reporte HID
        await page.click('label:has-text("Tipo de reporte")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Tipo (Hallazgo) - Usar filtro de texto exacto para evitar confusión con "Tipo de reporte"
        await page.locator('label').filter({ hasText: /^Tipo$/ }).click();
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Categoría
        await page.click('label:has-text("Categoría")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(1500);

        // Subcategoría
        await page.click('label:has-text("Subcategorías")');
        await page.click('.q-item >> nth=0');
        await page.waitForTimeout(500);

        // Fecha
        const today = new Date().toISOString().split('T')[0];
        await page.fill('input[type="date"]', today);

        // Descripción
        await page.fill('textarea[aria-label*="Descripción de hallazgo"]',
            'Test E2E - Reporte de prueba automatizada con datos reales de Cogua. Validación de flujo completo.');

        // Estado
        await page.click('label:has-text("Estado")');
        await page.click('.q-item:has-text("Abierto")');
        await page.waitForTimeout(500);

        // Observación
        await page.fill('textarea[aria-label*="Observación"]',
            'Reporte generado automáticamente por suite E2E para validar integración completa.');

        console.log('✅ Todos los campos completados');

        // Screenshot antes de enviar
        await page.screenshot({
            path: 'e2e/screenshots/debug-cogua-form-completo.png',
            fullPage: true
        });

        // Enviar formulario
        console.log('📤 Enviando formulario...');
        await page.click('button:has-text("Crear Reporte")');

        // Verificar redirección exitosa
        await expect(page).toHaveURL(/\/ilv\/reportes/, { timeout: 10000 });

        // Verificar notificación de éxito
        const successNotification = page.locator('.q-notification--positive');
        await expect(successNotification).toBeVisible({ timeout: 5000 });
        const successText = await successNotification.textContent();
        console.log(`✅ Reporte creado exitosamente: "${successText}"`);

        console.log('\n✅ TEST COMPLETO: Formulario HID con Cogua enviado exitosamente\n');
    });
});
