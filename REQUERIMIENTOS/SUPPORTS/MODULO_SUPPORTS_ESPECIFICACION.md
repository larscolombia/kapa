# Módulo Supports - Especificación Funcional

## Descripción General
- Administra la librería de documentos corporativos que deben estar disponibles para contratistas y usuarios internos.
- Ofrece un panel administrativo para crear, editar y eliminar soportes clasificados por categoría.
- Expone un catálogo público para consulta/descarga y un mecanismo de URLs firmadas para asegurar el acceso controlado a archivos alojados en S3.

## Casos de Uso

1. **Publicar nuevo soporte**
    - Actores: Administrador de soportes (permiso `supports_management` con `can_edit`).
    - Precondiciones: Usuario autenticado, archivo válido (<= 50 MB, formato permitido), categoría definida.
    - Flujo principal:
       1. El administrador abre “Administrador de Soportes” y selecciona “Agregar Soporte”.
       2. Completa título, categoría y adjunta archivo desde el formulario.
       3. El frontend sube el archivo vía `/upload-support-file` (middleware Express) o `supports/upload` y registra metadatos con `POST /supports`.
       4. El soporte queda visible para usuarios filtrando por la categoría correspondiente.
    - Flujos alternos:
       - Si el archivo supera 50 MB o no es un formato permitido, se bloquea en UI y el backend devuelve error.
       - Fallos en subida a S3 abortan la creación; no se crea registro en BD.

2. **Generar URL de subida desde sistemas externos**
    - Actores: Integración externa autorizada.
    - Precondiciones: Conocer nombre de archivo y categoría destino.
    - Flujo principal:
       1. Se llama `POST /supports/generate-upload-url` o `/upload/generate-url` con `fileName` y `category`.
       2. El backend retorna `uploadUrl` y `fileKey` presignados.
       3. El cliente carga el archivo directamente a S3 usando `PUT` sobre `uploadUrl`.
       4. Posteriormente se invoca `POST /supports` para persistir metadatos en BD.
    - Flujos alternos:
       - Si faltan parámetros, se devuelve `400`.
       - No hay autenticación, por lo que cualquiera puede solicitar URLs; se debe restringir en infraestructura.

3. **Consultar biblioteca por categoría**
    - Actores: Contratista, Auditor, Usuario interno.
    - Precondiciones: Sesión iniciada (UI requiere autenticación) o acceso público (API permite GET sin token).
    - Flujo principal:
       1. El usuario navega a “Soportes de interés” y selecciona una división.
       2. El frontend llama `GET /supports?category=X`.
       3. Los archivos se muestran como tarjetas (`FileCard`) con acciones de vista previa y descarga.
    - Flujos alternos:
       - Si la categoría no existe se retorna arreglo vacío.
       - Categorías múltiples (p.ej. `ehs-procedures-standards`) requieren múltiples llamados en la UI.

4. **Descargar / Previsualizar soporte**
    - Actores: Todos los usuarios con acceso al frontend.
    - Precondiciones: Archivo registrado con `file_path` válido en S3.
    - Flujo principal:
       1. Al seleccionar “Vista previa” o “Descargar”, el frontend solicita `GET /supports/presigned-url/:fileKey` con `disposition`.
       2. El backend decodifica el key, genera URL válida 1h y la devuelve.
       3. El navegador abre el archivo (inline) o inicia descarga.
    - Flujos alternos:
       - Si el objeto no existe en S3 se devuelve error genérico; la UI debe manejarlo.

5. **Editar/Eliminar soporte existente**
    - Actores: Administrador de soportes.
    - Precondiciones: Soporte existente.
    - Flujo principal:
       1. Desde el listado se selecciona editar/eliminar.
       2. Para editar, se actualizan campos (sin cambiar archivo) mediante `PUT /supports/:id`.
       3. Para eliminar, se llama `DELETE /supports/:id` y se remueve el registro.
    - Flujos alternos:
       - La eliminación no borra el archivo en S3; debe hacerse manualmente para evitar basura.

## Reglas de Negocio
- Campos obligatorios para crear: `name`, `display_name`, `category`, `file_path`.
- Categorías válidas utilizadas actualmente: `apendices`, `manual_contratistas`, `procedimientos`, `estandares`, `otros`; sin embargo, la validación es laxa (string libre).
- Tamaño máximo de archivo: 50 MB (controlado en UploadController y QFile).
- Tipos de archivo permitidos: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, imágenes (JPG, PNG, GIF), TXT, ZIP/RAR (sólo para carga directa en `SupportsService`), aunque el filtro UI no contempla comprimidos.
- URLs presignadas expiran: 15 min (subida), 1 hora (descarga/preview).
- El orden de presentación se hace por categoría (asc) y nombre display (asc) o fecha de creación en panel.
- Campo `file_size` se guarda en MB cuando se sube desde backend (`uploadFileToS3`) pero en bytes cuando proviene del formulario; se requiere estandarización.

## Interfaces
- Panel administrador: `frontend/src/pages/AdminSupportsPage.vue` con tabla Quasar y formulario modal `components/SupportForm.vue`.
- Catálogo público: `frontend/src/pages/GroupSupportsOfInterestPage.vue` y `SupportsOfInterestPage.vue`.
- Servicio Axios: `frontend/src/services/supportsService.js` y `supportService.js` (doble naming) manejan CRUD y categorías.
- API REST expuesta:
   - `GET /supports`, `GET /supports?category=...`, `GET /supports/categories`.
   - `POST /supports`, `PUT /supports/:id`, `DELETE /supports/:id`.
   - `GET /supports/presigned-url/:fileKey`, `GET /supports/upload-url` (query), `POST /supports/generate-upload-url`.
   - `POST /supports/upload` (con interceptor de archivo).
   - `POST /upload/support-file` y `POST /upload/generate-url` (alias legacy para el mismo flujo).
- Integración con `FileCard.vue` para preview/descarga usando presigned URLs.

## Tareas Pendientes
- Unificar endpoints de subida (duplicidad entre `/supports/upload` y `/upload/support-file`) y exponer sólo la variante preferida.
- Implementar eliminación del objeto en S3 cuando se borra el registro en BD.
- Asegurar autenticación/autorización en endpoints de creación/actualización/eliminación y limitar el acceso público a lo necesario.
- Normalizar categorías (enum en base de datos o tabla maestra) y validar en backend.
- Corregir inconsistencia de unidades `file_size` (bytes vs MB) y mostrar valor uniforme en UI.
- Agregar auditoría (quién sube/edita/elimina) y métricas de descarga.
- Automatizar pruebas unitarias/e2e para los flujos principales y validaciones.

