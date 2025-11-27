# Módulo Documents - Especificación Funcional

## Descripción General
- Gestiona el ciclo de vida de los documentos requeridos por criterio/subcriterio en cada relación proyecto–contratista.
- Opera como fuente de verdad de estados y comentarios, alimentando métricas de cumplimiento (porcentaje de cargue, aprobación, rechazos) en otros módulos.
- Apoya el intercambio seguro de archivos mediante enlaces firmados y notifica a los actores responsables cuando existen cargas pendientes de revisión.

## Casos de Uso

1. **Cargar documento de soporte**
    - Actores: Contratista, Coordinador interno.
    - Precondiciones: Sesión iniciada, subcriterio habilitado, conexión con AWS S3 configurada.
    - Flujo principal:
       1. El usuario selecciona subcriterio desde `SubCriterionCard.vue`.
       2. Elige archivo y define fechas (vigencia) si aplica.
       3. El frontend sube el archivo a S3 usando `S3Manager.writeFile()` y genera nombre normalizado.
       4. Se invoca `POST /document` para registrar metadata en BD con estado `submitted`.
       5. El servicio recalcula porcentajes de completitud y registra auditoría con estado inicial.
    - Flujos alternos:
       - Si la subida a S3 falla, el archivo no se registra; se muestra mensaje de error.
       - Si falta información obligatoria (nombre, estado, relaciones), el backend responde `400`.

2. **Revisión y cambio de estado**
    - Actores: Analista de cumplimiento.
    - Precondiciones: Documento existente en estado `submitted` o `for_adjustment`.
    - Flujo principal:
       1. El analista abre el documento, revisa la evidencia y agrega comentarios.
       2. Actualiza el estado (`approved`, `rejected`, `not_applicable`, `for_adjustment`).
       3. `PUT /document` persiste el cambio, calcula horas transcurridas desde el estado anterior y crea registro en `document_state_audit`.
       4. Se recalculan porcentajes por criterio y project-contractor.
    - Flujos alternos:
       - Si no existe documento, retorna `404`.
       - Si el estado no cambia, no se crea auditoría y solo se guardan comentarios.

3. **Descargar/Vista previa segura**
    - Actores: Cualquier usuario autorizado (interno o contratista).
    - Precondiciones: Documento registrado con `name` que referencia un objeto S3.
    - Flujo principal:
       1. Desde la UI se solicita vista previa/descarga.
       2. El frontend usa `GET /document/presigned-url/:fileKey` (public) indicando `disposition`.
       3. El backend genera URL firmada (expira en 1 hora) y la retorna.
       4. El navegador abre iframe (inline) o descarga (attachment).
    - Flujos alternos:
       - Si el archivo no existe en S3 se alerta en UI y se habilita re-cargue manual.

4. **Enviar notificación de cargue**
    - Actores: Coordinador de proyecto.
    - Precondiciones: Project-contractor con documentos en estado `submitted`.
    - Flujo principal:
       1. Se invoca `/document/send-notification` indicando proyecto, contratista y correo destino.
       2. El servicio valida existencia de relación y documentos pendientes.
       3. Se construye HTML con criterios/subcriterios y porcentaje de completitud.
       4. `MailUtil` envía correo con el resumen.
    - Flujos alternos:
       - Si no hay documentos cargados, retorna respuesta `type: error` sin enviar correo.

5. **Monitorear vencimientos próximos**
    - Actores: Job programado o usuario manual.
    - Precondiciones: Documentos con `endDate` definido.
    - Flujo principal:
       1. Se ejecuta `POST /document/getDocumentsCloseToEndDate`.
       2. El servicio consulta documentos cuya vigencia vence en los próximos 7 días.
       3. Retorna lista enriquecida (proyecto, contratista, empleado, subcriterio) para acción manual.

## Reglas de Negocio
- Estados válidos: `not_submitted`, `submitted`, `approved`, `rejected`, `not_applicable`, `for_adjustment`; transiciones deben registrarse en auditoría.
- Los subcriterios con `employee_required = true` demandan un documento por empleado; los porcentajes consideran multiplicidad.
- Nombres de archivo se normalizan (`<nombre>_YYYY-MM-DD_HH-mm-ss.ext`) y se recortan a 240 caracteres para evitar límites S3/DB.
- `time_in_previous_state_hours` se calcula como diferencia entre el último evento y la actualización actual (en horas enteras).
- Las notificaciones sólo se envían si existe al menos un documento `submitted`; de lo contrario se notifica error.
- Los porcentajes de aprobación/completitud excluyen documentos `not_applicable` del denominador.
- Las fechas `startDate`/`endDate` se almacenan en DB; si `endDate` < hoy, se considera documento vencido.

## Interfaces
- UI principal: `SubCriterionCard.vue` (gestiona upload, estado y descargas por subcriterio) y `FileCard.vue` (vista individual de archivo).
- Formularios auxiliares: `ContractorForm.vue`, `ProjectForm.vue`, `EmployeesPage.vue` consumen servicios para mostrar documentos relacionados.
- Composable: `useDocument.js` centraliza lógica de subida, verificación, descarga y eliminación.
- Servicios REST consumidos:
   - `GET /document` (listado general) y variantes por subcriterio, empleado, project-contractor, proyecto o contratista.
   - `POST /document`, `PUT /document`, `DELETE /document/:id`.
   - `POST /document/send-notification`, `POST /document/getDocumentsCloseToEndDate`.
   - `PUT /document/project-contractor/:id/uploaded-percentage` y `PUT /document/project-contractors/:id/uploaded-all-percentages` para recalcular métricas en lote.
- Integración S3: frontend utiliza `S3Manager` (AWS SDK v3) para subir/borrar archivos; backend genera URLs firmadas para descarga/preview.

## Tareas Pendientes
- Agregar guardas `JwtAuthGuard` y validación de permisos específicos en endpoints sensibles (lista, creación, actualización, eliminación).
- Implementar manejo transaccional o compensación entre subida a S3 y persistencia en BD para evitar referencias huérfanas.
- Validar límites de tamaño/tipo de archivo en backend (actualmente sólo se controla en UI).
- Internacionalizar mensajes y responder con códigos/mensajes consistentes para errores recurrentes.
- Automatizar pruebas unitarias/e2e de flujos críticos: cálculo de porcentajes, auditoría de estados, generación de presigned URL y envío de notificaciones.
- Evaluar paginación/filtros avanzados en `GET /document` para evitar respuestas pesadas en entornos con muchos archivos.

