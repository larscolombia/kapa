# Deployment Guide - KAPA Project

## Configuración del Servidor

### Estructura del Proyecto
- **Frontend**: `/var/www/kapa.healtheworld.com.co/frontend/dist/spa` (aplicación Quasar compilada)
- **Backend**: `/var/www/kapa.healtheworld.com.co/backend` (API NestJS)
- **Base de Datos**: PostgreSQL (`kapa_db`)

### Servicios Configurados

#### 1. Apache Virtual Hosts
- **HTTP**: `/etc/apache2/sites-available/kapa.healtheworld.com.co.conf`
- **HTTPS**: `/etc/apache2/sites-available/kapa.healtheworld.com.co-le-ssl.conf`
- **Dominio**: `https://kapa.healtheworld.com.co`

#### 2. Backend Service (systemd)
- **Archivo**: `/etc/systemd/system/kapa-backend.service`
- **Puerto**: 3001
- **Usuario**: root
- **Status**: `systemctl status kapa-backend.service`

#### 3. Base de Datos PostgreSQL
- **Base de datos**: `kapa_db`
- **Usuario**: `admin`
- **Contraseña**: `SECURE_KAPA_DB_PASS`

### Variables de Entorno (.env)

```env
# Backend configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=SECURE_KAPA_DB_PASS
DATABASE_NAME=kapa_db

# JWT Configuration
JWT_SECRET=CHANGE_THIS_JWT_SECRET_MINIMUM_32_CHARACTERS_REQUIRED
JWT_EXPIRES_IN=5000s

# Email Configuration (SendGrid SMTP)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=CHANGE_THIS_SENDGRID_API_KEY
MAIL_FROM=admin@healtheworld.com.co

# reCAPTCHA
RECAPTCHA_SECRET_KEY=CHANGE_THIS_RECAPTCHA_SECRET_KEY

# Server Configuration
PORT=3001
URL_FRONT=https://kapa.healtheworld.com.co
```

### Comandos de Administración

#### Backend Service
```bash
# Iniciar el servicio
systemctl start kapa-backend.service

# Detener el servicio
systemctl stop kapa-backend.service

# Reiniciar el servicio
systemctl restart kapa-backend.service

# Ver estado
systemctl status kapa-backend.service

# Ver logs
journalctl -u kapa-backend.service -f
```

#### Frontend Build
```bash
cd /var/www/kapa.healtheworld.com.co/frontend
npm run build
```

#### Backend Build
```bash
cd /var/www/kapa.healtheworld.com.co/backend
npm run build
```

### URLs de Acceso
- **Frontend**: https://kapa.healtheworld.com.co
- **API**: https://kapa.healtheworld.com.co/api/

### Pendientes de Configuración
1. Configurar JWT_SECRET con un valor seguro
2. Configurar SendGrid API key para notificaciones por email
3. Configurar reCAPTCHA secret key
4. Configurar AWS S3 para almacenamiento de archivos (si es necesario)

### SSL Certificate
- Certificado SSL configurado con Let's Encrypt
- Renovación automática configurada
- Válido hasta: 2026-01-15
