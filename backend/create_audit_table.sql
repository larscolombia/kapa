-- Tabla de auditoría de cambios de estado de documentos
CREATE TABLE IF NOT EXISTS document_state_audit (
    audit_id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    previous_state VARCHAR(50) NOT NULL,
    new_state VARCHAR(50) NOT NULL,
    comments TEXT,
    changed_by_user_id INTEGER,
    changed_by_email VARCHAR(100),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_in_previous_state_hours INTEGER DEFAULT 0,
    FOREIGN KEY (document_id) REFERENCES document(document_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES "user"(user_id) ON DELETE SET NULL
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_audit_document ON document_state_audit(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON document_state_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_new_state ON document_state_audit(new_state);

-- Comentarios de la tabla
COMMENT ON TABLE document_state_audit IS 'Auditoría de cambios de estado de documentos para tracking de tiempos de revisión';
COMMENT ON COLUMN document_state_audit.time_in_previous_state_hours IS 'Tiempo que el documento estuvo en el estado anterior (en horas)';
