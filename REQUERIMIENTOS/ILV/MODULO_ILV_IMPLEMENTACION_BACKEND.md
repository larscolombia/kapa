# 🎯 MÓDULO ILV - Implementación Backend Completa

**Fecha:** 4 de Noviembre, 2025  
**Estado:** ✅ BACKEND COMPLETO - FUNCIONANDO  
**Versión:** 1.0.0

---

## ✅ Resumen de Implementación

El módulo ILV (Identificación de Peligros, WIT, SWA, FDKAR) ha sido **completamente implementado en el backend** con todas las funcionalidades especificadas.

### Componentes Implementados:

#### 1. **Base de Datos** ✅
- 7 tablas creadas con índices optimizados
- Relaciones configuradas correctamente
- 39 maestros de catálogo seeded
- Permisos configurados para 5 roles

#### 2. **Entidades TypeORM** ✅
```
✅ ilv-report.entity.ts
✅ ilv-report-field.entity.ts  (campos dinámicos KV)
✅ ilv-attachment.entity.ts
✅ ilv-close-token.entity.ts
✅ ilv-maestro.entity.ts
✅ ilv-audit.entity.ts
✅ ilv-email-log.entity.ts
```

#### 3. **DTOs (Validación)** ✅
```
✅ create-ilv-report.dto.ts     (con IlbReportType enum)
✅ update-ilv-report.dto.ts
✅ close-ilv-report.dto.ts
✅ filter-ilv-report.dto.ts     (filtros combinables)
✅ create-maestro.dto.ts
```

#### 4. **Servicios** ✅
```
✅ ilv-reports.service.ts       (CRUD completo + visibilidad por rol)
✅ ilv-maestros.service.ts      (gestión catálogos)
✅ ilv-auth.service.ts          (tokens JWT de cierre)
✅ ilv-notifications.service.ts (emails con plantillas)
✅ ilv-stats.service.ts         (estadísticas y agregaciones)
```

#### 5. **Controladores** ✅
```
✅ ilv-reports.controller.ts    (4 endpoints)
✅ ilv-close.controller.ts      (cierre vía token sin auth)
✅ ilv-maestros.controller.ts   (CRUD maestros)
✅ ilv-stats.controller.ts      (estadísticas)
```

#### 6. **Guards y Utilidades** ✅
```
✅ ilv-ownership.guard.ts       (valida propietario)
✅ ilv-visibility.guard.ts      (filtra por rol/universo)
✅ ilv-token.guard.ts           (valida token cierre)
✅ field-mapper.util.ts         (configuración campos por tipo)
✅ validators.util.ts           (validaciones de negocio)
```

#### 7. **Módulo Principal** ✅
```
✅ ilv.module.ts                (integrado en app.module.ts)
```

---

## 📊 Endpoints API Disponibles

### Reportes
```
POST   /api/ilv/reports          - Crear reporte (Admin/Usuario KAPA/Cliente)
GET    /api/ilv/reports          - Lista con filtros (scoped por rol)
GET    /api/ilv/reports/:id      - Detalle de reporte
PUT    /api/ilv/reports/:id      - Editar (solo propietario + abierto)
```

### Cierre vía Token (Sin autenticación)
```
POST   /api/ilv/close            - Cerrar reporte con token JWT
```

### Maestros (Admin)
```
GET    /api/ilv/maestros/:tipo   - Obtener maestros por tipo
POST   /api/ilv/maestros         - Crear nuevo maestro
PUT    /api/ilv/maestros/:id     - Actualizar maestro
DELETE /api/ilv/maestros/:id     - Eliminar maestro
```

### Estadísticas
```
GET    /api/ilv/stats/summary    - Resumen general
GET    /api/ilv/stats/by-project - Por proyecto
GET    /api/ilv/stats/trend      - Serie temporal
```

---

## 🗄️ Tablas Creadas

### 1. `ilv_report`
**Propósito:** Tabla principal de reportes ILV  
**Registros:** 0 (listo para uso)  
**Índices:** tipo, estado, proyecto_id, creado_en  

**Campos clave:**
- `tipo`: 'hazard_id' | 'wit' | 'swa' | 'fdkar'
- `estado`: 'abierto' | 'cerrado'
- `propietario_user_id`: Dueño del reporte
- `empresa_id`: Contratista responsable
- `fecha_cierre`, `cerrado_por`

### 2. `ilv_report_field`
**Propósito:** Campos dinámicos key-value  
**Ventaja:** Permite campos personalizados por tipo sin alterar schema  

**Estructura:**
```sql
report_id → ilv_report
key       → nombre del campo (ej: 'ubicacion', 'severidad')
value     → valor del campo
value_type→ 'string' | 'number' | 'date' | 'maestro'
source    → 'manual' | 'maestro'
```

### 3. `ilv_attachment`
**Propósito:** Adjuntos S3  
**Campos:** filename, s3_key, mime_type, size_bytes, file_hash  

### 4. `ilv_close_token`
**Propósito:** Tokens seguros para cierre vía email  
**TTL:** 72 horas configurables  
**Campos:** jwt_id (unique), expires_at, used_at, used_ip, used_user_agent  

### 5. `ilv_maestro`
**Propósito:** Catálogos administrables  
**Registros:** 39 maestros iniciales  

**Tipos seeded:**
- `severidad`: Baja, Media, Alta, Crítica (4)
- `area`: 5 áreas
- `causa`: 6 causas probables
- `riesgo`: 8 riesgos WIT
- `motivo_swa`: 6 motivos
- `clasificacion_fdkar`: 5 clasificaciones
- `tipo_evidencia`: 5 tipos

### 6. `ilv_audit`
**Propósito:** Auditoría completa de mutaciones  
**Campos:** entidad, entidad_id, accion, actor_id, diff_json (JSONB), ip, user_agent  

### 7. `ilv_email_log`
**Propósito:** Trazabilidad de emails enviados  
**Campos:** to_addr, subject, payload, status, error_message, sent_at  

---

## 🔐 Permisos Configurados

| Rol              | can_view | can_edit | Alcance                              |
|------------------|----------|----------|--------------------------------------|
| Admin KAPA       | ✅        | ✅        | Todos los reportes de clientes       |
| Usuario KAPA     | ✅        | ✅        | Todos los reportes de clientes       |
| Cliente          | ✅        | ✅        | Solo reportes de SU cliente          |
| Contratista      | ✅        | ❌        | Solo reportes donde participan       |
| Subcontratista   | ✅        | ❌        | Solo reportes donde participan       |

**Regla especial:** Solo el **propietario** puede editar reportes **abiertos**.

---

## 🔄 Flujos Implementados

### Flujo 1: Crear Reporte
```
1. POST /api/ilv/reports
   Headers: { Authorization: Bearer JWT }
   Body: { tipo, proyecto_id, cliente_id, empresa_id, fields: [{key, value}] }

2. Validaciones:
   ✅ Usuario autorizado (Admin/Usuario/Cliente)
   ✅ Proyecto en universe del usuario
   ✅ Campos requeridos según tipo presentes
   ✅ Valores de maestros válidos

3. Acciones:
   ✅ Crear registro ilv_report
   ✅ Guardar fields dinámicos
   ✅ Generar token cierre (JWT 72h)
   ✅ Guardar token en ilv_close_token
   ✅ Enviar email a empresa_id con link
   ✅ Auditar: accion='create'

4. Response:
   { report_id, tipo, estado: 'abierto', token_link, ... }
```

### Flujo 2: Editar Reporte
```
1. PUT /api/ilv/reports/:id
   Guard: IlbOwnershipGuard

2. Validaciones:
   ✅ user_id === report.propietario_user_id
   ✅ report.estado === 'abierto'

3. Acciones:
   ✅ Calcular diff antes/después
   ✅ Actualizar report + fields
   ✅ Auditar: accion='update', diff_json={ before, after }

4. Response:
   { report con fields actualizados }
```

### Flujo 3: Cierre vía Token
```
1. POST /api/ilv/close?token=JWT_TOKEN
   Sin autenticación (público)

2. Validaciones (IlbTokenGuard):
   ✅ JWT válido y firmado con ILV_TOKEN_SECRET
   ✅ exp > now
   ✅ jwt_id existe en ilv_close_token
   ✅ token.used_at IS NULL
   ✅ report.estado === 'abierto'

3. Acciones:
   ✅ Validar campos de cierre (plan_accion required)
   ✅ FDKAR requiere evidencia_cierre + fecha_implantacion
   ✅ Guardar fields de cierre
   ✅ report.estado → 'cerrado'
   ✅ report.fecha_cierre → NOW()
   ✅ token.used_at → NOW(), grabar IP + UA
   ✅ Auditar: accion='close', actor_id=NULL
   ✅ Email confirmación a creador

4. Response:
   { message: 'Reporte cerrado exitosamente', report_id }
```

### Flujo 4: Consulta con Filtros
```
1. GET /api/ilv/reports?tipo=hazard_id&estado=abierto&proyecto_id=5&fecha_desde=2025-11-01

2. Aplicar visibilidad:
   - Admin/Usuario KAPA: WHERE cliente_id IN (user.clientes)
   - Cliente: WHERE cliente_id = user.cliente_id
   - Contratista: WHERE proyecto_id IN (user.proyectos) AND empresa_id = user.empresa_id

3. Filtros dinámicos:
   ✅ tipo, estado, proyecto_id, cliente_id, empresa_id
   ✅ creado_desde, creado_hasta
   ✅ campos custom: ?field:ubicacion=Area%20A

4. Response:
   {
     data: [ reports with fields expanded ],
     total: 150,
     page: 1,
     limit: 50
   }
```

---

## 📝 Configuración de Campos por Tipo

### Hazard ID
```typescript
required: ['ubicacion', 'descripcion_condicion', 'severidad', 'area', 'fecha_evento']
optional: ['foto', 'causa_probable', 'accion_inmediata']
maestros: { severidad, area, causa_probable }
validations: { fecha_evento: <= today }
```

### WIT (Walk & Talk)
```typescript
required: ['conducta_observada', 'riesgo_asociado', 'recomendacion', 'responsable']
optional: ['testigo', 'adjuntos']
maestros: { riesgo_asociado }
```

### SWA (Stop Work Authority)
```typescript
required: ['hora_inicio_parada', 'hora_reinicio', 'motivo', 'area', 'responsable']
maestros: { motivo, area }
validations: { hora_reinicio >= hora_inicio_parada }
```

### FDKAR
```typescript
required: ['quien_reporta', 'clasificacion', 'descripcion', 'plan_accion_propuesto']
maestros: { clasificacion }
close_required: ['evidencia_cierre', 'fecha_implantacion']
```

---

## 🔑 Variables de Entorno Requeridas

Agregar a `.env`:

```bash
# JWT para tokens de cierre ILV
ILV_TOKEN_SECRET=tu_secret_diferente_al_jwt_principal_2025

# TTL de tokens de cierre (en segundos)
ILV_TOKEN_TTL=259200  # 72 horas

# URL base para enlaces de cierre
ILV_BASE_URL=https://kapa.healtheworld.com.co

# SMTP para emails (si aún no existe)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@kapa.com
SMTP_PASS=tu_password_smtp
SMTP_FROM="KAPA Sistema ILV <notificaciones@kapa.com>"
```

---

## 🧪 Testing Manual

### 1. Verificar endpoints:
```bash
curl -X GET http://localhost:3001/api/ilv/maestros/severidad \
  -H "Authorization: Bearer YOUR_JWT"

# Response esperado:
[
  { "maestro_id": 1, "tipo": "severidad", "clave": "baja", "valor": "Baja", ... },
  ...
]
```

### 2. Crear reporte Hazard ID:
```bash
curl -X POST http://localhost:3001/api/ilv/reports \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "hazard_id",
    "proyecto_id": 1,
    "cliente_id": 1,
    "empresa_id": 2,
    "fields": [
      { "key": "ubicacion", "value": "Area de construcción" },
      { "key": "severidad", "value": "alta" },
      { "key": "descripcion_condicion", "value": "Cable expuesto" }
    ]
  }'
```

### 3. Verificar token generado:
```sql
SELECT * FROM ilv_close_token ORDER BY created_at DESC LIMIT 1;
```

### 4. Simular cierre vía token:
```bash
curl -X POST "http://localhost:3001/api/ilv/close?token=JWT_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_accion": "Se cubrió el cable y se señalizó el área",
    "evidencia_cierre": "foto_evidencia.jpg"
  }'
```

---

## 📊 Estado de Compilación

```bash
✅ npm run build         - Sin errores
✅ PM2 restart           - OK
✅ Entidades cargadas    - 7/7
✅ Endpoints registrados - 11/11
✅ Maestros seeded       - 39 registros
✅ Permisos creados      - 5 roles
```

---

## ⏭️ Siguiente Fase: Frontend

Con el backend completamente funcional, la siguiente fase es implementar el frontend:

```
📋 PENDIENTE - Frontend Vue/Quasar:
- [ ] ILVDashboard.vue       (widgets de resumen)
- [ ] ILVReportForm.vue      (formularios dinámicos por tipo)
- [ ] ILVReportDetail.vue    (ver + editar si owner)
- [ ] ILVReportsList.vue     (tabla con filtros)
- [ ] ILVStatsPage.vue       (gráficas y estadísticas)
- [ ] ILVMaestrosAdmin.vue   (CRUD maestros)
- [ ] ILVClosePublic.vue     (formulario público sin login)
- [ ] ilvService.js          (llamadas API)
- [ ] Configuraciones de campos dinámicos
- [ ] Validaciones frontend
- [ ] Rutas y menú
```

---

## 🚀 Comandos Útiles

```bash
# Reiniciar backend
pm2 restart kapa-backend

# Ver logs
pm2 logs kapa-backend --lines 50

# Verificar tablas
psql -U admin -d kapa_db -c "\dt ilv_*"

# Contar maestros
psql -U admin -d kapa_db -c "SELECT tipo, COUNT(*) FROM ilv_maestro GROUP BY tipo;"

# Ver reportes
psql -U admin -d kapa_db -c "SELECT * FROM ilv_report;"
```

---

**✅ BACKEND 100% FUNCIONAL - LISTO PARA FRONTEND**

