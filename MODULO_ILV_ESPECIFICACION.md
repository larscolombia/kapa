# 📊 MÓDULO ILV - Especificación Técnica Completa

## 🎯 Resumen Ejecutivo

Sistema completo de gestión de reportes ILV (Identificación de Peligros, WIT/Walk & Talk, SWA/Stop Work Authority, FDKAR) con:
- 4 tipos de reportes con campos dinámicos
- Control de acceso granular por rol (Admin KAPA, Usuario KAPA, Cliente, Contratista, Subcontratista)
- Cierre seguro vía tokens JWT con TTL
- Maestros administrables (catálogos)
- Filtros "infinitos" combinables
- Estadísticas y exportación Excel/PDF
- Auditoría completa
- Notificaciones email con enlaces firmados

---

## 📐 Arquitectura del Sistema

### Componentes Principales:

```
backend/src/modules/ilv/
├── entities/            (ya creadas en database/entities)
├── dto/                (validación de datos)
├── services/
│   ├── ilv-reports.service.ts      (CRUD reportes)
│   ├── ilv-maestros.service.ts     (Gestión maestros)
│   ├── ilv-auth.service.ts         (Tokens y permisos)
│   ├── ilv-notifications.service.ts (Emails)
│   └── ilv-stats.service.ts        (Estadísticas)
├── controllers/
│   ├── ilv-reports.controller.ts
│   ├── ilv-maestros.controller.ts
│   ├── ilv-close.controller.ts     (Cierre vía token)
│   └── ilv-stats.controller.ts
├── guards/
│   ├── ilv-ownership.guard.ts      (Valida propietario)
│   ├── ilv-visibility.guard.ts     (Valida visibilidad)
│   └── ilv-token.guard.ts          (Valida token cierre)
├── utils/
│   ├── field-mapper.util.ts        (Mapeo campos por tipo)
│   └── validators.util.ts          (Validaciones negocio)
└── ilv.module.ts

frontend/src/
├── pages/
│   ├── ILVDashboard.vue
│   ├── ILVReportForm.vue
│   ├── ILVReportDetail.vue
│   ├── ILVReportsList.vue
│   ├── ILVStats.vue
│   ├── ILVMaestrosAdmin.vue
│   └── ILVClosePublic.vue       (Sin login, con token)
├── components/ilv/
│   ├── FormHazardID.vue
│   ├── FormWIT.vue
│   ├── FormSWA.vue
│   ├── FormFDKAR.vue
│   ├── FilterPanel.vue
│   └── StatsWidgets.vue
└── services/
    └── ilvService.js
```

---

## 🗄️ Modelo de Datos (SQL)

Ya tenemos las entidades TypeORM creadas. Aquí el SQL equivalente:

```sql
-- Tabla principal de reportes
CREATE TABLE ilv_report (
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

CREATE INDEX idx_ilv_tipo ON ilv_report(tipo);
CREATE INDEX idx_ilv_estado ON ilv_report(estado);
CREATE INDEX idx_ilv_proyecto ON ilv_report(proyecto_id);
CREATE INDEX idx_ilv_creado_en ON ilv_report(creado_en);

-- Campos dinámicos (KV store)
CREATE TABLE ilv_report_field (
  field_id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES ilv_report(report_id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  value_type VARCHAR(50) DEFAULT 'string',
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_field_report ON ilv_report_field(report_id);
CREATE INDEX idx_field_key ON ilv_report_field(key);

-- Adjuntos
CREATE TABLE ilv_attachment (
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
CREATE TABLE ilv_close_token (
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

CREATE INDEX idx_token_jwt ON ilv_close_token(jwt_id);
CREATE INDEX idx_token_exp ON ilv_close_token(expires_at) WHERE used_at IS NULL;

-- Maestros
CREATE TABLE ilv_maestro (
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

CREATE INDEX idx_maestro_tipo ON ilv_maestro(tipo) WHERE activo = TRUE;

-- Auditoría
CREATE TABLE ilv_audit (
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

CREATE INDEX idx_audit_entidad ON ilv_audit(entidad, entidad_id);

-- Log de emails
CREATE TABLE ilv_email_log (
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

CREATE INDEX idx_email_status ON ilv_email_log(status) WHERE status = 'pending';
```

---

## 🔐 Matriz de Permisos Detallada

### Nuevo permiso en tabla `access`:

```sql
INSERT INTO access (module_name, can_view, can_edit, role_id) VALUES
('ilv_management', TRUE, TRUE, 1),  -- Admin KAPA: full access
('ilv_management', TRUE, TRUE, 2),  -- Usuario KAPA: full access
('ilv_management', TRUE, TRUE, 3),  -- Cliente: crear/ver sus reportes
('ilv_management', TRUE, FALSE, 4), -- Contratista: solo ver los suyos
('ilv_management', TRUE, FALSE, 5); -- Subcontratista: solo ver los suyos
```

### Lógica de Visibilidad (pseudocódigo):

```typescript
function canViewReport(user, report): boolean {
  if (user.role === 'admin_kapa' || user.role === 'usuario_kapa') {
    // Ven todos los reportes de clientes asociados
    return user.clientes.includes(report.cliente_id);
  }
  
  if (user.role === 'cliente') {
    // Solo reportes de SU cliente
    return user.cliente_id === report.cliente_id;
  }
  
  if (user.role === 'contratista' || user.role === 'subcontratista') {
    // Solo reportes donde participan en el proyecto
    return user.proyectos.includes(report.proyecto_id) 
      && report.empresa_id === user.empresa_id;
  }
  
  return false;
}

function canEditReport(user, report): boolean {
  // Solo creador y reporte abierto
  return report.propietario_user_id === user.user_id 
    && report.estado === 'abierto';
}

function canCloseReport(user, report): boolean {
  // Creador o empresa responsable (vía token)
  return report.propietario_user_id === user.user_id 
    || report.empresa_id === user.empresa_id;
}
```

---

## 📝 Mapeo de Campos Dinámicos por Tipo

### Hazard ID:
```typescript
{
  required: ['ubicacion', 'descripcion_condicion', 'severidad', 'area', 'fecha_evento'],
  optional: ['foto', 'causa_probable', 'accion_inmediata'],
  maestros: {
    severidad: 'ilv_maestro.tipo=severidad',
    area: 'ilv_maestro.tipo=area',
    causa_probable: 'ilv_maestro.tipo=causa'
  },
  validations: {
    fecha_evento: 'date <= today'
  }
}
```

### WIT (Walk & Talk):
```typescript
{
  required: ['conducta_observada', 'riesgo_asociado', 'recomendacion', 'responsable'],
  optional: ['testigo', 'adjuntos'],
  maestros: {
    riesgo_asociado: 'ilv_maestro.tipo=riesgo'
  }
}
```

### SWA (Stop Work Authority):
```typescript
{
  required: ['hora_inicio_parada', 'hora_reinicio', 'motivo', 'area', 'responsable'],
  optional: [],
  maestros: {
    motivo: 'ilv_maestro.tipo=motivo_swa',
    area: 'ilv_maestro.tipo=area'
  },
  validations: {
    hora_reinicio: 'time >= hora_inicio_parada'
  }
}
```

### FDKAR:
```typescript
{
  required: ['quien_reporta', 'clasificacion', 'descripcion', 'plan_accion_propuesto'],
  optional: [],
  maestros: {
    clasificacion: 'ilv_maestro.tipo=clasificacion_fdkar'
  },
  close_required: ['evidencia_cierre', 'fecha_implantacion']
}
```

---

## 🔄 Flujos de Proceso

### Flujo 1: Creación de Reporte

```
1. Usuario autorizado → POST /api/ilv/reports
2. Validar rol (Admin/Usuario KAPA/Cliente)
3. Validar que proyecto esté en proyectos asociados al usuario
4. Validar campos requeridos según tipo
5. Crear reporte (estado: abierto)
6. Generar token de cierre (TTL 72h)
7. Auditar: crear
8. Enviar email a empresa_id con enlace: 
   https://kapa.com/ilv/close?rid=123&t=JWT
9. Return report_id
```

### Flujo 2: Edición (solo propietario + abierto)

```
1. Usuario → PUT /api/ilv/reports/:id
2. Verificar propietario_user_id === user_id
3. Verificar estado === 'abierto'
4. Diff antes/después
5. Auditar: update con diff_json
6. Return updated report
```

### Flujo 3: Cierre vía Token

```
1. Contratista → GET /ilv/close?rid=123&t=JWT
2. Validar JWT:
   - Firma válida
   - exp > now
   - jwt_id no usado
   - report_id === payload.rid
3. Mostrar form cierre (sin login)
4. POST con plan_accion + evidencia
5. Guardar, estado → 'cerrado'
6. Marcar token.used_at, grabar IP/UA
7. Auditar: close
8. Email confirmación a creador
9. Redirect a página "Cierre exitoso"
```

### Flujo 4: Consulta/Filtrado

```
1. Usuario → GET /api/ilv/reports?filters
2. Aplicar visibilidad según rol
3. WHERE dinámica: cliente_id, proyecto_id, tipo, estado, fechas, campos custom
4. Paginación (default 50)
5. Return { data, total, page }
```

---

## �� Generación de Tokens de Cierre

```typescript
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

async function generateCloseToken(reportId: number, empresaId: number) {
  const jwtId = uuidv4();
  const expiresIn = 72 * 3600; // 72 horas
  
  const payload = {
    jti: jwtId,
    rid: reportId,
    eid: empresaId,
    scope: 'close_ilv',
    iat: Math.floor(Date.now() / 1000),
  };
  
  const token = jwt.sign(payload, process.env.ILV_TOKEN_SECRET, {
    expiresIn,
  });
  
  // Guardar en DB
  await ilvCloseTokenRepo.save({
    report_id: reportId,
    empresa_id: empresaId,
    jwt_id: jwtId,
    expires_at: new Date(Date.now() + expiresIn * 1000),
  });
  
  return token;
}
```

---

## 📧 Plantillas de Email

### Email Creación (para Contratista):

```html
<h2>Nuevo Reporte ILV #{{report_id}} - {{tipo}}</h2>
<p><strong>Proyecto:</strong> {{proyecto.nombre}}</p>
<p><strong>Creado por:</strong> {{creador.nombre}}</p>
<p><strong>Fecha:</strong> {{creado_en}}</p>

<h3>Resumen:</h3>
<ul>
  {{#each fields}}
    <li><strong>{{key}}:</strong> {{value}}</li>
  {{/each}}
</ul>

<p>Para cargar el cierre y plan de acción, haga clic en el siguiente enlace (válido por 72 horas):</p>
<a href="{{close_link}}">Cargar Cierre del Reporte #{{report_id}}</a>

<p style="color: red;">Este enlace expira el {{token_expires_at}}</p>
```

### Email Cierre (para Creador):

```html
<h2>Reporte ILV #{{report_id}} CERRADO</h2>
<p>El reporte ha sido cerrado exitosamente.</p>
<p><strong>Cerrado por:</strong> {{cerrado_por}}</p>
<p><strong>Fecha de cierre:</strong> {{fecha_cierre}}</p>

<h3>Plan de Acción:</h3>
<p>{{plan_accion}}</p>

<p><a href="{{report_detail_link}}">Ver Detalle Completo</a></p>
```

---

## 📊 Endpoints API Completos

```typescript
// Reportes
GET    /api/ilv/reports                    // Lista con filtros
POST   /api/ilv/reports                    // Crear
GET    /api/ilv/reports/:id                // Detalle
PUT    /api/ilv/reports/:id                // Editar (propietario + abierto)
DELETE /api/ilv/reports/:id                // Soft delete (solo admin)

// Adjuntos
POST   /api/ilv/reports/:id/attachments    // Upload
DELETE /api/ilv/reports/:id/attachments/:aid

// Cierre vía token (sin auth)
GET    /ilv/close                          // Mostrar form (valida token)
POST   /ilv/close                          // Procesar cierre

// Maestros (solo admin)
GET    /api/ilv/maestros/:tipo             // Ej: /api/ilv/maestros/severidad
POST   /api/ilv/maestros/:tipo
PUT    /api/ilv/maestros/:tipo/:id
DELETE /api/ilv/maestros/:tipo/:id

// Estadísticas
GET    /api/ilv/stats/summary              // Conteos por tipo/estado
GET    /api/ilv/stats/by-project           // Agregado por proyecto
GET    /api/ilv/stats/trend                // Serie temporal

// Exportación
GET    /api/ilv/reports/export/excel       // Con filtros aplicados
GET    /api/ilv/reports/export/pdf

// Auditoría
GET    /api/ilv/audit/:report_id
```

---

## ✅ Validaciones Críticas

### Crear Reporte:
```typescript
- rol in [admin_kapa, usuario_kapa, cliente]
- proyecto_id in user.proyectos_asociados
- campos requeridos según tipo presentes
- valores maestro válidos y activos
- adjuntos: ext permitida, size < MAX_SIZE
```

### Editar Reporte:
```typescript
- propietario_user_id === user.user_id
- estado === 'abierto'
- proyecto_id no cambia (o validar nueva asociación)
```

### Cierre vía Token:
```typescript
- JWT válido y firmado
- exp > now
- jwt_id not used
- report.estado === 'abierto'
- plan_accion required
- evidencia_cierre si tipo lo requiere (FDKAR)
```

### Maestros:
```typescript
- No inactivar si está en uso (check ilv_report_field.value)
- Clave única por tipo
```

---

## 🧪 Plan de Testing

### Test Unitario (Jest):
```typescript
- FieldMapper.getRequiredFields('hazard_id')
- TokenService.verify(validToken)
- VisibilityGuard.canAccess(userContratista, reportOtroContratista) // false
```

### Test Integración:
```typescript
- POST /api/ilv/reports (201, crear + token generado)
- PUT /api/ilv/reports/:id (403 si no propietario)
- POST /ilv/close (200, estado → cerrado, token marcado usado)
- GET /api/ilv/reports?proyecto_id=1 (solo visibles al usuario)
```

### Test E2E (Cypress):
```typescript
- Login como Cliente → crear Hazard ID → validar email enviado
- Abrir enlace cierre → subir evidencia → validar estado cerrado
- Login como Contratista → ver solo SUS reportes
- Intentar editar reporte ajeno → 403
```

---

## 📦 Migración Incremental

### Fase 1 (MVP):
```
✅ Entidades creadas
✅ CRUD básico reportes
✅ Campos dinámicos por tipo
✅ Tokens de cierre
✅ Email notificaciones
```

### Fase 2:
```
- Maestros admin
- Adjuntos S3
- Filtros avanzados
- Visibilidad por rol
```

### Fase 3:
```
- Estadísticas
- Exportación Excel/PDF
- Auditoría completa
```

### Fase 4:
```
- i18n
- Optimizaciones (indices, cache)
- Jobs async para exports grandes
```

---

## 🚀 Siguiente Acción Inmediata

Dado el tamaño del módulo, **¿prefieres que implemente primero:**

**Opción A:** MVP funcional (crear reporte → cierre vía token → email)?
**Opción B:** Estructura completa paso a paso con todos los componentes?
**Opción C:** Solo backend completo primero, frontend después?

---

**Fecha:** 3 de Noviembre, 2025  
**Versión:** 1.0.0  
**Estado:** 📋 DISEÑO COMPLETO - LISTO PARA IMPLEMENTAR

