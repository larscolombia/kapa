# Módulo Clients

Este directorio centraliza los requerimientos del módulo Clients del sistema KAPA. El módulo permite consultar el catálogo de clientes corporativos y sus proyectos asociados, habilitando las vistas públicas del home y los tableros segmentados por rol.

## Estructura
- `MODULO_CLIENTS_RESUMEN_COMPLETO.md` - Resumen ejecutivo del módulo.
- `MODULO_CLIENTS_ESPECIFICACION.md` - Especificación funcional y de negocio.
- `MODULO_CLIENTS_IMPLEMENTACION_BACKEND.md` - Guía técnica y consideraciones de backend.

## Implementación
- Backend: `../../backend/src/modules/clients/` contiene controlador, servicio y módulo NestJS; la entidad `Client` vive en `../../backend/src/database/entities/client.entity.ts`.
- Frontend: `../../frontend/src/pages/ClientProjectsPage.vue`, `../../frontend/src/pages/IndexPage.vue` y `../../frontend/src/services/clientService.js` consumen los endpoints expuestos.
- Autenticación: el endpoint protegido usa `JwtAuthGuard` y `AuthService` desde `../../backend/src/modules/auth/` para extraer correo y rol del token JWT.

## Flujos Clave
- Listar clientes disponibles para navegación (`GET /clients`).
- Consultar detalle puntual de un cliente (`GET /clients/:client_id`).
- Obtener proyectos por cliente con filtrado por rol (`GET /clients/:client_id/projects`).

## Dependencias
- `ProjectsService` y `ContractorsService` consolidan los proyectos visibles según rol y correo asociado al contratista.
- Entidades `Project` y `ProjectContractor` mantienen la relación cliente-proyecto-contratista.
- JWT emitido por el módulo Auth proporciona los claims `role` y `email` requeridos por el endpoint protegido.

## Base de Datos
- Tabla `client` con columnas `client_id` y `name`; poblada en el dump general `database.sql`.
- Relación uno a muchos con la tabla `project` mediante la FK `client_id` (ver `project.entity.ts`).
- No existen migraciones exclusivas para este módulo; cualquier cambio debe realizarse en migraciones globales o seeds.

## Pendientes Sugeridos
- Incorporar operaciones de alta, edición y baja de clientes en backend y UI.
- Parametrizar el listado de clientes en el home para evitar IDs codificados.
- Añadir pruebas unitarias e integrales que cubran `ClientsService` y la protección del endpoint `/clients/:client_id/projects`.
