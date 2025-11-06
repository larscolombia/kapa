-- Migración ILB Module
-- Fecha: 2025-11-03

BEGIN;

-- Tabla principal de reportes
CREATE TABLE IF NOT EXISTS ilv_report (
  report_id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('hazard_id', 'wit', 'swa', 'fdkar')),
  estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  centro_id INTEGER,
  proyecto_id INTEGER REFERENCES project(project_id),
  cliente_id INTEGER REFERENCES client(client_id),
  empresa_id INTEGER REFERENCES contractor(contractor_id),
  creado_por INTEGER NOT NULL REFERENCES "user"(user_id),
  propietario_user_id INTEGER REFERENCES "user"(user_id),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  fecha_cierre TIMESTAMP,
  cerrado_por INTEGER REFERENCES "user"(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ilv_tipo ON ilv_report(tipo);
CREATE INDEX IF NOT EXISTS idx_ilv_estado ON ilv_report(estado);
CREATE INDEX IF NOT EXISTS idx_ilv_proyecto ON ilv_report(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_ilv_creado_en ON ilv_report(creado_en);

-- Campos dinámicos
CREATE TABLE IF NOT EXISTS ilv_report_field (
  field_id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES ilv_report(report_id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  value_type VARCHAR(50) DEFAULT 'string',
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_report ON ilv_report_field(report_id);

-- Adjuntos
CREATE TABLE IF NOT EXISTS ilv_attachment (
  attachment_id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES ilv_report(report_id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  file_hash VARCHAR(64),
  created_by INTEGER NOT NULL REFERENCES "user"(user_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens de cierre
CREATE TABLE IF NOT EXISTS ilv_close_token (
  token_id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES ilv_report(report_id) ON DELETE CASCADE,
  empresa_id INTEGER,
  jwt_id VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  used_ip VARCHAR(45),
  used_user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_jwt ON ilv_close_token(jwt_id);

-- Maestros
CREATE TABLE IF NOT EXISTS ilv_maestro (
  maestro_id SERIAL PRIMARY KEY,
  tipo VARCHAR(100) NOT NULL,
  clave VARCHAR(100) NOT NULL,
  valor VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  aplica_a_tipo VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tipo, clave)
);

CREATE INDEX IF NOT EXISTS idx_maestro_tipo ON ilv_maestro(tipo) WHERE activo = TRUE;

-- Auditoría
CREATE TABLE IF NOT EXISTS ilv_audit (
  audit_id SERIAL PRIMARY KEY,
  entidad VARCHAR(50) NOT NULL,
  entidad_id INTEGER NOT NULL,
  accion VARCHAR(50) NOT NULL,
  actor_id INTEGER REFERENCES "user"(user_id),
  diff_json JSONB,
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entidad ON ilv_audit(entidad, entidad_id);

-- Log de emails
CREATE TABLE IF NOT EXISTS ilv_email_log (
  log_id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES ilv_report(report_id) ON DELETE SET NULL,
  to_addr VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  payload TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

-- Maestros iniciales
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden) VALUES
('severidad', 'baja', 'Baja', TRUE, 1),
('severidad', 'media', 'Media', TRUE, 2),
('severidad', 'alta', 'Alta', TRUE, 3),
('severidad', 'critica', 'Crítica', TRUE, 4),
('area', 'administrativa', 'Administrativa', TRUE, 1),
('area', 'operativa', 'Operativa', TRUE, 2),
('causa', 'condicion_insegura', 'Condición Insegura', TRUE, 1),
('causa', 'acto_inseguro', 'Acto Inseguro', TRUE, 2),
('riesgo', 'caida_altura', 'Caída en Altura', TRUE, 1),
('riesgo', 'golpeado_por', 'Golpeado Por', TRUE, 2),
('motivo_swa', 'condicion_peligrosa', 'Condición Peligrosa', TRUE, 1),
('motivo_swa', 'falta_epp', 'Falta de EPP', TRUE, 2),
('clasificacion_fdkar', 'hse', 'HSE', TRUE, 1),
('clasificacion_fdkar', 'calidad', 'Calidad', TRUE, 2)
ON CONFLICT (tipo, clave) DO NOTHING;

-- Permisos
INSERT INTO access (module_name, can_view, can_edit, role_id) VALUES
('ilv_management', TRUE, TRUE, 1),
('ilv_management', TRUE, TRUE, 2),
('ilv_management', TRUE, TRUE, 3),
('ilv_management', TRUE, FALSE, 4),
('ilv_management', TRUE, FALSE, 5)
ON CONFLICT DO NOTHING;

COMMIT;
