# 🔧 SOLUCIÓN: Problemas con Módulo ILV

## ✅ Estado Actual del Sistema

### Backend
- ✅ Rutas ILV configuradas correctamente bajo `/api/ilv/*`
- ✅ Campo-mapper con categoria/subcategoria configurados
- ✅ Maestros jerárquicos cargados (7 categorías, 24 subcategorías, 3 tipos HID)
- ✅ PM2 backend online (compilado Nov 18 12:24)

### Frontend  
- ✅ Dashboard con botón correcto: `ilvNuevoReporte`
- ✅ Rutas configuradas en router con meta `{ module: 'ilv_management' }`
- ✅ Formulario con selects jerárquicos (categoria → subcategoria)
- ✅ Bundles compilados (Nov 18 12:19)

### Permisos Base de Datos
```
Rol               | can_view | can_edit
------------------|----------|----------
Administrador     | true     | true
Usuario KAPA      | true     | true
Contratista       | true     | true
Cliente           | true     | false
Subcontratista    | true     | false
```

---

## 🎯 PROBLEMA IDENTIFICADO

### Causa Raíz:
El router guard en `frontend/src/router/index.js` (línea 38) verifica permisos antes de permitir navegación:

```javascript
if (to.meta.module && !authStore.hasPermission(to.meta.module, 'can_view')) {
  return next('/unauthorized'); 
}
```

**Los permisos se cargan solo en el login** (línea 23 de `auth.js`):
```javascript
const rolePermissions = await getPermissions();
this.setPermissions(rolePermissions);
```

Si el usuario hizo login **antes** de que se agregara el módulo `ilv_management` a la tabla `access`, su sesión no tiene esos permisos cargados aunque estén en la base de datos.

---

## 🚀 SOLUCIÓN INMEDIATA (USUARIO)

### Paso 1: Limpiar Cache del Navegador
**Chrome/Edge:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Todo el tiempo"
3. Marca: ✅ Archivos e imágenes en caché
4. Clic en "Borrar datos"

**Firefox:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Todo"
3. Marca: ✅ Caché
4. Clic en "Limpiar ahora"

### Paso 2: Hard Refresh
1. Presiona `Ctrl + Shift + R` (fuerza recarga sin cache)
2. O `Ctrl + F5` en Windows/Linux

### Paso 3: Cerrar Sesión y Re-Logearse
1. Ir a https://kapa.healtheworld.com.co
2. Hacer logout (cerrar sesión)
3. Volver a ingresar con sus credenciales
4. Los permisos se cargarán automáticamente desde el backend

### Paso 4: Probar Navegación ILV
1. Ir a Dashboard ILV
2. Clic en botón "Nuevo Reporte"
3. Debería navegar a `/ilv/reportes/nuevo`
4. El formulario debe mostrar:
   - Select "Tipo de Reporte HID" (3 opciones)
   - Select "Categoría" (7 opciones jerárquicas)
   - Select "Subcategoría" (se habilita al elegir categoría)

---

## 🔍 VERIFICACIÓN TÉCNICA

### Verificar Permisos en Consola del Navegador

1. Abrir DevTools (F12)
2. En la pestaña **Console**, ejecutar:

```javascript
// Ver si el usuario está autenticado
localStorage.getItem('authToken')

// Ver permisos cargados en Pinia
JSON.parse(localStorage.getItem('auth'))?.permissions
```

**Resultado esperado:**
```json
[
  {
    "module_name": "ilv_management",
    "can_view": true,
    "can_edit": true  // o false según el rol
  },
  // ... otros módulos
]
```

Si no aparece `ilv_management`, el usuario debe **cerrar sesión y volver a hacer login**.

---

## 🐛 DEBUGGING ADICIONAL

### Si después del logout/login sigue sin funcionar:

#### 1. Verificar Endpoint de Permisos

Abrir DevTools → Network → hacer login → buscar petición a `/auth/permissions`.

**Respuesta esperada:**
```json
{
  "role_id": 1,
  "permissions": [
    {
      "module_name": "ilv_management",
      "can_view": true,
      "can_edit": true
    }
  ]
}
```

#### 2. Verificar Router Guard

En DevTools → Console → intentar navegar:

```javascript
// Forzar navegación
this.$router.push({ name: 'ilvNuevoReporte' })
```

Si redirige a `/unauthorized`, el problema persiste en permisos.

#### 3. Verificar Maestros

```javascript
// En ILVReportForm.vue, verificar que los maestros se cargan
await fetch('https://kapa.healtheworld.com.co/api/ilv/maestros/categoria_hid/tree', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(console.log)
```

**Debe retornar 7 categorías con sus subcategorías anidadas.**

---

## 📝 CHECKLIST FINAL

- [ ] Usuario limpió cache del navegador
- [ ] Usuario hizo hard refresh (Ctrl+Shift+R)
- [ ] Usuario cerró sesión y volvió a hacer login
- [ ] Endpoint `/auth/permissions` retorna `ilv_management` con `can_view: true`
- [ ] Pinia store tiene permisos correctos en memoria
- [ ] Router permite navegar a `ilvNuevoReporte`
- [ ] Formulario carga categorías desde API
- [ ] Selects jerárquicos funcionan (categoria → subcategoria)

---

## 🔧 SOLUCIÓN ALTERNATIVA (BACKEND)

Si el problema persiste, podemos implementar un endpoint para **refrescar permisos sin logout**:

```typescript
// backend/src/modules/auth/auth.controller.ts
@UseGuards(JwtAuthGuard)
@Post('refresh-permissions')
async refreshPermissions(@Request() req) {
  return this.authService.getRolePermissions(req.user.role.role_id);
}
```

Y en frontend:

```javascript
// Botón "Refrescar Permisos" en el menú de usuario
async refreshPermissions() {
  const authStore = useAuthStore();
  const newPerms = await api.post('/auth/refresh-permissions');
  authStore.setPermissions(newPerms.data);
}
```

**Nota:** Esta solución requiere modificar código. La solución inmediata (logout/login) es más rápida.

---

## 📞 SOPORTE

Si después de seguir todos los pasos el problema persiste:

1. **Capturar screenshot** de la consola del navegador (F12) mostrando errores
2. **Capturar screenshot** de la pestaña Network cuando intenta navegar
3. **Enviar información:**
   - Rol del usuario logeado
   - URL exacta donde está (ej: `/ilv/dashboard`)
   - Acción que intenta realizar (ej: "Clic en botón Nuevo Reporte")
   - Mensaje de error visible (si hay)

---

**Fecha:** 18 de Noviembre, 2024  
**Estado:** ✅ SISTEMA FUNCIONAL - REQUIERE LOGOUT/LOGIN  
**Próximos Pasos:** Probar flujo completo después del re-login
