-- Seed de Maestros ILB
-- Ejecutar después de la migración principal

-- Severidad (para Hazard ID)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('severidad', 'baja', 'Baja', true, 1, 'hazard_id'),
('severidad', 'media', 'Media', true, 2, 'hazard_id'),
('severidad', 'alta', 'Alta', true, 3, 'hazard_id'),
('severidad', 'critica', 'Crítica', true, 4, 'hazard_id');

-- Áreas (para Hazard ID y SWA)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('area', 'construccion', 'Construcción', true, 1, NULL),
('area', 'mantenimiento', 'Mantenimiento', true, 2, NULL),
('area', 'operaciones', 'Operaciones', true, 3, NULL),
('area', 'logistica', 'Logística', true, 4, NULL),
('area', 'administrativa', 'Administrativa', true, 5, NULL);

-- Causas probables (para Hazard ID)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('causa', 'condicion_insegura', 'Condición insegura', true, 1, 'hazard_id'),
('causa', 'acto_inseguro', 'Acto inseguro', true, 2, 'hazard_id'),
('causa', 'falta_epp', 'Falta de EPP', true, 3, 'hazard_id'),
('causa', 'maquinaria_defectuosa', 'Maquinaria defectuosa', true, 4, 'hazard_id'),
('causa', 'falta_señalizacion', 'Falta de señalización', true, 5, 'hazard_id'),
('causa', 'orden_limpieza', 'Orden y limpieza', true, 6, 'hazard_id');

-- Riesgos asociados (para WIT)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('riesgo', 'caida_altura', 'Caída de altura', true, 1, 'wit'),
('riesgo', 'atrapamiento', 'Atrapamiento', true, 2, 'wit'),
('riesgo', 'golpe_objeto', 'Golpe por objeto', true, 3, 'wit'),
('riesgo', 'electrico', 'Eléctrico', true, 4, 'wit'),
('riesgo', 'incendio', 'Incendio', true, 5, 'wit'),
('riesgo', 'ergonomico', 'Ergonómico', true, 6, 'wit'),
('riesgo', 'quimico', 'Químico', true, 7, 'wit'),
('riesgo', 'biologico', 'Biológico', true, 8, 'wit');

-- Motivos SWA (para Stop Work Authority)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('motivo_swa', 'peligro_inminente', 'Peligro inminente', true, 1, 'swa'),
('motivo_swa', 'condicion_critica', 'Condición crítica de seguridad', true, 2, 'swa'),
('motivo_swa', 'falta_permisos', 'Falta de permisos de trabajo', true, 3, 'swa'),
('motivo_swa', 'personal_no_calificado', 'Personal no calificado', true, 4, 'swa'),
('motivo_swa', 'equipo_defectuoso', 'Equipo defectuoso', true, 5, 'swa'),
('motivo_swa', 'clima_adverso', 'Condiciones climáticas adversas', true, 6, 'swa');

-- Clasificación FDKAR
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('clasificacion_fdkar', 'find', 'Find (Encontrado)', true, 1, 'fdkar'),
('clasificacion_fdkar', 'develop', 'Develop (Desarrollado)', true, 2, 'fdkar'),
('clasificacion_fdkar', 'kill', 'Kill (Eliminado)', true, 3, 'fdkar'),
('clasificacion_fdkar', 'act', 'Act (Actuado)', true, 4, 'fdkar'),
('clasificacion_fdkar', 'recognize', 'Recognize (Reconocido)', true, 5, 'fdkar');

-- Tipos de evidencia
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('tipo_evidencia', 'foto', 'Fotografía', true, 1, NULL),
('tipo_evidencia', 'video', 'Video', true, 2, NULL),
('tipo_evidencia', 'documento', 'Documento', true, 3, NULL),
('tipo_evidencia', 'acta', 'Acta', true, 4, NULL),
('tipo_evidencia', 'checklist', 'Checklist', true, 5, NULL);

-- Tipo HID (Hazard Identification - Tipos de reporte)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('tipo_hid', 'condicion_insegura', 'Condición Insegura', true, 1, 'hazard_id'),
('tipo_hid', 'acto_inseguro', 'Acto Inseguro', true, 2, 'hazard_id'),
('tipo_hid', 'casi_accidente', 'Casi Accidente', true, 3, 'hazard_id'),
('tipo_hid', 'observacion_positiva', 'Observación Positiva', true, 4, 'hazard_id'),
('tipo_hid', 'mejora_proceso', 'Mejora de Proceso', true, 5, 'hazard_id');

-- Tipo HSE (Health, Safety & Environment)
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('tipo_hse', 'seguridad', 'Seguridad', true, 1, NULL),
('tipo_hse', 'salud', 'Salud Ocupacional', true, 2, NULL),
('tipo_hse', 'ambiente', 'Medio Ambiente', true, 3, NULL),
('tipo_hse', 'higiene_industrial', 'Higiene Industrial', true, 4, NULL),
('tipo_hse', 'emergencias', 'Emergencias', true, 5, NULL);

