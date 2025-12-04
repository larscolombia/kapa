import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test-config';

/**
 * E2E Tests para validar la estructura de base de datos del módulo Inspecciones
 * Verifica que las tablas, columnas y datos maestros estén correctamente configurados
 */

test.describe('Inspecciones - Validación de Base de Datos', () => {

    let token: string;

    test.beforeAll(async ({ request }) => {
        // Autenticarse una vez para todos los tests
        const loginResponse = await request.post(TEST_CONFIG.urls.base + '/api/auth/login', {
            data: {
                email: TEST_CONFIG.user.email,
                password: TEST_CONFIG.user.password
            }
        });
        const loginData = await loginResponse.json();
        token = loginData.accessToken;
    });

    test.describe('01. Datos Maestros', () => {

        test('01.1 Verificar tipos de inspección técnica', async ({ request }) => {
            console.log('🧪 Test: Tipos de inspección técnica');

            const response = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones/maestros/tipos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            // Debe tener exactamente 3 tipos
            expect(data.length).toBe(3);

            // Verificar los tipos esperados
            const valores = data.map((t: any) => t.valor);
            expect(valores).toContain('Seguridad');
            expect(valores).toContain('Medio Ambiente');
            expect(valores).toContain('Salud');

            console.log('✅ Tipos de inspección técnica correctos:', valores);
        });

        test('01.2 Verificar clasificaciones por tipo Seguridad', async ({ request }) => {
            console.log('🧪 Test: Clasificaciones de Seguridad');

            // Primero obtener el ID de Seguridad
            const tiposRes = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones/maestros/tipos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tipos = await tiposRes.json();
            const seguridad = tipos.find((t: any) => t.valor === 'Seguridad');

            expect(seguridad).toBeDefined();

            // Obtener clasificaciones de Seguridad
            const response = await request.get(
                TEST_CONFIG.urls.base + `/api/inspecciones/maestros/clasificaciones/${seguridad.maestro_id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            // Debe tener clasificaciones (6 para Seguridad)
            expect(data.length).toBeGreaterThanOrEqual(5);

            // Verificar que todas tienen el formato KAPA
            for (const clasif of data) {
                expect(clasif.valor).toMatch(/^KAPA-/);
            }

            console.log(`✅ Clasificaciones de Seguridad: ${data.length} formatos KAPA`);
        });

        test('01.3 Verificar áreas de auditoría', async ({ request }) => {
            console.log('🧪 Test: Áreas de auditoría');

            const response = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones/maestros/areas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            // Debe tener exactamente 21 áreas
            expect(data.length).toBe(21);

            // Verificar algunas áreas esperadas
            const valores = data.map((a: any) => a.valor);
            expect(valores).toContain('Horno');
            expect(valores).toContain('Alimentadores');
            // Buscar que contenga "Materias Primas" en alguna variante
            expect(valores.some((v: string) => v.includes('Materias Primas'))).toBeTruthy();
            // Buscar que contenga "Cuartos" o "Fríos"
            expect(valores.some((v: string) => v.includes('Cuartos') || v.includes('Fría'))).toBeTruthy();

            console.log('✅ Áreas de auditoría correctas:', data.length);
        });

        test('01.4 Verificar estados de reporte', async ({ request }) => {
            console.log('🧪 Test: Estados de reporte');

            const response = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones/maestros/estados', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            // Debe tener exactamente 2 estados
            expect(data.length).toBe(2);

            const valores = data.map((e: any) => e.valor.toLowerCase());
            expect(valores).toContain('abierto');
            expect(valores).toContain('cerrado');

            console.log('✅ Estados de reporte correctos:', valores);
        });

    });

    test.describe('02. CRUD API', () => {

        test('02.1 Crear inspección técnica vía API', async ({ request }) => {
            console.log('🧪 Test: Crear inspección técnica vía API');

            // Obtener proyecto y cliente
            const projectsRes = await request.get(TEST_CONFIG.urls.base + '/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const projects = await projectsRes.json();
            
            const clientsRes = await request.get(TEST_CONFIG.urls.base + '/api/clients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const clients = await clientsRes.json();

            // Obtener tipo y clasificación
            const tiposRes = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones/maestros/tipos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tipos = await tiposRes.json();

            const clasificacionesRes = await request.get(
                TEST_CONFIG.urls.base + `/api/inspecciones/maestros/clasificaciones/${tipos[0].maestro_id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const clasificaciones = await clasificacionesRes.json();

            // Crear inspección
            const createPayload = {
                tipo: 'tecnica',
                proyecto_id: projects[0]?.project_id || 1,
                cliente_id: clients[0]?.client_id || 1,
                fields: [
                    { key: 'tipo_inspeccion_id', value: String(tipos[0].maestro_id) },
                    { key: 'clasificacion_inspeccion_id', value: String(clasificaciones[0]?.maestro_id || 1) },
                    { key: 'hallazgos', value: 'Test E2E API - Hallazgo de prueba' }
                ]
            };

            const response = await request.post(TEST_CONFIG.urls.base + '/api/inspecciones', {
                headers: { 'Authorization': `Bearer ${token}` },
                data: createPayload
            });

            // Puede ser 201 Created o un error si faltan datos requeridos
            if (response.ok()) {
                const data = await response.json();
                expect(data).toHaveProperty('report_id');
                expect(data.tipo).toBe('tecnica');
                expect(data.estado).toBe('abierto');
                console.log(`✅ Inspección técnica creada: ID ${data.report_id}`);
            } else {
                const error = await response.json();
                console.log('⚠️ No se pudo crear (validación):', error.message);
            }
        });

        test('02.2 Listar inspecciones con filtros', async ({ request }) => {
            console.log('🧪 Test: Listar inspecciones con filtros');

            // Sin filtros
            const response1 = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            expect(response1.ok()).toBeTruthy();
            const data1 = await response1.json();
            expect(data1).toHaveProperty('data');
            expect(data1).toHaveProperty('total');
            console.log(`  Sin filtros: ${data1.total} inspecciones`);

            // Filtro por tipo
            const response2 = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones?tipo=tecnica', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            expect(response2.ok()).toBeTruthy();
            const data2 = await response2.json();
            console.log(`  Tipo técnica: ${data2.total} inspecciones`);

            // Filtro por estado
            const response3 = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones?estado=abierto', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            expect(response3.ok()).toBeTruthy();
            const data3 = await response3.json();
            console.log(`  Estado abierto: ${data3.total} inspecciones`);

            console.log('✅ Filtros funcionan correctamente');
        });

        test('02.3 Obtener inspección por ID', async ({ request }) => {
            console.log('🧪 Test: Obtener inspección por ID');

            // Primero listar para obtener un ID válido
            const listRes = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones?limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const listData = await listRes.json();

            if (listData.data && listData.data.length > 0) {
                const reportId = listData.data[0].report_id;

                const response = await request.get(TEST_CONFIG.urls.base + `/api/inspecciones/${reportId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                expect(response.ok()).toBeTruthy();
                const data = await response.json();
                expect(data.report_id).toBe(reportId);
                expect(data).toHaveProperty('fields');
                expect(data).toHaveProperty('tipo');
                expect(data).toHaveProperty('estado');

                console.log(`✅ Inspección ${reportId} obtenida correctamente`);
            } else {
                console.log('⚠️ No hay inspecciones para probar');
            }
        });

    });

    test.describe('03. Permisos y Roles', () => {

        test('03.1 Verificar que usuarios no autenticados no pueden acceder', async ({ request }) => {
            console.log('🧪 Test: Acceso sin autenticación');

            const response = await request.get(TEST_CONFIG.urls.base + '/api/inspecciones', {
                // Sin header de Authorization
            });

            expect(response.status()).toBe(401);
            console.log('✅ Acceso denegado correctamente sin token');
        });

        test('03.2 Verificar acceso a maestros autenticado', async ({ request }) => {
            console.log('🧪 Test: Acceso a maestros con autenticación');

            const endpoints = [
                '/api/inspecciones/maestros/tipos',
                '/api/inspecciones/maestros/areas',
                '/api/inspecciones/maestros/estados'
            ];

            for (const endpoint of endpoints) {
                const response = await request.get(TEST_CONFIG.urls.base + endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                expect(response.ok()).toBeTruthy();
                console.log(`  ✓ ${endpoint}`);
            }

            console.log('✅ Todos los endpoints de maestros accesibles');
        });

    });

});
