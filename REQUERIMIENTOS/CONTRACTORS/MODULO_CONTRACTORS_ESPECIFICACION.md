# Módulo Contractors - Especificación Funcional

## Descripción General
- Permite administrar contratistas principales y sus subcontratistas para cada proyecto KAPA.
- Gestiona datos de contacto, estado operativo, correos notificados y la relación con proyectos activos.
- Facilita el seguimiento del cumplimiento documental y la comunicación de resultados a través del correo electrónico.

## Casos de Uso

1. **Registrar o actualizar contratista**
   - Actores: Administrador, Usuario KAPA con permiso `contractor_management`.
   - Precondiciones: usuario autenticado; se cuenta con datos básicos (NIT, contactos, correos, proyectos asignados).
   - Flujo principal: desde `ContractorsPage` se abre el formulario; se diligencian campos obligatorios; al guardar se emite POST/PUT a `/contractors`; backend valida y persiste la información.
   - Flujos alternos: validaciones fallidas (campos obligatorios, formato de correo, correos duplicados) devuelven mensaje de error; si se intenta cambiar nombre con documentos asociados, el campo permanece bloqueado.

2. **Gestionar subcontratistas asociados**
   - Actores: Administrador, Usuario KAPA con permiso de edición.
   - Precondiciones: contratista padre existente y activo.
   - Flujo principal: desde la lista de subcontratistas se crea o edita un registro heredando proyectos del padre; backend verifica que no se superen cinco subcontratistas activos y almacena datos.
   - Flujos alternos: al exceder el límite o registrar correos inválidos se genera error; si el contratista se marca inactivo se permite guardar aunque exista documentación previa.

3. **Consultar catálogo de contratistas**
   - Actores: Administrador, Cliente, Contratista (según permisos de vista).
   - Precondiciones: usuario autenticado con permiso de visualización.
   - Flujo principal: la UI invoca `GET /contractors`; se muestran registros con filtros y ordenamiento.
   - Flujos alternos: si no hay registros, la UI muestra mensaje; errores de servicio retornan alerta.

4. **Obtener proyectos por contratista**
   - Actores: Administrador, Usuario KAPA, Contratista/Subcontratista.
   - Precondiciones: contratista registrado; proyectos asociados en la tabla `project_contractor`.
   - Flujo principal: la SPA llama `GET /contractors/:id/projects`; backend devuelve proyectos en los que participa el contratista.
   - Flujos alternos: contratista sin proyectos → respuesta vacía; ID inexistente → 404.

5. **Enviar resumen de resultados por correo**
   - Actores: Administrador, Usuario KAPA.
   - Precondiciones: existe relación proyecto-contratista; el solicitante proporciona correo destino.
   - Flujo principal: se invoca `POST /contractors/send-results` con `{ projectId, contractorId, email }`; backend calcula porcentajes y envía email con html generado.
   - Flujos alternos: faltan documentos o métricas → igual se envía con valores actuales; inexistencia de relación produce 404; fallos SMTP retornan error.

## Reglas de Negocio
- Todo contratista debe tener al menos un correo válido y único dentro de su lista.
- Los estados permitidos son `active` e `inactive`; usuarios inactivos no se muestran como disponibles para clientes.
- Máximo cinco subcontratistas activos por contratista padre.
- Asignar proyectos es obligatorio; no se permite guardar contratistas sin al menos un proyecto vinculado.
- Eliminación de relaciones proyecto-contratista valida dependencias (criterios, documentos) antes de removerlas.

## Interfaces
- Frontend: `ContractorsPage.vue`, `ContractorForm.vue`, `SubContractorList.vue`, `SimpleCard.vue` (navegación indirecta).
- Servicios: `contractorService.js`, `projectService.js`, `documentService.js`.
- API REST: `/contractors`, `/contractors/:id`, `/contractors/:id/projects`, `/contractors/:id/subContractors`, `/contractors/send-results`.
- Integraciones: `ProjectContractorsService`, `ProjectContractorCriterionsService`, `DocumentService`, utilidad `MailUtil`.

## Tareas Pendientes
- Implementar permisos y guardas en endpoints para respetar `contractor_management`.
- Añadir paginación, filtros avanzados y búsqueda server-side.
- Incorporar carga masiva/importación de contratistas y validaciones de duplicidad por NIT.
- Exponer historial de cambios o auditoría para operaciones de alta/baja.
- Diseñar pruebas funcionales que cubran los casos de uso anteriores.
