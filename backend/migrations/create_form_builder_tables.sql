-- =====================================================
-- FORM BUILDER - Migración de Base de Datos
-- Fecha: 2024-12-04
-- Descripción: Creación de tablas para el módulo Form Builder
-- =====================================================

-- Tabla: form_template
-- Almacena los formularios creados por los administradores
CREATE TABLE IF NOT EXISTS form_template (
    form_template_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL DEFAULT '{"fields": []}',
    settings JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_draft BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES "user"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para form_template
CREATE INDEX IF NOT EXISTS idx_form_template_active ON form_template(is_active);
CREATE INDEX IF NOT EXISTS idx_form_template_created_by ON form_template(created_by);
CREATE INDEX IF NOT EXISTS idx_form_template_name ON form_template(name);

-- Tabla: form_template_classification
-- Relación entre formularios y clasificaciones de inspección
CREATE TABLE IF NOT EXISTS form_template_classification (
    form_classification_id SERIAL PRIMARY KEY,
    form_template_id INTEGER NOT NULL REFERENCES form_template(form_template_id) ON DELETE CASCADE,
    maestro_id INTEGER NOT NULL REFERENCES inspeccion_maestro(maestro_id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_template_id, maestro_id)
);

-- Índices para form_template_classification
CREATE INDEX IF NOT EXISTS idx_ftc_form_template ON form_template_classification(form_template_id);
CREATE INDEX IF NOT EXISTS idx_ftc_maestro ON form_template_classification(maestro_id);

-- Tabla: form_submission
-- Almacena las respuestas de los formularios
CREATE TABLE IF NOT EXISTS form_submission (
    form_submission_id SERIAL PRIMARY KEY,
    form_template_id INTEGER NOT NULL REFERENCES form_template(form_template_id) ON DELETE RESTRICT,
    inspeccion_report_id INTEGER NOT NULL REFERENCES inspeccion_report(report_id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'draft', 'partial'
    submitted_by INTEGER REFERENCES "user"(user_id) ON DELETE SET NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_template_id, inspeccion_report_id)
);

-- Índices para form_submission
CREATE INDEX IF NOT EXISTS idx_form_submission_template ON form_submission(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_submission_report ON form_submission(inspeccion_report_id);
CREATE INDEX IF NOT EXISTS idx_form_submission_user ON form_submission(submitted_by);
CREATE INDEX IF NOT EXISTS idx_form_submission_status ON form_submission(status);
CREATE INDEX IF NOT EXISTS idx_form_submission_data ON form_submission USING GIN(data);

-- Tabla: form_draft
-- Almacena borradores de formularios en progreso
CREATE TABLE IF NOT EXISTS form_draft (
    form_draft_id SERIAL PRIMARY KEY,
    form_template_id INTEGER NOT NULL REFERENCES form_template(form_template_id) ON DELETE CASCADE,
    inspeccion_report_id INTEGER REFERENCES inspeccion_report(report_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    last_field_edited VARCHAR(255),
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para form_draft
CREATE INDEX IF NOT EXISTS idx_form_draft_template ON form_draft(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_draft_report ON form_draft(inspeccion_report_id);
CREATE INDEX IF NOT EXISTS idx_form_draft_user ON form_draft(user_id);
CREATE INDEX IF NOT EXISTS idx_form_draft_expires ON form_draft(expires_at);

-- Tabla: form_submission_history
-- Historial de cambios en formularios (auditoría)
CREATE TABLE IF NOT EXISTS form_submission_history (
    history_id SERIAL PRIMARY KEY,
    form_submission_id INTEGER NOT NULL REFERENCES form_submission(form_submission_id) ON DELETE CASCADE,
    previous_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    changed_fields JSONB, -- Lista de campos que cambiaron
    changed_by INTEGER REFERENCES "user"(user_id) ON DELETE SET NULL,
    change_reason VARCHAR(500),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para form_submission_history
CREATE INDEX IF NOT EXISTS idx_fsh_submission ON form_submission_history(form_submission_id);
CREATE INDEX IF NOT EXISTS idx_fsh_changed_by ON form_submission_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_fsh_changed_at ON form_submission_history(changed_at);

-- =====================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_form_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_form_template_updated ON form_template;
CREATE TRIGGER trigger_form_template_updated
    BEFORE UPDATE ON form_template
    FOR EACH ROW
    EXECUTE FUNCTION update_form_updated_at();

DROP TRIGGER IF EXISTS trigger_form_submission_updated ON form_submission;
CREATE TRIGGER trigger_form_submission_updated
    BEFORE UPDATE ON form_submission
    FOR EACH ROW
    EXECUTE FUNCTION update_form_updated_at();

DROP TRIGGER IF EXISTS trigger_form_draft_updated ON form_draft;
CREATE TRIGGER trigger_form_draft_updated
    BEFORE UPDATE ON form_draft
    FOR EACH ROW
    EXECUTE FUNCTION update_form_updated_at();

-- =====================================================
-- PERMISOS: Insertar permisos para el módulo Form Builder
-- =====================================================

-- Verificar si ya existen los permisos antes de insertarlos
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

-- Asignar permisos al rol administrador (role_id = 1 asumido)
-- Comentado para ejecución manual según configuración de roles
/*
INSERT INTO role_access (role_id, access_id)
SELECT 1, access_id FROM access WHERE module = 'form_builder'
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE form_template IS 'Plantillas de formularios creadas por administradores';
COMMENT ON COLUMN form_template.schema IS 'Estructura JSON del formulario con campos, validaciones y configuraciones';
COMMENT ON COLUMN form_template.settings IS 'Configuraciones adicionales: scoring, multi-idioma, etc.';
COMMENT ON COLUMN form_template.version IS 'Versión del formulario para control de cambios';

COMMENT ON TABLE form_template_classification IS 'Relación entre formularios y clasificaciones de inspección';
COMMENT ON COLUMN form_template_classification.is_required IS 'Si el formulario es obligatorio para la clasificación';

COMMENT ON TABLE form_submission IS 'Respuestas de formularios completados en inspecciones';
COMMENT ON COLUMN form_submission.data IS 'Datos del formulario en formato JSON {fieldKey: value}';

COMMENT ON TABLE form_draft IS 'Borradores de formularios para autoguardado';
COMMENT ON COLUMN form_draft.expires_at IS 'Fecha de expiración del borrador (7 días por defecto)';

COMMENT ON TABLE form_submission_history IS 'Historial de ediciones para auditoría';
COMMENT ON COLUMN form_submission_history.changed_fields IS 'Array de campos que fueron modificados';
