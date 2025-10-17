# KAPA Frontend - Aplicación Quasar/Vue

Interfaz de usuario para el sistema KAPA de gestión documental.

## 🚀 Stack Tecnológico

- **Framework:** Vue 3 + Quasar v2
- **Lenguaje:** JavaScript (ES6+)
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **UI:** Quasar Material Design
- **Cloud Storage:** AWS SDK v3 (S3)

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crear archivo `.env` en la raíz del frontend:

```env
# Backend API
VITE_API_URL=http://localhost:3000

# AWS S3
VITE_AWS_BUCKET_REGION=us-east-1
VITE_AWS_PUBLIC_KEY=tu_aws_access_key
VITE_AWS_SECRET_KEY_S3=tu_aws_secret_key
VITE_AWS_BUCKET_NAME=tu_bucket_name

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=tu_recaptcha_site_key
```

## 🏃 Ejecutar

### Desarrollo
```bash
npm run dev
```

### Build para Producción
```bash
npm run build
```

Los archivos compilados se generarán en `dist/spa/`

## 📁 Estructura

```
src/
├── pages/              # 17 páginas/vistas
├── components/         # 13 componentes reutilizables
├── layouts/            # Layout principal
├── router/             # Configuración de rutas
├── stores/             # Pinia stores
├── services/           # 11 servicios HTTP
├── composables/        # Composables de Vue
├── boot/              # Plugins de Quasar
└── utils/             # Utilidades (S3Manager)
```

## 🎨 Características

- ✅ Autenticación con JWT
- ✅ Dashboard interactivo
- ✅ Gestión de usuarios y roles
- ✅ Control de proyectos y contratistas
- ✅ Carga de documentos a AWS S3
- ✅ Control de estados de documentos
- ✅ Sistema de notificaciones
- ✅ Responsive design

## 🔐 Rutas Protegidas

Todas las rutas principales requieren autenticación mediante JWT.
Los permisos se validan a nivel de módulo (user_management, project_management, etc.)

## 📱 Build

Para compilar para producción:

```bash
npm run build
```

El resultado estará en `dist/spa/` listo para servir con Nginx u otro servidor web.
