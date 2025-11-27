# Módulo Supports - Implementación Backend

## Arquitectura
- Código en `backend/src/modules/supports/` compuesto por:
	- `SupportsModule`: importa `TypeOrmModule.forFeature([SupportFile])` y registra `SupportsController`, `UploadController`, `SupportsService`.
	- `SupportsController`: APIs REST para CRUD, presigned URLs y subida de archivos (con `FileInterceptor`).
	- `UploadController`: endpoints alternativos (`/upload/support-file`, `/upload/generate-url`) usados por integraciones existentes.
	- `SupportsService`: encapsula lógica con repositorio `SupportFile` y cliente AWS S3.
- Entidad `SupportFile` (`support-file.entity.ts`) define metadatos: nombre, display, categoría, ruta S3, tamaño, MIME y `created_by_user`.

## Endpoints / Servicios
- `GET /supports` (público) — lista todos los soportes ordenados por categoría/nombre; admite filtro `?category=`.
- `GET /supports/categories` (público) — devuelve listado de categorías distintas mediante `DISTINCT`.
- `GET /supports/presigned-url/:fileKey` (público) — genera URL de descarga/vista previa (`disposition` opcional).
- `GET /supports/upload-url?fileName&category` (público) — retorna URL presignada de subida (PUT) y `fileKey`.
- `POST /supports` — crea registro; también se usa con `requestType=generateUploadUrl` para devolver URL de subida.
- `POST /supports/upload` (público, `FileInterceptor`) — recibe archivo binario, lo sube a S3 y crea metadatos.
- `POST /supports/generate-upload-url` (público) — variante para obtener presigned URL via body.
- `PUT /supports/:id` — actualiza metadatos existentes.
- `DELETE /supports/:id` — elimina registro (no borra archivo en S3).
- `GET /supports/:id` — obtiene soporte específico.
- `POST /upload/support-file` y `POST /upload/generate-url` — endpoints legacy con lógica equivalente a los anteriores.

## Flujos Clave
- **Listado y filtrado**: `getSupportFiles()` y `getSupportFilesByCategory()` consultan repositorio con relación `created_by_user`, ordenando resultados.
- **Creación de soporte**:
	1. Validaciones básicas (`validateSupportFileRequiredFields`): requiere `name`, `display_name`, `category`, `file_path`.
	2. Si se sube vía `supports/upload` o `upload/support-file`, se genera key `soportes-de-interes/<category>/<timestamp>_<sanitizedName>` y se envía a S3 con `PutObjectCommand` (encriptación AES256).
	3. Se persiste metadata en BD y retorna entidad completa.
- **Presigned URLs**:
	- Descarga: `getPresignedUrl` construye `GetObjectCommand` con `ResponseContentDisposition` según `disposition`; expira en 1 hora.
	- Subida: `getPresignedUploadUrl` crea `PutObjectCommand`, expira en 15 min.
- **Actualización**: `updateSupportFile` obtiene la entidad, revalida campos y aplica `merge`. No recalcúla S3.
- **Eliminación**: `deleteSupportFile` borra registro en BD pero no interactúa con S3 (riesgo de archivos huérfanos).

## Seguridad y Permisos
- `SupportsController` aplica `@UseGuards(JwtAuthGuard)` a nivel clase, pero varios endpoints están anotados con `@Public()` (incluyendo listados, presigned URLs y subida). Esto implica que cualquier actor puede subir/crear registros si conoce las rutas.
- No se valida el permiso funcional `supports_management`; se asume control desde frontend.
- `UploadController` también es `@Public()` para ambos endpoints.
- Falta rate limiting/logging para URLs presignadas; potencial abuso.

## Integraciones
- AWS S3 vía `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`; requiere variables `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- Relación con `User` para `created_by_user` (no obligatoria; se permite `null`).
- Frontend consume endpoints a través de servicios `supportService.js`/`supportsService.js` y componentes Quasar (`SupportForm`, `FileCard`).
- Otros módulos reutilizan presigned URL pattern (Documents) — consistencia deseable.

## Pruebas
- `supports.service.spec.ts` sólo verifica creación del servicio; sin casos reales.
- Pruebas unitarias necesarias:
	- `uploadFileToS3` (nombre generado, manejo de excepciones).
	- `getPresignedUrl` / `getPresignedUploadUrl` (disposition, expiración, errores).
	- `validateSupportFileRequiredFields` y manejo de duplicados.
	- `getCategories` (DISTINCT).
- Pruebas e2e: flujo básico de creación (subida + registro), actualización, eliminación y consulta por categoría.
- Tests de integración con S3 deberían usar mocks para evitar costo/dep encia externa; verificar manejo de errores 4xx/5xx.

