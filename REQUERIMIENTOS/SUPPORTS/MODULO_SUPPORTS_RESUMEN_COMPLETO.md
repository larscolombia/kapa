# Módulo Supports - Resumen Ejecutivo

> El módulo Supports mantiene la biblioteca corporativa de “soportes de interés”, habilitando a contratistas e internos a consultar y descargar documentación oficial organizada por categoría.

## Objetivo
- Centralizar documentos institucionales (manuales, apéndices, procedimientos EHS) en un repositorio controlado.
- Simplificar la publicación y actualización ágil de archivos mediante un panel administrativo.
- Garantizar descargas seguras desde el bucket S3 sin exponer credenciales ni rutas directas.

## Alcance
- Carga y actualización de soportes a través del panel “Administrador de Soportes”.
- Organización de archivos por categorías predefinidas y exposición filtrada en el frontend.
- Generación de URLs firmadas para vista previa y descarga.
- Apoyo a cargas desde frontend o clientes externos mediante URLs presignadas de subida.
- Fuera de alcance: versionamiento histórico, aprobaciones múltiples, auditoría detallada de accesos, almacenamiento alternativo fuera de S3.

## KPIs y Métricas
- Número de documentos publicados por categoría y evolución mensual.
- Tiempo promedio de permanencia de un archivo antes de su actualización.
- Disponibilidad de endpoints `/supports` y `/supports/presigned-url` (errores vs. solicitudes).
- Volumen de descargas por archivo/categoría (requiere instrumentación adicional en frontend o logs).

## Dependencias
- AWS S3 (`AWS_REGION`, `AWS_S3_BUCKET`, credenciales) para almacenamiento y presigned URLs.
- Entidad `User` para registrar el autor que publica el documento.
- Guardas de autenticación JWT (`JwtAuthGuard`) para restringir operaciones administrativas.
- Componentes Quasar (`SupportForm`, `FileCard`) y servicios Axios para interacciones de UI.
- Librería `@aws-sdk/client-s3` en backend y fetch directo en frontend para consumo de URLs firmadas.

## Consideraciones Técnicas
- Múltiples endpoints públicos (`/supports`, `/supports/presigned-url`, `/supports/upload`, `/upload/support-file`) requieren controles adicionales si se publica externamente.
- El tamaño máximo de archivo se controla en `UploadController` (50 MB) y en `SupportForm`, pero no se valida al generar URLs presignadas.
- No existe eliminación automática del objeto en S3 al borrar el registro; se acumulan archivos huérfanos si no se gestiona manualmente.
- No hay auditoría de descargas ni logs detallados de creación/edición más allá de timestamps en BD.
- Categorías aceptan valores libres; se han observado datos inconsistentes (`[object Object]`); se recomienda normalizar mediante ENUM o catálogo dedicado.

