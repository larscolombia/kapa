# 🧪 Testing: Carga de Datos ILV - Endpoints Temporales

**Fecha:** 21 de noviembre de 2024  
**Tipo:** Testing temporal (REMOVER en producción)

---

## 📍 Acceso a Página de Test

### URL:
```
https://kapa.healtheworld.com.co/ilv/test-data-load
```

### Requisitos:
- ✅ Iniciar sesión en la aplicación
- ✅ Tener permisos de acceso a módulo ILV (cualquier rol que acceda a ILV)

---

## 🎯 Qué Hace Esta Página

Esta página de testing **NO requiere JWT** para las llamadas API porque usa endpoints especiales de prueba:

1. **Seleccionas un cliente** (ej: "Owens Illinois (Planta Peldar Cogua)")
2. **Se ejecutan automáticamente 2 llamadas API:**
   - `GET /api/clients/test/projects-by-client/:id` (sin JWT)
   - `GET /api/clients/test/contractors-by-client/:id` (sin JWT)
3. **Muestra en pantalla:**
   - Lista de proyectos encontrados
   - Lista de contratistas encontrados
   - Logs completos de las respuestas API
4. **Si hay error:**
   - Banner rojo con el mensaje de error
   - Logs detallados en el textarea

---

## 🔍 Cómo Usar

### Paso 1: Acceder a la Página
1. Ir a: `https://kapa.healtheworld.com.co/login`
2. Iniciar sesión con cualquier usuario que tenga acceso a ILV
3. Navegar a: `https://kapa.healtheworld.com.co/ilv/test-data-load`

### Paso 2: Seleccionar Cliente
1. Abrir el dropdown "Seleccionar Cliente"
2. Seleccionar "Owens Illinois (Planta Peldar Cogua)"
3. Esperar a que cargue (verás un spinner)

### Paso 3: Verificar Resultados

#### ✅ **Si TODO funciona correctamente:**
- Verás 2 secciones:
  - **✅ Proyectos (8)** con lista de 8 proyectos de Cogua
  - **✅ Contratistas (23)** con lista de 23 contratistas
- En el textarea "Logs de API" verás:
  ```
  [HH:MM:SS] 🎯 Cliente seleccionado: 2
  [HH:MM:SS] 📡 GET /clients/test/projects-by-client/2
  [HH:MM:SS] ✅ Proyectos Response: { ... }
  [HH:MM:SS] ✅ 8 proyectos cargados
  [HH:MM:SS] 📡 GET /clients/test/contractors-by-client/2
  [HH:MM:SS] ✅ Contratistas Response: { ... }
  [HH:MM:SS] ✅ 23 contratistas cargados
  [HH:MM:SS] 🎉 ÉXITO: Todos los datos cargados correctamente
  ```
- Notificación verde arriba: "Datos cargados: 8 proyectos, 23 contratistas"

#### ❌ **Si HAY un error:**
- Banner rojo con mensaje de error
- En logs verás:
  ```
  [HH:MM:SS] ❌ ERROR: ...
  [HH:MM:SS] ❌ Error.response: { ... }
  ```
- Notificación roja arriba con el error

### Paso 4: Capturar Evidencia

**Si funciona:**
- Capturar screenshot mostrando las listas de proyectos y contratistas
- Copiar el contenido del textarea "Logs de API"

**Si falla:**
- Capturar screenshot del banner de error
- Copiar el contenido completo del textarea "Logs de API"
- Abrir DevTools (F12) → pestaña Console
- Capturar screenshot de cualquier error en consola
- Abrir DevTools → pestaña Network
- Filtrar por `/test/`
- Capturar screenshot de las peticiones HTTP

---

## 🔬 Endpoints Backend Temporales

### 1. Test Contratistas
```
GET /api/clients/test/contractors-by-client/:client_id
```

**Características:**
- ⚠️ NO requiere autenticación JWT
- Devuelve JSON con estructura:
  ```json
  {
    "success": true,
    "client_id": "2",
    "count": 23,
    "contractors": [
      {
        "contractor_id": 2,
        "contractor_name": "KAPA SAS",
        "name": "KAPA SAS"
      },
      ...
    ]
  }
  ```

**Prueba directa con curl:**
```bash
curl "http://localhost:3001/api/clients/test/contractors-by-client/2"
```

### 2. Test Proyectos
```
GET /api/clients/test/projects-by-client/:client_id
```

**Características:**
- ⚠️ NO requiere autenticación JWT
- Devuelve JSON con estructura:
  ```json
  {
    "success": true,
    "client_id": "2",
    "count": 8,
    "projects": [
      {
        "project_id": 13,
        "name": "PORTAFOLIO",
        "address": "COGUA",
        "supervisor": "Jaime García - Carlos Gutierrez - Marco Cucunubá",
        "start_date": "2025-01-02",
        "end_date": "2025-01-31",
        "state": "active"
      },
      ...
    ]
  }
  ```

**Prueba directa con curl:**
```bash
curl "http://localhost:3001/api/clients/test/projects-by-client/2"
```

---

## 📊 Resultados Esperados

### Cliente: Cogua (client_id=2)

#### Proyectos (8):
1. PORTAFOLIO (ID: 13)
2. Portafolio Zipaquira (ID: 12)
3. Fuel Conversion Plan Zipa (ID: 17)
4. Zipa B Major Repair (ID: 18)
5. Reparación en caliente HB (ID: 20)
6. JG126 - Zipa Add Sections F2 + Deco Cap for F2 (ID: 21)
7. TV252 - Deco Zipa Expansión (ID: 14)
8. Reparación en caliente HD (ID: 16)

#### Contratistas (23):
1. KAPA SAS (ID: 2)
2. INSTRUMENTACION & MONTAJES ELECTRICOS SAS (ID: 3)
3. SIMECO INGENIERÍA (ID: 4)
4. Servicios y soluciones en ingeniería de Colombia SSIC Ltda. (ID: 5)
5. JYN CONSTRUCCIONES E INGENIERÍA S.A.S. (ID: 10)
6. COLREFRAC S.A.S. (ID: 12)
7. ARD PROYECTOS S.A.S (ID: 15)
8. Automatización integrada SAS (ID: 19)
9. KAMATI LTDA (ID: 24)
10. MN INGENIERIA INTEGRAL S.A.S (ID: 26)
11. MONTAJES Y MECANIZADOS CNC (ID: 27)
12. Mantenimiento y reparaciones industriales SAYPE SAS (ID: 33)
13. PROCTEK SAS (ID: 34)
14. DISEÑOS Y SOLUCIONES S.A.S - DISOL SAS (ID: 37)
15. Mega Estructuras y Redes de Colombia S.A.S (ID: 38)
16. KETCON INGENIERIA SAS (ID: 39)
17. PREMAC SAS (ID: 42)
18. PREMAC SAS (PLANTA DE ARENA) (ID: 43)
19. ATD AISLAMIENTOS TÉRMICOS SAS (ID: 44)
20. SADM INGENIERIA S.A.S (ID: 45)
21. Proyectos tanques y montajes PTM INGENIERÍA (ID: 46)
22. INDETRO INGENIERIA S.A.S. (ID: 48)
23. Y más...

---

## 🚨 Diferencia con Endpoints de Producción

### Endpoints Temporales (Test):
```
GET /api/clients/test/projects-by-client/:id    ⚠️ Sin JWT
GET /api/clients/test/contractors-by-client/:id ⚠️ Sin JWT
```
- NO requieren autenticación
- Devuelven JSON con wrapper `{ success, count, data }`
- Incluyen logs de consola en backend
- **SOLO PARA DEBUGGING**

### Endpoints de Producción (Real):
```
GET /api/clients/:id/projects     🔒 Requiere JWT
GET /api/clients/:id/contractors  🔒 Requiere JWT
```
- Requieren header `Authorization: Bearer <token>`
- Devuelven array directo de datos
- Filtran por role/email del usuario
- **PRODUCCIÓN REAL**

---

## 🎯 Objetivo del Testing

### Comprobar:
1. ✅ **Backend funciona:** Los endpoints temporales devuelven datos correctos
2. ✅ **Base de datos tiene datos:** Cogua tiene 8 proyectos y 23 contratistas
3. ✅ **Frontend puede consumir APIs:** La página de test llama y procesa correctamente
4. ✅ **No hay error de CORS:** Las peticiones pasan sin problemas
5. ✅ **No hay error de network:** La comunicación frontend-backend funciona

### Si TODO lo anterior funciona:
- **Entonces el problema está en:**
  - ❌ Autenticación JWT (token expirado o inválido)
  - ❌ Filtrado por role/email en endpoints de producción
  - ❌ Caché del browser con código viejo
  - ❌ Frontend no usando los métodos correctos en producción

### Próximo Paso:
- **Si los endpoints de test funcionan:** Probar los endpoints de producción con un JWT válido
- **Obtener JWT válido:**
  1. Iniciar sesión en la app
  2. Abrir DevTools → Application → Local Storage → `https://kapa.healtheworld.com.co`
  3. Copiar el valor de la key `access_token` o `token`
  4. Usar ese token en las pruebas con curl

**Prueba con JWT:**
```bash
# Copiar el token del Local Storage
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Probar proyectos
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/clients/2/projects"

# Probar contratistas
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/clients/2/contractors"
```

---

## 🗑️ Limpieza Post-Testing

### ⚠️ IMPORTANTE: Remover código temporal después del testing

#### Backend - `clients.controller.ts`:
**ELIMINAR estos 2 endpoints:**
```typescript
@Get('/test/contractors-by-client/:client_id')
async testGetClientContractors(@Request() req) { ... }

@Get('/test/projects-by-client/:client_id')
async testGetClientProjects(@Request() req) { ... }
```

#### Frontend - `routes.js`:
**ELIMINAR esta línea:**
```javascript
{ path: 'ilv/test-data-load', name: 'ilvTestDataLoad', component: () => import('pages/TestILVDataLoad.vue'), meta: { requiresAuth: true } },
```

#### Frontend - `TestILVDataLoad.vue`:
**ELIMINAR el archivo completo:**
```bash
rm /var/www/kapa.healtheworld.com.co/frontend/src/pages/TestILVDataLoad.vue
```

#### Recompilar:
```bash
# Backend
cd /var/www/kapa.healtheworld.com.co/backend
npm run build
pm2 restart kapa-backend

# Frontend
cd /var/www/kapa.healtheworld.com.co/frontend
npm run build
```

---

## 📝 Checklist de Testing

- [ ] Acceder a `https://kapa.healtheworld.com.co/ilv/test-data-load`
- [ ] Seleccionar "Owens Illinois (Planta Peldar Cogua)"
- [ ] Verificar que aparezcan 8 proyectos
- [ ] Verificar que aparezcan 23 contratistas
- [ ] Capturar screenshot de la página funcionando
- [ ] Copiar logs del textarea
- [ ] Si funciona → Probar endpoints de producción con JWT válido
- [ ] Si falla → Capturar error completo + DevTools Console + Network
- [ ] Después del testing → Remover código temporal

---

**Autor:** GitHub Copilot  
**Fecha:** 21 de noviembre de 2024  
**Estado:** ⚠️ TEMPORAL - REMOVER DESPUÉS DE VALIDAR
