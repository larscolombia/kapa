# Actualización Formulario HID - 20 Nov 2025

## ✅ Cambios Implementados

### 1. Nuevos Maestros en Base de Datos

#### Centro de Trabajo (2 valores)
- Owens Illinois (Planta Peldar Soacha)
- Owens Illinois (Planta Peldar Cogua)

#### Tipo de Reporte (2 valores)
- HID
- NEAR MISS

#### Tipo de Hallazgo (5 valores)
- Seguridad
- Salud
- Medio Ambiente
- Inocuidad
- Daño a la propiedad

### 2. Subcategorías Actualizadas

**Total de subcategorías HID: 47**

#### Trabajos en caliente (4 subcategorías) - ACTUALIZADO
- Conato
- Elementos de contención
- Distancias de seguridad
- Medición de atmosferas

#### Trabajos con maquinaria (2 subcategorías) - ACTUALIZADO
- Seguridad Vial
- Daños y averías

#### Medio Ambiente (5 subcategorías) - ACTUALIZADO
- Clasificación de residuos
- Segregación / disposición final
- Derrame producto químico
- Fugas
- Almacenamiento de productos químicos

#### Salud (3 subcategorías) - ACTUALIZADO
- Condiciones de salud
- Posturas Biomecánicas
- Puntos de hidratación

#### Inocuidad (2 subcategorías) - ACTUALIZADO
- Uso de joyas
- Uso de cofia

#### Aseguramiento (13 subcategorías) - ACTUALIZADO
- Ausencia de EHS
- Caída a mismo nivel
- EPP
- Exposición al vacío
- Equipos de emergencia
- Equipos conectados sin uso
- Falla de equipo / herramienta
- Inspecciones / preoperacionales
- Permisos de trabajo / ATS
- Orden, aseo
- Señalización y/o delimitación
- Personal en área no asignada
- Superficies con filos

### 3. Nuevo Orden de Campos en Formulario HID

El formulario HID ahora tiene **15 campos** en el siguiente orden:

1. **Fecha** (date) - REQUERIDO
2. **Centro de Trabajo** (select) - REQUERIDO
3. **Proyecto** (text) - REQUERIDO
4. **Seleccione la empresa a la que pertenece** (text) - REQUERIDO
5. **Nombre de quien reporta** (text) - REQUERIDO
6. **Tipo de reporte** (select: HID/NEAR MISS) - REQUERIDO
7. **Empresa a quien se le genera el reporte** (text) - REQUERIDO
8. **Nombre EHS del contratista** (text) - REQUERIDO
9. **Nombre Supervisor obra del contratista** (text) - REQUERIDO
10. **Tipo** (select: Seguridad/Salud/etc) - REQUERIDO
11. **Categoría** (select jerárquico) - REQUERIDO
12. **Subcategorías** (select jerárquico dependiente) - REQUERIDO
13. **Descripción de hallazgo** (textarea) - REQUERIDO
    - ¿Qué pasó?
    - ¿Dónde pasó?
    - ¿Qué procedimiento se incumplió?
14. **Descripción de cierre** (textarea) - OPCIONAL
    - ¿Qué acciones se tomaron?
    - ¿Qué acuerdos se generaron?
15. **Registro Fotográfico del hallazgo** (file) - OPCIONAL

### 4. Campos Removidos

Los siguientes campos del formulario anterior fueron removidos:
- ❌ Ubicación
- ❌ Fecha del Evento (ahora es solo "Fecha")
- ❌ Severidad
- ❌ Área
- ❌ Descripción de la Condición (ahora es "Descripción de hallazgo")
- ❌ Causa Probable
- ❌ Acción Inmediata
- ❌ Observación

### 5. Campos Agregados

Los siguientes campos son nuevos:
- ✅ Fecha (reemplaza Fecha del Evento)
- ✅ Centro de Trabajo
- ✅ Proyecto
- ✅ Empresa a la que pertenece
- ✅ Tipo de reporte (HID/NEAR MISS)
- ✅ Empresa a quien se genera el reporte
- ✅ Tipo (Seguridad/Salud/etc)
- ✅ Descripción de cierre
- ✅ Registro Fotográfico

## 📊 Resumen de Datos

| Tipo Maestro | Cantidad | Estado |
|--------------|----------|---------|
| Centro de Trabajo | 2 | ✅ |
| Tipo Reporte HID | 2 | ✅ |
| Tipo Hallazgo | 5 | ✅ |
| Categorías HID | 12 | ✅ |
| Subcategorías HID | 47 | ✅ |

## ✅ Tests E2E Actualizados

**Tests ejecutados: 4/4 PASADOS** ✅

1. ✅ No hay campos duplicados hardcodeados
2. ✅ Orden de 15 campos HID correcto
3. ✅ Campos críticos (fecha, categoría, subcategoría, nombre_quien_reporta) sin duplicados
4. ✅ Estructura completa del formulario correcta

## 🚀 Deployment

- ✅ Base de datos actualizada
- ✅ Backend compilado y desplegado
- ✅ Frontend compilado y desplegado
- ✅ PM2 reiniciado
- ✅ Tests E2E pasando

## 📝 Notas Importantes

1. **Jerarquía Categoría-Subcategoría**: Se mantiene el sistema jerárquico donde las subcategorías se cargan dinámicamente según la categoría seleccionada.

2. **Campos Requeridos**: Todos los campos del 1 al 13 son obligatorios. Solo "Descripción de cierre" y "Registro Fotográfico" son opcionales.

3. **Tipo de Archivo**: El campo "Registro Fotográfico" acepta archivos (imágenes).

4. **Compatibilidad**: Los reportes existentes no se ven afectados ya que los campos se almacenan en formato JSON flexible.

## 🔍 Verificación

Para verificar los cambios:

```bash
# Ver maestros nuevos
sudo -u postgres psql kapa_db -c "SELECT tipo, valor FROM ilv_maestro WHERE tipo IN ('centro_trabajo', 'tipo_reporte_hid', 'tipo_hallazgo') ORDER BY tipo, orden;"

# Ver conteo de subcategorías por categoría
sudo -u postgres psql kapa_db -c "SELECT c.valor as categoria, COUNT(s.maestro_id) as subcategorias FROM ilv_maestro c LEFT JOIN ilv_maestro s ON s.aplica_a_tipo = c.clave AND s.tipo = 'subcategoria_hid' WHERE c.tipo = 'categoria_hid' GROUP BY c.valor, c.orden ORDER BY c.orden;"

# Ejecutar tests
cd /var/www/kapa.healtheworld.com.co/e2e
npx playwright test ilv-ui-validation.spec.ts --reporter=line
```

## 📅 Fecha de Implementación

20 de Noviembre de 2025 - 16:15 GMT-5
