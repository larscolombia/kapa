# Módulo Contractors

Este directorio centraliza los requerimientos del módulo Contractors del sistema KAPA. El módulo administra el ciclo de vida de contratistas y subcontratistas, las asociaciones con proyectos y la comunicación de avances.

## Estructura
- `MODULO_CONTRACTORS_RESUMEN_COMPLETO.md` - Resumen ejecutivo del módulo.
- `MODULO_CONTRACTORS_ESPECIFICACION.md` - Detalle funcional y reglas de negocio.
- `MODULO_CONTRACTORS_IMPLEMENTACION_BACKEND.md` - Arquitectura NestJS, endpoints y flujos técnicos.

## Implementación
- Backend: `../../backend/src/modules/contractors/` contiene controlador, servicio, módulo y DTO. Las entidades relacionadas viven en `../../backend/src/database/entities/{contractor,contractor-email,project-contractor}.ts`.
- Frontend: `../../frontend/src/pages/ContractorsPage.vue`, componentes `../../frontend/src/components/ContractorForm.vue` y `SubContractorList.vue`, además del servicio `../../frontend/src/services/contractorService.js`.
- Reglas de negocio de subcontratistas y porcentajes de cumplimiento se apoyan en `ProjectContractorsService`, `ProjectContractorCriterionsService` y `DocumentService`.

## Flujos Clave
- Alta y edición con validaciones de NIT, correos, estado y asociación a proyectos.
- Consulta de contratistas y subcontratistas para vistas administrativas y filtro por permisos.
- Envío de reportes de cumplimiento vía correo electrónico (`/contractors/send-results`).

## Base de Datos
- Tablas `contractor`, `contractor_email` y `project_contractor` definidas en `../../database.sql`; relacionan contratistas con proyectos, correos y métricas de avance.
- Restricción operativa: máximo cinco subcontratistas activos por contratista padre.
- Datos semilla para contratistas y relaciones disponibles en el dump general.

## Pendientes Sugeridos
- Proteger los endpoints con `JwtAuthGuard` y validar permisos por rol.
- Añadir paginación y filtros avanzados en `/contractors` para manejar catálogos grandes.
- Completar pruebas unitarias y e2e sobre creación, edición, límites de subcontratistas y envío de correos.
- Documentar parámetros requeridos por el correo transaccional (plantilla HTML y variables de entorno `MAIL_*`).
