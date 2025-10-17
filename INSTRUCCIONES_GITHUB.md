# 🔐 Instrucciones Finales para Subir el Proyecto a GitHub

## ✅ Estado Actual

El proyecto KAPA está listo para ser subido al repositorio:
- ✅ Base de datos exportada a `database.sql` (3.7 MB)
- ✅ Archivo `.env.example` creado con todas las variables
- ✅ `.gitignore` configurado correctamente
- ✅ README.md completo con documentación
- ✅ Repositorio Git inicializado
- ✅ Remote configurado: `git@github.com:larscolombia/kapa.git`
- ✅ Commit inicial creado (190 archivos, 47,668 líneas)
- ✅ Clave SSH generada

---

## 🔑 Paso 1: Agregar la Clave SSH a GitHub

Debes agregar esta clave SSH pública a tu cuenta de GitHub:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAo5gJexjrv/7t7Q0LKUFMAWpHGKhQEW2e0hJVI8Rv3H afmartinez@iconoi.com
```

### Pasos en GitHub:

1. Ve a GitHub.com y inicia sesión
2. Click en tu foto de perfil (arriba derecha) → **Settings**
3. En el menú izquierdo → **SSH and GPG keys**
4. Click en **New SSH key**
5. Título: `KAPA Production Server`
6. Key: Pega la clave pública de arriba
7. Click en **Add SSH key**

---

## 🚀 Paso 2: Subir el Código a GitHub

Una vez agregada la clave SSH, ejecuta:

```bash
cd /home/ec2-user/kapa
git push -u origin main
```

Si el repositorio ya existe en GitHub y tiene contenido, usa:

```bash
git push -u origin main --force
```

---

## 📦 Estructura Subida al Repositorio

```
larscolombia/kapa (GitHub)
├── backend/              # API NestJS completa
├── frontend/             # Aplicación Quasar/Vue completa
├── database.sql          # Dump completo de PostgreSQL
├── .env.example          # Template de variables de entorno
├── .gitignore
└── README.md             # Documentación completa
```

---

## 🔒 Archivos EXCLUIDOS del repositorio (por seguridad)

Estos archivos están en `.gitignore` y NO se subirán:

- ❌ `.env` (credenciales reales)
- ❌ `node_modules/`
- ❌ `dist/` y `build/`
- ❌ `.quasar/`
- ❌ `data/` (volúmenes Docker)
- ❌ `docker-compose.yml` (ya no lo usas)

---

## 📋 Variables de Entorno que Necesitarás

### Backend (.env en el servidor nuevo)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=<TU_PASSWORD_SEGURO>
DATABASE_NAME=kapa_db
JWT_SECRET=<GENERA_UN_SECRET_NUEVO>
JWT_EXPIRES_IN=5000s
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=<TU_SENDGRID_API_KEY>
MAIL_FROM=supervisor.documental@kapasas.com
RECAPTCHA_SECRET_KEY=<TU_RECAPTCHA_SECRET>
PORT=3000
URL_FRONT=https://tu-nuevo-dominio.com
```

### Frontend (.env en el servidor nuevo)

```env
VITE_API_URL=https://tu-nuevo-dominio.com/api
VITE_AWS_BUCKET_REGION=us-east-1
VITE_AWS_PUBLIC_KEY=<TU_AWS_KEY>
VITE_AWS_SECRET_KEY_S3=<TU_AWS_SECRET>
VITE_AWS_BUCKET_NAME=<TU_BUCKET>
VITE_RECAPTCHA_SITE_KEY=<TU_RECAPTCHA_SITE_KEY>
```

---

## 🏗️ Despliegue en Nuevo Servidor (Resumen)

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:larscolombia/kapa.git
   cd kapa
   ```

2. **Instalar PostgreSQL y crear la BD:**
   ```bash
   sudo apt install postgresql-14
   sudo -u postgres psql
   CREATE DATABASE kapa_db;
   CREATE USER admin WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE kapa_db TO admin;
   \q
   psql -U admin -d kapa_db -f database.sql
   ```

3. **Configurar Backend:**
   ```bash
   cd backend
   cp ../.env.example .env
   nano .env  # Editar con credenciales reales
   npm install
   npm run build
   pm2 start dist/main.js --name kapa-backend
   ```

4. **Configurar Frontend:**
   ```bash
   cd ../frontend
   nano .env  # Crear y configurar
   npm install
   npm run build
   # Copiar dist/spa/ a /var/www/html o configurar Nginx
   ```

5. **Configurar Nginx** (ver README.md principal)

---

## ⚠️ Importante: Limpieza de Seguridad

Después de confirmar que todo funciona en el nuevo servidor:

1. **Eliminar .env.example del repositorio:**
   ```bash
   cd /home/ec2-user/kapa
   git rm .env.example
   git commit -m "Remove .env.example with sensitive data"
   git push origin main
   ```

2. **Cambiar todas las credenciales:**
   - ✅ Nueva contraseña de base de datos
   - ✅ Nuevo JWT_SECRET
   - ✅ Nueva API key de SendGrid (si es posible)
   - ✅ Rotar credenciales de AWS S3

---

## 📞 Contacto de Soporte

- **Desarrollador:** afmartinez@iconoi.com
- **Repositorio:** https://github.com/larscolombia/kapa

---

## 🎉 ¡Todo Listo!

El proyecto está completamente preparado para:
- ✅ Ser clonado en cualquier servidor
- ✅ Despliegue limpio sin Docker
- ✅ Restauración completa de la base de datos
- ✅ Configuración independiente de servicios

**Próximo paso:** Agregar la clave SSH a GitHub y hacer `git push`
