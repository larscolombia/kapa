-- Migración: Añadir nuevos maestros para campos específicos HID
-- Fecha: 2025-11-13
-- Sprint 2 - T2.1

BEGIN;

-- Maestros: Tipo de Reporte HID
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hid', 'hid_inert_smith', 'HID Inert Smith', true, 1, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hid' AND clave = 'hid_inert_smith');

INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hid', 'hid_preventivo', 'HID Preventivo', true, 2, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hid' AND clave = 'hid_preventivo');

INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hid', 'hid_reactivo', 'HID Reactivo', true, 3, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hid' AND clave = 'hid_reactivo');

-- Maestros: Tipo HSE (Seguridad, Salud, Medio Ambiente, etc.)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hse', 'seguridad', 'Seguridad', true, 1, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hse' AND clave = 'seguridad');

INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hse', 'salud', 'Salud', true, 2, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hse' AND clave = 'salud');

INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hse', 'medio_ambiente', 'Medio Ambiente', true, 3, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hse' AND clave = 'medio_ambiente');

INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hse', 'inocuidad', 'Inocuidad', true, 4, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hse' AND clave = 'inocuidad');

INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) 
SELECT 'tipo_hse', 'dano_propiedad', 'Daño a la Propiedad', true, 5, 'hazard_id'
WHERE NOT EXISTS (SELECT 1 FROM ilv_maestro WHERE tipo = 'tipo_hse' AND clave = 'dano_propiedad');

COMMIT;
