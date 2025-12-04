# Módulo de Inspecciones - Especificación Funcional

## 📋 Resumen Ejecutivo

El módulo de Inspecciones permite el registro, seguimiento y gestión de dos tipos de reportes de inspección en el sistema KAPA. Este módulo sigue la arquitectura y patrones establecidos en el módulo ILV existente.

---

## 🎯 Objetivos del Módulo

1. Permitir el registro de inspecciones técnicas (Opción 1) por usuarios autorizados
2. Permitir el registro de auditorías cruzadas (Opción 2) por cualquier usuario
3. Mantener trazabilidad completa de todas las inspecciones
4. Facilitar el seguimiento de estados (Abierto/Cerrado)
5. Integrar con la estructura existente de clientes, proyectos y contratistas

---

## 👥 Actores del Sistema

| Actor | Descripción | Permisos Opción 1 | Permisos Opción 2 |
|-------|-------------|-------------------|-------------------|
| **Administrador** | Usuario con rol administrativo completo | ✅ Crear, Editar, Ver, Eliminar | ✅ Crear, Editar, Ver, Eliminar |
| **Usuario KAPA** | Personal interno de KAPA | ✅ Crear, Editar, Ver | ✅ Crear, Editar, Ver |
| **Cliente** | Usuario del cliente (Owens Illinois, etc.) | ✅ Crear, Editar, Ver | ✅ Crear, Editar, Ver |
| **Contratista** | Usuario de empresa contratista | ❌ Sin acceso | ✅ Crear, Editar, Ver |
| **Visitante** | Usuario con permisos mínimos | ❌ Sin acceso | ✅ Crear, Ver |

---

## 📊 Tipos de Inspección

### Opción 1: Inspecciones Técnicas

**Descripción:** Inspecciones especializadas realizadas por personal autorizado para verificar el cumplimiento de normas de seguridad, medio ambiente y salud.

**Roles autorizados:** Administrador, Usuario KAPA, Cliente

**Campos del formulario:**
1. Fecha (obligatorio)
2. Cliente - Centro de Trabajo (obligatorio)
3. Proyecto (obligatorio, dependiente de Cliente)
4. Empresa contratista a quien se inspecciona (obligatorio, dependiente de Cliente)
5. Descripción detallada del área (obligatorio)
6. Quien reporta (obligatorio)
7. Tipo: Seguridad / Medio Ambiente / Salud (obligatorio)
8. Clasificación (obligatorio, dependiente de Tipo)
9. Estado: Abierto / Cerrado (obligatorio)
10. Observación (habilitado solo si Estado = Abierto)

### Opción 2: Auditorías Cruzadas

**Descripción:** Inspecciones realizadas entre empresas contratistas para verificar el cumplimiento de estándares operativos.

**Roles autorizados:** Todos los usuarios del sistema

**Campos del formulario:**
1. Fecha (obligatorio)
2. Cliente - Centro de Trabajo (obligatorio)
3. Proyecto (obligatorio, dependiente de Cliente)
4. Área (obligatorio, lista predefinida)
5. Descripción detallada del área (obligatorio)
6. Empresa auditora - Quien ejecuta (obligatorio, dependiente de Cliente)
7. Empresa auditada (obligatorio, dependiente de Cliente)
8. Clasificación: KAPA-AO-FO-003 Auditoria cruzada (fijo)
9. Estado: Abierto / Cerrado (obligatorio)
10. Observación (habilitado solo si Estado = Abierto)

---

## 📝 Casos de Uso

### CU-INS-001: Crear Reporte de Inspección Técnica (Opción 1)

**Actor Principal:** Administrador, Usuario KAPA, Cliente

**Precondiciones:**
- Usuario autenticado con rol autorizado (Administrador, Usuario KAPA o Cliente)
- Existen centros de trabajo configurados
- Existen proyectos asociados a los centros de trabajo
- Existen contratistas registrados

**Flujo Principal:**
1. El usuario accede al módulo de Inspecciones
2. El sistema muestra el dashboard de inspecciones
3. El usuario hace clic en "Nueva Inspección"
4. El sistema muestra el formulario con selector de tipo
5. El usuario selecciona "Inspección Técnica"
6. El sistema verifica el rol del usuario
7. Si el usuario tiene permisos, muestra el formulario completo
8. El usuario completa los campos obligatorios:
   - Fecha (por defecto: fecha actual)
   - Cliente (Centro de trabajo)
   - Proyecto (filtrado por cliente seleccionado)
   - Empresa contratista a quien se inspecciona
   - Descripción detallada del área
   - Quien reporta
   - Tipo (Seguridad/Medio Ambiente/Salud)
   - Clasificación (filtrada por tipo seleccionado)
   - Estado (Abierto/Cerrado)
   - Observación (si estado es Abierto)
9. El usuario hace clic en "Guardar"
10. El sistema valida los campos
11. El sistema guarda el reporte y muestra confirmación
12. El sistema redirige al listado de inspecciones

**Flujos Alternativos:**

*FA1 - Usuario sin permisos:*
- En el paso 7, si el usuario no tiene rol autorizado
- El sistema muestra mensaje: "No tiene permisos para crear este tipo de inspección"
- El sistema oculta la opción de Inspección Técnica

*FA2 - Validación fallida:*
- En el paso 10, si hay campos obligatorios vacíos
- El sistema resalta los campos con error
- El sistema muestra mensajes de validación específicos
- El usuario corrige y vuelve al paso 9

*FA3 - Error de conexión:*
- En el paso 11, si hay error de red
- El sistema muestra mensaje de error
- El sistema mantiene los datos del formulario
- El usuario puede reintentar

**Postcondiciones:**
- Reporte de inspección creado y almacenado
- Reporte visible en el listado de inspecciones
- Auditoría registrada con usuario y timestamp

---

### CU-INS-002: Crear Reporte de Auditoría Cruzada (Opción 2)

**Actor Principal:** Cualquier usuario autenticado

**Precondiciones:**
- Usuario autenticado (cualquier rol)
- Existen centros de trabajo configurados
- Existen proyectos asociados a los centros de trabajo
- Existen contratistas registrados

**Flujo Principal:**
1. El usuario accede al módulo de Inspecciones
2. El sistema muestra el dashboard de inspecciones
3. El usuario hace clic en "Nueva Inspección"
4. El sistema muestra el formulario con selector de tipo
5. El usuario selecciona "Auditoría Cruzada"
6. El sistema muestra el formulario completo
7. El usuario completa los campos obligatorios:
   - Fecha (por defecto: fecha actual)
   - Cliente (Centro de trabajo)
   - Proyecto (filtrado por cliente seleccionado)
   - Área (lista predefinida)
   - Descripción detallada del área
   - Empresa auditora (Quien ejecuta)
   - Empresa auditada
   - Clasificación (valor fijo: KAPA-AO-FO-003 Auditoria cruzada)
   - Estado (Abierto/Cerrado)
   - Observación (si estado es Abierto)
8. El usuario hace clic en "Guardar"
9. El sistema valida los campos
10. El sistema guarda el reporte y muestra confirmación
11. El sistema redirige al listado de inspecciones

**Flujos Alternativos:**

*FA1 - Validación fallida:*
- En el paso 9, si hay campos obligatorios vacíos
- El sistema resalta los campos con error
- El sistema muestra mensajes de validación específicos
- El usuario corrige y vuelve al paso 8

*FA2 - Misma empresa auditora y auditada:*
- En el paso 7, si el usuario selecciona la misma empresa como auditora y auditada
- El sistema muestra advertencia: "La empresa auditora no puede ser la misma que la auditada"
- El usuario debe seleccionar empresas diferentes

**Postcondiciones:**
- Reporte de auditoría cruzada creado y almacenado
- Reporte visible en el listado de inspecciones
- Auditoría registrada con usuario y timestamp

---

### CU-INS-003: Listar Reportes de Inspección

**Actor Principal:** Usuario autenticado

**Precondiciones:**
- Usuario autenticado

**Flujo Principal:**
1. El usuario accede al módulo de Inspecciones
2. El sistema muestra el listado de inspecciones con:
   - Filtros (Tipo de Inspección, Estado, Cliente, Fecha Creación Desde, Fecha Creación Hasta)
   - Tabla con columnas: ID, Tipo Inspección, Clasificación, Cliente, Proyecto, Estado, Fecha, Acciones
   - Paginación
3. El usuario puede aplicar filtros
4. El sistema actualiza el listado según los filtros
5. El usuario puede ordenar por cualquier columna
6. El usuario puede ver, editar o eliminar reportes según sus permisos

**Reglas de Visibilidad:**
- Administrador: Ve todos los reportes
- Usuario KAPA: Ve todos los reportes
- Cliente: Ve reportes de su centro de trabajo
- Contratista: Ve reportes donde su empresa es auditora o auditada (solo Opción 2)
- Visitante: Ve reportes donde participó

**Postcondiciones:**
- Listado mostrado según permisos del usuario
- Filtros aplicados correctamente

---

### CU-INS-004: Editar Reporte de Inspección

**Actor Principal:** Usuario autenticado con permisos

**Precondiciones:**
- Usuario autenticado
- Reporte existente
- Usuario tiene permisos de edición

**Flujo Principal:**
1. El usuario accede al listado de inspecciones
2. El usuario hace clic en el botón "Editar" de un reporte
3. El sistema carga los datos del reporte en el formulario
4. El usuario modifica los campos deseados
5. El usuario hace clic en "Guardar Cambios"
6. El sistema valida los campos
7. El sistema actualiza el reporte
8. El sistema muestra confirmación
9. El sistema redirige al listado

**Reglas de Edición:**
- Reportes **Abiertos**: Todos los campos editables según tipo
- Reportes **Cerrados**: Solo el Administrador puede editar
- El campo Tipo de inspección NO es editable después de crear

**Flujos Alternativos:**

*FA1 - Sin permisos de edición:*
- En el paso 2, si el usuario no tiene permisos
- El botón "Editar" no se muestra
- Solo se muestra el botón "Ver"

*FA2 - Reporte cerrado sin ser admin:*
- En el paso 3, si el reporte está cerrado y el usuario no es admin
- El sistema muestra mensaje: "Solo administradores pueden editar reportes cerrados"
- El sistema redirige al modo visualización

**Postcondiciones:**
- Reporte actualizado
- Auditoría de cambio registrada

---

### CU-INS-005: Visualizar Detalle de Reporte

**Actor Principal:** Usuario autenticado

**Precondiciones:**
- Usuario autenticado
- Reporte existente
- Usuario tiene permisos de visualización

**Flujo Principal:**
1. El usuario accede al listado de inspecciones
2. El usuario hace clic en el botón "Ver" de un reporte
3. El sistema muestra la vista de detalle con:
   - Información del reporte en modo solo lectura
   - Todos los campos con sus valores
   - Información de auditoría (creado por, fecha creación, modificado por, fecha modificación)
4. El usuario puede navegar de vuelta al listado

**Reglas importantes:**
- La vista de detalle es SOLO LECTURA
- NO se muestran botones de modificación de datos
- Los valores de campos de selección muestran el texto descriptivo, no el ID

**Postcondiciones:**
- Vista de detalle mostrada correctamente
- Sin modificaciones al reporte

---

### CU-INS-006: Eliminar Reportes de Inspección

**Actor Principal:** Administrador

**Precondiciones:**
- Usuario autenticado como Administrador
- Reportes existentes seleccionados

**Flujo Principal:**
1. El usuario accede al listado de inspecciones
2. El usuario selecciona uno o más reportes mediante checkboxes
3. El usuario hace clic en "Eliminar Seleccionados"
4. El sistema muestra diálogo de confirmación: "¿Está seguro de eliminar X reporte(s)?"
5. El usuario confirma
6. El sistema elimina los reportes (soft delete)
7. El sistema muestra confirmación
8. El sistema actualiza el listado

**Flujos Alternativos:**

*FA1 - Cancelar eliminación:*
- En el paso 5, el usuario cancela
- El sistema cierra el diálogo
- Los reportes permanecen sin cambios

**Postcondiciones:**
- Reportes marcados como eliminados (soft delete)
- Reportes no visibles en el listado
- Auditoría de eliminación registrada

---

### CU-INS-007: Ver Dashboard de Inspecciones

**Actor Principal:** Usuario autenticado

**Precondiciones:**
- Usuario autenticado

**Flujo Principal:**
1. El usuario accede al módulo de Inspecciones
2. El sistema muestra el dashboard con:
   - Total de inspecciones
   - Inspecciones abiertas
   - Inspecciones cerradas
   - Tasa de cierre (%)
   - Gráfico por tipo de inspección (Técnica vs Auditoría Cruzada)
   - Gráfico por clasificación
   - Tendencia de los últimos 30 días
   - Últimos 5 reportes creados
3. El usuario puede hacer clic en cualquier tarjeta para ir al listado filtrado

**Postcondiciones:**
- Dashboard mostrado con datos actualizados
- Navegación funcional a listados filtrados

---

## ✅ Criterios de Aceptación

### CA-INS-001: Formulario de Inspección Técnica (Opción 1)

| ID | Criterio | Verificación |
|----|----------|--------------|
| CA-001-01 | Solo usuarios con rol Administrador, Usuario KAPA o Cliente pueden ver la opción de crear Inspección Técnica | Manual/Automatizado |
| CA-001-02 | El campo Fecha debe mostrar la fecha actual por defecto | Automatizado |
| CA-001-03 | El campo Fecha no puede ser mayor a la fecha actual | Automatizado |
| CA-001-04 | Al seleccionar Cliente, el campo Proyecto debe filtrar solo los proyectos de ese cliente | Automatizado |
| CA-001-05 | Al seleccionar Cliente, el campo Empresa contratista debe filtrar solo los contratistas de ese centro de trabajo | Automatizado |
| CA-001-06 | El campo Quien reporta debe mostrar personal KAPA y usuarios del cliente seleccionado | Automatizado |
| CA-001-07 | El campo Tipo debe tener exactamente 3 opciones: Seguridad, Medio Ambiente, Salud | Automatizado |
| CA-001-08 | Al seleccionar Tipo "Seguridad", el campo Clasificación debe mostrar 6 opciones específicas | Automatizado |
| CA-001-09 | Al seleccionar Tipo "Medio Ambiente", el campo Clasificación debe mostrar 4 opciones específicas | Automatizado |
| CA-001-10 | Al seleccionar Tipo "Salud", el campo Clasificación debe mostrar 2 opciones específicas | Automatizado |
| CA-001-11 | El campo Observación debe estar deshabilitado cuando Estado es "Cerrado" | Automatizado |
| CA-001-12 | El campo Observación debe estar habilitado cuando Estado es "Abierto" | Automatizado |
| CA-001-13 | Todos los campos marcados como obligatorios deben validarse antes de guardar | Automatizado |
| CA-001-14 | El formulario debe mostrar mensajes de error claros para cada campo inválido | Automatizado |
| CA-001-15 | Al guardar exitosamente, debe mostrarse notificación de éxito | Automatizado |
| CA-001-16 | Al guardar exitosamente, debe redirigir al listado de inspecciones | Automatizado |

### CA-INS-002: Formulario de Auditoría Cruzada (Opción 2)

| ID | Criterio | Verificación |
|----|----------|--------------|
| CA-002-01 | Cualquier usuario autenticado puede crear una Auditoría Cruzada | Automatizado |
| CA-002-02 | El campo Fecha debe mostrar la fecha actual por defecto | Automatizado |
| CA-002-03 | El campo Fecha no puede ser mayor a la fecha actual | Automatizado |
| CA-002-04 | Al seleccionar Cliente, el campo Proyecto debe filtrar solo los proyectos de ese cliente | Automatizado |
| CA-002-05 | El campo Área debe tener exactamente 21 opciones predefinidas | Automatizado |
| CA-002-06 | Al seleccionar Cliente, los campos Empresa auditora y Empresa auditada deben filtrar contratistas de ese centro de trabajo | Automatizado |
| CA-002-07 | No debe permitirse seleccionar la misma empresa como auditora y auditada | Automatizado |
| CA-002-08 | El campo Clasificación debe tener un único valor fijo: "KAPA-AO-FO-003 Auditoria cruzada" | Automatizado |
| CA-002-09 | El campo Observación debe estar deshabilitado cuando Estado es "Cerrado" | Automatizado |
| CA-002-10 | El campo Observación debe estar habilitado cuando Estado es "Abierto" | Automatizado |
| CA-002-11 | Todos los campos marcados como obligatorios deben validarse antes de guardar | Automatizado |
| CA-002-12 | Al guardar exitosamente, debe mostrarse notificación de éxito | Automatizado |

### CA-INS-003: Listado de Inspecciones

| ID | Criterio | Verificación |
|----|----------|--------------|
| CA-003-01 | El listado debe mostrar columnas: ID, Tipo Inspección, Clasificación, Cliente, Proyecto, Estado, Fecha, Acciones | Manual |
| CA-003-02 | El filtro por Tipo de Inspección debe funcionar correctamente | Automatizado |
| CA-003-03 | El filtro por Estado debe funcionar correctamente | Automatizado |
| CA-003-04 | El filtro por Cliente debe funcionar correctamente | Automatizado |
| CA-003-05 | El filtro por rango de fechas debe incluir todo el día seleccionado (00:00:00 a 23:59:59) | Automatizado |
| CA-003-06 | El botón "Limpiar" debe resetear todos los filtros | Automatizado |
| CA-003-07 | La paginación debe funcionar correctamente con 25 registros por página | Automatizado |
| CA-003-08 | El ordenamiento por columnas debe funcionar correctamente | Automatizado |
| CA-003-09 | El botón "Ver" debe estar visible para todos los usuarios con permisos de lectura | Automatizado |
| CA-003-10 | El botón "Editar" debe estar visible solo para usuarios con permisos de edición | Automatizado |
| CA-003-11 | El botón "Editar" debe estar visible para admin en reportes cerrados | Automatizado |
| CA-003-12 | El checkbox de selección múltiple solo debe estar visible para Administradores | Automatizado |

### CA-INS-004: Edición de Inspecciones

| ID | Criterio | Verificación |
|----|----------|--------------|
| CA-004-01 | Al editar, el formulario debe cargar todos los datos existentes correctamente | Automatizado |
| CA-004-02 | El campo Tipo de inspección NO debe ser editable | Automatizado |
| CA-004-03 | Los campos dependientes deben mantener sus opciones correctas al cargar | Automatizado |
| CA-004-04 | Solo Administradores pueden editar reportes con estado "Cerrado" | Automatizado |
| CA-004-05 | Al guardar cambios, debe mostrarse notificación de éxito | Automatizado |
| CA-004-06 | Al cambiar Estado de "Abierto" a "Cerrado", debe registrarse fecha de cierre | Automatizado |

### CA-INS-005: Visualización de Detalle

| ID | Criterio | Verificación |
|----|----------|--------------|
| CA-005-01 | Todos los campos deben mostrarse en modo solo lectura | Manual |
| CA-005-02 | NO deben mostrarse botones de edición de datos en la vista de detalle | Automatizado |
| CA-005-03 | Debe mostrarse información de auditoría (creado por, fecha, modificado por, fecha) | Manual |
| CA-005-04 | Los campos de selección deben mostrar el texto descriptivo, no el ID | Automatizado |

### CA-INS-006: Dashboard

| ID | Criterio | Verificación |
|----|----------|--------------|
| CA-006-01 | Debe mostrar el total correcto de inspecciones | Automatizado |
| CA-006-02 | Debe mostrar el conteo correcto de inspecciones abiertas | Automatizado |
| CA-006-03 | Debe mostrar el conteo correcto de inspecciones cerradas | Automatizado |
| CA-006-04 | La tasa de cierre debe calcularse correctamente (cerrados/total * 100) | Automatizado |
| CA-006-05 | El gráfico por tipo debe mostrar datos correctos | Manual |
| CA-006-06 | Al hacer clic en una tarjeta, debe navegar al listado con el filtro correspondiente | Automatizado |

---

## 🎨 Reglas de Usabilidad y Experiencia de Usuario

### RU-001: Consistencia Visual
- Los formularios deben seguir el mismo diseño que el módulo ILV
- Usar los mismos componentes Quasar (q-select, q-input, q-btn, etc.)
- Mantener la misma paleta de colores y estilos
- Los iconos deben ser coherentes con el resto del sistema
- Chips de estado: Abierto (naranja), Cerrado (verde)

### RU-002: Feedback Inmediato
- Mostrar indicador de carga durante operaciones asíncronas
- Mostrar notificaciones de éxito/error en la esquina superior derecha
- Los botones deben mostrar estado de loading mientras procesan
- Los campos con error deben resaltarse inmediatamente

### RU-003: Prevención de Errores
- Deshabilitar el botón "Guardar" hasta que todos los campos obligatorios estén completos
- Mostrar hint en campos con reglas especiales
- Confirmar antes de eliminar registros
- Mantener datos del formulario si hay error de red
- Validar que empresa auditora ≠ empresa auditada

### RU-004: Navegación Intuitiva
- Breadcrumbs en todas las páginas (Dashboard > Inspecciones > Nuevo/Editar/Ver)
- Botón "Volver" visible en formularios y detalle
- Navegación por menú lateral consistente con otros módulos
- Icono distintivo para el módulo de Inspecciones

### RU-005: Accesibilidad
- Labels descriptivos en todos los campos
- Hints explicativos donde sea necesario
- Orden de tabulación lógico
- Mensajes de error legibles
- Contraste adecuado en todos los elementos

### RU-006: Rendimiento
- Carga lazy de opciones en selectores
- Paginación del lado del servidor
- Caché de datos maestros
- Optimización de consultas con joins

### RU-007: Responsive Design
- Formularios adaptables a dispositivos móviles
- Tablas con scroll horizontal en pantallas pequeñas
- Menú colapsable en móviles
- Touch-friendly en botones y selectores

### RU-008: Campos Condicionales
- El campo Observación se muestra siempre pero se habilita/deshabilita según Estado
- Mostrar hint: "Solo editable cuando el estado es Abierto" cuando está deshabilitado
- El campo Clasificación se filtra según Tipo seleccionado (solo Opción 1)

---

## 📐 Estructura de Datos

### Entidad: `inspeccion_report`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| report_id | SERIAL | Sí | Identificador único |
| tipo_inspeccion | VARCHAR(20) | Sí | 'tecnica' o 'auditoria_cruzada' |
| fecha | DATE | Sí | Fecha del reporte |
| cliente_id | INTEGER | Sí | FK a centro de trabajo |
| proyecto_id | INTEGER | Sí | FK a proyecto |
| estado | VARCHAR(20) | Sí | 'abierto' o 'cerrado' |
| observacion | TEXT | No | Observaciones (solo si abierto) |
| propietario_user_id | INTEGER | Sí | FK a usuario que creó |
| creado_en | TIMESTAMP | Sí | Fecha de creación |
| actualizado_en | TIMESTAMP | No | Fecha de última actualización |
| fecha_cierre | TIMESTAMP | No | Fecha cuando se cerró |

### Entidad: `inspeccion_report_field`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| field_id | SERIAL | Sí | Identificador único |
| report_id | INTEGER | Sí | FK a inspeccion_report |
| key | VARCHAR(100) | Sí | Nombre del campo |
| value | TEXT | Sí | Valor almacenado |
| value_type | VARCHAR(20) | Sí | Tipo de dato |

### Entidad: `inspeccion_maestro`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| maestro_id | SERIAL | Sí | Identificador único |
| tipo | VARCHAR(50) | Sí | Tipo de maestro |
| clave | VARCHAR(50) | No | Clave corta |
| valor | VARCHAR(255) | Sí | Valor a mostrar |
| padre_id | INTEGER | No | FK para jerarquías |
| orden | INTEGER | No | Orden de visualización |
| activo | BOOLEAN | Sí | Si está activo |

---

## 🔗 Dependencias con Módulos Existentes

1. **Módulo de Autenticación**: Validación de roles y permisos
2. **Módulo de Clientes/Centros de Trabajo**: Lista de clientes
3. **Módulo de Proyectos**: Lista de proyectos por cliente
4. **Módulo de Contratistas**: Lista de contratistas por centro de trabajo
5. **Módulo de Usuarios**: Lista de personal KAPA y usuarios cliente
6. **Módulo de Auditoría**: Registro de acciones
7. **Módulo ILV**: Referencia de arquitectura y patrones

---

## 📎 Anexo A: Catálogo de Clasificaciones por Tipo

### Tipo: Seguridad (6 opciones)
| Código | Descripción |
|--------|-------------|
| KAPA-AO-FO-008 | Inspección de equipos y herramientas |
| KAPA-AO-FO-014 | Inspección de uso y estado de elementos de protección personal y dotación |
| KAPA-AO-FO-015 | Inspección de seguridad para extintores |
| KAPA-AO-FO-016 | Inspección de equipos de alturas |
| KAPA-AO-FO-017 | Inspección de escaleras |
| KAPA-AO-FO-025 | Inspección de camilla de emergencias |

### Tipo: Medio Ambiente (4 opciones)
| Código | Descripción |
|--------|-------------|
| KAPA-AO-FO-009 | Inspección de productos químicos |
| KAPA-AO-FO-012 | Inspección orden y aseo |
| KAPA-AO-FO-013 | Inspección puntos ecológicos |
| KAPA-AO-FO-019 | Inspección de kit de derrames |

### Tipo: Salud (2 opciones)
| Código | Descripción |
|--------|-------------|
| KAPA-CL-FO-024 | Inspección de botiquin de emergencia |
| KAPA-AO-FO-010 | Inspección de puntos de hidratación |

### Tipo: Auditoría Cruzada (1 opción fija)
| Código | Descripción |
|--------|-------------|
| KAPA-AO-FO-003 | Auditoria cruzada |

---

## 📎 Anexo B: Catálogo de Áreas (Solo Opción 2)

| # | Área |
|---|------|
| 1 | Horno |
| 2 | Alimentadores |
| 3 | Formación |
| 4 | Decorado |
| 5 | Inspección automática y calidad |
| 6 | Zona Fría |
| 7 | Logística |
| 8 | Almacén |
| 9 | Talleres |
| 10 | Materias Primas (Silos - Batch house) |
| 11 | Planta agua |
| 12 | Planta térmica |
| 13 | Planta de oxigeno |
| 14 | Compresores |
| 15 | Oficinas |
| 16 | Área externas |
| 17 | Sótano |
| 18 | Comedor / Cafetería |
| 19 | Planta de Arena / Mina de arena |
| 20 | Bodegas |
| 21 | Planta Diesel |

---

## 📎 Anexo C: Mapeo de Roles a IDs del Sistema

| Rol | ID | Acceso Opción 1 | Acceso Opción 2 |
|-----|-----|-----------------|-----------------|
| Administrador | 1 | ✅ | ✅ |
| Usuario KAPA | 2 | ✅ | ✅ |
| Cliente | 3 | ✅ | ✅ |
| Contratista | 4 | ❌ | ✅ |
| Visitante | 5 | ❌ | ✅ |

---

*Documento creado: 29 de Noviembre de 2025*
*Versión: 1.0*
