-- Seed: Categorías y Subcategorías Jerárquicas HID
-- Fecha: 2025-11-13
-- Sprint 2 - T2.2

BEGIN;

-- CATEGORÍAS PRINCIPALES (sin parent_maestro_id)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (200, 'categoria_hid', 'trabajos_alturas', 'Trabajos en Alturas', true, 1, 'hazard_id', NULL),
  (201, 'categoria_hid', 'trabajos_caliente', 'Trabajos en Caliente', true, 2, 'hazard_id', NULL),
  (202, 'categoria_hid', 'espacios_confinados', 'Espacios Confinados', true, 3, 'hazard_id', NULL),
  (203, 'categoria_hid', 'operacion_equipos', 'Operación de Equipos y Maquinaria', true, 4, 'hazard_id', NULL),
  (204, 'categoria_hid', 'manejo_materiales', 'Manejo de Materiales Peligrosos', true, 5, 'hazard_id', NULL),
  (205, 'categoria_hid', 'electrico', 'Riesgos Eléctricos', true, 6, 'hazard_id', NULL),
  (206, 'categoria_hid', 'ergonomico', 'Riesgos Ergonómicos', true, 7, 'hazard_id', NULL);

-- SUBCATEGORÍAS: Trabajos en Alturas (parent: 200)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (210, 'subcategoria_hid', 'caidas_distinto_nivel', 'Caídas a distinto nivel', true, 1, 'hazard_id', 200),
  (211, 'subcategoria_hid', 'caidas_mismo_nivel', 'Caídas al mismo nivel', true, 2, 'hazard_id', 200),
  (212, 'subcategoria_hid', 'golpes_objetos_caida', 'Golpes por caída de objetos', true, 3, 'hazard_id', 200),
  (213, 'subcategoria_hid', 'ausencia_proteccion', 'Ausencia de protección colectiva', true, 4, 'hazard_id', 200);

-- SUBCATEGORÍAS: Trabajos en Caliente (parent: 201)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (220, 'subcategoria_hid', 'incendio', 'Riesgo de incendio', true, 1, 'hazard_id', 201),
  (221, 'subcategoria_hid', 'explosion', 'Riesgo de explosión', true, 2, 'hazard_id', 201),
  (222, 'subcategoria_hid', 'quemaduras', 'Quemaduras', true, 3, 'hazard_id', 201),
  (223, 'subcategoria_hid', 'falta_permisos', 'Trabajos sin permisos', true, 4, 'hazard_id', 201);

-- SUBCATEGORÍAS: Espacios Confinados (parent: 202)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (230, 'subcategoria_hid', 'asfixia', 'Riesgo de asfixia', true, 1, 'hazard_id', 202),
  (231, 'subcategoria_hid', 'atmosfera_peligrosa', 'Atmósfera peligrosa', true, 2, 'hazard_id', 202),
  (232, 'subcategoria_hid', 'ingreso_sin_permiso', 'Ingreso sin permiso', true, 3, 'hazard_id', 202);

-- SUBCATEGORÍAS: Operación de Equipos (parent: 203)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (240, 'subcategoria_hid', 'atrapamiento', 'Atrapamiento por maquinaria', true, 1, 'hazard_id', 203),
  (241, 'subcategoria_hid', 'golpe_partes_moviles', 'Golpes por partes móviles', true, 2, 'hazard_id', 203),
  (242, 'subcategoria_hid', 'operador_no_calificado', 'Operador no calificado', true, 3, 'hazard_id', 203),
  (243, 'subcategoria_hid', 'mantenimiento_inadecuado', 'Mantenimiento inadecuado', true, 4, 'hazard_id', 203);

-- SUBCATEGORÍAS: Manejo Materiales Peligrosos (parent: 204)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (250, 'subcategoria_hid', 'exposicion_quimicos', 'Exposición a químicos', true, 1, 'hazard_id', 204),
  (251, 'subcategoria_hid', 'derrame', 'Derrame de sustancias', true, 2, 'hazard_id', 204),
  (252, 'subcategoria_hid', 'almacenamiento_inadecuado', 'Almacenamiento inadecuado', true, 3, 'hazard_id', 204);

-- SUBCATEGORÍAS: Riesgos Eléctricos (parent: 205)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (260, 'subcategoria_hid', 'contacto_directo', 'Contacto eléctrico directo', true, 1, 'hazard_id', 205),
  (261, 'subcategoria_hid', 'contacto_indirecto', 'Contacto eléctrico indirecto', true, 2, 'hazard_id', 205),
  (262, 'subcategoria_hid', 'instalaciones_defectuosas', 'Instalaciones defectuosas', true, 3, 'hazard_id', 205);

-- SUBCATEGORÍAS: Riesgos Ergonómicos (parent: 206)
INSERT INTO ilv_maestro (maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo, parent_maestro_id) VALUES
  (270, 'subcategoria_hid', 'posturas_forzadas', 'Posturas forzadas', true, 1, 'hazard_id', 206),
  (271, 'subcategoria_hid', 'movimientos_repetitivos', 'Movimientos repetitivos', true, 2, 'hazard_id', 206),
  (272, 'subcategoria_hid', 'manejo_manual_cargas', 'Manejo manual de cargas', true, 3, 'hazard_id', 206);

-- Actualizar sequence
SELECT setval('ilb_maestro_maestro_id_seq', 280);

COMMIT;
