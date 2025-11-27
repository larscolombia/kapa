# 🔐 Módulo Users - Resumen Ejecutivo Completo

**Estado:** ✅ COMPLETAMENTE OPERACIONAL  
**Última actualización:** 8 de Noviembre, 2025

---

## 📊 Propósito y Valor de Negocio

El módulo **Users** es el corazón de la gestión de identidades en KAPA. Centraliza credenciales de usuarios, políticas de seguridad de contraseñas, recuperación de acceso, y la integración fundamental con el sistema de autenticación JWT que protege todos los recursos de la plataforma.

**Valor aportado:**
- ✅ Control de acceso: solo usuarios válidos pueden operar
- ✅ Auditoría de actores: trazabilidad de quién hizo qué
- ✅ Recuperación de acceso: reducción de bloqueos permanentes
- ✅ Cumplimiento normativo: gestión de estados y políticas
- ✅ Seguridad: contraseñas hasheadas con bcrypt, tokens JWT con TTL

---

## 🎯 Objetivo General

Proveer un sistema robusto de gestión de usuarios que:
1. **Centralice credenciales** en una tabla única con validaciones estrictas
2. **Enforce políticas de seguridad** (complejidad de password, cambio requerido)
3. **Habilite recuperación segura** mediante tokens con expiración
4. **Integre con Auth** para generar/validar sesiones JWT
5. **Audite cambios** de usuarios y permisos

---

## 📋 Alcance Funcional

### ✅ INCLUIDO

| Funcionalidad | Detalles |
|---|---|
| **Crear usuario** | Validación de campos, hash bcrypt, asignación de rol |
| **Listar usuarios** | Filtro por rol, estados (activo/inactivo), sin exponer passwords |
| **Obtener usuario** | By ID o by email, sin password en respuesta |
| **Actualizar usuario** | Name, role, state; revalidación de email único |
| **Eliminar usuario** | Soft delete mediante cambio de estado a `inactive` |
| **Cambiar contraseña** | Solo si usuario autenticado, revalidación de complejidad |
| **Olvidé contraseña** | Generación de token temporal, envío por email |
| **Restaurar contraseña** | Validación de token + expiración, reset con nueva password |
| **Listar correos Kapa** | Emails de usuarios role_id 1 o 2 (admin, coordinador) |
| **Validación de email único** | Previene duplicados en creación/actualización |
| **Políticas de password** | Mín. 8 caracteres, 1 mayúscula, 1 carácter especial |

### ❌ FUERA DE ALCANCE

- Two-factor authentication (2FA)
- OAuth/SSO externo (Google, Microsoft)
- Desactivación automática por inactividad
- Cambios de email con verificación
- Historial de cambios de contraseña
- Expiración forzada de contraseñas

---

## 📈 KPIs y Métricas

| Métrica | Objetivo | Frecuencia |
|---|---|---|
| Tiempo respuesta `POST /users` | < 500ms | Por creación |
| Usuarios activos | Registrado en logs | Diario |
| Reseteos de password exitosos | > 95% | Semanal |
| Intentos fallidos de login | Monitoreado (futuro) | Real-time |
| Validación de email único | 100% | Por transacción |
| Compliance de password policy | 100% | En cada creación/reset |

---

## 🔗 Dependencias Externas

### Módulos internos
- **Auth Module:** Extrae claims del JWT para identificar usuario actual
- **Roles Module:** Define permisos y visibilidad mediante `role_id`
- **Mail Util:** `MailUtil.sendMail()` para envío de correos de recuperación
- **Guards:** `JwtAuthGuard` protege endpoints autenticados

### Librerías externas
- **bcrypt:** Hash seguro de contraseñas (gensalt + hash)
- **crypto:** Generación de tokens aleatorios con `randomBytes(32).toString('hex')`
- **TypeORM:** ORM para operaciones CRUD con validaciones en BD

### Integraciones
- **Servicio SMTP:** Variables `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` para envío de emails
- **JWT Secret:** `JWT_SECRET` para validación de tokens
- **Frontend URL:** `URL_FRONT` para linkeo en correos de reseteo (pendiente mejor manejo)

---

## 🔧 Consideraciones Técnicas

### Arquitectura
- **Monolito NestJS:** Un único `UsersService` concentra toda la lógica
- **Eager loading:** `User.role` cargado automáticamente en queries
- **No cascada:** Al eliminar un usuario, sus documentos/auditorías no se borran

### Seguridad
- **Passwords nunca en respuesta:** `getUserWithoutPassword()` excluye `password`, `reset_password_expires`, `reset_password_token`
- **Tokens temporal limitado:** Reset tokens expiran en 1 hora
- **One-time use recomendado:** El token no se invalida después de uso (riesgo potencial)
- **Email único:** Constraint `UNIQUE(email)` a nivel DB

### Performance
- **No índices adicionales:** Performance OK con tabla pequeña (< 1000 usuarios típico)
- **Queries simples:** Findby ID/email sin JOINs complejos
- **Posible optimización:** Caché de roles si el módulo crece

### Deuda técnica
- **TODO en código:** URL fronted hardcodeada en servicio (mejorable via config)
- **Sin auditoría de cambios:** No se registra quién cambió quién
- **Validación débil de email:** Regex simple, no verifica deliverability
- **Manejo de excepciones genérico:** Algunos try-catch no capturan específicamente

---

## 📚 Estructuras de Datos

### Tabla `user`
```sql
user_id              INT PRIMARY KEY AUTO_INCREMENT
name                 VARCHAR(255) NOT NULL
email                VARCHAR(255) NOT NULL UNIQUE
password             VARCHAR(255) NOT NULL (bcrypt hash)
role_id              INT NOT NULL (FK → role)
state                ENUM('active', 'inactive') DEFAULT 'active'
reset_password_token VARCHAR(255) NULLABLE
reset_password_expires TIMESTAMP NULLABLE
created_at           TIMESTAMP AUTO
updated_at           TIMESTAMP AUTO
```

### Roles relacionados
```
role_id=1 → Admin KAPA
role_id=2 → Coordinador
role_id=3 → Cliente
role_id=4 → Contratista
role_id=5 → Empleado de Contratista
```

---

## 🧪 Testing Realizado

- ✅ Compilación sin errores (`npm run build`)
- ✅ Endpoints accesibles vía Postman/Curl
- ✅ Validación de campos requeridos
- ⚠️ Suite `users.service.spec.ts` vacía (pendiente)
- ⚠️ Tests e2e de reseteo de password (no automatizados)

---

## 🔮 Mejoras Futuras

1. **Auditoría de usuarios:** Tabla `user_audit` registrando cambios (quién, qué, cuándo, antes/después)
2. **2FA:** Integración con Google Authenticator o SMS Twilio para multi-factor
3. **Expiración de passwords:** Política de rotación cada 90 días con alerts
4. **Bloqueo por intentos:** Limitar login fallidos (ej: 5 intentos → cuenta bloqueada 15min)
5. **Caché de permisos:** Redis para cachear roles/accesos y reducir lookups
6. **Soft delete mejorado:** Usar `deleted_at TIMESTAMP` en lugar de `state=inactive`
7. **Validación de email mejorada:** Verificación real de deliverability + doble opt-in
8. **Historial de contraseña:** Evitar reuso de últimas 5 passwords
9. **API de provisioning:** Integración con LDAP/Active Directory corporativo
10. **Rate limiting:** Protección contra brute force en login y password reset

