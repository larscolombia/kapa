# Módulo Reports - Especificación Funcional

## Descripción General
- Provee visibilidad sobre el ciclo de vida de los documentos auditados, permitiendo filtrar por cliente, proyecto y contratista.
- Calcula métricas de tiempos de respuesta y cumplimiento de SLA basándose en los registros de la tabla `document_state_audit`.
- Permite descargar reportes en Excel con información agregada, detalle por documento y el historial completo de cambios.

## Casos de Uso

1. **Consultar métricas de auditoría**
    - Actores: Administrador operativo, Analista de calidad (roles con permiso `reports_management`).
    - Precondiciones: Usuario autenticado vía JWT, existencia de documentos con historial en `document_state_audit`.
    - Flujo principal:
       1. El usuario ingresa a “Reportes de Auditoría”.
       2. Selecciona filtros opcionales (cliente, proyecto, contratista, rango de fechas).
       3. Solicita la búsqueda y el sistema ejecuta `/reports/metrics` y `/reports/sla`.
       4. Se muestran métricas SLA agregadas y la tabla de detalle por documento.
    - Flujos alternos:
       - Si no hay registros que cumplan con los filtros, la tabla aparece vacía y las métricas muestran valores en cero.
       - Si el servicio presenta errores, se muestra mensaje de error genérico en consola (aún sin feedback amigable).

2. **Revisar historial (timeline) de un documento**
    - Actores: Misma audiencia del caso anterior.
    - Precondiciones: Resultado de métricas cargado y selección de un documento específico.
    - Flujo principal:
       1. El usuario hace clic en “Ver historial” sobre un documento.
       2. El sistema abre un diálogo con los eventos ordenados cronológicamente.
       3. Cada entrada muestra estados previo/nuevo, duración, responsable y comentarios.
    - Flujos alternos:
       - Si `time_in_previous_state_hours` no está calculado se muestra `null` o `N/A`.
       - Si el documento no tiene auditorías, la línea de tiempo aparece vacía.

3. **Descargar reporte Excel**
    - Actores: Administrador operativo, Analista de calidad.
    - Precondiciones: Haber definido filtros (opcionales) y contar con privilegios para consumir `/reports/export/excel`.
    - Flujo principal:
       1. El usuario selecciona “Descargar Excel”.
       2. El frontend llama al endpoint con los filtros actuales.
       3. El backend genera un archivo `.xlsx` con tres hojas (Resumen, Detalle, Timeline).
       4. El navegador descarga el archivo nombrado `reporte_auditoria_<fecha>.xlsx`.
    - Flujos alternos:
       - En caso de error, se muestra un log en consola y no se descarga el archivo.
       - Grandes volúmenes de datos pueden demorar la respuesta (sin feedback de progreso en UI).

## Reglas de Negocio
- Los filtros `clientId`, `projectId`, `contractorId`, `startDate`, `endDate` y `state` son opcionales pero, cuando se envían, filtran estrictamente los registros.
- El cálculo de SLA considera un umbral fijo de 24 horas (`SLA_HOURS`), configurable solo modificando el código.
- Un documento cuenta como “rechazado” si en su timeline existe algún evento con `new_state = rejected`.
- La duración por estado se suma usando `time_in_previous_state_hours`; valores nulos se tratan como 0.
- El porcentaje de rechazo en la hoja resumen divide documentos con rechazos entre el total filtrado.
- Las fechas se interpretan en horario del servidor y se formatean a `es-CO` en frontend/Excel.

## Interfaces
- Frontend principal: `frontend/src/pages/ReportsPage.vue` (Quasar) con componentes `q-select`, `q-table`, `q-timeline` y acción de descarga.
- Navegación: ruta `adminReports` en `frontend/src/router/routes.js` y menú en `MainLayout.vue`.
- API REST:
   - `GET /reports/metrics` — devuelve arreglo de métricas por documento con timeline embebido.
   - `GET /reports/sla` — entrega agregados SLA (cumplimiento, totales, promedio).
   - `GET /reports/audit` — expone la lista cruda de auditorías (usado por backend y export).
   - `GET /reports/export/excel` — retorna archivo Excel binario.
- Dependencias de datos: catálogos consumidos desde `clientService`, `projectService`, `contractorService`.

## Tareas Pendientes
- Implementar guardas (`JwtAuthGuard` + verificación de permiso `reports_management`) en los endpoints backend.
- Ampliar la validación de filtros (fechas coherentes, existencia de IDs) y retornar mensajes específicos al frontend.
- Proveer feedback de carga/errores en la UI (toast/notificación) para descargas y búsquedas.
- Exponer endpoints paginados o con límites configurables para evitar respuestas muy pesadas.
- Automatizar pruebas (unitarias y e2e) que cubran los cálculos de métricas, SLA y la generación de Excel.

