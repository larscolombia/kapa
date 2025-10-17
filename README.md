# 🏗️ KAPA - Sistema de Gestión Documental para Proyectos

> Sistema de gestión y control de cumplimiento documental para proyectos de construcción

[![NestJS](https://img.shields.io/badge/NestJS-v10-E0234E?logo=nestjs)](https://nestjs.com/)
[![Vue 3](https://img.shields.io/badge/Vue.js-v3-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-v2-1976D2?logo=quasar)](https://quasar.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 📋 Descripción

KAPA es una plataforma integral para la gestión y validación de documentación de contratistas en proyectos de construcción. Permite controlar el cumplimiento normativo mediante un sistema estructurado de criterios, subcriterios y documentos con control de vigencia.

### ✨ Características Principales

- 🔐 **Autenticación y Autorización** con JWT y control de permisos por rol (RBAC)
- 👥 **Gestión Multi-Cliente y Multi-Proyecto**
- 📄 **Sistema de Criterios y Subcriterios** personalizables
- 📝 **Control de Documentos** con estados (enviado, aprobado, rechazado, etc.)
- ⏰ **Control de Vigencia** de documentos con alertas
- 👷 **Gestión de Empleados** de contratistas con documentación individual
- ☁️ **Almacenamiento en AWS S3** con URLs firmadas temporales
- 📧 **Notificaciones por Email** (SendGrid/SMTP)
- 📊 **Dashboard de Cumplimiento** con métricas y reportes
- 🔄 **API RESTful** completa y documentada

---

## 🏗️ Arquitectura

```
┌─────────────┐      HTTPS      ┌──────────────┐      HTTP      ┌──────────────┐
│   Cliente   │ ◄────────────► │   Frontend   │ ◄────────────► │   Backend    │
│  (Browser)  │                │  (Quasar)    │                │  (NestJS)    │
└─────────────┘                └──────────────┘                └──────┬───────┘
                                                                       │
                                                                       ▼
                                                              ┌─────────────────┐
                                                              │   PostgreSQL    │
                                                              └─────────────────┘
                                                                       ▲
                                                                       │
                                                              ┌─────────────────┐
                                                              │     AWS S3      │
                                                              └─────────────────┘
```

### Stack Tecnológico

#### Backend
- **Framework:** NestJS v10 (Node.js)
- **Lenguaje:** TypeScript 5.1
- **ORM:** TypeORM
- **Autenticación:** Passport (JWT + Local Strategy)
- **Base de Datos:** PostgreSQL 14
- **Email:** Nodemailer + SendGrid
- **Testing:** Jest

#### Frontend
- **Framework:** Vue 3 + Quasar v2
- **Lenguaje:** JavaScript (ES6+)
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **UI Components:** Quasar Material Design
- **Cloud Storage:** AWS SDK v3 (S3)
- **Seguridad:** Vue reCAPTCHA v3

---

## 📂 Estructura del Proyecto

```
kapa/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Módulos funcionales (12 módulos)
│   │   │   ├── auth/          # Autenticación JWT
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── roles/         # Roles y permisos
│   │   │   ├── clients/       # Clientes
│   │   │   ├── projects/      # Proyectos
│   │   │   ├── contractors/   # Contratistas
│   │   │   ├── employees/     # Empleados
│   │   │   ├── criterion/     # Criterios
│   │   │   ├── subcriterion/  # Subcriterios
│   │   │   ├── documents/     # Documentos
│   │   │   ├── project-contractors/
│   │   │   └── project-contractor-criterions/
│   │   ├── database/          # Entidades y configuración DB
│   │   ├── common/            # Guards, decorators, utils
│   │   └── main.ts            # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Aplicación Quasar/Vue
│   ├── src/
│   │   ├── pages/            # 17 páginas/vistas
│   │   ├── components/       # 13 componentes reutilizables
│   │   ├── layouts/          # Layout principal
│   │   ├── router/           # Configuración de rutas
│   │   ├── stores/           # Pinia stores
│   │   ├── services/         # 11 servicios HTTP
│   │   ├── composables/      # Composables de Vue
│   │   ├── boot/             # Plugins de Quasar
│   │   └── utils/            # Utilidades (S3Manager)
│   ├── package.json
│   └── quasar.config.js
│
├── database.sql              # Dump completo de PostgreSQL
├── .env.example              # Variables de entorno (template)
├── .gitignore
└── README.md                 # Este archivo
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js:** v18+ o v20+
- **PostgreSQL:** 14+
- **npm:** 6.13.4+
- **AWS Account:** Para S3 (opcional en desarrollo)
- **SendGrid Account:** Para emails (opcional en desarrollo)

### 1. Clonar el Repositorio

```bash
git clone git@github.com:larscolombia/kapa.git
cd kapa
```

### 2. Configurar Base de Datos

#### Crear Base de Datos PostgreSQL

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos y usuario
CREATE DATABASE kapa_db;
CREATE USER admin WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE kapa_db TO admin;
\q
```

#### Importar Datos

```bash
psql -U admin -d kapa_db -f database.sql
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

#### Variables de Entorno Requeridas

```env
# Backend Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=tu_password_seguro
DATABASE_NAME=kapa_db

# JWT
JWT_SECRET=genera_un_secret_seguro_aqui
JWT_EXPIRES_IN=5000s

# Email (SendGrid)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=tu_sendgrid_api_key
MAIL_FROM=tu_email@dominio.com

# reCAPTCHA
RECAPTCHA_SECRET_KEY=tu_recaptcha_secret_key

# Server
PORT=3000
URL_FRONT=https://tu-dominio.com
```

#### Variables de Entorno del Frontend

Crear archivo `frontend/.env`:

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

### 4. Instalar Dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 5. Ejecutar en Desarrollo

#### Backend (Terminal 1)

```bash
cd backend
npm run start:dev
```

El backend estará disponible en: `http://localhost:3000`

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:8080` (o el puerto que asigne Quasar)

---

## 🏭 Despliegue en Producción

### Opción 1: Servidor VPS/Dedicado (Recomendado)

#### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL 14
sudo apt install postgresql-14 postgresql-contrib

# Instalar Nginx
sudo apt install nginx

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

#### 2. Configurar PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE kapa_db;
CREATE USER admin WITH PASSWORD 'password_produccion_seguro';
GRANT ALL PRIVILEGES ON DATABASE kapa_db TO admin;
\q

# Importar datos
psql -U admin -d kapa_db -f database.sql
```

#### 3. Configurar y Compilar Backend

```bash
cd /var/www/kapa/backend

# Configurar .env con credenciales de producción
nano .env

# Instalar dependencias
npm install --production

# Compilar TypeScript
npm run build

# Iniciar con PM2
pm2 start dist/main.js --name kapa-backend
pm2 save
pm2 startup
```

#### 4. Configurar y Compilar Frontend

```bash
cd /var/www/kapa/frontend

# Configurar variables de entorno
nano .env

# Instalar dependencias y compilar
npm install
npm run build

# Los archivos compilados estarán en dist/spa/
```

#### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/kapa
```

```nginx
# Configuración para KAPA
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend (SPA)
    location / {
        root /var/www/kapa/frontend/dist/spa;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/kapa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Configurar SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### Opción 2: Docker (Alternativa)

Si prefieres usar Docker (aunque mencionaste que no), está disponible en la rama `docker` del repositorio.

---

## 📚 Módulos del Sistema

### Backend (12 Módulos)

| Módulo | Descripción |
|--------|-------------|
| **auth** | Autenticación JWT, login, recuperación de contraseña |
| **users** | CRUD de usuarios del sistema |
| **roles** | Gestión de roles y permisos (RBAC) |
| **clients** | Gestión de empresas clientes |
| **projects** | Proyectos de construcción |
| **contractors** | Contratistas y subcontratistas |
| **employees** | Empleados de contratistas |
| **criterion** | Criterios de cumplimiento |
| **subcriterion** | Subcriterios de evaluación |
| **documents** | Documentos con estados y vigencia |
| **project-contractors** | Asignación de contratistas a proyectos |
| **project-contractor-criterions** | Criterios por contratista en proyecto |

### Entidades de Base de Datos (14 Entidades)

1. `User` - Usuarios del sistema
2. `Role` - Roles y permisos
3. `Access` - Permisos de módulo
4. `Client` - Clientes
5. `Project` - Proyectos
6. `Contractor` - Contratistas
7. `ContractorEmail` - Emails para notificaciones
8. `Employee` - Empleados
9. `Criterion` - Criterios
10. `Subcriterion` - Subcriterios
11. `DocumentType` - Tipos de documentos
12. `Document` - Documentos
13. `ProjectContractor` - Relación proyecto-contratista
14. `ProjectContractorCriterion` - Criterios asignados

---

## 🔐 Sistema de Autenticación y Permisos

### Autenticación

- **Estrategia:** JWT (JSON Web Tokens)
- **Guards:** JwtAuthGuard, LocalAuthGuard
- **Tiempo de expiración:** Configurable (default: 5000s)
- **Recuperación de contraseña:** Vía email con token temporal

### Sistema de Permisos (RBAC)

```typescript
// Estructura de Access
{
  module_name: string,  // ej: "user_management", "project_management"
  can_view: boolean,    // Permiso de lectura
  can_edit: boolean,    // Permiso de escritura
  role: Role           // Relación con rol
}
```

### Roles Predefinidos

- **Super Admin:** Acceso total
- **Administrador de Proyecto:** Gestión de proyectos y contratistas
- **Supervisor:** Revisión y aprobación de documentos
- **Contratista:** Carga de documentos

---

## 📄 Flujo de Documentación

```
1. Cliente → Crea Proyecto
2. Proyecto → Asigna Contratistas
3. Contratista → Debe cumplir Criterios específicos
4. Criterio → Contiene Subcriterios
5. Subcriterio → Requiere Documentos
6. Documento → Estados:
   - not_submitted (No enviado)
   - submitted (Enviado)
   - approved (Aprobado)
   - rejected (Rechazado)
   - for_adjustment (Para ajustar)
   - not_applicable (No aplica)
7. Documento → Vigencia (startDate, endDate)
8. Sistema → Notifica vencimientos y cambios de estado
```

---

## 📧 Sistema de Notificaciones

- **Proveedor:** SendGrid (SMTP)
- **Eventos notificados:**
  - Cambios de estado de documentos
  - Documentos próximos a vencer
  - Documentos rechazados
  - Recuperación de contraseña
  - Nuevas asignaciones de proyectos

---

## ☁️ Integración AWS S3

### Configuración

```javascript
// Frontend: src/utils/s3Manager.js
- Upload de archivos
- Generación de URLs firmadas (5 min)
- Eliminación de archivos
- Gestión por carpetas
```

### Estructura de Carpetas en S3

```
bucket-name/
├── projects/
│   ├── {project_id}/
│   │   ├── contractors/
│   │   │   ├── {contractor_id}/
│   │   │   │   ├── documents/
│   │   │   │   │   └── {document_name}
│   │   │   │   └── employees/
│   │   │   │       └── {employee_id}/
│   │   │   │           └── {document_name}
```

---

## 🧪 Testing

### Backend

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 📊 API Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil
- `GET /auth/permissions` - Obtener permisos

### Usuarios
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Proyectos
- `GET /projects` - Listar proyectos
- `POST /projects` - Crear proyecto
- `GET /projects/:id` - Obtener proyecto
- `PUT /projects/:id` - Actualizar proyecto

### Documentos
- `GET /documents` - Listar documentos
- `POST /documents` - Crear documento
- `PUT /documents/:id` - Actualizar documento
- `PATCH /documents/:id/status` - Cambiar estado

*(Ver documentación completa de API en `/backend/docs`)*

---

## 🔧 Comandos Útiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Linting
npm run lint

# Formateo
npm run format
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Linting
npm run lint

# Formateo
npm run format
```

---

## 🐛 Troubleshooting

### Error de Conexión a Base de Datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### Error de CORS

Asegúrate de configurar correctamente `URL_FRONT` en el backend `.env`:

```env
URL_FRONT=https://tu-dominio.com
```

### Errores de AWS S3

Verifica las credenciales en `frontend/.env`:

```env
VITE_AWS_BUCKET_REGION=us-east-1
VITE_AWS_PUBLIC_KEY=...
VITE_AWS_SECRET_KEY_S3=...
```

---

## 📝 Notas de Seguridad

⚠️ **IMPORTANTE:**

1. **Nunca** commitees el archivo `.env` al repositorio
2. Cambia todas las contraseñas y secrets en producción
3. Usa HTTPS en producción (Let's Encrypt)
4. Configura firewall (UFW) en el servidor
5. Mantén Node.js y dependencias actualizadas
6. Habilita backups automáticos de PostgreSQL
7. Usa variables de entorno para todas las credenciales
8. Configura rate limiting en Nginx

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y propietario de LARS Colombia.

---

## 👥 Contacto

- **Desarrollador:** afmartinez@iconoi.com
- **Repositorio:** https://github.com/larscolombia/kapa

---

## 🔄 Changelog

### v0.0.1 (Actual)
- ✅ Sistema base de autenticación y autorización
- ✅ CRUD completo de entidades principales
- ✅ Sistema de documentación con estados
- ✅ Integración con AWS S3
- ✅ Sistema de notificaciones por email
- ✅ Control de vigencia de documentos

---

**¡Listo para desplegar! 🚀**
