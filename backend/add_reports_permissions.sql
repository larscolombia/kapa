-- Agregar permisos para el módulo de reportes
-- Para el rol de administrador (role_id = 1)
INSERT INTO access (module_name, can_view, can_edit, role_id)
VALUES ('reports_management', true, false, 1)
ON CONFLICT DO NOTHING;

-- Verificar que se agregó correctamente
SELECT * FROM access WHERE module_name = 'reports_management';
