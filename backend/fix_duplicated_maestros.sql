-- Corrección de valores duplicados en ilv_maestro
-- Fecha: 20 de Noviembre de 2025
-- Problema: Los campos Severidad y Área mostraban valores duplicados en el formulario ILV

-- 1. DIAGNÓSTICO
-- Se encontraron registros duplicados en los siguientes tipos:
-- - severidad: 8 registros (4 valores × 2)
-- - area: 7 registros (algunos duplicados, otros faltantes)
-- - causa: 4 registros (2 valores × 2)
-- - riesgo: 2 registros (1 valor × 2)

-- 2. CAUSA
-- Los duplicados se crearon el 04-Nov-2025, posiblemente por una re-ejecución
-- de scripts de inicialización o migraciones

-- 3. SOLUCIÓN APLICADA

BEGIN;

-- Eliminar duplicados de severidad (mantener IDs originales 1,2,3,4 del 03-Nov)
DELETE FROM ilv_maestro WHERE maestro_id IN (15, 16, 17, 18);
-- Resultado: DELETE 4

-- Eliminar duplicados de area (mantener IDs originales 5,6 del 03-Nov)
DELETE FROM ilv_maestro WHERE maestro_id IN (19, 20, 21, 22, 23);
-- Resultado: DELETE 5

-- Agregar áreas faltantes
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo) VALUES
('area', 'construccion', 'Construcción', 3, TRUE),
('area', 'mantenimiento', 'Mantenimiento', 4, TRUE),
('area', 'operaciones', 'Operaciones', 5, TRUE),
('area', 'logistica', 'Logística', 6, TRUE);
-- Resultado: INSERT 0 4 (IDs: 165, 166, 167, 168)

-- Eliminar duplicados de causa
DELETE FROM ilv_maestro WHERE maestro_id IN (24, 25);
-- Resultado: DELETE 2

-- Eliminar duplicado de riesgo
DELETE FROM ilv_maestro WHERE maestro_id = 30;
-- Resultado: DELETE 1

COMMIT;

-- 4. VERIFICACIÓN FINAL
-- Consulta para verificar que no queden duplicados:
SELECT tipo, clave, COUNT(*) as cantidad
FROM ilv_maestro
WHERE activo = TRUE
GROUP BY tipo, clave
HAVING COUNT(*) > 1;
-- Resultado esperado: 0 rows

-- Estado final de los tipos corregidos:
-- severidad: 4 valores únicos (Baja, Media, Alta, Crítica)
-- area: 6 valores únicos (Administrativa, Operativa, Construcción, Mantenimiento, Operaciones, Logística)
-- causa: 6 valores únicos
-- riesgo: 9 valores únicos

-- 5. PREVENCIÓN FUTURA
-- - Agregar constraint UNIQUE en (tipo, clave) para prevenir duplicados
-- - Revisar scripts de migración para evitar re-ejecuciones

-- Agregar constraint para prevenir duplicados futuros:
-- ALTER TABLE ilv_maestro ADD CONSTRAINT uk_ilv_maestro_tipo_clave UNIQUE (tipo, clave);
