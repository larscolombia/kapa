# Módulo Projects

Este directorio reúne los requerimientos del módulo Projects del sistema KAPA. El módulo administra el ciclo de vida de los proyectos, su relación con clientes, la asociación con contratistas y la exposición de métricas de cumplimiento.

## Estructura
- `MODULO_PROJECTS_RESUMEN_COMPLETO.md` - Visión ejecutiva del módulo y objetivos clave.
- `MODULO_PROJECTS_ESPECIFICACION.md` - Casos de uso, reglas de negocio e interfaces funcionales.
- `MODULO_PROJECTS_IMPLEMENTACION_BACKEND.md` - Arquitectura técnica, endpoints y consideraciones de integración.

## Implementación
- Backend: `../../backend/src/modules/projects/` (controller, service, module) y entidad `Project` en `../../backend/src/database/entities/project.entity.ts`.
- Dependencias backend: `AuthModule` para obtener claims JWT y `ContractorsModule` para reutilizar lógica de filtrado por rol/correo.
- Frontend: `../../frontend/src/pages/ProjectsPage.vue`, `ProjectContractorsPage.vue`, componentes `ProjectForm.vue`, `ProjectInfo.vue` y servicio `../../frontend/src/services/projectService.js`.

## Flujos Clave
- CRUD de proyectos con validaciones de fechas, estado y cliente asociado.
- Listado consolidado con contratistas y subcontratistas para la vista administrativa.
- Consulta de contratistas por proyecto aplicando reglas de visibilidad según rol y correo.

## Base de Datos
- Tabla `project` con columnas `project_id`, `name`, `address`, `supervisor`, `start_date`, `end_date`, `state`, `client_id` y relación con `project_contractor`.
- Enum `project_state_enum` (`active`, `inactive`) y seeds incluidos en `../../database.sql`.
- Relación `client_id` exige registros previos en la tabla `client`.

## Pendientes Sugeridos
- Incorporar guardas y validación de permisos en endpoints de creación/actualización.
- Añadir paginación y filtros server-side para catálogos extensos.
- Detectar automáticamente conflictos de fechas o cambios en contratistas asociados.
- Ampliar cobertura de pruebas unitarias y e2e sobre los flujos descritos.
