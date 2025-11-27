# Módulo Projects - Resumen Ejecutivo

> El módulo Projects administra el portafolio de proyectos de KAPA, integrando información con clientes, contratistas y métricas de cumplimiento para soportar la operación y la toma de decisiones.

## Objetivo
- Centralizar la información maestra de proyectos (datos generales, estado, cliente asociado).
- Facilitar el seguimiento de avances mediante la relación con contratistas y subcontratistas.
- Proveer APIs que habiliten la gestión administrativa y la consulta contextual desde otros módulos.

## Alcance
- Registro, edición y consulta de proyectos con validaciones de fechas, estado y cliente.
- Exposición de listados que incluyen contratistas asociados y contactos relevantes.
- Entrega de contratistas por proyecto con filtrado dinámico según rol del usuario.
- Fuera de alcance: gestión financiera de proyectos, cronogramas detallados, analítica avanzada o integración con sistemas externos.

## KPIs y Métricas
- Número de proyectos activos vs. inactivos y su distribución por cliente.
- Latencia promedio y tasa de éxito de los endpoints `/projects` y `/projects/:id/contractors`.
- Porcentaje de proyectos con documentación completa (derivado del módulo Documents).
- Alertas de fechas inconsistentes (inicio > fin) o proyectos sin contratistas asignados.

## Dependencias
- Entidades `Project`, `ProjectContractor`, `Client` y sus seeds en `database.sql`.
- Servicios `ContractorsService` y `AuthService` para filtrar resultados por rol/correo.
- Frontend (ProjectsPage, ProjectForm, ProjectContractorsPage) para administración y navegación.
- Módulos complementarios: Clients (origen del cliente) y Contractors (asociaciones y métricas).

## Consideraciones Técnicas
- Uso de NestJS + TypeORM con relaciones eager para obtener datos de contratistas en una sola consulta.
- Validaciones estrictas en backend para campos requeridos y estados permitidos (`active`/`inactive`).
- Endpoint `/projects/:project_id/contractors` está protegido por `JwtAuthGuard` y depende del token JWT para aplicar filtros.
- Falta cobertura de pruebas unitarias e integración en `projects.service.spec.ts`.
- No se implementó control de concurrencia optimista; actualizaciones simultáneas dependen del repositorio por defecto.
