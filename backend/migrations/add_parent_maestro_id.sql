-- Migración: Añadir soporte para maestros jerárquicos
-- Fecha: 2025-11-13
-- Sprint 2 - T2.2

BEGIN;

-- Añadir columna parent_maestro_id para jerarquía
ALTER TABLE ilv_maestro 
ADD COLUMN IF NOT EXISTS parent_maestro_id INTEGER REFERENCES ilv_maestro(maestro_id) ON DELETE CASCADE;

-- Índice para mejorar queries de jerarquía
CREATE INDEX IF NOT EXISTS idx_ilv_maestro_parent ON ilv_maestro(parent_maestro_id);

-- Comentario
COMMENT ON COLUMN ilv_maestro.parent_maestro_id IS 'Referencia al maestro padre para jerarquías (categoría → subcategoría)';

COMMIT;
