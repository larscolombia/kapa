# Módulo Supports

Este directorio centraliza los requerimientos del módulo Supports, responsable de administrar los “soportes de interés” (biblioteca documental) visibles para contratistas y equipos internos dentro de KAPA.

## Estructura

- `MODULO_SUPPORTS_RESUMEN_COMPLETO.md` — Resumen ejecutivo del módulo y su aporte al negocio.
- `MODULO_SUPPORTS_ESPECIFICACION.md` — Casos de uso, reglas de negocio y alcance funcional.
- `MODULO_SUPPORTS_IMPLEMENTACION_BACKEND.md` — Detalle técnico de servicios, integraciones y pendientes de calidad.

## Implementación

- Backend: `../../backend/src/modules/supports/` (`SupportsModule`, `SupportsController`, `UploadController`, `SupportsService`).
- Entidad principal: `../../backend/src/database/entities/support-file.entity.ts` (metadatos del archivo) vinculada a `User` (autor).
- Frontend: páginas `frontend/src/pages/AdminSupportsPage.vue`, `GroupSupportsOfInterestPage.vue`, `SupportsOfInterestPage.vue`, formulario `components/SupportForm.vue` y servicio `services/supportsService.js`/`supportService.js`.
- Utilidades de archivos: `frontend/src/components/FileCard.vue` para previsualizar y `frontend/src/utils/s3Manager.js` para interacciones con S3 en otros contextos.

## Base de Datos

- Tabla `support_file` almacena metadatos (nombre, categoría, ruta S3, tamaño, tipo MIME, usuario creador).
- No existen migraciones recientes en `backend/migrations/`; la definición vive en la entidad y seeds iniciales (`database.sql`).
- Los archivos físicos residen en el bucket S3 (`soportes-de-interes/<categoría>/timestamp_nombre.ext`).

