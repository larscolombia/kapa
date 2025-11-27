# 🔐 Módulo Users - Implementación Backend Detallada

---

## 🏗️ Arquitectura

### Estructura de Carpetas
```
backend/src/modules/users/
├── dto/
│   └── (vacío - usa tipos inline en service)
├── users.controller.ts      # 111 líneas - endpoints REST
├── users.service.ts         # 161 líneas - lógica de negocio
├── users.module.ts          # Declaración del módulo
└── (sin spec.ts con cobertura real)
```

### Componentes Principales

#### `UsersModule`
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```
- Importa entidades `User` y `Role`
- Exporta `UsersService` para reutilización en Auth
- Registra controlador con guard global `JwtAuthGuard`

#### Entidad `User`
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;
  
  @Column()
  name: string;
  
  @Column({ unique: true })
  email: string;
  
  @Column()
  password: string;  // bcrypt hash, nunca plain
  
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
  
  @Column({ type: 'enum', enum: ['active', 'inactive'] })
  state: string;
  
  @Column({ nullable: true })
  reset_password_token: string;
  
  @Column({ type: 'timestamp', nullable: true })
  reset_password_expires: Date;
}
```

**Decisiones de Diseño:**
- `eager: true` en role → siempre cargado, reduce queries
- `password` jamás sale en respuestas (select explícito sin password)
- `email` con `unique: true` en DB + validación en service
- `state` como ENUM para evitar valores inválidos
- Reset fields `nullable` para usuarios "normales"

---

## 🔌 Endpoints y Métodos

### 1. POST `/users` - Crear Usuario

**Controlador:**
```typescript
@UseGuards(JwtAuthGuard)
@Post('/')
async postUsers(@Body() userData) {
  const users = await this.usersService.create(userData);
  return users;  // sin password
}
```

**Servicio (`UsersService.create`):**
```typescript
async create(userData: User): Promise<User> {
  // 1. Validaciones
  await this.validateUserRequiredFields(userData);
  await this.validateUserWithSameEmail(userData);
  await this.validateUserPassword(userData);
  await this.validateStateEnum(userData.state);
  
  // 2. Hash password
  const salt = await bcrypt.genSalt();  // 10 rondas default
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // 3. Crear y persistir
  const user = this.usersRepository.create({
    ...userData,
    password: hashedPassword,
  });
  return this.usersRepository.save(user);
}
```

**Validaciones ejecutadas:**
- `validateUserRequiredFields()`: name, email, password, role, state presentes
- `validateUserWithSameEmail()`: email único vs tabla User
- `validateUserPassword()`: ≥8 chars, 1 mayúscula, 1 especial
- `validateStateEnum()`: 'active' o 'inactive'

**Manejo de Excepciones:**
- Email duplicado → `Error: Ya existe usuario...` → Controlador → BadRequest 400
- Password débil → `Error: La contraseña...` → Controlador → BadRequest 400
- Campo faltante → `Error: El campo X es obligatorio` → BadRequest 400

**Respuesta Exitosa:**
```json
{
  "user_id": 42,
  "name": "Juan Pérez",
  "email": "juan@kapa.com",
  "role": { "role_id": 3, "name": "Cliente" },
  "state": "active"
  // NO incluye: password, reset_password_token, reset_password_expires
}
```

---

### 2. GET `/users` - Listar Usuarios

**Controlador:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('/')
async getUsers() {
  const users = await this.usersService.getUsersWithoutPassword();
  return users;
}
```

**Servicio:**
```typescript
async getUsersWithoutPassword(): Promise<User[] | undefined> {
  return this.usersRepository.find({
    select: {
      user_id: true,
      name: true,
      email: true,
      state: true,
      role: { role_id: true, name: true },
    },
    relations: ['role'],
    order: { user_id: 'ASC' },
  });
}
```

**Query generada (TypeORM):**
```sql
SELECT user.user_id, user.name, user.email, user.state,
       role.role_id, role.name
FROM user
LEFT JOIN role ON user.role_id = role.role_id
ORDER BY user.user_id ASC;
```

**Performance:**
- O(1) con N < 1000 usuarios
- Podría beneficiarse de índice en `(user_id, state)` si creciera

---

### 3. PUT `/users/change-password` - Cambiar Contraseña (Autenticado)

**Controlador:**
```typescript
@UseGuards(JwtAuthGuard)
@Put('change-password')
async changePassword(@Request() req, @Body('newPassword') newPassword: string) {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    const userId = await this.authService.getPayloadFromToken(token, 'userId');
    await this.usersService.changePassword(userId, newPassword);
    return { message: 'Contraseña actualizada con éxito.' };
  } catch (error) {
    throw new BadRequestException('Token inválido o expirado');
  }
}
```

**Flujo:**
1. Extrae JWT del header (manual: `replace('Bearer ', '')`)
2. Invoca `AuthService.getPayloadFromToken()` para obtener `userId`
3. Valida nueva password
4. Hashea con nuevo salt
5. Limpia campos de reset

**Servicio:**
```typescript
async changePassword(user_id: number, newPassword: string): Promise<void> {
  const user = await this.usersRepository.findOneBy({ user_id });
  
  // Validar policy (NO lo hace: mejora futura)
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  user.password = hashedPassword;
  user.reset_password_expires = null;
  user.reset_password_token = null;
  await this.usersRepository.save(user);
}
```

**Riesgos Actuales:**
- No valida complejidad de newPassword (✋ TODO)
- No verifica contraseña anterior
- No requiere confirmación
- No registra auditoría (quién cambió)

---

### 4. POST `/users/user-forgot-password` - Solicitar Reset

**Controlador:**
```typescript
@Post('user-forgot-password')
async forgotPassword(@Body('email') email: string) {
  await this.usersService.createPasswordResetToken(email);
  return { message: 'Si el correo está registrado, recibirás...' };
}
```

**Servicio:**
```typescript
async createPasswordResetToken(email: string): Promise<void> {
  try {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) return;  // Security: no revela si email existe
    
    // Generar token seguro
    const token = randomBytes(32).toString('hex');  // 64 caracteres hex
    user.reset_password_token = token;
    user.reset_password_expires = new Date(Date.now() + 3600000);  // +1h
    await this.usersRepository.save(user);
    
    // Construir email
    const resetUrl = `${process.env.URL_FRONT}/restore-password/${token}`;
    
    await MailUtil.sendMail({
      to: user.email,
      subject: 'Restablece tu contraseña',
      html: `
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">Reestablecer contraseña</a>
        <p>Este enlace expira en 1 hora.</p>
      `,
    });
  } catch (error) {
    console.log(error);  // Silencia errores de SMTP
  }
}
```

**Características de Seguridad:**
- No revela si email existe (mismo mensaje siempre)
- Token aleatorio de 32 bytes
- Expiración fija en 1 hora (3600000 ms)
- URL construida con `process.env.URL_FRONT` (configurable)

**Problemas Actuales:**
- Error SMTP se silencia (mejora: logging + reintentos)
- `URL_FRONT` hardcodeado en servicio (mejorable: config service)
- Token NO se invalida tras uso

---

### 5. PUT `/users/restore-password` - Restaurar con Token

**Controlador:**
```typescript
@Put('restore-password')
async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
  try {
    await this.usersService.resetPassword(token, newPassword);
    return { message: 'Contraseña restablecida con éxito.' };
  } catch (error) {
    throw new BadRequestException('Token inválido o expirado');
  }
}
```

**Servicio:**
```typescript
async resetPassword(token: string, newPassword: string): Promise<void> {
  // 1. Validar token
  const user = await this.validateResetToken(token);
  
  // 2. Validar password
  await this.validateUserPassword({ password: newPassword } as User);
  
  // 3. Hashear y guardar
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  user.reset_password_expires = null;
  user.reset_password_token = null;
  await this.usersRepository.save(user);
}

async validateResetToken(token: string): Promise<User> {
  const user = await this.usersRepository.findOne({
    where: {
      reset_password_token: token,
      reset_password_expires: MoreThan(new Date()),  // expires > NOW
    },
  });
  
  if (!user) {
    throw new Error('Token inválido o expirado');
  }
  
  return user;
}
```

**Query TypeORM:**
```sql
SELECT * FROM user
WHERE reset_password_token = ?
  AND reset_password_expires > NOW();
```

---

### 6. POST `/users/getKapaEmails` - Correos Admin

**Controlador:**
```typescript
@Post('/getKapaEmails')
async getKapaEmails() {
  return this.usersService.getKapaEmails();
}
```

**Servicio:**
```typescript
async getKapaEmails(): Promise<User[] | undefined> {
  return this.usersRepository.find({
    where: [
      { role: { role_id: 1 } },  // Admin
      { role: { role_id: 2 } },  // Coordinador
    ],
    select: ['user_id', 'email', 'name'],
  });
}
```

---

## 🔒 Seguridad y Permisos

### Guardas Actuales
| Endpoint | Guard | Token | Otros |
|---|---|---|---|
| POST /users | JwtAuthGuard | Requerido | ✋ Sin verificación de `user_management` |
| GET /users | JwtAuthGuard | Requerido | ✋ Sin verificación de rol |
| PUT /users/change-password | JwtAuthGuard | Requerido | Extrae userId del token |
| POST /users/user-forgot-password | PÚBLICO | No | ✅ Security best practice |
| PUT /users/restore-password | PÚBLICO | No | ⚠️ Rate limiting faltante |
| POST /users/getKapaEmails | PÚBLICO | No | Solo lectura, datos no sensibles |

### Mejoras Necesarias
```typescript
// Futuro: verificar permiso específico
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermission('user_management', 'can_edit')
@Post('/')
async postUsers(@Body() userData) { ... }
```

---

## 🔌 Integraciones

### AuthService
- **Usado en:** `changePassword()` para extraer userId del token
- **Método:** `getPayloadFromToken(token, 'userId')`
- **Riesgo:** Extracción manual del token desde header (debería ser middleware)

### MailUtil
- **Usado en:** `createPasswordResetToken()` para enviar emails
- **Configuración:** Requiere `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`
- **Comportamiento actual:** Falla silenciosamente (error capturado con console.log)

### Bcrypt
- **Librería:** `bcrypt` npm package
- **Uso:** `genSalt()` + `hash()` para crear passwords, `compare()` en Auth module
- **Configuración:** Salt rounds por defecto = 10

### TypeORM
- **Repositorio:** `@InjectRepository(User)`
- **Operaciones:** find, findOne, findOneBy, save, remove
- **Relaciones:** Role cargado eagerly en User

---

## 📊 Flujos de Datos

### Flujo: Crear Usuario
```
AdminPage
    ↓ POST /users { name, email, password, role, state }
Controller
    ↓ JwtAuthGuard + body validation
UsersService.create()
    ├─ validateUserRequiredFields()
    ├─ validateUserWithSameEmail()
    ├─ validateUserPassword()
    ├─ validateStateEnum()
    ├─ bcrypt.genSalt() → hash
    └─ userRepository.save()
        ↓ INSERT INTO user
        Database
            ↓
        new User { user_id, name, email, role, state }
            ↓
Controller (exluye password)
    ↓
AdminPage (tabla actualizada)
```

### Flujo: Restaurar Contraseña
```
User en email
    ↓ Click en link: /restore-password/token
Frontend RestorePasswordPage
    ↓ PUT /users/restore-password { token, newPassword }
Controller
    ↓
UsersService.resetPassword()
    ├─ validateResetToken()
    │   └─ Query: WHERE token=? AND expires > NOW()
    ├─ validateUserPassword(newPassword)
    ├─ bcrypt.hash(newPassword, salt)
    ├─ UPDATE user SET password=hash, reset_token=NULL, expires=NULL
    └─
Database
    ↓
Success message
    ↓
User puede loguear
```

---

## 🧪 Estado de Pruebas

**Actual:**
```typescript
// users.service.spec.ts
describe('UsersService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```
❌ **Sin cobertura real de lógica**

**Necesarias:**
- ✅ `create()` con password válido/inválido
- ✅ `create()` con email duplicado
- ✅ `validateUserPassword()` con políticas
- ✅ `resetPassword()` con token válido/expirado
- ✅ `changePassword()` con JWT válido
- ✅ Integration test de forgot-password + email

---

## 🚨 Deuda Técnica Identificada

| Prioridad | Problema | Impacto | Solución |
|---|---|---|---|
| 🔴 CRÍTICA | `getUserWithoutPassword()` no filtra password en select | Información sensible potencialmente expuesta | Select explícito de campos |
| 🔴 CRÍTICA | `/users/user-forgot-password` sin rate limiting | DoS posible, spam de emails | Redis throttle + IP tracking |
| 🟡 ALTA | `changePassword()` sin validación de complejidad | Passwords débiles al cambiar | Reutilizar `validateUserPassword()` |
| 🟡 ALTA | Token reset no se invalida tras uso | Replay attack posible | Set `reset_token = NULL` tras uso exitoso ✅ YA LO HACE |
| 🟠 MEDIA | Manejo de email silencioso (SMTP down) | Usuario no sabe si email se envió | Logging + alertas |
| 🟠 MEDIA | `URL_FRONT` hardcodeado en servicio | No portable entre envs | Config service + .env |
| 🟢 BAJA | Falta auditoría de cambios | No trazabilidad de cambios | Tabla `user_audit` |

---

## 🔧 Configuraciones Necesarias

```bash
# .env (variables requeridas)
JWT_SECRET=your-secret-key
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@kapa.com
MAIL_PASS=password
URL_FRONT=https://kapa.healtheworld.com.co
AWS_REGION=us-east-1
```

---

## ✅ Checklist de Calidad (vs ILV)

- ✅ Entidades bien definidas con relaciones
- ✅ Servicios con lógica clara y reutilizable
- ✅ Validaciones exhaustivas en múltiples capas
- ✅ Manejo de errores con mensajes específicos
- ✅ Security: bcrypt + JWT + email timing
- ⚠️ Tests: vacíos (mejora urgente)
- ⚠️ Documentación: este doc + TODO en código
- ⚠️ Auditoría: no implementada
- ⚠️ Rate limiting: no implementada

