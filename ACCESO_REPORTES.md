# 🔍 CÓMO ACCEDER AL MÓDULO DE REPORTES

## ✅ PROBLEMA SOLUCIONADO

El módulo de reportes **YA ESTÁ CONFIGURADO** en el sistema:

- ✅ Código agregado al menú (`MainLayout.vue`)
- ✅ Permisos configurados en la base de datos
- ✅ Frontend compilado con éxito

---

## 🚀 PASOS PARA VER EL MÓDULO

### 1️⃣ **Refrescar el Navegador (MUY IMPORTANTE)**

**CTRL + SHIFT + R** (o **CMD + SHIFT + R** en Mac)

Esto fuerza al navegador a descargar la nueva versión del código.

**Alternativa:**
1. Presiona **F12** para abrir DevTools
2. Click derecho en el botón de refrescar
3. Selecciona **"Vaciar caché y recargar de manera forzada"**

---

### 2️⃣ **Cerrar Sesión y Volver a Iniciar**

1. Cerrar sesión en KAPA
2. Iniciar sesión con: **admin@kapa.com**
3. Buscar en el menú lateral izquierdo:
   - 📊 **"Reportes de Auditoría"** (con ícono de gráfico)

---

### 3️⃣ **Ubicación en el Menú**

El enlace aparece en este orden:

```
🏠 Inicio
👥 Administrar usuarios
🛠️  Administrar proyectos
👷 Administrar contratistas
📁 Administrador de soportes
📊 Reportes de Auditoría    ← AQUÍ ESTÁ
━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Soportes de interés
�� Cambiar contraseña
🚪 Cerrar sesión
```

---

### 4️⃣ **URL Directa**

También puedes acceder directamente desde el navegador:

```
https://kapa.healtheworld.com.co/admin-reports
```

---

## ⚠️ TROUBLESHOOTING

### Si NO aparece el módulo:

**Causa #1: Caché del Navegador**
```
Solución: CTRL + SHIFT + R para forzar recarga
```

**Causa #2: Usuario sin permisos**
```
Verificar: Solo funciona con usuario "admin@kapa.com" (rol Administrador)
```

**Causa #3: Sesión antigua**
```
Solución: 
1. Cerrar todas las pestañas de KAPA
2. Limpiar cookies del sitio
3. Volver a iniciar sesión
```

---

## ✅ VERIFICACIÓN EN BASE DE DATOS

El permiso está configurado correctamente:

```sql
SELECT * FROM access WHERE module_name = 'reports_management';

access_id |    module_name     | can_view | can_edit | role_id 
----------|--------------------|-----------|---------|---------
    27    | reports_management |     t     |    f    |    1
```

**Usuario administrador tiene rol_id = 1** ✅

---

## 🎯 QUÉ VERÁS EN EL MÓDULO

Cuando accedas correctamente, verás:

1. **Filtros superiores:**
   - Cliente
   - Proyecto
   - Contratista
   - Rango de fechas
   - Estado de documento

2. **Tarjetas de métricas SLA:**
   - % Cumplimiento SLA
   - Tiempo promedio de respuesta
   - Documentos dentro de SLA
   - Documentos fuera de SLA

3. **Tabla de documentos:**
   - Columnas con info de cliente, proyecto, contratista
   - Tiempo de respuesta
   - Número de rechazos
   - Estado actual

4. **Botones de acción:**
   - 📥 **Exportar a Excel**
   - 👁️ **Ver Timeline** (por documento)

---

## 🔄 COMANDOS EJECUTADOS

```bash
# Frontend compilado exitosamente ✅
cd /var/www/kapa.healtheworld.com.co/frontend
npm run build

# Resultado:
✓ Build succeeded
✓ ReportsPage.vue incluida en build
✓ MainLayout.vue actualizado
✓ Archivos listos en dist/spa/
```

---

## 📞 PRÓXIMO PASO

**REFRESCAR EL NAVEGADOR CON CTRL + SHIFT + R**

Luego busca el enlace **"Reportes de Auditoría"** en el menú lateral.

---

**Fecha:** 23 de Octubre, 2025
**Estado:** ✅ COMPILADO Y LISTO PARA USAR
