-- Script para agregar permisos del módulo de Configuración del Sistema
-- Solo para roles de administrador (role_id = 1)

-- Verificar que el módulo no exista antes de insertar
DO $$
BEGIN
    -- Verificar si ya existe el módulo para el rol admin
    IF NOT EXISTS (
        SELECT 1 FROM access 
        WHERE module_name = 'system_config' AND role_id = 1
    ) THEN
        -- Agregar permiso de Configuración del Sistema para Admin (role_id = 1)
        INSERT INTO access (module_name, can_view, can_edit, role_id)
        VALUES ('system_config', true, true, 1);
        
        RAISE NOTICE 'Permiso system_config agregado para Admin (role_id = 1)';
    ELSE
        RAISE NOTICE 'El permiso system_config ya existe para Admin';
    END IF;
END $$;

-- Mostrar los permisos actuales del módulo
SELECT 
    a.access_id,
    a.module_name,
    a.can_view,
    a.can_edit,
    r.name as role_name
FROM access a
JOIN role r ON a.role_id = r.role_id
WHERE a.module_name = 'system_config'
ORDER BY r.role_id;
