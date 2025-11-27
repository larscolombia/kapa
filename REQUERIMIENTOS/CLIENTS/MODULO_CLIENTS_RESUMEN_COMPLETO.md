# Módulo Clients - Resumen Ejecutivo

> El módulo Clients expone el catálogo corporativo de clientes y aporta el contexto necesario para navegar hacia los proyectos y contratistas vinculados, respetando los permisos por rol y manteniendo la trazabilidad entre backend y frontend.

## Objetivo
- Centralizar la información maestra de clientes que interactúan con KAPA.
- Servir como punto de entrada para visualizar proyectos activos y asignaciones por cliente.
- Ofrecer una API liviana que pueda ser consumida desde otras vistas y servicios internos.

## Alcance
- Exponer endpoints de solo lectura para listar clientes y obtener su detalle.
- Entregar la lista de proyectos asociados a un cliente, filtrada dinámicamente según el rol del usuario autenticado.
- Alimentar la vista principal del sistema y la página de proyectos por cliente en el frontend.
- Fuera de alcance: operaciones de creación, edición o eliminación de clientes; gestión documental o métricas específicas de proyectos.

## KPIs y Métricas
- Tiempo medio de respuesta de los endpoints `/clients` y `/clients/:id/projects`.
- Número de usuarios únicos que acceden a proyectos por cliente según rol (cliente, contratista, subcontratista).
- Cantidad de clientes activos y proyectos asociados visibles por rol.
- Frecuencia de errores HTTP o vacíos de información al intentar recuperar proyectos para un cliente.

## Dependencias
- Servicio de autenticación (`AuthService`) para extraer `role` y `email` del JWT.
- `ProjectsService` y `ContractorsService` para obtener y filtrar proyectos por cliente y correo del contratista.
- Entidades TypeORM `Client`, `Project` y `ProjectContractor` que materializan la relación cliente-proyecto.
- Datos semilla presentes en `database.sql` que cargan los clientes existentes.

## Consideraciones Técnicas
- Los endpoints de clientes usan NestJS y TypeORM; las respuestas se entregan en formato JSON sin proyecciones adicionales.
- El endpoint `/clients/:client_id/projects` está protegido por `JwtAuthGuard` y aplica reglas diferenciadas para roles 3 (Contratista), 4 (Cliente) y 5 (Subcontratista).
- Falta un mecanismo de caché o paginación; si el número de clientes crece habrá que optimizar la consulta.
- Actualmente el frontend principal usa IDs codificados en duro para navegar; se recomienda consumir el endpoint `/clients` para desacoplar la interfaz.
- Las pruebas automatizadas del servicio son mínimas (solo verificación de existencia); se requiere ampliar la cobertura.
