# Módulo Reports

Este directorio centraliza los requerimientos del módulo Reports del ecosistema KAPA, responsable de exponer las métricas de auditoría de documentos y proveer exportes operativos.

## Estructura

- `MODULO_REPORTS_RESUMEN_COMPLETO.md` — Resumen ejecutivo del módulo y sus objetivos.
- `MODULO_REPORTS_ESPECIFICACION.md` — Reglas de negocio, casos de uso y alcance funcional.
- `MODULO_REPORTS_IMPLEMENTACION_BACKEND.md` — Detalle técnico de controladores, servicios y flujos de datos.

## Implementación

- Backend: `../../backend/src/modules/reports/` (`ReportsModule`, `ReportsService`, `ReportsController`).
- Entidades relacionadas: `../../backend/src/database/entities/document-state-audit.entity.ts` y `document.entity.ts`.
- Frontend: `../../frontend/src/pages/ReportsPage.vue` con navegación declarada en `frontend/src/router/routes.js` y menú en `frontend/src/layouts/MainLayout.vue`.
- Servicios auxiliares: consumo de catálogos desde `frontend/src/services/clientService.js`, `projectService.js` y `contractorService.js` para poblar filtros.

## Base de Datos

- Tabla principal: `document_state_audit` (auditoría de cambios de estado de documentos).
- Tabla de soporte: `document` (metadatos, estado vigente y relaciones con proyectos/contratistas/criterios).
- Métricas calculadas requieren que `time_in_previous_state_hours` se alimente durante cada transición de estado del documento.

