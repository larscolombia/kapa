# 📊 GUÍA DE USUARIO - Módulo de Reportes de Auditoría

## 🎯 ¿Para qué sirve este módulo?

Este módulo te permite **demostrar con datos reales** cuánto tiempo tarda tu equipo en revisar documentos versus cuánto tiempo tardan los proveedores en corregir y reenviar documentos rechazados.

### Problema que resuelve:

> "El proveedor dice: *'Ustedes se demoran mucho en revisar mis documentos'*"

**Ahora puedes responder con datos exactos:**
- ✅ "Tu equipo revisó en promedio 6 horas"
- ✅ "El proveedor reenviót 4 veces por mala calidad"
- ✅ "El 85% de los documentos se revisaron antes de 24 horas"

---

## 🔍 ¿Cómo funciona el registro automático?

### El sistema registra AUTOMÁTICAMENTE cada vez que:

1. **Un proveedor sube un documento**
   - 📝 Registra: Fecha y hora exacta
   - 📝 Estado: "Subido por proveedor"
   - 📝 Usuario: Email del proveedor

2. **Tu equipo revisa y aprueba/rechaza**
   - 📝 Registra: Fecha y hora de la revisión
   - 📝 Estado: "Aprobado" o "Rechazado"
   - 📝 Usuario: Email de quien revisó
   - ⏱️ **CALCULA AUTOMÁTICAMENTE:** Tiempo transcurrido desde que el proveedor lo subió

3. **El proveedor reenvía un documento rechazado**
   - 📝 Registra: Nueva fecha y hora
   - 📝 Estado: "Reenviado"
   - 📝 Contador: Incrementa el número de rechazos
   - ⏱️ **CALCULA AUTOMÁTICAMENTE:** Tiempo que el proveedor tardó en corregir

---

## 📈 ¿Qué métricas calcula el sistema?

### 1. **Tiempo de Respuesta de Tu Equipo**

Mide cuántas horas/días pasan desde que el documento está en estado **"Subido"** hasta que tu equipo lo **Aprueba o Rechaza**.

**Ejemplo:**
```
Proveedor sube documento:     15/10/2025 a las 10:00 AM
Tu equipo revisa y rechaza:   15/10/2025 a las 4:00 PM
────────────────────────────────────────────────────────
⏱️ Tiempo de respuesta: 6 horas
```

### 2. **Número de Rechazos por Documento**

Cuenta cuántas veces un documento fue rechazado por mala calidad, errores o falta de información.

**Ejemplo:**
```
Intento 1: Rechazado (falta firma)
Intento 2: Rechazado (fecha incorrecta)
Intento 3: Rechazado (documento ilegible)
Intento 4: Aprobado
────────────────────────────────────────────────────────
🔴 Total de rechazos: 3 veces
💡 Problema: Calidad del proveedor, no demora del equipo
```

### 3. **Cumplimiento de SLA (24 horas)**

Calcula qué porcentaje de documentos fueron revisados dentro del tiempo acordado (SLA de 24 horas por defecto).

**Ejemplo:**
```
Total de documentos: 100
Revisados en menos de 24h: 87
Revisados en más de 24h: 13
────────────────────────────────────────────────────────
✅ Cumplimiento SLA: 87%
📊 Tiempo promedio de respuesta: 8.5 horas
```

### 4. **Timeline Completo por Documento**

Muestra el historial cronológico de cada documento con timestamps exactos.

**Ejemplo:**
```
�� Documento: Certificado de Calidad XYZ

📅 15/10/2025 10:00 AM
   └─ Estado: Subido por proveedor
   └─ Usuario: proveedor@empresa.com

📅 15/10/2025 04:30 PM
   └─ Estado: Rechazado
   └─ Usuario: revisor@kapa.com
   └─ Comentario: "Falta firma del representante legal"
   └─ ⏱️ Tiempo en revisión: 6.5 horas

📅 17/10/2025 09:00 AM
   └─ Estado: Reenviado por proveedor
   └─ Usuario: proveedor@empresa.com
   └─ ⏱️ Tiempo del proveedor en corregir: 40.5 horas

📅 17/10/2025 11:00 AM
   └─ Estado: Aprobado
   └─ Usuario: supervisor@kapa.com
   └─ ⏱️ Tiempo en segunda revisión: 2 horas
```

---

## 🖥️ ¿Cómo usar el módulo?

### 1️⃣ **Acceder al módulo**

**Opción A: Desde el menú lateral**
```
1. Inicia sesión como Administrador
2. En el menú lateral izquierdo, busca:
   📊 "Reportes de Auditoría"
3. Haz clic
```

**Opción B: URL directa**
```
https://kapa.healtheworld.com.co/admin-reports
```

---

### 2️⃣ **Aplicar filtros**

En la parte superior verás filtros para personalizar tu búsqueda:

**🔹 Filtro por Cliente**
```
Selecciona: "KAPA SAS"
Resultado: Solo documentos de ese cliente
```

**🔹 Filtro por Proyecto**
```
Selecciona: "Proyecto ABC - 2025"
Resultado: Solo documentos de ese proyecto
```

**🔹 Filtro por Contratista/Proveedor**
```
Selecciona: "Proveedor XYZ Ltda."
Resultado: Solo documentos de ese proveedor
```

**🔹 Filtro por Rango de Fechas**
```
Fecha inicio: 01/10/2025
Fecha fin: 31/10/2025
Resultado: Solo documentos subidos en octubre
```

**🔹 Filtro por Estado**
```
Selecciona: "Rechazado"
Resultado: Solo documentos rechazados (para identificar problemas)
```

---

### 3️⃣ **Ver las métricas SLA**

En la parte superior verás **4 tarjetas con métricas clave:**

```
┌─────────────────────────┐  ┌─────────────────────────┐
│ 📊 Cumplimiento SLA     │  │ ⏱️ Tiempo Promedio      │
│                         │  │                         │
│        87%              │  │      8.5 horas          │
│                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ ✅ Dentro de SLA        │  │ ❌ Fuera de SLA         │
│                         │  │                         │
│     87 documentos       │  │     13 documentos       │
│                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘
```

**💡 Interpretación:**
- **87% de cumplimiento** = Tu equipo está trabajando bien
- **8.5 horas promedio** = Muy por debajo del SLA de 24h
- **13 documentos fuera de SLA** = Analizar si hubo razones justificadas

---

### 4️⃣ **Ver tabla de documentos**

Más abajo verás una tabla con **todos los documentos** y sus métricas:

```
┌──────────────┬─────────────┬──────────────┬─────────────┬──────────────┬─────────┐
│ Cliente      │ Proyecto    │ Contratista  │ Documento   │ Tiempo Rev.  │ Rechazos│
├──────────────┼─────────────┼──────────────┼─────────────┼──────────────┼─────────┤
│ KAPA SAS     │ Proyecto A  │ Prov. XYZ    │ Cert. Cal.  │   6.5 h ✅   │    3    │
│ KAPA SAS     │ Proyecto A  │ Prov. ABC    │ Acta Inic.  │   2.3 h ✅   │    0    │
│ ACME Corp    │ Proyecto B  │ Prov. XYZ    │ RUT         │  28.0 h ❌   │    5    │
└──────────────┴─────────────┴──────────────┴─────────────┴──────────────┴─────────┘
```

**🎨 Códigos de colores:**
- 🟢 **Verde** (< 24h): Dentro del SLA
- �� **Amarillo** (24-48h): Ligeramente fuera del SLA
- 🔴 **Rojo** (> 48h): Muy fuera del SLA

**Columnas importantes:**
- **Tiempo Rev.**: Cuánto tardó TU EQUIPO en revisar
- **Rechazos**: Cuántas veces el PROVEEDOR envió mal
- **Primera Subida**: Cuándo el proveedor subió por primera vez
- **Última Aprobación**: Cuándo finalmente se aprobó

---

### 5️⃣ **Ver timeline de un documento**

Para ver el historial completo de un documento:

```
1. En la tabla, localiza el documento
2. Haz clic en el ícono 👁️ "Ver Timeline"
3. Se abrirá un diálogo con el historial cronológico completo
```

**Ejemplo de timeline:**
```
─────────────────────────────────────────────────────────────
│ 📄 CERTIFICADO DE CALIDAD - PROVEEDOR XYZ                 │
─────────────────────────────────────────────────────────────

● 15/10/2025 10:00:00 AM
  SUBIDO POR PROVEEDOR
  👤 proveedor@xyz.com
  ⏱️ Tiempo en este estado: 6.5 horas
  
● 15/10/2025 04:30:00 PM
  RECHAZADO
  👤 revisor@kapa.com
  💬 "Falta firma del representante legal"
  ⏱️ Tiempo en este estado: 40.5 horas
  
● 17/10/2025 09:00:00 AM
  REENVIADO
  👤 proveedor@xyz.com
  ⏱️ Tiempo en este estado: 2 horas
  
● 17/10/2025 11:00:00 AM
  APROBADO
  👤 supervisor@kapa.com
  💬 "Aprobado. Todo en orden."
─────────────────────────────────────────────────────────────
```

**💡 Con este timeline puedes demostrar:**
- ✅ Tu equipo revisó en 6.5h (primera vez) y 2h (segunda vez)
- ❌ El proveedor tardó 40.5 horas en corregir
- 🎯 El problema fue del proveedor, no de tu equipo

---

### 6️⃣ **Exportar a Excel**

Para generar un reporte completo descargable:

```
1. Aplica los filtros que necesites (cliente, fecha, etc.)
2. Haz clic en el botón: 📥 "Exportar a Excel"
3. Se descargará un archivo .xlsx con 3 hojas
```

**📄 Contenido del Excel:**

**HOJA 1: Resumen General**
```
┌─────────────────────────────────────────┐
│ RESUMEN GENERAL DE AUDITORÍA            │
├─────────────────────────────────────────┤
│ Total de documentos:           150      │
│ Tiempo promedio de respuesta:  8.5h    │
│ Total de rechazos:             87       │
│ Porcentaje de rechazo:         58%      │
│ Cumplimiento SLA:              87%      │
└─────────────────────────────────────────┘
```

**HOJA 2: Detalle por Documento**
```
Tabla completa con TODAS las columnas:
- Cliente
- Proyecto
- Contratista
- Criterio
- Subcriterio
- Empleado
- Documento
- Primera subida
- Última aprobación/rechazo
- Tiempo total de respuesta
- Número de rechazos
- Estado actual
```

**HOJA 3: Timeline Completo**
```
Historial cronológico de TODOS los cambios:
- Fecha y hora exacta
- Estado anterior → Estado nuevo
- Usuario que hizo el cambio
- Tiempo en el estado anterior
- Comentarios
```

---

## 🎯 CASOS DE USO REALES

### **Caso 1: Proveedor se queja de demoras**

**Situación:**
> Proveedor XYZ dice: "Ustedes se demoran demasiado en revisar mis documentos"

**Solución con el módulo:**
```
1. Ir a Reportes de Auditoría
2. Filtrar por: Contratista = "Proveedor XYZ"
3. Ver métricas:
   - Tiempo promedio de respuesta: 7.2 horas
   - Número de rechazos: 4 por documento
   - Cumplimiento SLA: 95%

4. Exportar a Excel
5. Enviar al proveedor mostrando:
   ✅ "Revisamos en promedio 7.2 horas (SLA es 24h)"
   ❌ "Rechazamos 4 veces por mala calidad"
   📊 "95% de cumplimiento de SLA"
```

**Resultado:** Proveedor comprende que el problema es su calidad, no tu demora.

---

### **Caso 2: Reunión con el cliente**

**Situación:**
> Cliente pide evidencia de que estás cumpliendo tiempos de revisión

**Solución con el módulo:**
```
1. Filtrar por: Cliente = "ACME Corp"
2. Filtrar por: Fecha = "Último mes"
3. Ver métricas SLA
4. Descargar Excel completo
5. Presentar en reunión:
   - "92% de cumplimiento de SLA"
   - "Tiempo promedio: 6.8 horas"
   - "Total de documentos procesados: 234"
```

**Resultado:** Cliente queda satisfecho con tu desempeño.

---

### **Caso 3: Identificar proveedores problemáticos**

**Situación:**
> Necesitas saber qué proveedor está generando más rechazos

**Solución con el módulo:**
```
1. Ver tabla completa sin filtros
2. Ordenar por columna "Número de Rechazos"
3. Identificar:
   - Proveedor ABC: Promedio 5 rechazos por documento
   - Proveedor XYZ: Promedio 1 rechazo por documento

4. Conclusión:
   ❌ Proveedor ABC necesita capacitación
   ✅ Proveedor XYZ trabaja bien
```

**Resultado:** Tomas decisiones basadas en datos.

---

### **Caso 4: Análisis interno de eficiencia**

**Situación:**
> Quieres saber si tu equipo está trabajando rápido o lento

**Solución con el módulo:**
```
1. Ver métrica: "Tiempo promedio de respuesta"
2. Comparar con SLA (24 horas)
3. Resultados:
   - Enero: 12 horas promedio
   - Febrero: 8 horas promedio
   - Marzo: 6 horas promedio

4. Conclusión:
   📈 El equipo está mejorando mes a mes
```

**Resultado:** Puedes premiar al equipo con datos reales.

---

## ❓ PREGUNTAS FRECUENTES

### **¿Desde cuándo se registran los datos?**

A partir de la implementación de este módulo (23/10/2025), TODOS los cambios de estado se registran automáticamente.

- ✅ Documentos nuevos: Auditoría completa desde el inicio
- ⚠️ Documentos antiguos: Solo se registra desde ahora en adelante

**Opción:** Puedes ejecutar un script para crear registros base de documentos históricos (consulta con soporte técnico).

---

### **¿Qué significa "SLA de 24 horas"?**

**SLA** = Service Level Agreement (Acuerdo de Nivel de Servicio)

Es el tiempo MÁXIMO que tu equipo debería tardar en revisar un documento.

- ✅ Si revisas en 23 horas: Dentro del SLA
- ❌ Si revisas en 26 horas: Fuera del SLA

**Configuración actual:** 24 horas (se puede modificar si lo necesitas).

---

### **¿Qué pasa si un documento fue aprobado en la primera revisión?**

```
Número de rechazos: 0
Tiempo de respuesta: 5 horas
Estado: Aprobado

💡 Interpretación:
   ✅ Documento perfecto desde el inicio
   ✅ Proveedor trabaja bien
   ✅ Tu equipo respondió rápido
```

---

### **¿Qué pasa si un documento tiene 10 rechazos?**

```
Número de rechazos: 10
Tiempo promedio de respuesta: 4 horas
Tiempo promedio del proveedor en corregir: 72 horas

💡 Interpretación:
   ❌ Proveedor con problemas graves de calidad
   ✅ Tu equipo responde rápido (4h)
   ❌ Proveedor tarda mucho en corregir (72h = 3 días)
   
🎯 Acción recomendada:
   - Reunión con el proveedor
   - Capacitación
   - Evaluar cambio de proveedor
```

---

### **¿Puedo cambiar el tiempo de SLA?**

Sí, puedes modificar el SLA según tus necesidades:

```
Contacta a soporte técnico para cambiar:
- SLA actual: 24 horas
- SLA nuevo: 48 horas (o el que necesites)
```

---

### **¿Los datos son exportables para auditorías externas?**

**SÍ**, absolutamente:

- ✅ Excel completo con 3 hojas
- ✅ Timestamps exactos
- ✅ Identificación de usuarios
- ✅ Comentarios de cada cambio
- ✅ Cálculos automáticos verificables

**Ideal para:**
- Auditorías externas
- Certificaciones de calidad
- Evidencia legal
- Reportes a clientes
- Métricas de desempeño

---

## 🎊 CONCLUSIÓN

Este módulo te convierte de **acusado a acusador**:

**ANTES:**
> "Ustedes se demoran mucho"
> Respuesta: "No es cierto" (sin pruebas)

**AHORA:**
> "Ustedes se demoran mucho"
> Respuesta: "Aquí está el Excel: Revisamos en 6h, tú reenvías 5 veces por mala calidad"

---

## 🆘 SOPORTE

¿Necesitas ayuda?

1. **Documentación técnica:** Ver archivo `IMPLEMENTACION_COMPLETA.md`
2. **Problemas técnicos:** Ver archivo `PROBLEMA_RESUELTO.md`
3. **Soporte técnico:** Contactar a administrador del sistema

---

**Versión del documento:** 1.0  
**Fecha:** 23 de Octubre, 2025  
**Estado:** ✅ Sistema en producción  
**Autor:** Equipo KAPA + GitHub Copilot
