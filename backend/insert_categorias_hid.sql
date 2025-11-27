-- Script para poblar categorías/subcategorías HID
-- Basado en las imágenes proporcionadas por el usuario
-- La tabla ilv_maestro ya existe con la columna parent_maestro_id

-- Limpiar datos existentes de categorías HID
DELETE FROM ilv_maestro WHERE tipo = 'categoria_hid';

-- ====================
-- CATEGORÍAS PRINCIPALES (7 categorías)
-- ====================

-- 1. Trabajos en alturas
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'trabajos_alturas', 'Trabajos en alturas', 1, TRUE, NULL);

-- 2. Trabajos en caliente
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'trabajos_caliente', 'Trabajos en caliente', 2, TRUE, NULL);

-- 3. Trabajos en espacio confinado
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'espacio_confinado', 'Trabajos en espacio confinado', 3, TRUE, NULL);

-- 4. Trabajos de izaje de cargas
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'izaje_cargas', 'Trabajos de izaje de cargas', 4, TRUE, NULL);

-- 5. Trabajos eléctricos
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'trabajos_electricos', 'Trabajos eléctricos', 5, TRUE, NULL);

-- 6. Trabajos altas temperaturas
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'altas_temperaturas', 'Trabajos altas temperaturas', 6, TRUE, NULL);

-- 7. Trabajos con maquinaria
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'maquinaria', 'Trabajos con maquinaria', 7, TRUE, NULL);

-- 8. Otros trabajos de alto riesgo
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'otros_alto_riesgo', 'Otros trabajos de alto riesgo', 8, TRUE, NULL);

-- 9. Medio Ambiente
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'medio_ambiente', 'Medio Ambiente', 9, TRUE, NULL);

-- 10. Salud
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'salud', 'Salud', 10, TRUE, NULL);

-- 11. Inocuidad
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'inocuidad', 'Inocuidad', 11, TRUE, NULL);

-- 12. Aseguramiento
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id) 
VALUES ('categoria_hid', 'aseguramiento', 'Aseguramiento', 12, TRUE, NULL);

-- ====================
-- SUBCATEGORÍAS (HIJOS)
-- ====================

-- Subcategorías de "Trabajos en alturas"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'caidas_distinto_nivel', 'Caídas a distinto Nivel', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'derrumbe_estructura', 'Derrumbe de estructura', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'golpes_caida_objetos', 'Golpes por caída de objetos', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'atrapamiento', 'Atrapamiento', 4, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'uso_epcc', 'Uso de EPCC', 5, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'puntos_anclaje', 'Puntos de anclaje', 6, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'sistemas_acceso', 'Sistemas de acceso', 7, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_alturas' AND tipo = 'categoria_hid'));

-- Subcategorías de "Trabajos en caliente"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'elementos_contencion', 'Elementos de contención', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_caliente' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'extintor', 'Extintor', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_caliente' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'medicion_atmosferas', 'Medición de atmósferas', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_caliente' AND tipo = 'categoria_hid'));

-- Subcategorías de "Trabajos en espacio confinado"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'atmosfera_peligrosa', 'Atmósfera peligrosa', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'espacio_confinado' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'sistemas_acceso_ec', 'Sistemas de acceso', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'espacio_confinado' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'mediciones_atmosfericas', 'Mediciones atmosféricas', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'espacio_confinado' AND tipo = 'categoria_hid'));

-- Subcategorías de "Trabajos de izaje de cargas"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'sujecion_carga', 'Sujeción de carga', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'izaje_cargas' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'maniobra', 'Maniobra', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'izaje_cargas' AND tipo = 'categoria_hid'));

-- Subcategorías de "Trabajos eléctricos"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'lock_out', 'Lock Out (Bloqueo y etiquetado)', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_electricos' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'contactos_electricos', 'Contactos eléctricos', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'trabajos_electricos' AND tipo = 'categoria_hid'));

-- Subcategorías de "Trabajos altas temperaturas"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'tiempos_recuperacion', 'Tiempos de recuperación', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'altas_temperaturas' AND tipo = 'categoria_hid'));

-- Subcategorías de "Trabajos con maquinaria"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'seguridad_vial', 'Seguridad Vial', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'maquinaria' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'daños_golpes', 'Daños o Golpes', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'maquinaria' AND tipo = 'categoria_hid'));

-- Subcategorías de "Otros trabajos de alto riesgo"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'trabajos_demolicion', 'Trabajos de demolición', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'otros_alto_riesgo' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'trabajos_excavacion', 'Trabajos de excavación', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'otros_alto_riesgo' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'manipulacion_residuos', 'Manipulación de residuos', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'otros_alto_riesgo' AND tipo = 'categoria_hid'));

-- Subcategorías de "Medio Ambiente"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'segregacion_disposicion', 'Segregación / disposición final', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'medio_ambiente' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'derrame_producto_quimico', 'Derrame producto químico', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'medio_ambiente' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'fugas', 'Fugas', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'medio_ambiente' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'almacenamiento_productos_quimicos', 'Almacenamiento de productos químicos', 4, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'medio_ambiente' AND tipo = 'categoria_hid'));

-- Subcategorías de "Salud"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'condiciones_salud', 'Condiciones de salud', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'salud' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'posturas_biomecanicas', 'Posturas Biomecánicas', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'salud' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'puntos_hidratacion', 'Puntos de hidratación', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'salud' AND tipo = 'categoria_hid'));

-- Subcategorías de "Inocuidad"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'uso_joyas', 'Uso de joyas', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'herida', 'Herida', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'ausencia_ehs', 'Ausencia de EHS', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'caida_mismo_nivel', 'Caída a mismo nivel', 4, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'epp', 'EPP', 5, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'exposicion_vacio', 'Exposición al vacío', 6, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'equipos_emergencia', 'Equipos de emergencia', 7, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'inocuidad' AND tipo = 'categoria_hid'));

-- Subcategorías de "Aseguramiento"
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, parent_maestro_id)
VALUES 
  ('categoria_hid', 'equipos_conectados_sin_uso', 'Equipos conectados sin uso', 1, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'falla_herramienta', 'Falla en herramienta', 2, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'inspecciones_preoperacionales', 'Inspecciones / preoperacionales', 3, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'permisos_trabajo_ats', 'Permisos trabajo / ATS', 4, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'orden_aseo', 'Orden, aseo', 5, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'senalizacion_delimitacion', 'Señalización y/o delimitación', 6, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'personal_entrenamiento', 'Personal en entrenamiento', 7, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid')),
  ('categoria_hid', 'superficies_rilos', 'Superficies con rilos', 8, TRUE, (SELECT maestro_id FROM ilv_maestro WHERE clave = 'aseguramiento' AND tipo = 'categoria_hid'));

-- Verificación: Mostrar todas las categorías con sus hijos
SELECT 
  p.maestro_id as cat_id,
  p.valor as categoria,
  COUNT(h.maestro_id) as subcategorias
FROM ilv_maestro p
LEFT JOIN ilv_maestro h ON h.parent_maestro_id = p.maestro_id
WHERE p.tipo = 'categoria_hid' AND p.parent_maestro_id IS NULL
GROUP BY p.maestro_id, p.valor, p.orden
ORDER BY p.orden;

-- Mostrar total
SELECT 
  'TOTAL CATEGORÍAS' as tipo,
  COUNT(*) as cantidad
FROM ilv_maestro 
WHERE tipo = 'categoria_hid' AND parent_maestro_id IS NULL
UNION ALL
SELECT 
  'TOTAL SUBCATEGORÍAS' as tipo,
  COUNT(*) as cantidad
FROM ilv_maestro 
WHERE tipo = 'categoria_hid' AND parent_maestro_id IS NOT NULL;
