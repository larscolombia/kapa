# Módulo de Inspecciones - Plan de Ejecución

## 📋 Resumen del Plan

Este documento detalla el plan de implementación paso a paso para el módulo de Inspecciones, siguiendo la arquitectura establecida en el módulo ILV existente.

**Duración estimada total:** 3-4 días de desarrollo
**Referencia de arquitectura:** Módulo ILV

---

## ✅ PROGRESO DE IMPLEMENTACIÓN

### Estado Actual: FASE 1 y 2 COMPLETADAS, FASE 3 EN PROGRESO

| Fase | Estado | Completado |
|------|--------|------------|
| Fase 1: Base de Datos y Entidades | ✅ COMPLETADA | 100% |
| Fase 2: Backend - Servicios y Controladores | ✅ COMPLETADA | 100% |
| Fase 3: Frontend - Componentes y Vistas | ✅ COMPLETADA | 100% |
| Fase 4: Integración y Pruebas | ⏳ Pendiente | 0% |
| Fase 5: Tests E2E con Playwright | ⏳ Pendiente | 0% |

### Archivos Creados:

**Backend:**
- ✅ `backend/src/database/entities/inspeccion-report.entity.ts`
- ✅ `backend/src/database/entities/inspeccion-report-field.entity.ts`
- ✅ `backend/src/database/entities/inspeccion-maestro.entity.ts`
- ✅ `backend/src/modules/inspecciones/dto/create-inspeccion-report.dto.ts`
- ✅ `backend/src/modules/inspecciones/dto/update-inspeccion-report.dto.ts`
- ✅ `backend/src/modules/inspecciones/dto/filter-inspeccion.dto.ts`
- ✅ `backend/src/modules/inspecciones/dto/index.ts`
- ✅ `backend/src/modules/inspecciones/services/inspecciones-reports.service.ts`
- ✅ `backend/src/modules/inspecciones/controllers/inspecciones.controller.ts`
- ✅ `backend/src/modules/inspecciones/inspecciones.module.ts`
- ✅ Registrado en `app.module.ts`

**Base de Datos:**
- ✅ Tabla `inspeccion_maestro` con 39 registros maestros
- ✅ Tabla `inspeccion_report` con columnas actualizadas
- ✅ Tabla `inspeccion_report_field` para campos dinámicos

**Frontend:**
- ✅ `frontend/src/services/inspeccionesService.js`
- ✅ `frontend/src/pages/InspeccionesReportsList.vue`
- ✅ `frontend/src/pages/InspeccionesReportForm.vue`
- ✅ `frontend/src/pages/InspeccionesReportDetail.vue`
- ✅ Rutas agregadas en `router/routes.js`
- ✅ Menú agregado en `layouts/MainLayout.vue`

---

## 🏗️ Arquitectura de Referencia

El módulo se implementará siguiendo exactamente la misma estructura que ILV:

```
Backend (NestJS):
├── src/modules/inspecciones/
│   ├── controllers/
│   │   └── inspecciones.controller.ts
│   ├── services/
│   │   └── inspecciones-reports.service.ts
│   ├── dto/
│   │   ├── create-inspeccion-report.dto.ts
│   │   └── update-inspeccion-report.dto.ts
│   └── inspecciones.module.ts
├── src/database/entities/
│   ├── inspeccion-report.entity.ts
│   ├── inspeccion-report-field.entity.ts
│   └── inspeccion-maestro.entity.ts

Frontend (Vue 3 + Quasar):
├── src/pages/
│   ├── InspeccionesDashboard.vue
│   ├── InspeccionesReportsList.vue
│   ├── InspeccionesReportForm.vue
│   └── InspeccionesReportDetail.vue
├── src/services/
│   └── inspeccionesService.js
└── src/router/routes.js (agregar rutas)
```

---

## 📅 Fases de Implementación

### FASE 1: Base de Datos y Entidades
**Duración estimada:** 2-3 horas

### FASE 2: Backend - Servicios y Controladores
**Duración estimada:** 4-5 horas

### FASE 3: Frontend - Componentes y Vistas
**Duración estimada:** 6-8 horas

### FASE 4: Integración y Pruebas
**Duración estimada:** 3-4 horas

### FASE 5: Tests E2E con Playwright
**Duración estimada:** 2-3 horas

---

## 📝 FASE 1: Base de Datos y Entidades

### Tarea 1.1: Crear Script de Migración de Base de Datos

**Archivo:** `backend/src/database/migrations/create-inspecciones-tables.sql`

```sql
-- Crear tabla de maestros de inspecciones
CREATE TABLE IF NOT EXISTS inspeccion_maestro (
    maestro_id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    clave VARCHAR(50),
    valor VARCHAR(255) NOT NULL,
    padre_id INTEGER REFERENCES inspeccion_maestro(maestro_id),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de reportes de inspección
CREATE TABLE IF NOT EXISTS inspeccion_report (
    report_id SERIAL PRIMARY KEY,
    tipo_inspeccion VARCHAR(20) NOT NULL CHECK (tipo_inspeccion IN ('tecnica', 'auditoria_cruzada')),
    fecha DATE NOT NULL,
    cliente_id INTEGER NOT NULL,
    proyecto_id INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
    observacion TEXT,
    propietario_user_id INTEGER NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP,
    fecha_cierre TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Crear tabla de campos dinámicos
CREATE TABLE IF NOT EXISTS inspeccion_report_field (
    field_id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES inspeccion_report(report_id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    value_type VARCHAR(20) DEFAULT 'string'
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_inspeccion_report_tipo ON inspeccion_report(tipo_inspeccion);
CREATE INDEX IF NOT EXISTS idx_inspeccion_report_estado ON inspeccion_report(estado);
CREATE INDEX IF NOT EXISTS idx_inspeccion_report_cliente ON inspeccion_report(cliente_id);
CREATE INDEX IF NOT EXISTS idx_inspeccion_report_creado ON inspeccion_report(creado_en);
CREATE INDEX IF NOT EXISTS idx_inspeccion_field_report ON inspeccion_report_field(report_id);
CREATE INDEX IF NOT EXISTS idx_inspeccion_maestro_tipo ON inspeccion_maestro(tipo);
```

### Tarea 1.2: Insertar Datos Maestros

```sql
-- Tipos de inspección (para Opción 1)
INSERT INTO inspeccion_maestro (tipo, clave, valor, orden) VALUES
('tipo_inspeccion_tecnica', 'seguridad', 'Seguridad', 1),
('tipo_inspeccion_tecnica', 'medio_ambiente', 'Medio Ambiente', 2),
('tipo_inspeccion_tecnica', 'salud', 'Salud', 3);

-- Clasificaciones de Seguridad
INSERT INTO inspeccion_maestro (tipo, clave, valor, padre_id, orden) VALUES
('clasificacion_inspeccion', 'KAPA-AO-FO-008', 'KAPA-AO-FO-008 Inspección de equipos y herramientas', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'seguridad'), 1),
('clasificacion_inspeccion', 'KAPA-AO-FO-014', 'KAPA-AO-FO-014 Inspección de uso y estado de elementos de protección personal y dotación', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'seguridad'), 2),
('clasificacion_inspeccion', 'KAPA-AO-FO-015', 'KAPA-AO-FO-015 Inspección de seguridad para extintores', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'seguridad'), 3),
('clasificacion_inspeccion', 'KAPA-AO-FO-016', 'KAPA-AO-FO-016 Inspección de equipos de alturas', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'seguridad'), 4),
('clasificacion_inspeccion', 'KAPA-AO-FO-017', 'KAPA-AO-FO-017 Inspección de escaleras', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'seguridad'), 5),
('clasificacion_inspeccion', 'KAPA-AO-FO-025', 'KAPA-AO-FO-025 Inspección de camilla de emergencias', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'seguridad'), 6);

-- Clasificaciones de Medio Ambiente
INSERT INTO inspeccion_maestro (tipo, clave, valor, padre_id, orden) VALUES
('clasificacion_inspeccion', 'KAPA-AO-FO-009', 'KAPA-AO-FO-009 Inspección de productos químicos', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'medio_ambiente'), 1),
('clasificacion_inspeccion', 'KAPA-AO-FO-012', 'KAPA-AO-FO-012 Inspección orden y aseo', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'medio_ambiente'), 2),
('clasificacion_inspeccion', 'KAPA-AO-FO-013', 'KAPA-AO-FO-013 Inspección puntos ecológicos', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'medio_ambiente'), 3),
('clasificacion_inspeccion', 'KAPA-AO-FO-019', 'KAPA-AO-FO-019 Inspección de kit de derrames', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'medio_ambiente'), 4);

-- Clasificaciones de Salud
INSERT INTO inspeccion_maestro (tipo, clave, valor, padre_id, orden) VALUES
('clasificacion_inspeccion', 'KAPA-CL-FO-024', 'KAPA-CL-FO-024 Inspección de botiquin de emergencia', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'salud'), 1),
('clasificacion_inspeccion', 'KAPA-AO-FO-010', 'KAPA-AO-FO-010 Inspección de puntos de hidratación', (SELECT maestro_id FROM inspeccion_maestro WHERE clave = 'salud'), 2);

-- Clasificación de Auditoría Cruzada (fija)
INSERT INTO inspeccion_maestro (tipo, clave, valor, orden) VALUES
('clasificacion_auditoria', 'KAPA-AO-FO-003', 'KAPA-AO-FO-003 Auditoria cruzada', 1);

-- Áreas para Auditoría Cruzada
INSERT INTO inspeccion_maestro (tipo, clave, valor, orden) VALUES
('area_auditoria', 'horno', 'Horno', 1),
('area_auditoria', 'alimentadores', 'Alimentadores', 2),
('area_auditoria', 'formacion', 'Formación', 3),
('area_auditoria', 'decorado', 'Decorado', 4),
('area_auditoria', 'inspeccion_calidad', 'Inspección automática y calidad', 5),
('area_auditoria', 'zona_fria', 'Zona Fría', 6),
('area_auditoria', 'logistica', 'Logística', 7),
('area_auditoria', 'almacen', 'Almacén', 8),
('area_auditoria', 'talleres', 'Talleres', 9),
('area_auditoria', 'materias_primas', 'Materias Primas (Silos - Batch house)', 10),
('area_auditoria', 'planta_agua', 'Planta agua', 11),
('area_auditoria', 'planta_termica', 'Planta térmica', 12),
('area_auditoria', 'planta_oxigeno', 'Planta de oxigeno', 13),
('area_auditoria', 'compresores', 'Compresores', 14),
('area_auditoria', 'oficinas', 'Oficinas', 15),
('area_auditoria', 'areas_externas', 'Área externas', 16),
('area_auditoria', 'sotano', 'Sótano', 17),
('area_auditoria', 'comedor', 'Comedor / Cafetería', 18),
('area_auditoria', 'planta_arena', 'Planta de Arena / Mina de arena', 19),
('area_auditoria', 'bodegas', 'Bodegas', 20),
('area_auditoria', 'planta_diesel', 'Planta Diesel', 21);

-- Estados
INSERT INTO inspeccion_maestro (tipo, clave, valor, orden) VALUES
('estado_reporte', 'abierto', 'Abierto', 1),
('estado_reporte', 'cerrado', 'Cerrado', 2);
```

### Tarea 1.3: Crear Entidades TypeORM

**Archivo:** `backend/src/database/entities/inspeccion-report.entity.ts`
- Copiar estructura de `ilv-report.entity.ts`
- Ajustar nombre de tabla y campos

**Archivo:** `backend/src/database/entities/inspeccion-report-field.entity.ts`
- Copiar estructura de `ilv-report-field.entity.ts`
- Ajustar referencias

**Archivo:** `backend/src/database/entities/inspeccion-maestro.entity.ts`
- Copiar estructura de `ilv-maestro.entity.ts`
- Ajustar nombre de tabla

### Verificación Fase 1:
- [ ] Tablas creadas en PostgreSQL
- [ ] Datos maestros insertados correctamente
- [ ] Entidades TypeORM compilando sin errores
- [ ] Índices creados

---

## 📝 FASE 2: Backend - Servicios y Controladores

### Tarea 2.1: Crear DTOs

**Archivo:** `backend/src/modules/inspecciones/dto/create-inspeccion-report.dto.ts`

```typescript
export class CreateInspeccionReportDto {
  tipo_inspeccion: 'tecnica' | 'auditoria_cruzada';
  fecha: string;
  cliente_id: number;
  proyecto_id: number;
  estado?: 'abierto' | 'cerrado';
  observacion?: string;
  fields: {
    key: string;
    value: string;
    value_type?: string;
  }[];
}
```

**Archivo:** `backend/src/modules/inspecciones/dto/update-inspeccion-report.dto.ts`

```typescript
export class UpdateInspeccionReportDto {
  fecha?: string;
  estado?: 'abierto' | 'cerrado';
  observacion?: string;
  fields?: {
    key: string;
    value: string;
    value_type?: string;
  }[];
}
```

### Tarea 2.2: Crear Servicio Principal

**Archivo:** `backend/src/modules/inspecciones/services/inspecciones-reports.service.ts`

Métodos a implementar (copiar lógica de ILV y adaptar):
1. `create(dto, userId)` - Crear reporte con validación de permisos
2. `findAll(filters)` - Listar con filtros y paginación
3. `findOne(id)` - Obtener detalle con campos enriquecidos
4. `update(id, dto, userId)` - Actualizar con validación de permisos y estado
5. `deleteBulk(ids, userId)` - Eliminación masiva (solo admin)
6. `getMaestros(tipo)` - Obtener maestros por tipo
7. `getClasificacionesByTipo(tipoInspeccion)` - Obtener clasificaciones filtradas
8. `getStats()` - Estadísticas para dashboard
9. `canCreateTecnica(userId)` - Verificar permisos para Opción 1

**Validaciones especiales:**
- Opción 1: Solo roles 1, 2, 3 pueden crear
- Opción 2: Empresa auditora ≠ Empresa auditada
- Solo admin puede editar reportes cerrados
- Sincronizar estado del campo con columna estado

### Tarea 2.3: Crear Controlador

**Archivo:** `backend/src/modules/inspecciones/controllers/inspecciones.controller.ts`

Endpoints:
```
POST   /api/inspecciones/reports              - Crear reporte
GET    /api/inspecciones/reports              - Listar reportes
GET    /api/inspecciones/reports/:id          - Obtener detalle
PUT    /api/inspecciones/reports/:id          - Actualizar reporte
DELETE /api/inspecciones/reports/bulk         - Eliminar masivo

GET    /api/inspecciones/maestros/:tipo       - Obtener maestros
GET    /api/inspecciones/clasificaciones/:tipo - Clasificaciones por tipo

GET    /api/inspecciones/stats/summary        - Estadísticas resumen
GET    /api/inspecciones/stats/trend          - Tendencia temporal

GET    /api/inspecciones/can-create-tecnica   - Verificar permisos
```

### Tarea 2.4: Crear Módulo

**Archivo:** `backend/src/modules/inspecciones/inspecciones.module.ts`

- Importar entidades
- Registrar servicios
- Registrar controladores
- Exportar módulo

### Tarea 2.5: Registrar en AppModule

**Archivo:** `backend/src/app.module.ts`

- Importar InspeccionesModule

### Verificación Fase 2:
- [ ] Backend compila sin errores
- [ ] Endpoints responden correctamente (probar con curl/Postman)
- [ ] Validación de permisos funciona
- [ ] CRUD completo funcional
- [ ] Estadísticas calculan correctamente

---

## 📝 FASE 3: Frontend - Componentes y Vistas

### Tarea 3.1: Crear Servicio Frontend

**Archivo:** `frontend/src/services/inspeccionesService.js`

Copiar estructura de `ilvService.js` y adaptar:
- `createReport(data)`
- `getReports(filters)`
- `getReportById(id)`
- `updateReport(id, data)`
- `deleteBulk(ids)`
- `getMaestros(tipo)`
- `getClasificacionesByTipo(tipo)`
- `getStats()`
- `canCreateTecnica()`
- `getReportTypes()`
- `getEstados()`

### Tarea 3.2: Crear Dashboard

**Archivo:** `frontend/src/pages/InspeccionesDashboard.vue`

Copiar estructura de `ILVDashboard.vue` y adaptar:
- Tarjetas de estadísticas
- Gráfico por tipo de inspección (Técnica vs Auditoría)
- Gráfico por clasificación
- Tendencia 30 días
- Últimos reportes
- Botón "Nueva Inspección"

### Tarea 3.3: Crear Listado

**Archivo:** `frontend/src/pages/InspeccionesReportsList.vue`

Copiar estructura de `ILVReportsList.vue` y adaptar:
- Filtros: Tipo de Inspección, Estado, Cliente, Fecha Creación Desde/Hasta
- Columnas: ID, Tipo, Clasificación, Cliente, Proyecto, Estado, Fecha, Acciones
- Botones: Ver (siempre), Editar (según permisos)
- Checkbox selección múltiple (solo admin)
- Paginación

### Tarea 3.4: Crear Formulario

**Archivo:** `frontend/src/pages/InspeccionesReportForm.vue`

Copiar estructura de `ILVReportForm.vue` y adaptar:

**Selector de tipo de inspección:**
- Mostrar opciones según permisos del usuario
- Si no tiene permiso para Técnica, mostrar solo Auditoría Cruzada

**Campos para Inspección Técnica (Opción 1):**
1. Fecha (date, required)
2. Cliente - Centro de Trabajo (select, required)
3. Proyecto (select-dependent, required)
4. Empresa contratista a quien se inspecciona (select-dependent, required)
5. Descripción detallada del área (textarea, required)
6. Quien reporta (select, required)
7. Tipo (select: Seguridad/Medio Ambiente/Salud, required)
8. Clasificación (select-dependent de Tipo, required)
9. Estado (select: Abierto/Cerrado, required)
10. Observación (textarea, disabled cuando estado=cerrado)

**Campos para Auditoría Cruzada (Opción 2):**
1. Fecha (date, required)
2. Cliente - Centro de Trabajo (select, required)
3. Proyecto (select-dependent, required)
4. Área (select con 21 opciones, required)
5. Descripción detallada del área (textarea, required)
6. Empresa auditora - Quien ejecuta (select-dependent, required)
7. Empresa auditada (select-dependent, required)
8. Clasificación (fijo: KAPA-AO-FO-003, readonly)
9. Estado (select: Abierto/Cerrado, required)
10. Observación (textarea, disabled cuando estado=cerrado)

**Validaciones especiales:**
- Empresa auditora ≠ Empresa auditada (mostrar error)
- Tipo de inspección no editable en modo edición

### Tarea 3.5: Crear Vista de Detalle

**Archivo:** `frontend/src/pages/InspeccionesReportDetail.vue`

Copiar estructura de `ILVReportDetail.vue` y adaptar:
- Mostrar todos los campos en modo solo lectura
- Breadcrumbs de navegación
- Información de auditoría
- Botón Editar (si tiene permisos)
- Botón Volver
- **NO mostrar botones de modificación**

### Tarea 3.6: Configurar Rutas

**Archivo:** `frontend/src/router/routes.js`

Agregar rutas:
```javascript
{
  path: '/inspecciones',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    { 
      path: '', 
      redirect: '/inspecciones/dashboard' 
    },
    { 
      path: 'dashboard', 
      name: 'inspeccionesDashboard',
      component: () => import('pages/InspeccionesDashboard.vue') 
    },
    { 
      path: 'reportes', 
      name: 'inspeccionesReportes',
      component: () => import('pages/InspeccionesReportsList.vue') 
    },
    { 
      path: 'reportes/nuevo', 
      name: 'inspeccionesNuevoReporte',
      component: () => import('pages/InspeccionesReportForm.vue') 
    },
    { 
      path: 'reportes/:id', 
      name: 'inspeccionesReporteDetalle',
      component: () => import('pages/InspeccionesReportDetail.vue') 
    },
    { 
      path: 'reportes/:id/editar', 
      name: 'inspeccionesReporteEditar',
      component: () => import('pages/InspeccionesReportForm.vue') 
    }
  ]
}
```

### Tarea 3.7: Agregar al Menú Lateral

**Archivo:** `frontend/src/layouts/MainLayout.vue` (o donde esté el menú)

Agregar ítem de menú:
```javascript
{
  icon: 'fact_check',
  label: 'Inspecciones - Dashboard',
  to: '/inspecciones/dashboard'
},
{
  icon: 'assignment',
  label: 'Inspecciones - Reportes',
  to: '/inspecciones/reportes'
}
```

### Verificación Fase 3:
- [ ] Navegación funciona correctamente
- [ ] Dashboard muestra estadísticas
- [ ] Listado muestra reportes con filtros
- [ ] Formulario crea reportes correctamente
- [ ] Validación de permisos funciona (Opción 1 vs 2)
- [ ] Campo Observación se deshabilita con estado Cerrado
- [ ] Clasificación se filtra por Tipo
- [ ] Vista de detalle es solo lectura

---

## 📝 FASE 4: Integración y Pruebas

### Tarea 4.1: Pruebas de Permisos

| Rol | Crear Técnica | Crear Auditoría | Editar Abierto | Editar Cerrado |
|-----|---------------|-----------------|----------------|----------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Usuario KAPA | ✅ | ✅ | ✅ | ❌ |
| Cliente | ✅ | ✅ | ✅ | ❌ |
| Contratista | ❌ | ✅ | ✅ | ❌ |
| Visitante | ❌ | ✅ | ❌ | ❌ |

### Tarea 4.2: Pruebas de Campos Dependientes

- [ ] Al seleccionar Cliente, se cargan Proyectos correctos
- [ ] Al seleccionar Cliente, se cargan Contratistas correctos
- [ ] Al seleccionar Tipo (Seguridad/MA/Salud), se cargan Clasificaciones correctas
- [ ] Al cambiar Estado a Cerrado, Observación se deshabilita
- [ ] Empresa auditora ≠ Empresa auditada (validación)

### Tarea 4.3: Pruebas de Filtros

- [ ] Filtro por Tipo de Inspección funciona
- [ ] Filtro por Estado funciona
- [ ] Filtro por Cliente funciona
- [ ] Filtro por Fecha incluye todo el día (00:00:00 a 23:59:59)
- [ ] Limpiar filtros funciona

### Tarea 4.4: Pruebas de CRUD

- [ ] Crear Inspección Técnica
- [ ] Crear Auditoría Cruzada
- [ ] Editar reporte abierto
- [ ] Admin editar reporte cerrado
- [ ] Eliminar reportes (admin)
- [ ] Visualizar detalle sin modificar

### Tarea 4.5: Build y Deploy

```bash
# Backend
cd /var/www/kapa.healtheworld.com.co/backend
npm run build
pm2 restart kapa-backend

# Frontend
cd /var/www/kapa.healtheworld.com.co/frontend
npm run build
```

---

## 📝 FASE 5: Tests E2E con Playwright

### Tarea 5.1: Crear Tests de Navegación

**Archivo:** `e2e/tests/inspecciones-navigation.spec.ts`

- Test: Navegar a Dashboard
- Test: Navegar a Listado
- Test: Navegar a Nuevo Reporte

### Tarea 5.2: Crear Tests de Permisos

**Archivo:** `e2e/tests/inspecciones-permissions.spec.ts`

- Test: Admin puede ver opción Inspección Técnica
- Test: Contratista NO puede ver opción Inspección Técnica
- Test: Contratista puede crear Auditoría Cruzada

### Tarea 5.3: Crear Tests de Formulario

**Archivo:** `e2e/tests/inspecciones-form.spec.ts`

- Test: Crear Inspección Técnica con todos los campos
- Test: Crear Auditoría Cruzada con todos los campos
- Test: Validación de campos obligatorios
- Test: Campo Observación deshabilitado cuando Estado=Cerrado
- Test: Clasificación se filtra por Tipo

### Tarea 5.4: Crear Tests de Listado

**Archivo:** `e2e/tests/inspecciones-list.spec.ts`

- Test: Filtros funcionan correctamente
- Test: Paginación funciona
- Test: Botones de acción visibles según permisos

---

## 📋 Checklist Final

### Base de Datos
- [ ] Tabla `inspeccion_maestro` creada
- [ ] Tabla `inspeccion_report` creada
- [ ] Tabla `inspeccion_report_field` creada
- [ ] Datos maestros insertados
- [ ] Índices creados

### Backend
- [ ] Entidades TypeORM creadas
- [ ] DTOs creados
- [ ] Servicio con todos los métodos
- [ ] Controlador con todos los endpoints
- [ ] Módulo registrado en AppModule
- [ ] Validación de permisos implementada
- [ ] Sincronización de estado implementada

### Frontend
- [ ] Servicio JavaScript creado
- [ ] Dashboard implementado
- [ ] Listado con filtros implementado
- [ ] Formulario con campos condicionales
- [ ] Vista de detalle (solo lectura)
- [ ] Rutas configuradas
- [ ] Menú lateral actualizado

### Funcionalidades
- [ ] Crear Inspección Técnica (Opción 1)
- [ ] Crear Auditoría Cruzada (Opción 2)
- [ ] Permisos por rol funcionando
- [ ] Campos dependientes funcionando
- [ ] Campo Observación condicional
- [ ] Edición con validaciones
- [ ] Eliminación masiva (solo admin)
- [ ] Dashboard con estadísticas

### Tests
- [ ] Tests de navegación
- [ ] Tests de permisos
- [ ] Tests de formulario
- [ ] Tests de listado

---

## 🔄 Orden de Ejecución Recomendado

1. **Día 1 - Mañana:** Fase 1 completa (BD + Entidades)
2. **Día 1 - Tarde:** Fase 2 tareas 2.1 a 2.3 (DTOs, Servicio)
3. **Día 2 - Mañana:** Fase 2 tareas 2.4 a 2.5 + verificación backend
4. **Día 2 - Tarde:** Fase 3 tareas 3.1 a 3.3 (Servicio, Dashboard, Listado)
5. **Día 3 - Mañana:** Fase 3 tareas 3.4 a 3.5 (Formulario, Detalle)
6. **Día 3 - Tarde:** Fase 3 tareas 3.6 a 3.7 + Fase 4 (Rutas, Menú, Pruebas)
7. **Día 4 - Mañana:** Fase 5 (Tests E2E)
8. **Día 4 - Tarde:** Correcciones y deploy final

---

## 📞 Puntos de Verificación

Después de cada fase, verificar:

1. **Post-Fase 1:** 
   - `SELECT * FROM inspeccion_maestro;` devuelve datos
   - Backend compila

2. **Post-Fase 2:**
   - `curl http://localhost:3001/api/inspecciones/maestros/tipo_inspeccion_tecnica` devuelve JSON
   - `curl http://localhost:3001/api/inspecciones/stats/summary` devuelve estadísticas

3. **Post-Fase 3:**
   - Navegador accede a `/inspecciones/dashboard`
   - Formulario crea reportes

4. **Post-Fase 4:**
   - Todos los checklist marcados
   - Sin errores en consola

5. **Post-Fase 5:**
   - `npx playwright test inspecciones` pasa todos los tests

---

*Documento creado: 29 de Noviembre de 2025*
*Versión: 1.0*
