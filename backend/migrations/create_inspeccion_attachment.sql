-- Migración: Crear tabla de adjuntos para inspecciones
-- Fecha: 2025-12-03

-- Crear tabla de adjuntos para inspecciones
CREATE TABLE IF NOT EXISTS inspeccion_attachment (
    attachment_id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES inspeccion_report(report_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_hash VARCHAR(64),
    created_by INTEGER NOT NULL REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_inspeccion_attachment_report ON inspeccion_attachment(report_id);
CREATE INDEX IF NOT EXISTS idx_inspeccion_attachment_created_by ON inspeccion_attachment(created_by);
CREATE INDEX IF NOT EXISTS idx_inspeccion_attachment_hash ON inspeccion_attachment(file_hash);

-- Comentarios
COMMENT ON TABLE inspeccion_attachment IS 'Adjuntos de los reportes de inspección (imágenes, PDFs)';
COMMENT ON COLUMN inspeccion_attachment.s3_key IS 'Clave del archivo en S3';
COMMENT ON COLUMN inspeccion_attachment.file_hash IS 'Hash SHA256 para evitar duplicados';
