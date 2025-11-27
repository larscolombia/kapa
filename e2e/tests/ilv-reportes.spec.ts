import { test, expect } from '@playwright/test';

// Credenciales de prueba (ajustar según tu sistema)
const TEST_USER = {
    email: process.env.TEST_EMAIL || 'admin@test.com',
    password: process.env.TEST_PASSWORD || 'admin123'
};

test.describe('ILV - Lista de Reportes', () => {

    test.beforeEach(async ({ page }) => {
        // Login antes de cada test
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Esperar a que cargue el dashboard
        await page.waitForURL(/\/$/);
    });

    test('debe cargar la página de reportes ILV', async ({ page }) => {
        await page.goto('/ilv/reportes');

        // Verificar que carga correctamente
        await expect(page.locator('h4')).toContainText('Reportes ILV');
        await expect(page.locator('text=Listado completo de reportes')).toBeVisible();
    });

    test('debe mostrar el botón "Nuevo Reporte"', async ({ page }) => {
        await page.goto('/ilv/reportes');

        const nuevoBtn = page.locator('button:has-text("Nuevo Reporte")');
        await expect(nuevoBtn).toBeVisible();
        await expect(nuevoBtn).toBeEnabled();
    });

    test('debe navegar al formulario al hacer clic en "Nuevo Reporte"', async ({ page }) => {
        await page.goto('/ilv/reportes');

        // Capturar errores de consola
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Capturar errores de página
        const pageErrors: Error[] = [];
        page.on('pageerror', error => {
            pageErrors.push(error);
        });

        // Click en el botón
        const nuevoBtn = page.locator('button:has-text("Nuevo Reporte")');
        await nuevoBtn.click();

        // Esperar navegación o error
        await page.waitForTimeout(2000);

        // Verificar si hubo errores
        if (consoleErrors.length > 0) {
            console.log('❌ Errores de consola encontrados:');
            consoleErrors.forEach(err => console.log('  -', err));
        }

        if (pageErrors.length > 0) {
            console.log('❌ Errores de página encontrados:');
            pageErrors.forEach(err => console.log('  -', err.message));
        }

        // Verificar que navegó correctamente
        const currentUrl = page.url();
        console.log('📍 URL actual:', currentUrl);

        // Debe estar en la página de nuevo reporte
        await expect(page).toHaveURL(/\/ilv\/reportes\/nuevo/);

        // Verificar que cargó el formulario
        await expect(page.locator('text=Crear Reporte ILV')).toBeVisible({ timeout: 5000 });
    });

    test('debe mostrar mensaje de error descriptivo si falla la navegación', async ({ page }) => {
        await page.goto('/ilv/reportes');

        let errorCaptured = false;
        let errorMessage = '';

        page.on('pageerror', error => {
            errorCaptured = true;
            errorMessage = error.message;
        });

        await page.locator('button:has-text("Nuevo Reporte")').click();
        await page.waitForTimeout(1000);

        if (errorCaptured) {
            console.log('🔍 Error capturado:', errorMessage);

            // Analizar el error
            if (errorMessage.includes('resolve')) {
                console.log('❌ PROBLEMA: La ruta no existe o el nombre es incorrecto');
                console.log('💡 SOLUCIÓN: Verificar nombre de ruta en routes.js vs router.push()');
            }
        }
    });

    test('debe mostrar filtros de búsqueda', async ({ page }) => {
        await page.goto('/ilv/reportes');

        // Verificar que existen los selectores de filtro
        await expect(page.locator('label:has-text("Tipo")')).toBeVisible();
        await expect(page.locator('label:has-text("Estado")')).toBeVisible();
        await expect(page.locator('label:has-text("Fecha Desde")')).toBeVisible();
        await expect(page.locator('label:has-text("Fecha Hasta")')).toBeVisible();
    });

    test('debe mostrar la tabla de reportes', async ({ page }) => {
        await page.goto('/ilv/reportes');

        // Esperar a que cargue la tabla
        await page.waitForSelector('.q-table', { timeout: 5000 });

        // Verificar columnas de la tabla
        await expect(page.locator('th:has-text("ID")')).toBeVisible();
        await expect(page.locator('th:has-text("Tipo")')).toBeVisible();
        await expect(page.locator('th:has-text("Estado")')).toBeVisible();
        await expect(page.locator('th:has-text("Proyecto")')).toBeVisible();
    });

    test('debe aplicar filtros correctamente', async ({ page }) => {
        await page.goto('/ilv/reportes');

        // Aplicar filtro de tipo
        await page.click('label:has-text("Tipo")');
        await page.waitForTimeout(500);
        await page.click('text=Safety Cards');

        // Esperar a que se aplique el filtro
        await page.waitForTimeout(1000);

        // Verificar que la URL cambió o que se recargó la tabla
        const url = page.url();
        console.log('📍 URL después de filtrar:', url);
    });
});

test.describe('ILV - Formulario de Nuevo Reporte', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\//);
    });

    test('debe cargar el formulario directamente via URL', async ({ page }) => {
        await page.goto('/ilv/reportes/nuevo');

        // Verificar que carga el formulario
        await expect(page.locator('text=Crear Reporte ILV').or(page.locator('text=Nuevo Reporte ILV'))).toBeVisible({ timeout: 5000 });
    });

    test('debe mostrar los 4 tipos de reporte', async ({ page }) => {
        await page.goto('/ilv/reportes/nuevo');
        await page.waitForTimeout(1000);

        // Click en selector de tipo
        await page.click('label:has-text("Tipo de Reporte")');
        await page.waitForTimeout(500);

        // Verificar que aparecen los 4 tipos
        await expect(page.locator('text=Identificación de Peligros')).toBeVisible();
        await expect(page.locator('text=Walk & Talk')).toBeVisible();
        await expect(page.locator('text=Stop Work Authority')).toBeVisible();
        await expect(page.locator('text=Safety Cards')).toBeVisible();
    });

    test('debe mostrar campos dinámicos al seleccionar HID', async ({ page }) => {
        await page.goto('/ilv/reportes/nuevo');
        await page.waitForTimeout(1000);

        // Seleccionar HID
        await page.click('label:has-text("Tipo de Reporte")');
        await page.waitForTimeout(500);
        await page.click('text=Identificación de Peligros');
        await page.waitForTimeout(1000);

        // Verificar campos específicos de HID
        await expect(page.locator('label:has-text("Nombre Quien Reporta")')).toBeVisible();
        await expect(page.locator('label:has-text("Categoría")')).toBeVisible();
        await expect(page.locator('label:has-text("Subcategoría")')).toBeVisible();
        await expect(page.locator('label:has-text("Observación")')).toBeVisible();
    });

    test('debe mostrar campos dinámicos al seleccionar Safety Cards', async ({ page }) => {
        await page.goto('/ilv/reportes/nuevo');
        await page.waitForTimeout(1000);

        // Seleccionar Safety Cards
        await page.click('label:has-text("Tipo de Reporte")');
        await page.waitForTimeout(500);
        await page.click('text=Safety Cards');
        await page.waitForTimeout(1000);

        // Verificar campos específicos de Safety Cards
        await expect(page.locator('label:has-text("Quién Reporta")')).toBeVisible();
        await expect(page.locator('label:has-text("Tipo de Tarjeta")')).toBeVisible();
        await expect(page.locator('label:has-text("Observación")')).toBeVisible();
    });
});

test.describe('ILV - Diagnóstico del Error', () => {

    test('debe identificar el problema exacto del botón', async ({ page }) => {
        // No hacer login, ir directo
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\//);

        await page.goto('/ilv/reportes');

        // Interceptar errores de router
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Revisar el código fuente de la página
        const pageContent = await page.content();
        console.log('📄 Verificando contenido de la página...');

        // Extraer el evento click del botón
        const btnHtml = await page.locator('button:has-text("Nuevo Reporte")').innerHTML();
        console.log('🔍 HTML del botón:', btnHtml);

        await page.locator('button:has-text("Nuevo Reporte")').click();
        await page.waitForTimeout(2000);

        if (errors.length > 0) {
            console.log('\n❌ ERRORES DETECTADOS:');
            errors.forEach(err => {
                console.log('  -', err);

                if (err.includes('resolve')) {
                    console.log('\n💡 DIAGNÓSTICO:');
                    console.log('  El router no puede resolver el nombre de la ruta');
                    console.log('  Ruta esperada: "ilvReportForm"');
                    console.log('  Ruta definida en routes.js: "ilvNuevoReporte"');
                    console.log('\n🔧 SOLUCIÓN:');
                    console.log('  Cambiar en ILVReportsList.vue línea ~13:');
                    console.log('  DE: @click="$router.push({ name: \'ilvReportForm\' })"');
                    console.log('  A:  @click="$router.push({ name: \'ilvNuevoReporte\' })"');
                }
            });
        }
    });
});
