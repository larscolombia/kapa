-- Seed de maestros para Hazard ID (HID)
-- Fecha: 13 de Noviembre, 2025

-- Tipo de Reporte HID (Categoría principal)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('tipo_hid', 'acto_inseguro', 'Acto Inseguro', TRUE, 1, 'hazard_id'),
('tipo_hid', 'condicion_insegura', 'Condición Insegura', TRUE, 2, 'hazard_id'),
('tipo_hid', 'casi_accidente', 'Casi Accidente / Near Miss', TRUE, 3, 'hazard_id'),
('tipo_hid', 'buena_practica', 'Buena Práctica', TRUE, 4, 'hazard_id')
ON CONFLICT (tipo, clave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- Severidad (ya existente, complementar si falta)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('severidad', 'baja', 'Baja', TRUE, 1, 'hazard_id'),
('severidad', 'media', 'Media', TRUE, 2, 'hazard_id'),
('severidad', 'alta', 'Alta', TRUE, 3, 'hazard_id'),
('severidad', 'critica', 'Crítica', TRUE, 4, 'hazard_id')
ON CONFLICT (tipo, clave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- Áreas (ya existente, complementar si falta)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('area', 'produccion', 'Producción', TRUE, 1, NULL),
('area', 'mantenimiento', 'Mantenimiento', TRUE, 2, NULL),
('area', 'logistica', 'Logística', TRUE, 3, NULL),
('area', 'almacen', 'Almacén', TRUE, 4, NULL),
('area', 'oficinas', 'Oficinas', TRUE, 5, NULL),
('area', 'instalaciones', 'Instalaciones / Infraestructura', TRUE, 6, NULL),
('area', 'vias_acceso', 'Vías de Acceso', TRUE, 7, NULL),
('area', 'zona_comun', 'Zona Común', TRUE, 8, NULL),
('area', 'otra', 'Otra', TRUE, 99, NULL)
ON CONFLICT (tipo, clave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- Causas Probables
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('causa', 'falta_capacitacion', 'Falta de Capacitación', TRUE, 1, 'hazard_id'),
('causa', 'falta_supervision', 'Falta de Supervisión', TRUE, 2, 'hazard_id'),
('causa', 'procedimiento_inadecuado', 'Procedimiento Inadecuado', TRUE, 3, 'hazard_id'),
('causa', 'equipo_defectuoso', 'Equipo Defectuoso', TRUE, 4, 'hazard_id'),
('causa', 'herramienta_inadecuada', 'Herramienta Inadecuada', TRUE, 5, 'hazard_id'),
('causa', 'falta_epp', 'Falta de EPP', TRUE, 6, 'hazard_id'),
('causa', 'epp_inadecuado', 'EPP Inadecuado', TRUE, 7, 'hazard_id'),
('causa', 'condicion_climatica', 'Condición Climática', TRUE, 8, 'hazard_id'),
('causa', 'fatiga', 'Fatiga / Cansancio', TRUE, 9, 'hazard_id'),
('causa', 'prisa', 'Prisa / Urgencia', TRUE, 10, 'hazard_id'),
('causa', 'orden_limpieza', 'Falta de Orden y Limpieza', TRUE, 11, 'hazard_id'),
('causa', 'iluminacion', 'Iluminación Inadecuada', TRUE, 12, 'hazard_id'),
('causa', 'ventilacion', 'Ventilación Inadecuada', TRUE, 13, 'hazard_id'),
('causa', 'senalizacion', 'Falta de Señalización', TRUE, 14, 'hazard_id'),
('causa', 'otra', 'Otra', TRUE, 99, 'hazard_id')
ON CONFLICT (tipo, clave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- Mostrar resumen
SELECT 
  tipo, 
  COUNT(*) as total_valores,
  COUNT(*) FILTER (WHERE activo = TRUE) as activos
FROM ilv_maestro
WHERE tipo IN ('tipo_hid', 'severidad', 'area', 'causa')
GROUP BY tipo
ORDER BY tipo;

-- Verificar maestros HID
SELECT maestro_id, tipo, clave, valor, activo, orden, aplica_a_tipo
FROM ilv_maestro
WHERE tipo = 'tipo_hid'
ORDER BY orden;
