# 🧪 Testing E2E - Form Builder Module

## 📋 Resumen

Este documento define las reglas y casos de prueba detallados para validar el módulo Form Builder mediante tests automatizados con Playwright. Los tests deben cubrir desde la perspectiva del usuario final todas las funcionalidades del módulo.

---

## 🎯 Objetivos del Testing

1. **Validar funcionalidad completa** del editor de formularios
2. **Asegurar correcta integración** con el módulo de inspecciones
3. **Verificar visualización** de formularios llenados
4. **Garantizar persistencia** de datos
5. **Comprobar permisos** y accesos según rol

---

## 👤 Usuarios de Prueba

| Usuario | Rol | Permisos |
|---------|-----|----------|
| `admin@test.com` | Administrador | CRUD completo de formularios |
| `user@test.com` | Usuario KAPA | Llenar formularios, ver inspecciones |
| `cliente@test.com` | Cliente | Llenar formularios, ver sus inspecciones |

---

## 📁 Estructura de Tests

```
e2e/tests/form-builder/
├── form-builder-admin.spec.ts        # Tests del editor (admin)
├── form-builder-fill.spec.ts         # Tests de llenado de formularios
├── form-builder-view.spec.ts         # Tests de visualización
├── form-builder-integration.spec.ts  # Tests de integración con inspecciones
├── form-builder-permissions.spec.ts  # Tests de permisos
└── form-builder-fields.spec.ts       # Tests de cada tipo de campo
```

---

## 🔐 TEST SUITE 1: Permisos y Acceso

### T1.1 - Acceso al módulo Form Builder (Admin)

```typescript
test('T1.1 - Admin puede acceder al módulo Form Builder', async ({ page }) => {
  // DADO: Usuario admin autenticado
  // CUANDO: Navega al menú de administración
  // ENTONCES: 
  //   - Debe ver opción "Form Builder" en el menú
  //   - Al hacer clic, debe cargar la lista de formularios
  //   - Debe ver botón "+ Nuevo Formulario"
});
```

**Reglas de validación:**
- [ ] El menú lateral muestra "Form Builder" solo para administradores
- [ ] La URL `/admin/form-builder` es accesible
- [ ] Se carga la lista de formularios existentes
- [ ] El botón "Nuevo Formulario" está visible y habilitado

### T1.2 - Acceso denegado para usuarios no admin

```typescript
test('T1.2 - Usuario no admin no puede acceder al Form Builder', async ({ page }) => {
  // DADO: Usuario regular autenticado (no admin)
  // CUANDO: Intenta navegar a /admin/form-builder
  // ENTONCES:
  //   - Debe ser redirigido o ver mensaje de acceso denegado
  //   - No debe ver opción "Form Builder" en el menú
});
```

**Reglas de validación:**
- [ ] La opción "Form Builder" NO aparece en el menú para usuarios no admin
- [ ] Acceso directo a URL redirige a página de no autorizado
- [ ] No se expone información del módulo a usuarios sin permiso

---

## 📝 TEST SUITE 2: Crear Formulario (Editor)

### T2.1 - Crear formulario básico

```typescript
test('T2.1 - Admin puede crear un formulario básico', async ({ page }) => {
  // DADO: Admin en la página del Form Builder
  // CUANDO: Hace clic en "Nuevo Formulario"
  // ENTONCES:
  //   - Se abre el editor de formularios
  //   - Puede ingresar nombre del formulario
  //   - Puede seleccionar clasificación(es)
  //   - Ve la barra lateral de componentes
  //   - Ve el canvas vacío
});
```

**Reglas de validación:**
- [ ] Campo "Nombre del formulario" es editable y requerido
- [ ] Selector de clasificaciones muestra todas las clasificaciones disponibles
- [ ] La barra lateral muestra componentes organizados por categoría
- [ ] El canvas muestra área de drop con mensaje "Arrastra un componente aquí"
- [ ] Botón "Guardar" está deshabilitado si no hay nombre o campos

### T2.2 - Drag & Drop de componentes

```typescript
test('T2.2 - Arrastrar componentes al canvas', async ({ page }) => {
  // DADO: Admin en el editor de formularios
  // CUANDO: Arrastra un componente "Texto" al canvas
  // ENTONCES:
  //   - El componente aparece en el canvas
  //   - Se muestra con configuración por defecto
  //   - Aparecen botones de editar, mover y eliminar
});
```

**Reglas de validación:**
- [ ] Drag inicia al mantener presionado un componente de la barra lateral
- [ ] El canvas resalta la zona de drop durante el drag
- [ ] Al soltar, el componente se agrega al canvas
- [ ] El componente muestra su tipo (icono) y label por defecto
- [ ] Se puede reordenar arrastrando componentes dentro del canvas

### T2.3 - Configurar campo

```typescript
test('T2.3 - Configurar propiedades de un campo', async ({ page }) => {
  // DADO: Un campo de texto en el canvas
  // CUANDO: Hace clic en el botón "Editar" del campo
  // ENTONCES:
  //   - Se abre modal de configuración
  //   - Puede cambiar: label, nombre técnico, placeholder
  //   - Puede marcar como obligatorio
  //   - Puede definir validaciones
  //   - Al guardar, el campo se actualiza en el canvas
});
```

**Reglas de validación:**
- [ ] Modal de configuración se abre correctamente
- [ ] Todos los campos de configuración son editables
- [ ] El nombre técnico se auto-genera desde el label (snake_case)
- [ ] Checkbox "Obligatorio" funciona
- [ ] Cambios se reflejan inmediatamente en el canvas al guardar
- [ ] Botón cancelar descarta cambios

### T2.4 - Eliminar campo

```typescript
test('T2.4 - Eliminar campo del formulario', async ({ page }) => {
  // DADO: Un formulario con campos
  // CUANDO: Hace clic en el botón "Eliminar" de un campo
  // ENTONCES:
  //   - Se muestra confirmación
  //   - Al confirmar, el campo desaparece del canvas
  //   - El campo no aparece en el árbol de estructura
});
```

**Reglas de validación:**
- [ ] Se muestra diálogo de confirmación antes de eliminar
- [ ] Al confirmar, el campo se elimina inmediatamente
- [ ] Si el campo tiene campos anidados, se muestra advertencia especial
- [ ] Cancelar mantiene el campo intacto

### T2.5 - Guardar formulario

```typescript
test('T2.5 - Guardar formulario exitosamente', async ({ page }) => {
  // DADO: Formulario con nombre, clasificación y al menos 1 campo
  // CUANDO: Hace clic en "Guardar"
  // ENTONCES:
  //   - Se muestra indicador de guardado
  //   - Notificación de éxito aparece
  //   - El formulario aparece en la lista de formularios
});
```

**Reglas de validación:**
- [ ] Botón "Guardar" se deshabilita durante el guardado
- [ ] Se muestra spinner o indicador de progreso
- [ ] Notificación verde "Formulario guardado exitosamente"
- [ ] Se redirige a la lista o permanece en el editor
- [ ] El formulario aparece en la lista con estado correcto

### T2.6 - Validación de formulario incompleto

```typescript
test('T2.6 - No permite guardar formulario incompleto', async ({ page }) => {
  // DADO: Formulario sin nombre o sin clasificación
  // CUANDO: Intenta guardar
  // ENTONCES:
  //   - Se muestran mensajes de error en campos faltantes
  //   - No se guarda el formulario
});
```

**Reglas de validación:**
- [ ] Campo nombre muestra error si está vacío
- [ ] Selector de clasificación muestra error si no hay selección
- [ ] Mensaje de error es claro y específico
- [ ] El foco se mueve al primer campo con error

---

## 🏗️ TEST SUITE 3: Campos de Estructura (Anidamiento)

### T3.1 - Crear grupo de campos

```typescript
test('T3.1 - Crear un grupo que contenga campos', async ({ page }) => {
  // DADO: Admin en el editor
  // CUANDO: Arrastra "Group" al canvas y luego campos dentro del group
  // ENTONCES:
  //   - El group se crea con su título
  //   - Los campos aparecen dentro del group
  //   - El árbol de estructura muestra la jerarquía
});
```

**Reglas de validación:**
- [ ] El Group muestra área de drop para campos internos
- [ ] Los campos arrastrados dentro se anidan correctamente
- [ ] El árbol de estructura refleja la jerarquía
- [ ] El group puede colapsarse/expandirse
- [ ] Eliminar el group ofrece eliminar hijos o moverlos fuera

### T3.2 - Crear tabs con campos

```typescript
test('T3.2 - Crear pestañas con campos en cada una', async ({ page }) => {
  // DADO: Admin en el editor
  // CUANDO: Arrastra "Tabs" y configura pestañas con campos
  // ENTONCES:
  //   - Se crean las pestañas definidas
  //   - Cada pestaña puede contener campos
  //   - Se puede navegar entre pestañas en el editor
});
```

**Reglas de validación:**
- [ ] Modal de configuración permite agregar/quitar pestañas
- [ ] Cada pestaña tiene nombre e icono configurables
- [ ] Los campos se pueden arrastrar a la pestaña activa
- [ ] Cambiar de pestaña muestra los campos correspondientes
- [ ] Mínimo 2 pestañas requeridas

### T3.3 - Crear repeater

```typescript
test('T3.3 - Crear campo repeater con campos internos', async ({ page }) => {
  // DADO: Admin en el editor
  // CUANDO: Arrastra "Repeater" y agrega campos dentro
  // ENTONCES:
  //   - El repeater muestra los campos plantilla
  //   - Se puede configurar min/max de repeticiones
  //   - El texto del botón agregar es personalizable
});
```

**Reglas de validación:**
- [ ] Repeater muestra zona de drop para campos internos
- [ ] Configuración permite definir minItems y maxItems
- [ ] Se puede personalizar texto del botón "Agregar"
- [ ] Los campos dentro del repeater se muestran correctamente
- [ ] Preview muestra cómo se verá con una entrada

### T3.4 - Anidamiento profundo

```typescript
test('T3.4 - Anidar estructuras en múltiples niveles', async ({ page }) => {
  // DADO: Admin en el editor
  // CUANDO: Crea Group > Tabs > Repeater > Campos
  // ENTONCES:
  //   - La estructura se crea correctamente
  //   - El árbol de estructura muestra todos los niveles
  //   - Se puede navegar y editar en cualquier nivel
});
```

**Reglas de validación:**
- [ ] Se permite anidamiento de al menos 5 niveles
- [ ] El árbol de estructura es expandible/colapsable
- [ ] Se puede seleccionar cualquier elemento del árbol
- [ ] El breadcrumb muestra la ruta actual
- [ ] Drag & drop funciona en niveles profundos

### T3.5 - Campo condicional

```typescript
test('T3.5 - Crear campo condicional que muestra/oculta campos', async ({ page }) => {
  // DADO: Formulario con un campo select "Estado"
  // CUANDO: Agrega un Conditional que depende del select
  // ENTONCES:
  //   - Se puede configurar la condición (campo, operador, valor)
  //   - Los campos dentro se configuran
  //   - Preview muestra comportamiento según valor
});
```

**Reglas de validación:**
- [ ] Selector de campo muestra todos los campos previos
- [ ] Selector de operador muestra opciones válidas para el tipo de campo
- [ ] Campo de valor se adapta al tipo seleccionado
- [ ] Se pueden agregar campos al área "Si verdadero"
- [ ] Opcionalmente se pueden agregar campos "Si falso"

---

## ✏️ TEST SUITE 4: Llenado de Formularios

### T4.1 - Ver formularios asociados a clasificación

```typescript
test('T4.1 - Al seleccionar clasificación aparecen formularios asociados', async ({ page }) => {
  // DADO: Usuario creando una inspección
  // CUANDO: Selecciona una clasificación que tiene formularios
  // ENTONCES:
  //   - Aparece sección "Formularios Asociados"
  //   - Se listan los formularios con nombre y si son obligatorios
  //   - Cada uno tiene botón "Llenar formulario"
});
```

**Reglas de validación:**
- [ ] La sección aparece solo si hay formularios asociados
- [ ] Los formularios obligatorios muestran indicador visual
- [ ] Los formularios opcionales se distinguen visualmente
- [ ] El botón "Llenar formulario" está habilitado

### T4.2 - Abrir modal de llenado

```typescript
test('T4.2 - Abrir formulario para llenar', async ({ page }) => {
  // DADO: Usuario viendo formularios asociados
  // CUANDO: Hace clic en "Llenar formulario"
  // ENTONCES:
  //   - Se abre modal con el formulario renderizado
  //   - Todos los campos son interactivos
  //   - Se muestran los campos obligatorios marcados
});
```

**Reglas de validación:**
- [ ] Modal se abre con animación suave
- [ ] El título del modal es el nombre del formulario
- [ ] Los campos obligatorios tienen asterisco (*)
- [ ] Botones "Cancelar" y "Guardar" están visibles
- [ ] Se puede cerrar con X o clic fuera del modal

### T4.3 - Llenar campos básicos

```typescript
test('T4.3 - Llenar campos de texto, número, fecha', async ({ page }) => {
  // DADO: Modal de formulario abierto
  // CUANDO: Llena campos básicos
  // ENTONCES:
  //   - Los valores se ingresan correctamente
  //   - Las validaciones se ejecutan en tiempo real
  //   - Los errores se muestran debajo del campo
});
```

**Reglas de validación:**
- [ ] Campo texto acepta caracteres y respeta maxLength
- [ ] Campo número solo acepta números, respeta min/max
- [ ] Campo fecha abre selector de fecha
- [ ] Campo email valida formato
- [ ] Errores se muestran en rojo debajo del campo
- [ ] Campo válido muestra checkmark verde (opcional)

### T4.4 - Llenar campos de selección

```typescript
test('T4.4 - Llenar campos select, radio, checkbox', async ({ page }) => {
  // DADO: Modal de formulario con campos de selección
  // CUANDO: Interactúa con cada tipo
  // ENTONCES:
  //   - Select abre dropdown con opciones
  //   - Radio permite una sola selección
  //   - Checkbox permite múltiples selecciones
});
```

**Reglas de validación:**
- [ ] Select muestra todas las opciones configuradas
- [ ] Select con búsqueda filtra opciones al escribir
- [ ] Radio deselecciona el anterior al seleccionar otro
- [ ] Checkbox permite marcar/desmarcar múltiples
- [ ] Toggle cambia entre estados Sí/No

### T4.5 - Llenar campos multimedia

```typescript
test('T4.5 - Subir imagen y capturar firma', async ({ page }) => {
  // DADO: Modal con campo de imagen y firma
  // CUANDO: Sube imagen y dibuja firma
  // ENTONCES:
  //   - La imagen se muestra en preview
  //   - La firma se captura correctamente
  //   - Se puede limpiar y volver a hacer
});
```

**Reglas de validación:**
- [ ] Campo imagen acepta click para abrir selector de archivo
- [ ] Solo acepta tipos de archivo configurados (jpg, png)
- [ ] Muestra preview de la imagen seleccionada
- [ ] Campo firma muestra canvas para dibujar
- [ ] Botón "Limpiar" borra la firma
- [ ] La firma se guarda como imagen

### T4.6 - Llenar repeater (agregar/eliminar entradas)

```typescript
test('T4.6 - Agregar y eliminar entradas en repeater', async ({ page }) => {
  // DADO: Formulario con campo repeater
  // CUANDO: Agrega múltiples entradas
  // ENTONCES:
  //   - Cada entrada muestra los campos configurados
  //   - Botón "Agregar" crea nueva entrada
  //   - Botón "Eliminar" quita la entrada
  //   - Se respeta min/max de entradas
});
```

**Reglas de validación:**
- [ ] Entrada inicial se muestra si minItems > 0
- [ ] Botón "+" agrega nueva entrada con campos vacíos
- [ ] Cada entrada tiene número identificador (#1, #2, etc.)
- [ ] Botón eliminar aparece si hay más de minItems entradas
- [ ] Botón agregar se deshabilita al alcanzar maxItems
- [ ] Las entradas se pueden reordenar (si está habilitado)

### T4.7 - Lógica condicional al llenar

```typescript
test('T4.7 - Campos condicionales aparecen/desaparecen según valor', async ({ page }) => {
  // DADO: Formulario con campo condicional
  // CUANDO: Cambia el valor del campo que controla la condición
  // ENTONCES:
  //   - Los campos condicionados aparecen/desaparecen
  //   - La transición es suave
  //   - Los valores de campos ocultos no se envían
});
```

**Reglas de validación:**
- [ ] Campos condicionados están ocultos inicialmente (si condición no se cumple)
- [ ] Al cumplirse condición, campos aparecen con animación
- [ ] Al dejar de cumplirse, campos desaparecen
- [ ] Los valores de campos ocultos se limpian (opcional según config)
- [ ] Las validaciones de campos ocultos no se ejecutan

### T4.8 - Campos calculados

```typescript
test('T4.8 - Campos calculados muestran valor automático', async ({ page }) => {
  // DADO: Formulario con campo calculado (ej: cantidad * precio)
  // CUANDO: Ingresa valores en los campos de la fórmula
  // ENTONCES:
  //   - El campo calculado muestra el resultado
  //   - Se actualiza en tiempo real
  //   - No es editable manualmente
});
```

**Reglas de validación:**
- [ ] Campo calculado muestra valor inicial (0 o según fórmula)
- [ ] Al cambiar cualquier campo de la fórmula, se recalcula
- [ ] El formato es correcto (moneda, porcentaje, decimales)
- [ ] El campo está deshabilitado para edición manual
- [ ] Fórmulas con SUM de repeater funcionan correctamente

### T4.9 - Validación al guardar

```typescript
test('T4.9 - Validar formulario completo al intentar guardar', async ({ page }) => {
  // DADO: Formulario parcialmente llenado
  // CUANDO: Hace clic en "Guardar"
  // ENTONCES:
  //   - Se validan todos los campos obligatorios
  //   - Se muestran errores en campos inválidos
  //   - El foco va al primer error
  //   - No se cierra el modal hasta corregir
});
```

**Reglas de validación:**
- [ ] Todos los campos obligatorios vacíos muestran error
- [ ] Campos con validación personalizada se verifican
- [ ] Scroll automático al primer error
- [ ] Mensaje de error general en la parte superior (opcional)
- [ ] Conteo de errores "X campos con error"

### T4.10 - Guardar formulario exitosamente

```typescript
test('T4.10 - Guardar formulario llenado correctamente', async ({ page }) => {
  // DADO: Formulario completamente llenado y válido
  // CUANDO: Hace clic en "Guardar"
  // ENTONCES:
  //   - Se muestra indicador de guardado
  //   - El modal se cierra
  //   - El formulario aparece como "Completado" en la lista
  //   - Notificación de éxito
});
```

**Reglas de validación:**
- [ ] Spinner durante el guardado
- [ ] Botones deshabilitados durante guardado
- [ ] Modal se cierra al completar
- [ ] El formulario en la lista muestra ✅ Completado
- [ ] Notificación verde "Formulario guardado"

### T4.11 - Auto-guardado (si está habilitado)

```typescript
test('T4.11 - Auto-guardado funciona cada X segundos', async ({ page }) => {
  // DADO: Formulario con auto-guardado habilitado
  // CUANDO: Llena campos y espera el intervalo
  // ENTONCES:
  //   - Se muestra indicador "Guardando..."
  //   - Luego "Guardado" con timestamp
  //   - Los datos se persisten como borrador
});
```

**Reglas de validación:**
- [ ] Indicador de auto-guardado visible
- [ ] Se guarda cada X segundos configurados
- [ ] Se muestra última hora de guardado
- [ ] Al recargar, se recupera el borrador
- [ ] Opción de "Descartar borrador"

---

## 👁️ TEST SUITE 5: Visualización de Formularios Llenados

### T5.1 - Ver formularios en detalle de inspección

```typescript
test('T5.1 - Ver lista de formularios llenados en detalle de inspección', async ({ page }) => {
  // DADO: Inspección con formularios llenados
  // CUANDO: Accede al detalle de la inspección
  // ENTONCES:
  //   - Se muestra sección "Formularios Diligenciados"
  //   - Lista cada formulario con nombre, autor, fecha
  //   - Botones Ver, Editar, Descargar PDF
});
```

**Reglas de validación:**
- [ ] Sección aparece si hay al menos un formulario llenado
- [ ] Cada formulario muestra: nombre, quién lo llenó, cuándo
- [ ] Si tiene scoring, muestra puntuación
- [ ] Botón "Ver" siempre visible
- [ ] Botón "Editar" visible si inspección está abierta
- [ ] Botón "Descargar PDF" siempre visible

### T5.2 - Abrir modal de visualización

```typescript
test('T5.2 - Ver formulario en modo solo lectura', async ({ page }) => {
  // DADO: Lista de formularios en detalle de inspección
  // CUANDO: Hace clic en "Ver formulario"
  // ENTONCES:
  //   - Se abre modal con datos del formulario
  //   - Todos los campos muestran valores (no editables)
  //   - Las imágenes se muestran
  //   - Las firmas se muestran
});
```

**Reglas de validación:**
- [ ] Modal se abre con título del formulario
- [ ] Encabezado muestra: autor, fecha, puntuación
- [ ] Campos de texto muestran el valor como texto
- [ ] Campos de selección muestran la opción seleccionada
- [ ] Imágenes se muestran con opción de ampliar
- [ ] Firmas se muestran como imagen
- [ ] No hay campos editables
- [ ] Botón "Cerrar" cierra el modal

### T5.3 - Visualizar repeaters

```typescript
test('T5.3 - Ver todas las entradas de un repeater', async ({ page }) => {
  // DADO: Formulario con repeater de 3 entradas
  // CUANDO: Ve el formulario
  // ENTONCES:
  //   - Se muestran las 3 entradas
  //   - Cada entrada tiene sus valores
  //   - Están numeradas (#1, #2, #3)
});
```

**Reglas de validación:**
- [ ] Todas las entradas del repeater son visibles
- [ ] Cada entrada muestra número secuencial
- [ ] Los campos dentro de cada entrada muestran sus valores
- [ ] Si hay repeaters anidados, se muestran correctamente

### T5.4 - Visualizar campos condicionales

```typescript
test('T5.4 - Solo mostrar campos que aplican', async ({ page }) => {
  // DADO: Formulario con campo condicional
  // CUANDO: Ve el formulario donde la condición se cumplió
  // ENTONCES:
  //   - Solo se muestran los campos que aplican
  //   - Los campos que no aplican no aparecen
});
```

**Reglas de validación:**
- [ ] Campos condicionales que no aplican NO se muestran
- [ ] Solo se visualizan los campos con valores relevantes
- [ ] La estructura se mantiene coherente

### T5.5 - Visualizar puntuación

```typescript
test('T5.5 - Ver puntuación y desglose', async ({ page }) => {
  // DADO: Formulario con scoring
  // CUANDO: Ve el formulario
  // ENTONCES:
  //   - Se muestra barra de progreso con puntuación
  //   - Se muestra estado (Cumple/No Cumple)
  //   - Se muestra desglose por sección
});
```

**Reglas de validación:**
- [ ] Barra de progreso muestra porcentaje correcto
- [ ] Color de barra según rango (verde/amarillo/rojo)
- [ ] Etiqueta de estado clara
- [ ] Desglose muestra puntos por cada criterio
- [ ] Total coincide con suma del desglose

### T5.6 - Vista compacta (acordeón)

```typescript
test('T5.6 - Alternar entre vista compacta y expandida', async ({ page }) => {
  // DADO: Inspección con múltiples formularios
  // CUANDO: Usa el toggle de vista
  // ENTONCES:
  //   - Vista compacta muestra solo resúmenes colapsados
  //   - Vista expandida muestra todo el contenido inline
});
```

**Reglas de validación:**
- [ ] Toggle de vista está visible
- [ ] Vista compacta muestra tarjetas con resumen
- [ ] Click en tarjeta expande el contenido
- [ ] Vista expandida muestra todo sin necesidad de modal
- [ ] El estado de vista se mantiene durante la sesión

### T5.7 - Ampliar imágenes

```typescript
test('T5.7 - Ampliar imagen al hacer clic', async ({ page }) => {
  // DADO: Formulario con imágenes
  // CUANDO: Hace clic en una imagen
  // ENTONCES:
  //   - Se abre lightbox con imagen ampliada
  //   - Se puede cerrar con X o clic fuera
  //   - Se puede descargar la imagen
});
```

**Reglas de validación:**
- [ ] Cursor indica que la imagen es clickeable
- [ ] Lightbox se abre centrado
- [ ] Imagen se muestra en tamaño completo o ajustado a pantalla
- [ ] Botón cerrar visible
- [ ] Botón descargar disponible

---

## ✏️ TEST SUITE 6: Edición de Formularios Llenados

### T6.1 - Editar formulario existente

```typescript
test('T6.1 - Editar un formulario ya llenado', async ({ page }) => {
  // DADO: Inspección abierta con formulario llenado
  // CUANDO: Hace clic en "Editar"
  // ENTONCES:
  //   - Se abre modal en modo edición
  //   - Los campos tienen los valores actuales
  //   - Puede modificar cualquier campo
});
```

**Reglas de validación:**
- [ ] Modal se abre con valores precargados
- [ ] Todos los campos son editables
- [ ] Se pueden modificar valores existentes
- [ ] Se pueden agregar/quitar entradas de repeater
- [ ] Botón "Guardar cambios" disponible

### T6.2 - No permitir edición si inspección cerrada

```typescript
test('T6.2 - No se puede editar si la inspección está cerrada', async ({ page }) => {
  // DADO: Inspección cerrada
  // CUANDO: Intenta editar formulario
  // ENTONCES:
  //   - Botón "Editar" está deshabilitado o no visible
  //   - O muestra mensaje explicativo
});
```

**Reglas de validación:**
- [ ] Botón "Editar" no aparece o está deshabilitado
- [ ] Tooltip explica por qué no se puede editar
- [ ] Solo se permite "Ver" y "Descargar PDF"

### T6.3 - Guardar cambios y registrar historial

```typescript
test('T6.3 - Los cambios se registran en el historial', async ({ page }) => {
  // DADO: Formulario editado
  // CUANDO: Guarda los cambios
  // ENTONCES:
  //   - Se registra en el historial
  //   - Se puede ver qué cambió, quién y cuándo
});
```

**Reglas de validación:**
- [ ] Cambios se guardan correctamente
- [ ] Entrada en historial con usuario y fecha
- [ ] Historial muestra campos modificados
- [ ] Valores anteriores y nuevos son visibles

### T6.4 - Ver historial de cambios

```typescript
test('T6.4 - Ver historial completo de un formulario', async ({ page }) => {
  // DADO: Formulario con múltiples ediciones
  // CUANDO: Accede al historial
  // ENTONCES:
  //   - Lista todas las modificaciones
  //   - Muestra detalle de cada cambio
  //   - Ordenado cronológicamente
});
```

**Reglas de validación:**
- [ ] Botón/link para ver historial
- [ ] Lista en orden cronológico (más reciente primero)
- [ ] Cada entrada muestra: fecha, usuario, acción
- [ ] Se puede expandir para ver detalles del cambio

---

## 📥 TEST SUITE 7: Exportación PDF

### T7.1 - Descargar formulario como PDF

```typescript
test('T7.1 - Generar y descargar PDF', async ({ page }) => {
  // DADO: Formulario llenado
  // CUANDO: Hace clic en "Descargar PDF"
  // ENTONCES:
  //   - Se genera el PDF
  //   - Se descarga automáticamente
  //   - El archivo tiene nombre descriptivo
});
```

**Reglas de validación:**
- [ ] Botón "Descargar PDF" inicia generación
- [ ] Se muestra indicador de progreso si tarda
- [ ] El PDF se descarga con nombre formato: `formulario_[nombre]_[fecha].pdf`
- [ ] El archivo se puede abrir correctamente

### T7.2 - Contenido del PDF

```typescript
test('T7.2 - Verificar contenido del PDF generado', async ({ page }) => {
  // DADO: PDF descargado
  // CUANDO: Se abre el archivo
  // ENTONCES:
  //   - Tiene encabezado con info de inspección
  //   - Todos los campos y valores están presentes
  //   - Las imágenes están incluidas
  //   - Las firmas están incluidas
  //   - Puntuación si aplica
});
```

**Reglas de validación:**
- [ ] Encabezado con logo y datos de inspección
- [ ] Todos los campos con sus labels y valores
- [ ] Imágenes embebidas en el PDF
- [ ] Firmas visibles en el PDF
- [ ] Puntuación y desglose si aplica
- [ ] Pie de página con fecha de generación

---

## 🔄 TEST SUITE 8: Integración con Inspecciones

### T8.1 - Crear inspección con formularios obligatorios

```typescript
test('T8.1 - No permitir crear inspección sin formularios obligatorios', async ({ page }) => {
  // DADO: Clasificación con formulario obligatorio
  // CUANDO: Intenta crear inspección sin llenar el formulario
  // ENTONCES:
  //   - Se muestra advertencia
  //   - Botón "Crear Inspección" está deshabilitado
  //   - O se permite pero con advertencia clara
});
```

**Reglas de validación:**
- [ ] Formularios obligatorios claramente marcados
- [ ] Advertencia si no están completos
- [ ] Opción de continuar con advertencia o bloqueo total
- [ ] Mensaje explica qué falta

### T8.2 - Formularios se asocian a la inspección

```typescript
test('T8.2 - Formularios llenados se vinculan a la inspección', async ({ page }) => {
  // DADO: Inspección creada con formularios
  // CUANDO: Accede al detalle
  // ENTONCES:
  //   - Los formularios están vinculados
  //   - Se pueden ver desde el detalle
  //   - Tienen la referencia correcta
});
```

**Reglas de validación:**
- [ ] Formularios aparecen en el detalle de inspección
- [ ] La referencia es bidireccional (inspección ↔ formulario)
- [ ] Eliminar inspección no elimina los datos del formulario (o según política)

### T8.3 - Cambiar clasificación limpia formularios

```typescript
test('T8.3 - Al cambiar clasificación se actualizan los formularios', async ({ page }) => {
  // DADO: Formulario llenado para clasificación A
  // CUANDO: Cambia a clasificación B
  // ENTONCES:
  //   - Se advierte que se perderán datos
  //   - Si confirma, se muestran formularios de clasificación B
  //   - Los datos anteriores se descartan
});
```

**Reglas de validación:**
- [ ] Advertencia antes de cambiar si hay datos
- [ ] Diálogo de confirmación
- [ ] Al confirmar, se cargan nuevos formularios
- [ ] Datos anteriores se limpian

---

## 🛡️ TEST SUITE 9: Casos de Error y Edge Cases

### T9.1 - Error de conexión al guardar

```typescript
test('T9.1 - Manejar error de red al guardar formulario', async ({ page }) => {
  // DADO: Formulario listo para guardar
  // CUANDO: Falla la conexión
  // ENTONCES:
  //   - Se muestra error amigable
  //   - Los datos no se pierden
  //   - Se puede reintentar
});
```

**Reglas de validación:**
- [ ] Mensaje de error claro "No se pudo guardar"
- [ ] Botón "Reintentar" disponible
- [ ] Los datos del formulario se mantienen en el modal
- [ ] No se cierra el modal en error

### T9.2 - Formulario muy largo

```typescript
test('T9.2 - Formulario con muchos campos hace scroll correcto', async ({ page }) => {
  // DADO: Formulario con 50+ campos
  // CUANDO: Se abre el modal
  // ENTONCES:
  //   - El modal tiene scroll interno
  //   - Se puede navegar por todo el formulario
  //   - Los botones de acción siempre visibles
});
```

**Reglas de validación:**
- [ ] Modal no excede altura de pantalla
- [ ] Scroll interno funciona
- [ ] Header y footer del modal fixed
- [ ] Botones siempre accesibles

### T9.3 - Campos con valores muy largos

```typescript
test('T9.3 - Visualizar campos con texto muy largo', async ({ page }) => {
  // DADO: Formulario con textarea de 1000+ caracteres
  // CUANDO: Se visualiza
  // ENTONCES:
  //   - El texto se muestra completo o con expand
  //   - No rompe el diseño
  //   - Se puede leer todo el contenido
});
```

**Reglas de validación:**
- [ ] Texto largo se muestra con ellipsis o expand
- [ ] Opción "Ver más" si está truncado
- [ ] No overflow visible
- [ ] Diseño se mantiene coherente

### T9.4 - Archivos grandes

```typescript
test('T9.4 - Subir archivo que excede el límite', async ({ page }) => {
  // DADO: Campo de archivo con límite de 5MB
  // CUANDO: Intenta subir archivo de 10MB
  // ENTONCES:
  //   - Se muestra error de tamaño
  //   - El archivo no se sube
  //   - Mensaje indica límite permitido
});
```

**Reglas de validación:**
- [ ] Validación de tamaño antes de subir
- [ ] Mensaje claro "Archivo excede el límite de XMB"
- [ ] No intenta subir el archivo
- [ ] Campo queda disponible para nuevo intento

### T9.5 - Sesión expirada durante llenado

```typescript
test('T9.5 - Manejar sesión expirada', async ({ page }) => {
  // DADO: Usuario llenando formulario
  // CUANDO: La sesión expira
  // ENTONCES:
  //   - Se detecta al intentar guardar
  //   - Se guarda borrador local si es posible
  //   - Se redirige a login
  //   - Puede recuperar datos al volver
});
```

**Reglas de validación:**
- [ ] Detección de sesión expirada
- [ ] Intento de guardar borrador en localStorage
- [ ] Redirección a login con mensaje
- [ ] Al volver, ofrecer recuperar borrador

---

## 📊 TEST SUITE 10: Rendimiento

### T10.1 - Carga rápida de lista de formularios

```typescript
test('T10.1 - Lista de formularios carga en menos de 2 segundos', async ({ page }) => {
  // DADO: 50+ formularios en el sistema
  // CUANDO: Accede a la lista
  // ENTONCES:
  //   - Se carga en menos de 2 segundos
  //   - Se muestra paginación si hay muchos
});
```

**Reglas de validación:**
- [ ] Tiempo de carga < 2 segundos
- [ ] Paginación funcional
- [ ] Skeleton loading durante carga

### T10.2 - Editor con formulario complejo

```typescript
test('T10.2 - Editor maneja formulario con 100+ campos', async ({ page }) => {
  // DADO: Formulario con 100 campos anidados
  // CUANDO: Se edita en el builder
  // ENTONCES:
  //   - No hay lag notable al arrastrar
  //   - El árbol de estructura es navegable
  //   - Guardar funciona correctamente
});
```

**Reglas de validación:**
- [ ] Drag & drop fluido
- [ ] Árbol de estructura responsive
- [ ] No congelamiento de UI
- [ ] Guardado completa sin timeout

### T10.3 - Renderizado de formulario grande

```typescript
test('T10.3 - Formulario con múltiples repeaters llenos', async ({ page }) => {
  // DADO: Formulario con 5 repeaters, cada uno con 10 entradas
  // CUANDO: Se visualiza
  // ENTONCES:
  //   - Renderiza sin problemas
  //   - Scroll funciona bien
  //   - Imágenes cargan progresivamente
});
```

**Reglas de validación:**
- [ ] Renderizado completo sin errores
- [ ] Imágenes con lazy loading
- [ ] Scroll fluido
- [ ] Memoria no excede límites razonables

---

## ✅ Checklist de Reglas Generales

### Interacción de Usuario
- [ ] Todos los botones tienen estados hover/active visibles
- [ ] Los elementos clickeables tienen cursor pointer
- [ ] Los campos deshabilitados tienen apariencia gris
- [ ] Los campos obligatorios tienen asterisco (*)
- [ ] Los errores se muestran en rojo
- [ ] Los éxitos se muestran en verde
- [ ] Las notificaciones desaparecen automáticamente (excepto errores críticos)

### Accesibilidad
- [ ] Navegación por teclado funciona (Tab, Enter, Escape)
- [ ] Los modales atrapan el foco
- [ ] Los labels están asociados a sus campos
- [ ] Contraste de colores es suficiente
- [ ] Los mensajes de error se anuncian a lectores de pantalla

### Responsive
- [ ] El editor funciona en pantallas de 1024px+
- [ ] El llenado de formularios funciona en móvil
- [ ] La visualización se adapta a diferentes tamaños
- [ ] Los modales no se salen de la pantalla

### Persistencia
- [ ] Los datos se guardan correctamente en BD
- [ ] Los borradores se guardan localmente
- [ ] No hay pérdida de datos en navegación
- [ ] Los archivos se suben correctamente

### Seguridad
- [ ] Solo admin accede al builder
- [ ] Los endpoints validan permisos
- [ ] No hay XSS en campos de texto
- [ ] Los archivos se validan en servidor

---

## 🏃 Ejecución de Tests

### Comandos

```bash
# Ejecutar todos los tests del form builder
npx playwright test e2e/tests/form-builder/

# Ejecutar suite específica
npx playwright test e2e/tests/form-builder/form-builder-admin.spec.ts

# Ejecutar con UI mode
npx playwright test e2e/tests/form-builder/ --ui

# Ejecutar en modo headed (ver navegador)
npx playwright test e2e/tests/form-builder/ --headed

# Generar reporte
npx playwright test e2e/tests/form-builder/ --reporter=html
```

### Configuración de Datos de Prueba

```typescript
// fixtures/form-builder.fixtures.ts

export const testFormTemplate = {
  name: 'Formulario de Prueba E2E',
  classifications: [4], // KAPA-AO-FO-008
  schema: {
    version: '2.0',
    fields: [
      { type: 'text', label: 'Nombre', name: 'nombre', required: true },
      { type: 'select', label: 'Estado', name: 'estado', 
        properties: { options: ['Bueno', 'Malo'] } },
      { type: 'signature', label: 'Firma', name: 'firma', required: true }
    ]
  }
};

export const testSubmission = {
  data: {
    nombre: 'Test Usuario',
    estado: 'Bueno',
    firma: 'data:image/png;base64,...'
  }
};
```

---

## 📈 Métricas de Cobertura Esperada

| Área | Cobertura Objetivo |
|------|-------------------|
| Creación de formularios | 95% |
| Tipos de campos | 100% |
| Llenado de formularios | 95% |
| Visualización | 90% |
| Edición | 90% |
| Exportación PDF | 85% |
| Integración inspecciones | 95% |
| Manejo de errores | 80% |
| Permisos | 100% |

---

**Documento creado:** 04/12/2024  
**Autor:** Sistema KAPA  
**Versión:** 1.0
