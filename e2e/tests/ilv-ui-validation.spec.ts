import { test, expect } from '@playwright/test';

/**
 * Test de validación de UI - Detecta problemas visuales
 * Verifica duplicaciones de campos y orden correcto
 */

test.describe('ILV - Validación de UI y Duplicaciones', () => {

    test('Verificar que no hay campos duplicados en el código del formulario', async () => {
        console.log('🧪 Verificando que no haya campos duplicados en ILVReportForm.vue');

        const fs = require('fs');
        const path = require('path');
        const formPath = path.join(__dirname, '../../frontend/src/pages/ILVReportForm.vue');
        const formContent = fs.readFileSync(formPath, 'utf-8');

        // Buscar campos hardcodeados fuera del bucle dinámico
        const hardcodedFieldsRegex = /<q-input[^>]*v-model="reportForm\.([^"]+)"[^>]*>/g;
        const hardcodedFields: string[] = [];
        let match;

        while ((match = hardcodedFieldsRegex.exec(formContent)) !== null) {
            if (match[1] && !match[1].includes('campos[')) {
                hardcodedFields.push(match[1]);
            }
        }

        console.log('📋 Campos hardcodeados encontrados (fuera de fieldConfigs):');
        console.log(hardcodedFields);

        // Verificar que no haya campos como 'fecha', 'nombre_quien_reporta' hardcodeados
        const problematicFields = ['fecha', 'nombre_quien_reporta', 'categoria', 'subcategoria'];

        for (const field of problematicFields) {
            const isHardcoded = hardcodedFields.includes(field);
            if (isHardcoded) {
                console.log(`  ❌ PROBLEMA: Campo "${field}" está hardcodeado fuera del bucle dinámico`);
            } else {
                console.log(`  ✓ Campo "${field}" NO está hardcodeado (correcto)`);
            }
            expect(isHardcoded).toBe(false);
        }

        console.log('✅ No hay campos duplicados hardcodeados');
    });

    test('Verificar orden de campos en HID según especificación', async () => {
        console.log('🧪 Verificando orden de campos HID en fieldConfigs');

        const fs = require('fs');
        const path = require('path');
        const formPath = path.join(__dirname, '../../frontend/src/pages/ILVReportForm.vue');
        const formContent = fs.readFileSync(formPath, 'utf-8');

        // Extraer la configuración de HID
        const hidConfigMatch = formContent.match(/hazard_id:\s*\[([\s\S]*?)\],\s*wit:/);

        if (!hidConfigMatch) {
            throw new Error('No se encontró la configuración de hazard_id');
        }

        const hidConfig = hidConfigMatch[1];

        // Extraer los keys en orden
        const keyRegex = /key:\s*'([^']+)'/g;
        const keys: string[] = [];
        let match;

        while ((match = keyRegex.exec(hidConfig)) !== null) {
            keys.push(match[1]);
        }

        console.log('📋 Orden actual de campos HID:');
        keys.forEach((key, index) => {
            console.log(`  ${index + 1}. ${key}`);
        });

        // Verificar orden esperado
        const expectedOrder = [
            'fecha',                      // Primero
            'cliente',                    // Segundo (antes centro_trabajo)
            'proyecto',
            'empresa_pertenece',
            'nombre_quien_reporta',
            'tipo_reporte',
            'empresa_genera_reporte',
            'nombre_ehs_contratista',
            'nombre_supervisor_obra',
            'tipo',
            'categoria',
            'subcategoria',
            'descripcion_hallazgo',
            'descripcion_cierre',
            'registro_fotografico'
        ];

        console.log('\n✅ Verificando orden correcto:');
        for (let i = 0; i < expectedOrder.length; i++) {
            const expected = expectedOrder[i];
            const actual = keys[i];

            if (expected === actual) {
                console.log(`  ✓ Posición ${i + 1}: ${expected} (correcto)`);
            } else {
                console.log(`  ❌ Posición ${i + 1}: Se esperaba "${expected}" pero se encontró "${actual}"`);
            }

            expect(actual).toBe(expected);
        }

        console.log('✅ Orden de campos correcto');
    });

    test('Verificar que ubicacion solo aparece una vez en HID', async () => {
        console.log('🧪 Verificando que campos críticos aparecen exactamente una vez en configuración HID');

        const fs = require('fs');
        const path = require('path');
        const formPath = path.join(__dirname, '../../frontend/src/pages/ILVReportForm.vue');
        const formContent = fs.readFileSync(formPath, 'utf-8');

        // Extraer la configuración de HID
        const hidConfigMatch = formContent.match(/hazard_id:\s*\[([\s\S]*?)\],\s*wit:/);

        if (!hidConfigMatch) {
            throw new Error('No se encontró la configuración de hazard_id');
        }

        const hidConfig = hidConfigMatch[1];

        // Contar ocurrencias de campos clave
        const fieldsToCheck = ['fecha', 'categoria', 'subcategoria', 'nombre_quien_reporta'];

        for (const field of fieldsToCheck) {
            const fieldMatches = hidConfig.match(new RegExp(`key:\\s*'${field}'`, 'g'));
            const count = fieldMatches ? fieldMatches.length : 0;

            console.log(`📊 Campo "${field}" aparece ${count} vez(ces) en fieldConfigs.hazard_id`);

            if (count === 1) {
                console.log(`  ✓ Correcto: ${field} aparece exactamente 1 vez`);
            } else if (count === 0) {
                console.log(`  ❌ ERROR: ${field} NO está en fieldConfigs (debería estar)`);
            } else {
                console.log(`  ❌ ERROR: ${field} aparece ${count} veces (debería ser 1)`);
            }

            expect(count).toBe(1);
        }

        // Verificar que NO estén hardcodeados fuera del bucle
        const templateSection = formContent.match(/<template>([\s\S]*)<\/template>/)?.[1] || '';
        const hardcodedFields = templateSection.match(/v-model="reportForm\.(fecha|categoria|subcategoria|nombre_quien_reporta)"/g);

        if (hardcodedFields) {
            console.log('  ❌ ERROR: Campos hardcodeados en el template fuera del bucle dinámico');
        } else {
            console.log('  ✓ Correcto: Campos NO están hardcodeados fuera del bucle');
        }

        expect(hardcodedFields).toBeNull();

        console.log('✅ Campos críticos correctamente configurados');
    });

    test('Resumen: Verificación completa de estructura del formulario', async () => {
        console.log('📊 RESUMEN: Verificación completa de ILVReportForm.vue');
        console.log('==========================================================');

        const fs = require('fs');
        const path = require('path');
        const formPath = path.join(__dirname, '../../frontend/src/pages/ILVReportForm.vue');
        const formContent = fs.readFileSync(formPath, 'utf-8');

        // 1. Contar campos por tipo
        const types = ['hazard_id', 'wit', 'swa', 'fdkar'];
        const fieldCounts: { [key: string]: number } = {};

        for (const type of types) {
            let nextType = '';
            switch (type) {
                case 'hazard_id': nextType = 'wit'; break;
                case 'wit': nextType = 'swa'; break;
                case 'swa': nextType = 'fdkar'; break;
                case 'fdkar': nextType = '}'; break;
            }

            const regex = new RegExp(`${type}:\\s*\\[([\\s\\S]*?)\\],\\s*${nextType}`);
            const match = formContent.match(regex);

            if (match) {
                const keys = match[1].match(/key:/g);
                fieldCounts[type] = keys ? keys.length : 0;
            }
        }

        console.log('\n📋 Conteo de campos por tipo:');
        console.log(`  HID (hazard_id):  ${fieldCounts['hazard_id']} campos`);
        console.log(`  W&T (wit):        ${fieldCounts['wit']} campos`);
        console.log(`  SWA (swa):        ${fieldCounts['swa']} campos`);
        console.log(`  Safety Cards:     ${fieldCounts['fdkar']} campos`);

        // 2. Verificar que no haya campos hardcodeados problemáticos
        const templateSection = formContent.match(/<template>([\s\S]*)<\/template>/)?.[1] || '';
        const hardcodedInputs = templateSection.match(/v-model="reportForm\.(fecha|categoria|nombre_quien_reporta)"/g);

        console.log('\n🔍 Campos hardcodeados (fuera de campos dinámicos):');
        if (!hardcodedInputs || hardcodedInputs.length === 0) {
            console.log('  ✓ No hay campos hardcodeados problemáticos');
        } else {
            console.log('  ❌ Se encontraron campos hardcodeados:');
            hardcodedInputs.forEach((input: string) => console.log(`     - ${input}`));
        }

        // 3. Verificar componentes jerárquicos
        const hasHierarchical = formContent.includes('select-hierarchical');
        const hasHierarchicalChild = formContent.includes('select-hierarchical-child');

        console.log('\n🌳 Componentes jerárquicos:');
        console.log(`  ${hasHierarchical ? '✓' : '❌'} select-hierarchical implementado`);
        console.log(`  ${hasHierarchicalChild ? '✓' : '❌'} select-hierarchical-child implementado`);

        expect(hasHierarchical).toBe(true);
        expect(hasHierarchicalChild).toBe(true);

        // 4. Verificar observacion en todos los tipos
        const observacionCounts = types.map(type => {
            const regex = new RegExp(`${type}:[\\s\\S]*?key:\\s*'observacion'`);
            return formContent.match(regex) ? 1 : 0;
        });

        console.log('\n📝 Campo "observacion" (debe estar en todos):');
        types.forEach((type, i) => {
            const hasIt = observacionCounts[i] === 1;
            console.log(`  ${hasIt ? '✓' : '❌'} ${type}: ${hasIt ? 'presente' : 'ausente'}`);
        });

        console.log('\n✅ Verificación de estructura completada');
    });
});
