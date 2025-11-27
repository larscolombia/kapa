import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Test de base de datos - Verificación de valores maestros
 * Confirma que no hay duplicados y que los valores son correctos
 */

test.describe('ILV - Verificación de Base de Datos', () => {

  test('Verificar que no hay valores duplicados de Severidad en la BD', async () => {
    console.log('🧪 Verificando valores de Severidad en PostgreSQL');

    const query = `
      SELECT tipo, clave, valor, COUNT(*) as cantidad
      FROM ilv_maestro
      WHERE tipo = 'severidad' AND activo = TRUE
      GROUP BY tipo, clave, valor
      ORDER BY valor;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const lines = stdout.trim().split('\n').filter(l => l.trim());
    console.log(`📊 Registros encontrados: ${lines.length}`);

    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      console.log(`  ${parts[2]}: ${parts[3]} ocurrencia(s)`);

      // Verificar que cada valor aparece solo 1 vez
      expect(parseInt(parts[3])).toBe(1);
    });

    // Verificar que hay exactamente 4 valores
    expect(lines.length).toBe(4);
    console.log('✅ No hay duplicados en Severidad');
  });

  test('Verificar que no hay valores duplicados de Área en la BD', async () => {
    console.log('🧪 Verificando valores de Área en PostgreSQL');

    const query = `
      SELECT tipo, clave, valor, COUNT(*) as cantidad
      FROM ilv_maestro
      WHERE tipo = 'area' AND activo = TRUE
      GROUP BY tipo, clave, valor
      ORDER BY valor;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const lines = stdout.trim().split('\n').filter(l => l.trim());
    console.log(`📊 Registros encontrados: ${lines.length}`);

    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      console.log(`  ${parts[2]}: ${parts[3]} ocurrencia(s)`);

      // Verificar que cada valor aparece solo 1 vez
      expect(parseInt(parts[3])).toBe(1);
    });

    // Verificar que hay exactamente 6 valores
    expect(lines.length).toBe(6);
    console.log('✅ No hay duplicados en Área');
  });

  test('Verificar que todos los tipos maestros no tienen duplicados', async () => {
    console.log('🧪 Buscando duplicados en todos los tipos maestros');

    const query = `
      SELECT tipo, clave, COUNT(*) as cantidad
      FROM ilv_maestro
      WHERE activo = TRUE
      GROUP BY tipo, clave
      HAVING COUNT(*) > 1
      ORDER BY tipo, clave;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const duplicates = stdout.trim();

    if (duplicates) {
      console.log('❌ Se encontraron duplicados:');
      console.log(duplicates);
    } else {
      console.log('✅ No hay duplicados en ningún tipo maestro');
    }

    expect(duplicates).toBe('');
  });

  test('Verificar conteo de categorías y subcategorías HID', async () => {
    console.log('🧪 Verificando estructura jerárquica de categorías HID');

    const query = `
      SELECT 
        c.clave as categoria,
        c.valor as nombre,
        COUNT(s.maestro_id) as subcategorias
      FROM ilv_maestro c
      LEFT JOIN ilv_maestro s ON s.aplica_a_tipo = c.clave AND s.tipo = 'subcategoria_hid'
      WHERE c.tipo = 'categoria_hid' AND c.activo = TRUE
      GROUP BY c.clave, c.valor, c.orden
      ORDER BY c.orden
      LIMIT 5;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const lines = stdout.trim().split('\n').filter(l => l.trim());
    console.log('📊 Primeras 5 categorías con sus subcategorías:');

    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      console.log(`  ${parts[1]}: ${parts[2]} subcategoría(s)`);
    });

    // Verificar que hay al menos 5 categorías
    expect(lines.length).toBeGreaterThanOrEqual(5);
    console.log('✅ Estructura jerárquica correcta');
  });

  test('Verificar valores específicos de Severidad', async () => {
    console.log('🧪 Verificando valores específicos de Severidad');

    const query = `
      SELECT valor
      FROM ilv_maestro
      WHERE tipo = 'severidad' AND activo = TRUE
      ORDER BY orden;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const values = stdout.trim().split('\n').map(v => v.trim());
    console.log('📋 Valores encontrados:', values);

    const expected = ['Baja', 'Media', 'Alta', 'Crítica'];

    expect(values).toEqual(expected);
    console.log('✅ Valores de Severidad son correctos');
  });

  test('Verificar valores específicos de Área', async () => {
    console.log('🧪 Verificando valores específicos de Área');

    const query = `
      SELECT valor
      FROM ilv_maestro
      WHERE tipo = 'area' AND activo = TRUE
      ORDER BY orden;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const values = stdout.trim().split('\n').map(v => v.trim());
    console.log('📋 Valores encontrados:', values);

    const expected = ['Administrativa', 'Operativa', 'Construcción', 'Mantenimiento', 'Operaciones', 'Logística'];

    expect(values).toEqual(expected);
    console.log('✅ Valores de Área son correctos');
  });

  test('Simular guardado de reporte - Verificar estructura de datos', async () => {
    console.log('🧪 Verificando que los IDs de maestros existen para guardar un reporte');

    // Verificar que existen los valores necesarios para un reporte HID
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM ilv_maestro WHERE tipo = 'severidad' AND activo = TRUE) as severidades,
        (SELECT COUNT(*) FROM ilv_maestro WHERE tipo = 'area' AND activo = TRUE) as areas,
        (SELECT COUNT(*) FROM ilv_maestro WHERE tipo = 'tipo_hid' AND activo = TRUE) as tipos_hid,
        (SELECT COUNT(*) FROM ilv_maestro WHERE tipo = 'categoria_hid' AND activo = TRUE) as categorias,
        (SELECT COUNT(*) FROM ilv_maestro WHERE tipo = 'subcategoria_hid' AND activo = TRUE) as subcategorias;
    `;

    const { stdout } = await execAsync(
      `sudo -u postgres psql kapa_db -t -c "${query}"`
    );

    const parts = stdout.trim().split('|').map(p => p.trim());

    console.log('📊 Datos disponibles para reportes:');
    console.log(`  Severidades: ${parts[0]}`);
    console.log(`  Áreas: ${parts[1]}`);
    console.log(`  Tipos HID: ${parts[2]}`);
    console.log(`  Categorías HID: ${parts[3]}`);
    console.log(`  Subcategorías HID: ${parts[4]}`);

    // Verificar que hay datos suficientes
    expect(parseInt(parts[0])).toBeGreaterThanOrEqual(4); // Severidades
    expect(parseInt(parts[1])).toBeGreaterThanOrEqual(6); // Áreas
    expect(parseInt(parts[2])).toBeGreaterThan(0); // Tipos HID
    expect(parseInt(parts[3])).toBeGreaterThanOrEqual(12); // Categorías
    expect(parseInt(parts[4])).toBeGreaterThanOrEqual(40); // Subcategorías

    console.log('✅ Todos los datos necesarios están disponibles para guardar reportes');
  });

});
