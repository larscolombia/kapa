# Módulo Documents

Este directorio centraliza los requerimientos del módulo Documents, encargado del ciclo completo de cargue, validación, auditoría y notificación de evidencias documentales dentro de KAPA.

## Estructura

- `MODULO_DOCUMENTS_RESUMEN_COMPLETO.md` — Resumen ejecutivo con objetivos y alcance.
- `MODULO_DOCUMENTS_ESPECIFICACION.md` — Reglas de negocio, casos de uso y métricas de éxito.
- `MODULO_DOCUMENTS_IMPLEMENTACION_BACKEND.md` — Detalle técnico de servicios, integraciones y tareas pendientes.

## Implementación

- Backend: `../../backend/src/modules/documents/` (`DocumentsModule`, `DocumentController`, `DocumentService`).
- Entidades principales: `../../backend/src/database/entities/document.entity.ts`, `document-state-audit.entity.ts`, `subcriterion.entity.ts`, `employee.entity.ts`.
- Frontend: composición entre `frontend/src/components/SubCriterionCard.vue`, `FileCard.vue`, `ContractorForm.vue`, `ProjectForm.vue`, `pages/CriterionPage.vue`, `composables/useDocument.js` y `services/documentService.js`.
- Utilidades compartidas: gestor S3 en `frontend/src/utils/s3Manager.js` y URLs firmadas mediante `/document/presigned-url`.

## Base de Datos

- Tablas: `document`, `document_state_audit`, `project_contractor`, `project_contractor_criterion`, `employee`, `subcriterion`.
- Migraciones: revisar scripts históricos en `backend/migrations/` para creación de tablas de documentos y auditoría.
- Dependencias de seeds: `database.sql` y `seed-maestros-ilb.sql` aseguran catálogos de criterios y subcriterios necesarios para validar documentos.

