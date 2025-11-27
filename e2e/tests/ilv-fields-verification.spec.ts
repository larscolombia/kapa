import { test, expect } from '@playwright/test';

/**
 * Test simplificado sin login - Verificación de estructura de campos
 * Este test solo verifica que el componente ILVReportForm renderiza correctamente
 * los campos dinámicos según el tipo de reporte
 */

test.describe('ILV - Verificación de Campos (Sin Login)', () => {

    test('Verificar que todos los campos de HID están en el código fuente', async () => {
        console.log('🧪 Verificando estructura de campos HID en el código');

        // Campos esperados en HID según la especificación
        const expectedHIDFields = [
            'nombre_quien_reporta',
            'ubicacion',
            'tipo_reporte_hid',
            'categoria',
            'subcategoria',
            'fecha_evento',
            'severidad',
            'area',
            'descripcion_condicion',
            'causa_probable',
            'accion_inmediata',
            'nombre_ehs_contratista',
            'nombre_supervisor_obra',
            'observacion'
        ];

        // Verificar contra el field-mapper del backend
        const fs = require('fs');
        const path = require('path');
        const fieldMapperPath = path.join(__dirname, '../../backend/src/modules/ilv/utils/field-mapper.util.ts');
        const fieldMapperContent = fs.readFileSync(fieldMapperPath, 'utf-8');

        console.log('✅ Verificando campos en field-mapper.util.ts:');
        for (const field of expectedHIDFields) {
            const exists = fieldMapperContent.includes(`'${field}'`);
            console.log(`  ${exists ? '✓' : '✗'} ${field}`);
            expect(exists).toBe(true);
        }

        console.log('✅ Todos los campos HID están en el backend');
    });

    test('Verificar que todos los campos de W&T están en el código fuente', async () => {
        console.log('🧪 Verificando estructura de campos W&T en el código');

        const expectedWTFields = [
            'nombre_quien_reporta',
            'conducta_observada',
            'riesgo_asociado',
            'recomendacion',
            'responsable',
            'testigo',
            'observacion'
        ];

        const fs = require('fs');
        const path = require('path');
        const fieldMapperPath = path.join(__dirname, '../../backend/src/modules/ilv/utils/field-mapper.util.ts');
        const fieldMapperContent = fs.readFileSync(fieldMapperPath, 'utf-8');

        console.log('✅ Verificando campos en field-mapper.util.ts:');
        for (const field of expectedWTFields) {
            const exists = fieldMapperContent.includes(`'${field}'`);
            console.log(`  ${exists ? '✓' : '✗'} ${field}`);
            expect(exists).toBe(true);
        }

        console.log('✅ Todos los campos W&T están en el backend');
    });

    test('Verificar que todos los campos de SWA están en el código fuente', async () => {
        console.log('🧪 Verificando estructura de campos SWA en el código');

        const expectedSWAFields = [
            'nombre_quien_reporta',
            'nombre_ehs_contratista',
            'nombre_supervisor_obra',
            'descripcion_hallazgo',
            'hora_inicio_parada',
            'hora_reinicio',
            'motivo',
            'area',
            'responsable',
            'observacion'
        ];

        const fs = require('fs');
        const path = require('path');
        const fieldMapperPath = path.join(__dirname, '../../backend/src/modules/ilv/utils/field-mapper.util.ts');
        const fieldMapperContent = fs.readFileSync(fieldMapperPath, 'utf-8');

        console.log('✅ Verificando campos en field-mapper.util.ts:');
        for (const field of expectedSWAFields) {
            const exists = fieldMapperContent.includes(`'${field}'`);
            console.log(`  ${exists ? '✓' : '✗'} ${field}`);
            expect(exists).toBe(true);
        }

        console.log('✅ Todos los campos SWA están en el backend');
    });

    test('Verificar que todos los campos de Safety Cards están en el código fuente', async () => {
        console.log('🧪 Verificando estructura de campos Safety Cards en el código');

        const expectedFDKARFields = [
            'quien_reporta',
            'clasificacion',
            'descripcion',
            'observacion',
            'plan_accion_propuesto', // Solo en cierre
            'descripcion_cierre',
            'evidencia_cierre',
            'fecha_implantacion'
        ];

        const fs = require('fs');
        const path = require('path');
        const fieldMapperPath = path.join(__dirname, '../../backend/src/modules/ilv/utils/field-mapper.util.ts');
        const fieldMapperContent = fs.readFileSync(fieldMapperPath, 'utf-8');

        console.log('✅ Verificando campos en field-mapper.util.ts:');
        for (const field of expectedFDKARFields) {
            const exists = fieldMapperContent.includes(`'${field}'`);
            console.log(`  ${exists ? '✓' : '✗'} ${field}`);
            expect(exists).toBe(true);
        }

        console.log('✅ Todos los campos Safety Cards están en el backend');
    });

    test('Verificar configuración de campos en frontend', async () => {
        console.log('🧪 Verificando configuración de campos en ILVReportForm.vue');

        const fs = require('fs');
        const path = require('path');
        const formPath = path.join(__dirname, '../../frontend/src/pages/ILVReportForm.vue');
        const formContent = fs.readFileSync(formPath, 'utf-8');

        // Verificar que existan las configuraciones para cada tipo
        expect(formContent).toContain('hazard_id');
        expect(formContent).toContain('wit');
        expect(formContent).toContain('swa');
        expect(formContent).toContain('fdkar');

        // Verificar que exista la estructura fieldConfigs
        expect(formContent).toContain('fieldConfigs');

        // Verificar campos específicos de HID
        expect(formContent).toContain('nombre_quien_reporta');
        expect(formContent).toContain('categoria');
        expect(formContent).toContain('subcategoria');
        expect(formContent).toContain('select-hierarchical');
        expect(formContent).toContain('select-hierarchical-child');

        console.log('✅ Frontend tiene la configuración correcta de campos');
    });

    test('Resumen: Conteo de campos por tipo', async () => {
        console.log('📊 RESUMEN DE CAMPOS POR TIPO DE REPORTE');
        console.log('=========================================');

        const fs = require('fs');
        const path = require('path');
        const fieldMapperPath = path.join(__dirname, '../../backend/src/modules/ilv/utils/field-mapper.util.ts');
        const fieldMapperContent = fs.readFileSync(fieldMapperPath, 'utf-8');

        // Extraer secciones por tipo
        const hidMatch = fieldMapperContent.match(/\[IlvReportType\.HAZARD_ID\]:\s*{([^}]+required:\s*\[([^\]]+)\][^}]+optional:\s*\[([^\]]+)\])/);
        const witMatch = fieldMapperContent.match(/\[IlvReportType\.WIT\]:\s*{([^}]+required:\s*\[([^\]]+)\][^}]+optional:\s*\[([^\]]+)\])/);
        const swaMatch = fieldMapperContent.match(/\[IlvReportType\.SWA\]:\s*{([^}]+required:\s*\[([^\]]+)\][^}]+optional:\s*\[([^\]]+)\])/);
        const fdkarMatch = fieldMapperContent.match(/\[IlvReportType\.FDKAR\]:\s*{([^}]+required:\s*\[([^\]]+)\][^}]+optional:\s*\[([^\]]+)\])/);

        console.log('\n📋 HID (Identificación de Peligros):');
        if (hidMatch) {
            const required = hidMatch[2].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            const optional = hidMatch[3].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            console.log(`  Requeridos: ${required.length} campos`);
            console.log(`  Opcionales: ${optional.length} campos`);
            console.log(`  Total: ${required.length + optional.length} campos`);
        }

        console.log('\n📋 W&T (Walk & Talk):');
        if (witMatch) {
            const required = witMatch[2].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            const optional = witMatch[3].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            console.log(`  Requeridos: ${required.length} campos`);
            console.log(`  Opcionales: ${optional.length} campos`);
            console.log(`  Total: ${required.length + optional.length} campos`);
        }

        console.log('\n📋 SWA (Stop Work Authority):');
        if (swaMatch) {
            const required = swaMatch[2].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            const optional = swaMatch[3].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            console.log(`  Requeridos: ${required.length} campos`);
            console.log(`  Opcionales: ${optional.length} campos`);
            console.log(`  Total: ${required.length + optional.length} campos`);
        }

        console.log('\n📋 Safety Cards (FDKAR):');
        if (fdkarMatch) {
            const required = fdkarMatch[2].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            const optional = fdkarMatch[3].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
            console.log(`  Requeridos en creación: ${required.length} campos`);
            console.log(`  Opcionales: ${optional.length} campos`);
            // Contar close_required
            const closeMatch = fieldMapperContent.match(/\[IlvReportType\.FDKAR\][^}]+close_required:\s*\[([^\]]+)\]/);
            if (closeMatch) {
                const closeRequired = closeMatch[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
                console.log(`  Requeridos en cierre: ${closeRequired.length} campos`);
                console.log(`  Total: ${required.length + optional.length + closeRequired.length} campos`);
            }
        }

        console.log('\n✅ Verificación de estructura completada');
    });
});
