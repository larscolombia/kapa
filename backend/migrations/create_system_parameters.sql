-- Migración: Crear tabla system_parameter para configuración dinámica
-- Fecha: 2025-12-10

-- Tabla de parámetros del sistema
CREATE TABLE IF NOT EXISTS system_parameter (
    parameter_id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(500) NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(100) DEFAULT 'general', -- general, ilv, inspecciones, notificaciones, reportes
    label VARCHAR(200) NOT NULL,
    description TEXT,
    editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsqueda por categoría
CREATE INDEX IF NOT EXISTS idx_system_parameter_category ON system_parameter(category);
CREATE INDEX IF NOT EXISTS idx_system_parameter_key ON system_parameter(key);

-- Comentarios
COMMENT ON TABLE system_parameter IS 'Parámetros de configuración del sistema';
COMMENT ON COLUMN system_parameter.key IS 'Identificador único del parámetro (snake_case)';
COMMENT ON COLUMN system_parameter.value IS 'Valor del parámetro (siempre string, se parsea según data_type)';
COMMENT ON COLUMN system_parameter.data_type IS 'Tipo de dato: string, number, boolean, json';
COMMENT ON COLUMN system_parameter.category IS 'Categoría para agrupar parámetros en la UI';
COMMENT ON COLUMN system_parameter.editable IS 'Si puede ser editado desde la UI';

-- Insertar parámetros por defecto
INSERT INTO system_parameter (key, value, data_type, category, label, description, editable) VALUES
-- Parámetros de SLA para ILV
('sla_days_ilv', '5', 'number', 'ilv', 'Días SLA ILV', 'Número de días máximo permitido para que un reporte ILV permanezca abierto antes de enviar recordatorio', true),
('sla_hours_revision', '24', 'number', 'reportes', 'Horas SLA Revisión', 'Horas máximas para revisión de documentos (SLA)', true),

-- Parámetros de SLA para Inspecciones
('sla_days_inspeccion', '5', 'number', 'inspecciones', 'Días SLA Inspecciones', 'Número de días máximo permitido para que una inspección permanezca abierta antes de enviar recordatorio', true),

-- Parámetros de notificaciones
('notification_reminder_enabled', 'true', 'boolean', 'notificaciones', 'Recordatorios Activos', 'Habilitar/deshabilitar el envío automático de recordatorios por SLA vencido', true),
('notification_reminder_hour', '8', 'number', 'notificaciones', 'Hora de Recordatorio', 'Hora del día (0-23) en que se envían los recordatorios automáticos', true),

-- Parámetros de correo
('email_mode', 'test', 'string', 'notificaciones', 'Modo de Email', 'Modo de envío de correos: test (solo a emails de prueba) o production (a destinatarios reales)', true),
('email_test_recipients', 'paola.gil@kapasas.com,jorge@blasterinformation.com,ludwig.angarita@lars.net.co', 'string', 'notificaciones', 'Emails de Prueba', 'Lista de emails separados por coma que reciben correos en modo test', true),

-- Parámetros generales
('app_name', 'KAPA', 'string', 'general', 'Nombre de la Aplicación', 'Nombre que aparece en correos y encabezados', false),
('frontend_url', 'https://kapa.healtheworld.com.co', 'string', 'general', 'URL Frontend', 'URL base del frontend para links en correos', true),

-- Parámetros de reportes
('report_excel_max_rows', '10000', 'number', 'reportes', 'Máx. Filas Excel', 'Número máximo de filas al exportar a Excel', true),
('report_default_date_range_days', '30', 'number', 'reportes', 'Rango de Fechas por Defecto', 'Días de rango de fechas por defecto en reportes', true)

ON CONFLICT (key) DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_system_parameter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_system_parameter_timestamp ON system_parameter;
CREATE TRIGGER trigger_update_system_parameter_timestamp
    BEFORE UPDATE ON system_parameter
    FOR EACH ROW
    EXECUTE FUNCTION update_system_parameter_timestamp();
