-- Script para agregar permisos de Form Builder al rol Admin

-- Primero verificamos que existen los permisos en la tabla access
DO $$
BEGIN
    -- Permiso: Gestionar Formularios (CRUD completo)
    IF NOT EXISTS (SELECT 1 FROM access WHERE access_name = 'form_builder_manage') THEN
        INSERT INTO access (access_name, description, module) 
        VALUES ('form_builder_manage', 'Crear, editar y eliminar plantillas de formularios', 'form_builder');
    END IF;

    -- Permiso: Ver formularios
    IF NOT EXISTS (SELECT 1 FROM access WHERE access_name = 'form_builder_view') THEN
        INSERT INTO access (access_name, description, module) 
        VALUES ('form_builder_view', 'Ver plantillas de formularios', 'form_builder');
    END IF;

    -- Permiso: Llenar formularios
    IF NOT EXISTS (SELECT 1 FROM access WHERE access_name = 'form_builder_fill') THEN
        INSERT INTO access (access_name, description, module) 
        VALUES ('form_builder_fill', 'Completar formularios asignados a inspecciones', 'form_builder');
    END IF;

    -- Permiso: Ver respuestas
    IF NOT EXISTS (SELECT 1 FROM access WHERE access_name = 'form_builder_submissions') THEN
        INSERT INTO access (access_name, description, module) 
        VALUES ('form_builder_submissions', 'Ver respuestas de formularios completados', 'form_builder');
    END IF;

    -- Permiso: Exportar PDF
    IF NOT EXISTS (SELECT 1 FROM access WHERE access_name = 'form_builder_export') THEN
        INSERT INTO access (access_name, description, module) 
        VALUES ('form_builder_export', 'Exportar formularios a PDF', 'form_builder');
    END IF;
END $$;

-- Asignar permisos al rol administrador (role_id = 1)
INSERT INTO role_access (role_id, access_id)
SELECT 1, access_id FROM access WHERE module = 'form_builder'
ON CONFLICT DO NOTHING;

-- Mostrar los permisos asignados
SELECT r.role_name, a.access_name, a.module 
FROM role_access ra
JOIN roles r ON ra.role_id = r.role_id
JOIN access a ON ra.access_id = a.access_id
WHERE a.module = 'form_builder';
