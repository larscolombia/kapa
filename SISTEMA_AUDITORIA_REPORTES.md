# 📊 Sistema de Auditoría y Reportes - KAPA

## 🎯 Propósito

Este sistema permite rastrear y demostrar los tiempos de respuesta en la revisión de documentos, solucionando el problema de negocio donde los proveedores acusan demoras que pueden ser causadas por ellos mismos.

## ✨ Funcionalidades Implementadas

### 1. **Auditoría Automática** 
- ✅ Registro automático de cada cambio de estado de documentos
- ✅ Tracking de timestamps precisos
- ✅ Cálculo automático de tiempo en cada estado
- ✅ Identificación del usuario que realizó el cambio
- ✅ Registro de comentarios asociados

### 2. **Módulo de Reportes**
- ✅ Filtros avanzados por cliente, proyecto, contratista y fechas
- ✅ Métricas de SLA (Service Level Agreement - 24 horas)
- ✅ Tiempo promedio de respuesta
- ✅ Conteo de rechazos y reenvíos
- ✅ Cumplimiento de SLA porcentual

### 3. **Exportación a Excel**
- ✅ **Hoja 1 - Resumen General**: Métricas globales
- ✅ **Hoja 2 - Detalle por Documento**: Información completa por archivo
- ✅ **Hoja 3 - Timeline Completo**: Historial cronológico de cambios
- ✅ Formato profesional con colores y estilos

### 4. **Visualización Frontend**
- ✅ Dashboard con métricas clave (SLA, tiempos, rechazos)
- ✅ Tabla detallada con indicadores visuales
- ✅ Timeline interactivo por documento
- ✅ Badges de colores según criticidad

## 📁 Archivos Creados

### Backend
```
backend/src/
├── database/entities/
│   └── document-state-audit.entity.ts         # Entidad de auditoría
├── modules/
│   ├── documents/
│   │   ├── documents.service.ts               # Actualizado con auditoría
│   │   └── documents.module.ts                # Actualizado
│   └── reports/
│       ├── reports.module.ts                  # Módulo de reportes
│       ├── reports.service.ts                 # Lógica de reportes
│       └── reports.controller.ts              # API endpoints
└── create_audit_table.sql                     # Migración ejecutada ✓
```

### Frontend
```
frontend/src/
├── pages/
│   └── ReportsPage.vue                        # Vista de reportes
└── router/
    └── routes.js                              # Actualizado con ruta
```

## 🔌 API Endpoints Disponibles

### GET `/api/reports/audit`
Obtiene el historial completo de auditoría filtrado.

**Query Params:**
- `clientId` (opcional)
- `contractorId` (opcional)
- `projectId` (opcional)
- `startDate` (opcional) - YYYY-MM-DD
- `endDate` (opcional) - YYYY-MM-DD
- `state` (opcional) - submitted|approved|rejected|not_applicable

**Ejemplo:**
```
GET /api/reports/audit?clientId=1&startDate=2025-01-01&endDate=2025-01-31
```

### GET `/api/reports/metrics`
Obtiene métricas calculadas por documento.

**Query Params:** Igual que `/audit`

**Respuesta:**
```json
[
  {
    "document": {...},
    "timeline": [...],
    "totalTimeInSubmitted": 12.5,
    "totalResubmissions": 2,
    "firstSubmission": "2025-01-15T10:30:00Z",
    "lastApprovalOrRejection": "2025-01-16T14:45:00Z"
  }
]
```

### GET `/api/reports/sla`
Obtiene métricas de cumplimiento de SLA (24 horas).

**Respuesta:**
```json
{
  "total": 150,
  "withinSLA": 120,
  "breachedSLA": 30,
  "slaCompliance": "80.00",
  "averageResponseTime": 18.5,
  "breachedDocuments": [...]
}
```

### GET `/api/reports/export/excel`
Descarga reporte completo en formato Excel (.xlsx).

**Query Params:** Igual que `/audit`

**Respuesta:** Archivo Excel con 3 hojas

## 📊 Estructura del Reporte Excel

### Hoja 1: Resumen General
| Métrica | Valor |
|---------|-------|
| Total de Documentos Analizados | 150 |
| Tiempo Promedio de Respuesta (horas) | 18.50 |
| Total de Rechazos | 45 |
| Documentos con Rechazos | 30 |
| Porcentaje de Rechazo | 20.00% |

### Hoja 2: Detalle por Documento
Columnas:
- Cliente
- Proyecto
- Contratista
- Criterio
- Subcriterio
- Empleado
- Documento
- Primera Carga
- Última Revisión
- Tiempo en Revisión (hrs)
- Número de Rechazos
- Estado Actual

### Hoja 3: Timeline Completo
Columnas:
- Fecha/Hora
- Cliente
- Proyecto
- Contratista
- Documento
- Estado Anterior
- Estado Nuevo
- Tiempo en Estado Anterior (hrs)
- Cambiado Por
- Comentarios

## 🎨 Códigos de Estado

| Estado | Traducción | Color |
|--------|------------|-------|
| `submitted` | Enviado | Azul |
| `approved` | Aprobado | Verde |
| `rejected` | Rechazado | Rojo |
| `not_applicable` | No Aplica | Gris |
| `pending` | Pendiente | Naranja |

## 🔐 Permisos Requeridos

Para acceder al módulo de reportes, el usuario debe tener:
- **Módulo:** `reports_management`
- **Permiso:** `can_view`

## 🚀 Acceso en el Sistema

1. Login como **Administrador**
2. Ir al menú → **Reportes**
3. Ruta: `https://kapa.healtheworld.com.co/admin-reports`

## 📝 Casos de Uso

### Caso 1: Demostrar tiempos de revisión al cliente
1. Filtrar por cliente y fechas
2. Exportar a Excel
3. Mostrar "Tiempo Promedio de Respuesta" < 24h
4. Evidenciar cumplimiento de SLA del 80%+

### Caso 2: Identificar documentos problemáticos
1. Ir a la pestaña "Detalle por Documento"
2. Ordenar por "Número de Rechazos"
3. Identificar contratistas con más rechazos
4. Tomar acciones correctivas

### Caso 3: Probar responsabilidad del proveedor
1. Buscar documento específico
2. Click en "Ver historial" (ícono de reloj)
3. Ver timeline completo con timestamps
4. Demostrar:
   - Cuándo se cargó (proveedor)
   - Cuánto tardó la revisión (tu equipo)
   - Cuántas veces fue rechazado (calidad del proveedor)
   - Tiempo total por estado

### Caso 4: Análisis por contratista
1. Filtrar por un contratista específico
2. Ver su cumplimiento de SLA
3. Identificar si sus documentos son de calidad
4. Comparar con otros contratistas

## 🔧 Mantenimiento

### Agregar nuevos estados
Editar los siguientes archivos:
1. `frontend/src/pages/ReportsPage.vue` → funciones `translateState()` y `getStateColor()`
2. `backend/src/modules/reports/reports.service.ts` → método `translateState()`

### Cambiar SLA (actualmente 24 horas)
Editar: `backend/src/modules/reports/reports.service.ts`
```typescript
const SLA_HOURS = 24; // Cambiar este valor
```

### Agregar nuevas métricas
1. Modificar `getResponseTimeMetrics()` en `reports.service.ts`
2. Actualizar columnas en `ReportsPage.vue`
3. Agregar a la generación del Excel

## ⚠️ Importante

### Datos Históricos
- ❌ Los documentos creados **ANTES** de esta implementación NO tienen auditoría
- ✅ La auditoría comienza desde el momento de la instalación
- 💡 **Solución temporal**: Puedes crear registros manuales en `document_state_audit` para documentos antiguos si es crítico

### Migración de Datos Antiguos (Opcional)
Si necesitas auditoría de documentos existentes:

```sql
INSERT INTO document_state_audit (
    document_id, 
    previous_state, 
    new_state, 
    comments, 
    changed_at, 
    time_in_previous_state_hours
)
SELECT 
    document_id,
    'none' as previous_state,
    state as new_state,
    'Migración histórica' as comments,
    NOW() as changed_at,
    0 as time_in_previous_state_hours
FROM document
WHERE document_id NOT IN (SELECT DISTINCT document_id FROM document_state_audit);
```

## 📈 Métricas de Éxito

Con este sistema puedes demostrar:

✅ **Tu equipo responde en promedio en X horas**
✅ **Y% de cumplimiento del SLA de 24h**
✅ **El proveedor ha reenviado Z veces el mismo documento**
✅ **Tiempo total: X% proveedor, Y% tu equipo**

## 🎯 Próximos Pasos Recomendados

1. ✅ **Crear permisos** en la tabla `access` para el módulo `reports_management`
2. ✅ **Asignar permisos** al rol de administrador
3. ✅ **Agregar enlace** en el menú principal del frontend
4. ✅ **Capacitar** al equipo en el uso del sistema
5. ✅ **Definir SLA contractual** con clientes
6. ✅ **Establecer métricas objetivo** (ej: 90% dentro de SLA)

## 📞 Soporte

Para dudas o mejoras contactar al equipo de desarrollo.

---

**Fecha de Implementación:** 2025-01-23
**Versión:** 1.0.0
**Estado:** ✅ Productivo
