# 🏗️ Módulo Form Builder - Especificación Funcional

## 📋 Resumen Ejecutivo

El **Form Builder** es un módulo de generación de formularios dinámicos que permite a los administradores crear, configurar y asignar formularios personalizados a las clasificaciones del módulo de Inspecciones. Los usuarios finales podrán completar estos formularios de manera intuitiva directamente desde el formulario de creación de inspecciones.

**Filosofía de Diseño:** UX digno de un premio Nobel - pensado para usuarios sin conocimientos técnicos.

---

## 🎯 Objetivos del Módulo

1. **Empoderamiento del administrador**: Permitir crear formularios sin necesidad de desarrolladores
2. **Flexibilidad total**: Soportar múltiples tipos de campos y configuraciones
3. **Asociación inteligente**: Vincular formularios a clasificaciones de inspección
4. **Experiencia de usuario excepcional**: Interfaz de arrastrar y soltar (drag & drop)
5. **Campos repetibles**: Permitir campos "repeater" para datos dinámicos
6. **Anidamiento ilimitado**: Campos dentro de campos, grupos dentro de grupos
7. **Lógica condicional**: Mostrar/ocultar campos basado en respuestas
8. **Campos calculados**: Fórmulas automáticas basadas en otros campos
9. **Integración fluida**: Los formularios se presentan como modales en el flujo de inspecciones

---

## 👥 Actores del Sistema

| Actor | Descripción | Permisos |
|-------|-------------|----------|
| **Administrador** | Usuario con rol de administrador | ✅ CRUD completo de formularios |
| **Usuario Regular** | Cualquier usuario del sistema | ✅ Llenar formularios asignados |

---

## 🧩 Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FORM BUILDER ADMIN                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Lista de Formularios Creados                                         │  │
│  │  [+ Nuevo Formulario]                                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  EDITOR DE FORMULARIO                                                 │  │
│  │  ┌─────────────────────────────────┬──────────────────────────────┐  │  │
│  │  │         CANVAS                  │       COMPONENTES             │  │  │
│  │  │  ┌───────────────────────────┐  │  ┌─────────────────────────┐  │  │  │
│  │  │  │ 📦 GROUP (anidable)       │  │  │ 🔤 BÁSICOS              │  │  │  │
│  │  │  │  ├── Campo 1              │  │  │  📝 Texto               │  │  │  │
│  │  │  │  ├── 🔁 REPEATER          │  │  │  📧 Email               │  │  │  │
│  │  │  │  │   ├── Campo A          │  │  │  🔢 Número              │  │  │  │
│  │  │  │  │   ├── 🎭 CONDITIONAL   │  │  │  📅 Fecha/Hora          │  │  │  │
│  │  │  │  │   │   └── Campos...    │  │  │  📄 Textarea            │  │  │  │
│  │  │  │  │   └── Campo B          │  │  ├─────────────────────────┤  │  │  │
│  │  │  │  └── 🗂️ TABS              │  │  │ 📋 SELECCIÓN            │  │  │  │
│  │  │  │      ├── Tab 1: campos    │  │  │  ☑️ Checkbox            │  │  │  │
│  │  │  │      └── Tab 2: campos    │  │  │  🔘 Radio               │  │  │  │
│  │  │  └───────────────────────────┘  │  │  📋 Select              │  │  │  │
│  │  │                                 │  │  🔛 Toggle              │  │  │  │
│  │  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  ├─────────────────────────┤  │  │  │
│  │  │  │   Arrastra aquí          │  │  │ 📎 MULTIMEDIA           │  │  │  │
│  │  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  │  📷 Imagen               │  │  │  │
│  │  │                                 │  │  📎 Archivo             │  │  │  │
│  │  └─────────────────────────────────┘  │  ✍️ Firma               │  │  │  │
│  │                                       ├─────────────────────────┤  │  │  │
│  │  ┌─────────────────────────────────┐  │ 🏗️ ESTRUCTURA           │  │  │  │
│  │  │  ÁRBOL DE ESTRUCTURA            │  │  📦 Group               │  │  │  │
│  │  │  (Vista jerárquica)             │  │  ↔️ Row                 │  │  │  │
│  │  │  📄 Formulario                   │  │  🗂️ Tabs               │  │  │  │
│  │  │  ├── 📢 Header                  │  │  🎭 Conditional         │  │  │  │
│  │  │  ├── 📦 Group                   │  │  🔁 Repeater            │  │  │  │
│  │  │  │   ├── 📝 Campo               │  │  📊 Data Grid           │  │  │  │
│  │  │  │   └── 🔁 Repeater            │  ├─────────────────────────┤  │  │  │
│  │  │  │       └── ...                │  │ 🧠 AVANZADOS            │  │  │  │
│  │  │  └── ✍️ Firma                   │  │  🔢 Calculated          │  │  │  │
│  │  └─────────────────────────────────┘  │  🔗 API Select          │  │  │  │
│  │                                       │  📋 Template            │  │  │  │
│  │                                       │  ⭐ Rating               │  │  │  │
│  │                                       │  📍 Location            │  │  │  │
│  │                                       ├─────────────────────────┤  │  │  │
│  │                                       │ 🎨 DISEÑO               │  │  │  │
│  │                                       │  📢 Header              │  │  │  │
│  │                                       │  ➗ Divider             │  │  │  │
│  │                                       │  ⬜ Spacer              │  │  │  │
│  │                                       └─────────────────────────┘  │  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Modelo de Datos

### Tabla: `form_template`
Almacena los formularios creados por los administradores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `form_template_id` | SERIAL PK | ID único del formulario |
| `name` | VARCHAR(255) | Nombre del formulario |
| `description` | TEXT | Descripción opcional |
| `schema` | JSONB | Esquema JSON con la estructura del formulario |
| `is_active` | BOOLEAN | Si el formulario está activo |
| `created_by` | INTEGER FK | Usuario que creó el formulario |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última modificación |

### Tabla: `form_template_classification`
Tabla de relación entre formularios y clasificaciones de inspección.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `form_classification_id` | SERIAL PK | ID único de la relación |
| `form_template_id` | INTEGER FK | ID del formulario |
| `maestro_id` | INTEGER FK | ID de la clasificación (inspeccion_maestro) |
| `orden` | INTEGER | Orden de presentación |
| `is_required` | BOOLEAN | Si es obligatorio llenar el formulario |

### Tabla: `form_submission`
Almacena las respuestas de los formularios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `form_submission_id` | SERIAL PK | ID único de la respuesta |
| `form_template_id` | INTEGER FK | ID del formulario |
| `inspeccion_report_id` | INTEGER FK | ID del reporte de inspección |
| `data` | JSONB | Datos del formulario llenado |
| `submitted_by` | INTEGER FK | Usuario que llenó el formulario |
| `submitted_at` | TIMESTAMP | Fecha de envío |
| `updated_at` | TIMESTAMP | Fecha de última modificación |

---

## 🔧 Tipos de Campos Soportados

### Campos Básicos

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `text` | 📝 | Campo de texto corto | `placeholder`, `maxLength`, `pattern`, `required` |
| `email` | 📧 | Email con validación | `placeholder`, `required` |
| `number` | 🔢 | Número entero o decimal | `min`, `max`, `step`, `required` |
| `decimal` | 💯 | Número con decimales | `min`, `max`, `decimals`, `required` |
| `date` | 📅 | Selector de fecha | `minDate`, `maxDate`, `required` |
| `time` | ⏰ | Selector de hora | `format24h`, `required` |
| `datetime` | 📅⏰ | Fecha y hora combinados | `minDate`, `maxDate`, `required` |
| `textarea` | 📄 | Texto largo multilínea | `placeholder`, `maxLength`, `rows`, `required` |

### Campos de Selección

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `checkbox` | ☑️ | Casilla de verificación individual | `label`, `defaultValue` |
| `checkbox_group` | ☑️☑️ | Múltiples opciones seleccionables | `options[]`, `minSelections`, `maxSelections` |
| `radio` | 🔘 | Opción única de varias | `options[]`, `required` |
| `select` | 📋 | Lista desplegable | `options[]`, `searchable`, `required` |
| `multi_select` | 📋📋 | Selección múltiple | `options[]`, `maxSelections`, `required` |
| `toggle` | 🔛 | Interruptor Sí/No | `labelOn`, `labelOff`, `defaultValue` |

### Campos Multimedia

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `file` | 📎 | Carga de archivo | `accept`, `maxSize`, `multiple`, `required` |
| `image` | 📷 | Carga de imagen con preview | `accept`, `maxSize`, `maxWidth`, `maxHeight` |
| `signature` | ✍️ | Captura de firma digital | `width`, `height`, `required` |

### Campos Especiales

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `location` | 📍 | Captura de ubicación GPS | `required` |
| `rating` | ⭐ | Calificación con estrellas | `maxStars`, `allowHalf`, `required` |
| `slider` | 🎚️ | Control deslizante | `min`, `max`, `step`, `showValue` |
| `color` | 🎨 | Selector de color | `palette[]`, `required` |

### Campos de Diseño

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `header` | 📢 | Título/Encabezado | `text`, `size` (h1-h6) |
| `paragraph` | 📃 | Texto informativo | `text`, `style` |
| `divider` | ➗ | Línea separadora | `style` (solid, dashed, dotted) |
| `spacer` | ⬜ | Espacio en blanco | `height` |

### Campos de Estructura (Contenedores)

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `group` | 📦 | Contenedor de campos agrupados | `collapsible`, `collapsed`, `columns`, `showBorder`, `fields[]` |
| `row` | ↔️ | Fila con control de columnas | `columns[]` (porcentajes), `fields[]` |
| `tabs` | 🗂️ | Pestañas para organizar secciones | `tabs[]` con `label`, `icon`, `fields[]` |
| `conditional` | 🎭 | Mostrar campos según condición | `condition`, `fields[]`, `elseFields[]` |
| `repeater` | 🔁 | Grupo repetible dinámicamente | `minItems`, `maxItems`, `fields[]`, `addButtonText` |
| `data_grid` | 📊 | Tabla editable | `columns[]`, `minRows`, `maxRows`, `summary` |

### Campos Calculados y Especiales

| Tipo | Icono | Descripción | Propiedades |
|------|-------|-------------|-------------|
| `calculated` | 🔢 | Valor calculado automáticamente | `formula`, `format`, `decimals`, `prefix`, `suffix` |
| `template` | 📋 | Referencia a plantilla reutilizable | `template` (nombre), hereda campos de la plantilla |
| `api_select` | 🔗 | Select con datos de API | `endpoint`, `valueField`, `labelField`, `filters`, `dependsOn` |

### 🔁 Campo Repeater (Campos Repetibles)

El campo **Repeater** es un contenedor especial que permite agrupar campos y repetirlos dinámicamente.

**Ejemplo de uso:**
```
┌─────────────────────────────────────────────────────────────┐
│  REPEATER: "Personal Involucrado"                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Entrada #1                                           │  │
│  │  ├── Nombre: [Juan Pérez          ]                   │  │
│  │  ├── Cargo:  [Supervisor          ]                   │  │
│  │  └── Firma:  [✍️ ----------------]                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Entrada #2                                           │  │
│  │  ├── Nombre: [María López         ]                   │  │
│  │  ├── Cargo:  [Inspector           ]                   │  │
│  │  └── Firma:  [✍️ ----------------]                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [+ Agregar otro]                                           │
└─────────────────────────────────────────────────────────────┘
```

**Propiedades del Repeater:**
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `label` | string | Título del grupo repetible |
| `minItems` | number | Mínimo de repeticiones requeridas |
| `maxItems` | number | Máximo de repeticiones permitidas |
| `fields` | array | Lista de campos dentro del repeater |
| `addButtonText` | string | Texto del botón "Agregar" |
| `allowReorder` | boolean | Permitir reordenar elementos |

---

## 🏗️ Campos de Estructura y Anidamiento

### 📦 Campo Group (Contenedor Simple)

El campo **Group** permite agrupar campos relacionados visualmente sin repetición.

```
┌─────────────────────────────────────────────────────────────────┐
│  📦 GROUP: "Datos del Vehículo"                                 │
│  ═══════════════════════════════════════════════════════════════│
│  │  Placa: [ABC-123         ]    Marca: [Toyota    ▼]          │
│  │  Modelo: [2024   ]            Color: [Blanco   ▼]           │
│  │  Kilometraje: [45000      ]                                  │
│  └──────────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
```

**Propiedades del Group:**
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `label` | string | Título del grupo |
| `collapsible` | boolean | Permitir colapsar/expandir |
| `collapsed` | boolean | Estado inicial colapsado |
| `fields` | array | Campos anidados |
| `columns` | number | Columnas del grid (1-4) |
| `showBorder` | boolean | Mostrar borde visual |

### 🗂️ Campo Tabs (Pestañas)

Organiza campos en pestañas para formularios extensos.

```
┌─────────────────────────────────────────────────────────────────┐
│  🗂️ TABS: "Información del Equipo"                              │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ 📋 General   │ 🔧 Técnico   │ 📸 Evidencias │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│  ┌──────────────────────────────────────────────────────────────│
│  │  [Contenido de la pestaña activa]                           │
│  │  ├── Campo 1                                                 │
│  │  ├── Campo 2                                                 │
│  │  └── Campo 3                                                 │
│  └──────────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
```

### 📊 Campo Row (Fila con Columnas)

Permite colocar múltiples campos en una fila con control de ancho.

```
┌─────────────────────────────────────────────────────────────────┐
│  ROW (3 columnas)                                               │
│  ┌───────────────────┬────────────────┬────────────────────┐   │
│  │ Nombre (50%)      │ Edad (25%)     │ Ciudad (25%)       │   │
│  │ [_______________] │ [____]         │ [Bogotá       ▼]   │   │
│  └───────────────────┴────────────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 🎭 Campo Conditional (Condicional)

Muestra u oculta campos basado en el valor de otro campo.

```
┌─────────────────────────────────────────────────────────────────┐
│  ¿El equipo presenta fallas? *                                  │
│  (○) Sí    (●) No                                               │
│                                                                 │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  🎭 SI "presenta_fallas" = "si" ENTONCES MOSTRAR:        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Descripción de la falla *                         │  │  │
│  │  │  [_____________________________________________]   │  │  │
│  │  │                                                    │  │  │
│  │  │  Severidad *                                       │  │  │
│  │  │  (○) Leve  (○) Moderada  (○) Crítica              │  │  │
│  │  │                                                    │  │  │
│  │  │  📷 Foto de evidencia                              │  │  │
│  │  │  [📎 Seleccionar archivo]                          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Propiedades del Conditional:**
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `condition` | object | Regla de condición |
| `condition.field` | string | Campo a evaluar (por name) |
| `condition.operator` | string | `equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `is_empty`, `is_not_empty` |
| `condition.value` | any | Valor a comparar |
| `fields` | array | Campos a mostrar si la condición es verdadera |
| `elseFields` | array | Campos a mostrar si es falsa (opcional) |

### 🔢 Campo Calculated (Calculado)

Campo que calcula su valor automáticamente basado en otros campos.

```
┌─────────────────────────────────────────────────────────────────┐
│  CÁLCULO AUTOMÁTICO                                             │
│                                                                 │
│  Cantidad: [10    ]    Precio unitario: [$5,000   ]            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🔢 Total: $50,000                                        │  │
│  │     Fórmula: cantidad * precio_unitario                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Propiedades del Calculated:**
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `formula` | string | Expresión matemática (`field1 + field2 * 0.19`) |
| `format` | string | `number`, `currency`, `percentage` |
| `decimals` | number | Decimales a mostrar |
| `prefix` | string | Prefijo (ej: "$") |
| `suffix` | string | Sufijo (ej: "%") |

**Operadores soportados:**
- Aritméticos: `+`, `-`, `*`, `/`, `%` (módulo)
- Funciones: `SUM()`, `AVG()`, `MIN()`, `MAX()`, `COUNT()`, `ROUND()`
- Lógicos: `IF(condition, true_value, false_value)`

---

## 🎯 Anidamiento Ilimitado

El sistema permite anidar campos dentro de otros campos sin límite de profundidad. Esto habilita estructuras complejas como:

### Ejemplo: Anidamiento Multinivel

```
📦 GROUP: "Inspección de Planta"
├── 🗂️ TABS: "Secciones"
│   ├── TAB: "Área de Producción"
│   │   ├── 🔁 REPEATER: "Máquinas"
│   │   │   ├── 📝 Nombre de máquina
│   │   │   ├── 📋 Estado general
│   │   │   ├── 🎭 CONDITIONAL: Si estado = "malo"
│   │   │   │   ├── 📄 Descripción del problema
│   │   │   │   ├── 🔁 REPEATER: "Partes afectadas"
│   │   │   │   │   ├── 📝 Nombre de parte
│   │   │   │   │   ├── 📷 Foto de evidencia
│   │   │   │   │   └── 🔘 Severidad
│   │   │   │   └── ✍️ Firma del técnico
│   │   │   └── 📦 GROUP: "Mediciones"
│   │   │       ├── 🔢 Temperatura
│   │   │       ├── 🔢 Presión
│   │   │       └── 🔢 CALCULATED: Índice de rendimiento
│   │   └── 📷 Foto panorámica del área
│   └── TAB: "Área de Almacén"
│       └── ...
└── ✍️ Firma del inspector general
```

### Visualización en el Editor

```
┌──────────────────────────────────────────────────────────────────────────┐
│  📦 GROUP: Inspección de Planta                              [−] [🗑️]   │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  🗂️ TABS: Secciones                                      [⚙️] [🗑️] │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  TAB: Área de Producción                                     │  │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │  🔁 REPEATER: Máquinas                        [⚙️] [🗑️] │  │  │  │
│  │  │  │  ┌──────────────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  📝 Nombre de máquina                            │  │  │  │  │
│  │  │  │  │  📋 Estado general                               │  │  │  │  │
│  │  │  │  │  🎭 CONDITIONAL: Si estado = "malo"              │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  📄 Descripción del problema               │  │  │  │  │  │
│  │  │  │  │  │  🔁 REPEATER: Partes afectadas             │  │  │  │  │  │
│  │  │  │  │  │  └── [campos anidados...]                  │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └──────────────────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│  [+ Agregar campo al grupo]                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Características Avanzadas de Flexibilidad

### 1. 📜 Reglas de Validación Personalizadas

Además de las validaciones básicas, se pueden crear reglas complejas:

```json
{
  "validations": [
    {
      "type": "custom",
      "rule": "field_value > other_field_value",
      "message": "El valor debe ser mayor que {other_field}"
    },
    {
      "type": "async",
      "endpoint": "/api/validate/unique-code",
      "message": "Este código ya existe"
    },
    {
      "type": "regex",
      "pattern": "^[A-Z]{3}-[0-9]{4}$",
      "message": "Formato inválido. Use: ABC-1234"
    }
  ]
}
```

### 2. 🔗 Campos con Datos Dinámicos (API)

Campos que cargan sus opciones desde endpoints externos:

```json
{
  "type": "select",
  "label": "Empleado responsable",
  "name": "empleado_id",
  "properties": {
    "dataSource": {
      "type": "api",
      "endpoint": "/api/employees",
      "method": "GET",
      "valueField": "employee_id",
      "labelField": "full_name",
      "filters": {
        "client_id": "{form.cliente_id}"  // Referencia a otro campo
      }
    }
  }
}
```

### 3. 🔄 Campos Dependientes en Cascada

Múltiples selects que se filtran en cadena:

```
País → Departamento → Ciudad → Localidad

┌─────────────────────────────────────────────────────────────────┐
│  País: [Colombia                    ▼]                          │
│  Departamento: [Cundinamarca        ▼]  ← Filtrado por país    │
│  Ciudad: [Bogotá                    ▼]  ← Filtrado por depto   │
│  Localidad: [Usaquén                ▼]  ← Filtrado por ciudad  │
└─────────────────────────────────────────────────────────────────┘
```

```json
{
  "type": "select",
  "name": "departamento",
  "properties": {
    "dependsOn": "pais",
    "dataSource": {
      "endpoint": "/api/locations/departments",
      "filters": { "country_id": "{pais}" }
    }
  }
}
```

### 4. 📋 Plantillas de Campo (Field Templates)

Reutilizar configuraciones de campos comunes:

```json
{
  "templates": {
    "firma_con_fecha": {
      "type": "group",
      "fields": [
        { "type": "signature", "name": "firma", "required": true },
        { "type": "text", "name": "nombre_firmante", "required": true },
        { "type": "text", "name": "cargo", "required": true },
        { "type": "datetime", "name": "fecha_firma", "default": "now" }
      ]
    }
  }
}
```

Uso en el formulario:
```json
{
  "type": "template",
  "template": "firma_con_fecha",
  "name": "firma_supervisor"
}
```

### 5. 🎨 Estilos Personalizados por Campo

```json
{
  "type": "text",
  "label": "Campo destacado",
  "styling": {
    "labelColor": "#FF5722",
    "backgroundColor": "#FFF3E0",
    "borderColor": "#FF5722",
    "fontSize": "large",
    "width": "100%",
    "customClass": "campo-importante"
  }
}
```

### 6. 🔔 Acciones y Eventos

Ejecutar acciones cuando ocurren eventos en campos:

```json
{
  "type": "select",
  "name": "tipo_inspeccion",
  "events": {
    "onChange": [
      {
        "action": "setValue",
        "target": "clasificacion",
        "value": null
      },
      {
        "action": "fetchData",
        "target": "clasificaciones_disponibles",
        "endpoint": "/api/clasificaciones/{value}"
      },
      {
        "action": "showNotification",
        "message": "Tipo seleccionado: {label}",
        "type": "info"
      }
    ]
  }
}
```

### 7. 📊 Tabla Editable (Data Grid)

Campo especial para datos tabulares con edición inline:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 TABLA: Inventario de Equipos                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ # │ Equipo          │ Serie      │ Estado  │ Cantidad │ Acciones │  │
│  ├───┼─────────────────┼────────────┼─────────┼──────────┼──────────┤  │
│  │ 1 │ [Taladro     ]  │ [TAL-001 ] │ [OK ▼]  │ [5    ]  │ [🗑️]    │  │
│  │ 2 │ [Esmeril     ]  │ [ESM-002 ] │ [NC ▼]  │ [3    ]  │ [🗑️]    │  │
│  │ 3 │ [Compresor   ]  │ [COM-003 ] │ [OK ▼]  │ [2    ]  │ [🗑️]    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  [+ Agregar fila]                          Total equipos: 10            │
└─────────────────────────────────────────────────────────────────────────┘
```

```json
{
  "type": "data_grid",
  "name": "inventario",
  "properties": {
    "columns": [
      { "name": "equipo", "type": "text", "width": "30%" },
      { "name": "serie", "type": "text", "width": "20%" },
      { "name": "estado", "type": "select", "options": ["OK", "NC"], "width": "15%" },
      { "name": "cantidad", "type": "number", "width": "15%" }
    ],
    "minRows": 1,
    "maxRows": 50,
    "allowAddRow": true,
    "allowDeleteRow": true,
    "showRowNumbers": true,
    "summary": {
      "cantidad": { "type": "sum", "label": "Total equipos" }
    }
  }
}
```

### 8. 🎯 Puntuación y Scoring

Sistema de puntuación automática basado en respuestas:

```json
{
  "scoring": {
    "enabled": true,
    "maxScore": 100,
    "fields": {
      "cumple_norma_1": { "yes": 10, "no": 0, "na": null },
      "cumple_norma_2": { "yes": 15, "no": 0, "na": null },
      "estado_equipo": { "bueno": 20, "regular": 10, "malo": 0 }
    },
    "display": {
      "showProgress": true,
      "showPercentage": true,
      "colorRanges": [
        { "min": 0, "max": 50, "color": "red", "label": "No Cumple" },
        { "min": 51, "max": 80, "color": "orange", "label": "Parcial" },
        { "min": 81, "max": 100, "color": "green", "label": "Cumple" }
      ]
    }
  }
}
```

Visualización:
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 PUNTUACIÓN DE INSPECCIÓN                                    │
│                                                                 │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░  45/100 (45%)           │
│  Estado: 🔴 No Cumple                                           │
│                                                                 │
│  Desglose:                                                      │
│  • Norma 1: ✅ 10/10                                            │
│  • Norma 2: ❌ 0/15                                             │
│  • Estado Equipo: ⚠️ 10/20 (Regular)                            │
│  • [otros campos...]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 9. 📝 Auto-guardado y Borradores

```json
{
  "settings": {
    "autosave": {
      "enabled": true,
      "interval": 30,  // segundos
      "showIndicator": true
    },
    "drafts": {
      "enabled": true,
      "maxDrafts": 5,
      "expirationDays": 7
    }
  }
}
```

### 10. 🌐 Soporte Multi-idioma

```json
{
  "type": "text",
  "name": "observacion",
  "i18n": {
    "es": { "label": "Observación", "placeholder": "Ingrese observación" },
    "en": { "label": "Observation", "placeholder": "Enter observation" },
    "pt": { "label": "Observação", "placeholder": "Digite observação" }
  }
}
```

---

## 📝 Esquema JSON del Formulario (Avanzado)

### Ejemplo Completo con Anidamiento y Características Avanzadas

```json
{
  "version": "2.0",
  "settings": {
    "autosave": { "enabled": true, "interval": 30 },
    "scoring": { "enabled": true, "maxScore": 100 }
  },
  "templates": {
    "firma_completa": {
      "type": "group",
      "columns": 2,
      "fields": [
        { "type": "signature", "name": "firma", "required": true },
        { "type": "text", "name": "nombre", "required": true },
        { "type": "text", "name": "cargo" },
        { "type": "datetime", "name": "fecha", "default": "now" }
      ]
    }
  },
  "fields": [
    {
      "id": "uuid-1",
      "type": "header",
      "label": "Inspección de Equipos",
      "properties": { "size": "h1" }
    },
    {
      "id": "uuid-2",
      "type": "group",
      "label": "Información General",
      "properties": {
        "collapsible": true,
        "columns": 2,
        "showBorder": true
      },
      "fields": [
        {
          "id": "uuid-2-1",
          "type": "text",
          "label": "Responsable",
          "name": "responsable",
          "required": true
        },
        {
          "id": "uuid-2-2",
          "type": "select",
          "label": "Área",
          "name": "area",
          "required": true,
          "properties": {
            "dataSource": {
              "type": "api",
              "endpoint": "/api/areas",
              "valueField": "id",
              "labelField": "nombre"
            }
          }
        }
      ]
    },
    {
      "id": "uuid-3",
      "type": "tabs",
      "label": "Secciones de Inspección",
      "properties": {
        "tabs": [
          {
            "id": "tab-equipos",
            "label": "🔧 Equipos",
            "icon": "build",
            "fields": [
              {
                "id": "uuid-3-1",
                "type": "repeater",
                "label": "Equipos Inspeccionados",
                "name": "equipos",
                "properties": {
                  "minItems": 1,
                  "maxItems": 20,
                  "addButtonText": "➕ Agregar equipo"
                },
                "fields": [
                  {
                    "id": "uuid-3-1-1",
                    "type": "row",
                    "properties": { "columns": [50, 30, 20] },
                    "fields": [
                      { "type": "text", "label": "Nombre", "name": "nombre", "required": true },
                      { "type": "text", "label": "Serie", "name": "serie" },
                      { 
                        "type": "select", 
                        "label": "Estado", 
                        "name": "estado",
                        "required": true,
                        "scoring": { "bueno": 10, "regular": 5, "malo": 0 },
                        "properties": {
                          "options": [
                            { "value": "bueno", "label": "✅ Bueno" },
                            { "value": "regular", "label": "⚠️ Regular" },
                            { "value": "malo", "label": "❌ Malo" }
                          ]
                        }
                      }
                    ]
                  },
                  {
                    "id": "uuid-3-1-2",
                    "type": "conditional",
                    "condition": {
                      "field": "estado",
                      "operator": "equals",
                      "value": "malo"
                    },
                    "fields": [
                      {
                        "type": "textarea",
                        "label": "Descripción del problema",
                        "name": "problema",
                        "required": true,
                        "properties": { "rows": 3 }
                      },
                      {
                        "type": "repeater",
                        "label": "Partes afectadas",
                        "name": "partes_afectadas",
                        "properties": { "minItems": 1 },
                        "fields": [
                          { "type": "text", "label": "Parte", "name": "parte" },
                          { "type": "image", "label": "Foto", "name": "foto" },
                          { 
                            "type": "radio", 
                            "label": "Severidad", 
                            "name": "severidad",
                            "properties": {
                              "options": [
                                { "value": "leve", "label": "Leve" },
                                { "value": "moderada", "label": "Moderada" },
                                { "value": "critica", "label": "Crítica" }
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "id": "uuid-3-1-3",
                    "type": "group",
                    "label": "Mediciones",
                    "properties": { "columns": 3, "collapsible": true },
                    "fields": [
                      { "type": "number", "label": "Temperatura (°C)", "name": "temperatura" },
                      { "type": "number", "label": "Presión (PSI)", "name": "presion" },
                      { "type": "number", "label": "RPM", "name": "rpm" }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "id": "tab-evidencias",
            "label": "📸 Evidencias",
            "icon": "photo_camera",
            "fields": [
              { "type": "image", "label": "Foto panorámica", "name": "foto_panoramica" },
              { "type": "file", "label": "Documentos adjuntos", "name": "documentos", "properties": { "multiple": true } }
            ]
          }
        ]
      }
    },
    {
      "id": "uuid-4",
      "type": "data_grid",
      "label": "Resumen de Hallazgos",
      "name": "hallazgos",
      "properties": {
        "columns": [
          { "name": "hallazgo", "type": "text", "label": "Hallazgo", "width": "40%" },
          { "name": "tipo", "type": "select", "label": "Tipo", "options": ["Crítico", "Mayor", "Menor"], "width": "20%" },
          { "name": "responsable", "type": "text", "label": "Responsable", "width": "25%" },
          { "name": "plazo", "type": "date", "label": "Plazo", "width": "15%" }
        ],
        "minRows": 0,
        "maxRows": 20
      }
    },
    {
      "id": "uuid-5",
      "type": "calculated",
      "label": "Puntuación Total",
      "name": "puntuacion_total",
      "properties": {
        "formula": "SUM(equipos.*.estado)",
        "format": "number",
        "suffix": " puntos"
      }
    },
    {
      "id": "uuid-6",
      "type": "divider"
    },
    {
      "id": "uuid-7",
      "type": "template",
      "template": "firma_completa",
      "name": "firma_inspector",
      "label": "Firma del Inspector"
    }
  ]
}
```

### Esquema JSON Simplificado (Para Formularios Básicos)

```json
{
  "version": "2.0",
  "fields": [
    {
      "id": "uuid-1",
      "type": "header",
      "label": "Información General",
      "properties": {
        "size": "h2"
      }
    },
    {
      "id": "uuid-2",
      "type": "text",
      "label": "Nombre del responsable",
      "name": "responsable_nombre",
      "required": true,
      "properties": {
        "placeholder": "Ingrese nombre completo",
        "maxLength": 100
      }
    },
    {
      "id": "uuid-3",
      "type": "select",
      "label": "Estado del equipo",
      "name": "estado_equipo",
      "required": true,
      "properties": {
        "options": [
          { "value": "bueno", "label": "Bueno" },
          { "value": "regular", "label": "Regular" },
          { "value": "malo", "label": "Malo" }
        ]
      }
    },
    {
      "id": "uuid-4",
      "type": "repeater",
      "label": "Equipos Inspeccionados",
      "name": "equipos",
      "properties": {
        "minItems": 1,
        "maxItems": 10,
        "addButtonText": "Agregar equipo",
        "fields": [
          {
            "id": "uuid-4-1",
            "type": "text",
            "label": "Nombre del equipo",
            "name": "nombre",
            "required": true
          },
          {
            "id": "uuid-4-2",
            "type": "text",
            "label": "Serie/Código",
            "name": "serie"
          },
          {
            "id": "uuid-4-3",
            "type": "radio",
            "label": "Estado",
            "name": "estado",
            "required": true,
            "properties": {
              "options": [
                { "value": "ok", "label": "✅ Conforme" },
                { "value": "nc", "label": "❌ No Conforme" }
              ]
            }
          }
        ]
      }
    },
    {
      "id": "uuid-5",
      "type": "signature",
      "label": "Firma del inspector",
      "name": "firma_inspector",
      "required": true
    }
  ]
}
```

---

## 🖥️ Interfaz de Usuario - Form Builder (Admin)

### Vista: Lista de Formularios

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 FORM BUILDER                                    [+ Nuevo Formulario]
├─────────────────────────────────────────────────────────────────────┤
│  🔍 Buscar formulario...                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 📄 Inspección de Equipos y Herramientas                       │  │
│  │ Asignado a: KAPA-AO-FO-008 Inspección de equipos y herramientas│  │
│  │ Campos: 12 | Creado: 01/12/2024 | Estado: ✅ Activo            │  │
│  │                                              [✏️] [👁️] [🗑️]   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 📄 Inspección de EPP                                          │  │
│  │ Asignado a: KAPA-AO-FO-014 Inspección de uso y estado de EPP  │  │
│  │ Campos: 8 | Creado: 28/11/2024 | Estado: ✅ Activo             │  │
│  │                                              [✏️] [👁️] [🗑️]   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 📄 Inspección de Extintores                                   │  │
│  │ Asignado a: KAPA-AO-FO-015 Inspección de seguridad extintores │  │
│  │ Campos: 15 | Creado: 25/11/2024 | Estado: ⚠️ Borrador         │  │
│  │                                              [✏️] [👁️] [🗑️]   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Vista: Editor de Formulario (Drag & Drop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Volver                    EDITOR DE FORMULARIO                 [Guardar] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Nombre: [Inspección de Equipos y Herramientas                   ]          │
│                                                                              │
│  Asignar a clasificación(es):                                               │
│  [☑️ KAPA-AO-FO-008 Inspección de equipos y herramientas         ▼]        │
│  [+ Agregar otra clasificación]                                              │
│                                                                              │
├────────────────────────────────────────────┬────────────────────────────────┤
│           CANVAS DEL FORMULARIO            │        COMPONENTES             │
│                                            │                                │
│  ┌──────────────────────────────────────┐  │  🔤 CAMPOS BÁSICOS             │
│  │  📢 Información General              │  │  ┌──────────────────────────┐  │
│  │     [Editar] [↕️] [🗑️]               │  │  │ 📝 Texto                 │  │
│  └──────────────────────────────────────┘  │  └──────────────────────────┘  │
│                                            │  ┌──────────────────────────┐  │
│  ┌──────────────────────────────────────┐  │  │ 📧 Email                 │  │
│  │  📝 Nombre del responsable *         │  │  └──────────────────────────┘  │
│  │     [Editar] [↕️] [🗑️]               │  │  ┌──────────────────────────┐  │
│  └──────────────────────────────────────┘  │  │ 🔢 Número                │  │
│                                            │  └──────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │  📋 Estado del equipo *              │  │  │ 📅 Fecha                 │  │
│  │     Bueno | Regular | Malo           │  │  └──────────────────────────┘  │
│  │     [Editar] [↕️] [🗑️]               │  │                                │
│  └──────────────────────────────────────┘  │  📋 SELECCIÓN                  │
│                                            │  ┌──────────────────────────┐  │
│  ┌──────────────────────────────────────┐  │  │ ☑️ Checkbox              │  │
│  │  🔁 REPEATER: Equipos Inspeccionados │  │  └──────────────────────────┘  │
│  │  ┌────────────────────────────────┐  │  │  ┌──────────────────────────┐  │
│  │  │  📝 Nombre del equipo *        │  │  │  │ 🔘 Radio                 │  │
│  │  │  📝 Serie/Código               │  │  │  └──────────────────────────┘  │
│  │  │  🔘 Estado: ✅ OK | ❌ NC       │  │  │  ┌──────────────────────────┐  │
│  │  └────────────────────────────────┘  │  │  │ 📋 Select                │  │
│  │     [Editar] [+ Campo] [↕️] [🗑️]    │  │  └──────────────────────────┘  │
│  └──────────────────────────────────────┘  │                                │
│                                            │  📎 MULTIMEDIA                 │
│  ┌──────────────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │  ✍️ Firma del inspector *            │  │  │ 📷 Imagen                │  │
│  │     [Editar] [↕️] [🗑️]               │  │  └──────────────────────────┘  │
│  └──────────────────────────────────────┘  │  ┌──────────────────────────┐  │
│                                            │  │ ✍️ Firma                 │  │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  └──────────────────────────┘  │
│  │     Arrastra un componente aquí     │  │                                │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  🔁 ESPECIALES                  │
│                                            │  ┌──────────────────────────┐  │
│                                            │  │ 🔁 Repeater              │  │
│                                            │  └──────────────────────────┘  │
│                                            │                                │
│                                            │  🎨 DISEÑO                     │
│                                            │  ┌──────────────────────────┐  │
│                                            │  │ 📢 Título                │  │
│                                            │  └──────────────────────────┘  │
│                                            │  ┌──────────────────────────┐  │
│                                            │  │ ➗ Separador             │  │
│                                            │  └──────────────────────────┘  │
└────────────────────────────────────────────┴────────────────────────────────┘
```

### Modal: Configuración de Campo

Cuando el usuario hace clic en "Editar" en un campo, aparece un modal con las opciones:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Configurar Campo                                    [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Etiqueta (Label): [Nombre del responsable           ]      │
│                                                             │
│  Nombre técnico:   [responsable_nombre               ]      │
│  (Se usa para guardar el dato)                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ VALIDACIONES                                        │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ☑️ Campo obligatorio                                │    │
│  │ ☐ Longitud mínima: [ 5  ] caracteres               │    │
│  │ ☑️ Longitud máxima: [100 ] caracteres              │    │
│  │ ☐ Patrón (RegEx):  [                           ]   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ APARIENCIA                                          │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Placeholder: [Ingrese nombre completo         ]     │    │
│  │ Texto de ayuda: [                             ]     │    │
│  │ Ancho: (●) Completo (○) Medio (○) Tercio           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                          [Cancelar]  [💾 Guardar Cambios]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Interfaz de Usuario - Llenado de Formularios (Usuario Final)

### Integración en Formulario de Inspecciones

Cuando el usuario selecciona una clasificación en el formulario de inspecciones:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📝 Nueva Inspección                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Fecha: [04/12/2024       ]         Cliente: [Owens Illinois ▼]         │
│                                                                          │
│  Proyecto: [Planta Cogua                                          ▼]    │
│                                                                          │
│  Tipo: [Seguridad ▼]                                                     │
│                                                                          │
│  Clasificación: [KAPA-AO-FO-008 Inspección de equipos y herramientas ▼] │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  📋 FORMULARIOS ASOCIADOS                                         │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  📄 Inspección de Equipos y Herramientas                    │  │  │
│  │  │  Campos: 12 | ⚠️ Obligatorio                                │  │  │
│  │  │                                        [📝 Llenar formulario]│  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  📄 Checklist de Seguridad Adicional                        │  │  │
│  │  │  Campos: 8 | Opcional                                       │  │  │
│  │  │                                        [📝 Llenar formulario]│  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Observación: [                                                      ]   │
│                                                                          │
│                                               [Crear Inspección]         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modal: Llenar Formulario

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📄 Inspección de Equipos y Herramientas                            [X] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ════════════════════════════════════════════════════════════════════   │
│                        📢 Información General                            │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                          │
│  Nombre del responsable *                                                │
│  [Juan Carlos Pérez García                                          ]   │
│                                                                          │
│  Estado del equipo *                                                     │
│  (●) Bueno    (○) Regular    (○) Malo                                   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════   │
│                     🔁 Equipos Inspeccionados                           │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Equipo #1                                                [🗑️]  │    │
│  │  ─────────────────────────────────────────────────────────────  │    │
│  │  Nombre del equipo *      Serie/Código                          │    │
│  │  [Taladro Industrial   ]  [TAL-2024-001    ]                   │    │
│  │                                                                 │    │
│  │  Estado *                                                       │    │
│  │  (●) ✅ Conforme    (○) ❌ No Conforme                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Equipo #2                                                [🗑️]  │    │
│  │  ─────────────────────────────────────────────────────────────  │    │
│  │  Nombre del equipo *      Serie/Código                          │    │
│  │  [Esmeriladora Bosch   ]  [ESM-2024-002    ]                   │    │
│  │                                                                 │    │
│  │  Estado *                                                       │    │
│  │  (○) ✅ Conforme    (●) ❌ No Conforme                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  [+ Agregar equipo]                                                      │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════   │
│                           ✍️ Firma                                       │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                          │
│  Firma del inspector *                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │                     [Área de firma]                             │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  [Limpiar firma]                                                         │
│                                                                          │
│                              [Cancelar]  [💾 Guardar Formulario]         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 👁️ Visualización de Formularios en Detalle de Inspección

Cuando un usuario accede al detalle de una inspección, debe poder ver todos los formularios que fueron llenados para esa inspección.

### Vista: Detalle de Inspección con Formularios

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Volver                    DETALLE DE INSPECCIÓN                 [✏️ Editar]
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📋 INFORMACIÓN GENERAL                                             │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Fecha:          04/12/2024                                         │    │
│  │  Cliente:        Owens Illinois                                     │    │
│  │  Proyecto:       Planta Cogua                                       │    │
│  │  Tipo:           Seguridad                                          │    │
│  │  Clasificación:  KAPA-AO-FO-008 Inspección de equipos y herramientas│    │
│  │  Estado:         ✅ Abierto                                         │    │
│  │  Observación:    Inspección realizada sin novedad                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📄 FORMULARIOS DILIGENCIADOS (2)                                   │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │  📋 Inspección de Equipos y Herramientas                      │  │    │
│  │  │  Llenado por: Juan Pérez | 04/12/2024 10:30 AM                │  │    │
│  │  │  Puntuación: 85/100 (✅ Cumple)                               │  │    │
│  │  │                                                               │  │    │
│  │  │  [👁️ Ver formulario] [✏️ Editar] [📥 Descargar PDF]           │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  │                                                                     │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │  📋 Checklist de Seguridad Adicional                          │  │    │
│  │  │  Llenado por: Juan Pérez | 04/12/2024 10:45 AM                │  │    │
│  │  │  Puntuación: N/A                                              │  │    │
│  │  │                                                               │  │    │
│  │  │  [👁️ Ver formulario] [✏️ Editar] [📥 Descargar PDF]           │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📎 ARCHIVOS ADJUNTOS (si aplica)                                   │    │
│  │  • foto_evidencia_1.jpg                                             │    │
│  │  • documento_soporte.pdf                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Modal: Ver Formulario Llenado (Solo Lectura)

Al hacer clic en "Ver formulario", se abre un modal con el formulario en modo de solo lectura:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  👁️ Inspección de Equipos y Herramientas                               [X] │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Llenado por: Juan Pérez | 04/12/2024 10:30 AM | Puntuación: 85/100        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════   │
│                          📢 Información General                              │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Nombre del responsable                                            │     │
│  │  Juan Carlos Pérez García                                          │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Estado del equipo                                                 │     │
│  │  ● Bueno                                                           │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════   │
│                       🔁 Equipos Inspeccionados (2)                          │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Equipo #1                                                         │     │
│  │  ──────────────────────────────────────────────────────────────    │     │
│  │  Nombre del equipo:    Taladro Industrial                          │     │
│  │  Serie/Código:         TAL-2024-001                                │     │
│  │  Estado:               ✅ Conforme                                 │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Equipo #2                                                         │     │
│  │  ──────────────────────────────────────────────────────────────    │     │
│  │  Nombre del equipo:    Esmeriladora Bosch                          │     │
│  │  Serie/Código:         ESM-2024-002                                │     │
│  │  Estado:               ❌ No Conforme                              │     │
│  │                                                                    │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │  ⚠️ Problema reportado:                                      │  │     │
│  │  │  Desgaste en disco de corte, requiere reemplazo inmediato    │  │     │
│  │  │                                                              │  │     │
│  │  │  Severidad: 🔴 Crítica                                       │  │     │
│  │  │                                                              │  │     │
│  │  │  📷 Foto de evidencia:                                       │  │     │
│  │  │  [Imagen: esmeriladora_desgaste.jpg]                         │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════   │
│                              ✍️ Firma                                        │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Firma del inspector                                               │     │
│  │  ┌────────────────────────────────────────────────────────────┐    │     │
│  │  │                                                            │    │     │
│  │  │         [Imagen de firma digital]                          │    │     │
│  │  │                                                            │    │     │
│  │  └────────────────────────────────────────────────────────────┘    │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════   │
│                         📊 Resumen de Puntuación                             │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  ████████████████████████████████░░░░░░░░░░  85/100 (85%)         │     │
│  │  Estado: ✅ Cumple                                                 │     │
│  │                                                                    │     │
│  │  Desglose:                                                         │     │
│  │  • Estado general del equipo: ✅ 20/20                             │     │
│  │  • Equipo 1 (Taladro): ✅ 35/35                                    │     │
│  │  • Equipo 2 (Esmeriladora): ❌ 0/35 (No Conforme)                  │     │
│  │  • Firma completada: ✅ 10/10                                      │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│                                        [📥 Descargar PDF]  [Cerrar]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Características de Visualización

| Característica | Descripción |
|----------------|-------------|
| **Modo solo lectura** | Los campos se muestran como texto, no editables |
| **Estructura preservada** | Se mantiene la misma estructura visual del formulario |
| **Imágenes visibles** | Las fotos e imágenes se muestran inline con opción de ampliar |
| **Firmas visibles** | Las firmas digitales se muestran como imagen |
| **Repeaters expandidos** | Todos los items de repeaters se muestran |
| **Condicionales resueltos** | Solo se muestran los campos que aplican según las respuestas |
| **Puntuación visible** | Si el formulario tiene scoring, se muestra el resumen |
| **Metadatos** | Quién llenó, cuándo, última modificación |
| **Descarga PDF** | Generar PDF con el formulario y sus respuestas |

### Vista Compacta vs Expandida

El usuario puede alternar entre dos modos de visualización:

**Vista Compacta (Acordeón):**
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Inspección de Equipos y Herramientas               [▼]     │
│  ──────────────────────────────────────────────────────────    │
│  Resumen: 2 equipos inspeccionados | 1 no conforme | 85/100    │
└─────────────────────────────────────────────────────────────────┘
│  📋 Checklist de Seguridad Adicional                   [▼]     │
│  ──────────────────────────────────────────────────────────    │
│  Resumen: 8 items verificados | Todos conformes                │
└─────────────────────────────────────────────────────────────────┘
```

**Vista Expandida (Todo visible):**
Muestra todo el contenido de los formularios directamente en la página, sin necesidad de abrir modal.

### Historial de Cambios del Formulario

Si el formulario fue editado después de ser llenado:

```
┌─────────────────────────────────────────────────────────────────┐
│  📜 HISTORIAL DE CAMBIOS                                        │
├─────────────────────────────────────────────────────────────────┤
│  • 04/12/2024 14:20 - María López                              │
│    Editó: "Estado Equipo 2" de "Conforme" a "No Conforme"      │
│    Agregó: "Descripción del problema"                          │
│                                                                 │
│  • 04/12/2024 10:30 - Juan Pérez                               │
│    Creación inicial del formulario                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Form Templates (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/form-builder/templates` | Listar todos los formularios |
| `GET` | `/api/form-builder/templates/:id` | Obtener formulario por ID |
| `POST` | `/api/form-builder/templates` | Crear nuevo formulario |
| `PUT` | `/api/form-builder/templates/:id` | Actualizar formulario |
| `DELETE` | `/api/form-builder/templates/:id` | Eliminar formulario |
| `POST` | `/api/form-builder/templates/:id/duplicate` | Duplicar formulario |
| `GET` | `/api/form-builder/templates/:id/export` | Exportar formulario como JSON |
| `POST` | `/api/form-builder/templates/import` | Importar formulario desde JSON |

### Form Classifications

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/form-builder/classifications` | Listar clasificaciones disponibles |
| `GET` | `/api/form-builder/templates/by-classification/:maestroId` | Formularios por clasificación |
| `POST` | `/api/form-builder/templates/:id/assign` | Asignar a clasificación(es) |

### Form Submissions (Usuario)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/form-builder/submissions` | Crear respuesta de formulario |
| `GET` | `/api/form-builder/submissions/:id` | Obtener respuesta por ID |
| `PUT` | `/api/form-builder/submissions/:id` | Actualizar respuesta |
| `GET` | `/api/form-builder/submissions/by-report/:reportId` | Respuestas por reporte de inspección |
| `GET` | `/api/form-builder/submissions/:id/history` | Historial de cambios de una respuesta |
| `GET` | `/api/form-builder/submissions/:id/pdf` | Descargar respuesta como PDF |

### Visualización (Detalle de Inspección)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/inspecciones/:id/forms` | Obtener todos los formularios llenados de una inspección |
| `GET` | `/api/inspecciones/:id/forms/summary` | Resumen compacto de formularios (para acordeón) |
| `GET` | `/api/inspecciones/:id/forms/:submissionId` | Detalle completo de un formulario llenado |

---

## 📝 Casos de Uso

### CU-FB-001: Crear Formulario Dinámico

**Actor Principal:** Administrador

**Precondiciones:**
- Usuario autenticado con rol de administrador
- Existen clasificaciones de inspección en el sistema

**Flujo Principal:**
1. El administrador accede al módulo Form Builder
2. Hace clic en "Nuevo Formulario"
3. Ingresa el nombre del formulario
4. Selecciona una o más clasificaciones donde asociar el formulario
5. Arrastra componentes desde la barra lateral al canvas
6. Configura cada campo (etiqueta, validaciones, etc.)
7. Organiza el orden de los campos arrastrándolos
8. Hace clic en "Guardar"
9. El sistema valida y guarda el formulario

**Postcondiciones:**
- El formulario queda disponible para las clasificaciones seleccionadas
- El formulario aparece en el listado de formularios

### CU-FB-002: Llenar Formulario en Inspección

**Actor Principal:** Usuario del sistema

**Precondiciones:**
- Usuario autenticado
- Existe al menos un formulario asociado a la clasificación seleccionada

**Flujo Principal:**
1. El usuario crea una nueva inspección
2. Selecciona el tipo y clasificación
3. El sistema muestra los formularios asociados a esa clasificación
4. El usuario hace clic en "Llenar formulario"
5. Se abre un modal con el formulario dinámico
6. El usuario completa los campos
7. Si hay campos repeater, puede agregar más entradas con el botón "+"
8. Hace clic en "Guardar Formulario"
9. El modal se cierra y el formulario queda vinculado a la inspección

**Postcondiciones:**
- Los datos del formulario quedan guardados en `form_submission`
- La inspección puede ser creada con los formularios adjuntos

### CU-FB-003: Configurar Campo Repeater

**Actor Principal:** Administrador

**Flujo Principal:**
1. En el editor de formulario, el administrador arrastra un campo "Repeater"
2. Se abre el modal de configuración
3. Configura:
   - Título del grupo (ej: "Personal Involucrado")
   - Mínimo de elementos requeridos
   - Máximo de elementos permitidos
   - Texto del botón agregar
4. Arrastra campos dentro del repeater
5. Configura cada campo interno
6. Guarda el formulario

### CU-FB-004: Crear Estructura Anidada

**Actor Principal:** Administrador

**Flujo Principal:**
1. El administrador arrastra un contenedor (Group, Tabs, o Repeater) al canvas
2. Arrastra campos o más contenedores dentro del primer contenedor
3. Puede seguir anidando sin límite de profundidad
4. El sistema muestra visualmente la jerarquía en el árbol de estructura
5. Configura cada nivel según necesidad
6. Guarda el formulario

**Ejemplo de estructura:**
```
📦 Group: "Sección Principal"
├── 🗂️ Tabs
│   ├── Tab "Datos Básicos"
│   │   ├── 📝 Campo texto
│   │   └── 🔁 Repeater "Items"
│   │       └── 🎭 Conditional
│   │           └── 📝 Campo condicional
│   └── Tab "Evidencias"
│       └── 📷 Campo imagen
└── ✍️ Firma
```

### CU-FB-005: Configurar Lógica Condicional

**Actor Principal:** Administrador

**Flujo Principal:**
1. Arrastra un campo "Conditional" al canvas
2. Configura la condición:
   - Campo a evaluar (selecciona de campos existentes)
   - Operador (igual, diferente, mayor que, etc.)
   - Valor a comparar
3. Arrastra campos al área "Si verdadero"
4. Opcionalmente arrastra campos al área "Si falso"
5. El sistema mostrará/ocultará campos dinámicamente al llenar

### CU-FB-006: Configurar Campos Calculados

**Actor Principal:** Administrador

**Flujo Principal:**
1. Arrastra un campo "Calculated" al canvas
2. Define la fórmula usando nombres de otros campos
3. Configura formato de salida (número, moneda, porcentaje)
4. El valor se calcula automáticamente al llenar el formulario

**Ejemplos de fórmulas:**
- `cantidad * precio_unitario` → Total
- `SUM(items.*.valor)` → Suma de valores en repeater
- `IF(estado == "malo", 0, 10)` → Puntuación condicional

### CU-FB-007: Usar Plantillas de Campo

**Actor Principal:** Administrador

**Flujo Principal:**
1. En configuración del formulario, crea una plantilla
2. Define los campos que componen la plantilla
3. Guarda la plantilla con un nombre
4. Arrastra "Template" al canvas
5. Selecciona la plantilla a usar
6. Los campos de la plantilla se insertan automáticamente

### CU-FB-008: Configurar Campo con Datos de API

**Actor Principal:** Administrador

**Flujo Principal:**
1. Arrastra un campo Select o API Select
2. En configuración, selecciona "Datos desde API"
3. Configura:
   - Endpoint de la API
   - Campo para valor
   - Campo para etiqueta
   - Dependencia de otro campo (opcional)
4. El campo cargará opciones dinámicamente

### CU-FB-009: Configurar Scoring/Puntuación

**Actor Principal:** Administrador

**Flujo Principal:**
1. Activa "Scoring" en configuración del formulario
2. Define puntuación máxima
3. En cada campo relevante, asigna puntos por respuesta
4. Configura rangos de evaluación (colores, etiquetas)
5. Al llenar, se muestra barra de progreso con puntuación

### CU-FB-010: Visualizar Formulario en Detalle de Inspección

**Actor Principal:** Usuario del sistema

**Precondiciones:**
- Usuario autenticado
- Existe una inspección con formularios llenados
- Usuario tiene permisos para ver la inspección

**Flujo Principal:**
1. El usuario accede al detalle de una inspección
2. El sistema muestra la información general de la inspección
3. Debajo se muestra la sección "Formularios Diligenciados"
4. Se listan todos los formularios llenados con:
   - Nombre del formulario
   - Quién lo llenó y cuándo
   - Puntuación (si aplica)
5. El usuario hace clic en "Ver formulario"
6. Se abre un modal con el formulario en modo solo lectura
7. El usuario puede ver todos los datos, imágenes y firmas
8. Opcionalmente puede descargar el formulario como PDF

**Flujo Alternativo - Vista Expandida:**
1. El usuario activa el modo "Vista expandida"
2. Los formularios se muestran directamente en la página
3. No necesita abrir modal para ver el contenido

**Postcondiciones:**
- El usuario puede ver toda la información del formulario
- Las imágenes y firmas son visibles
- Puede descargar PDF si lo necesita

### CU-FB-011: Editar Formulario Ya Llenado

**Actor Principal:** Usuario con permisos de edición

**Precondiciones:**
- Usuario autenticado con permisos de edición
- La inspección está en estado "Abierto"
- Existe un formulario llenado para la inspección

**Flujo Principal:**
1. En el detalle de inspección, el usuario hace clic en "Editar" en un formulario
2. Se abre el modal del formulario en modo edición
3. El usuario modifica los campos necesarios
4. Hace clic en "Guardar cambios"
5. El sistema guarda los cambios y registra en el historial:
   - Quién editó
   - Qué campos cambió
   - Valores anteriores y nuevos
   - Fecha y hora

**Postcondiciones:**
- Los cambios quedan guardados
- El historial de cambios se actualiza
- La versión anterior queda registrada para auditoría

### CU-FB-012: Descargar Formulario como PDF

**Actor Principal:** Usuario del sistema

**Flujo Principal:**
1. En el detalle de inspección o modal de visualización
2. El usuario hace clic en "Descargar PDF"
3. El sistema genera un PDF con:
   - Encabezado con información de la inspección
   - Todos los campos y sus valores
   - Imágenes embebidas
   - Firmas digitales
   - Puntuación y desglose (si aplica)
   - Pie de página con fecha de generación
4. El PDF se descarga automáticamente

---

## ✅ Criterios de Aceptación

### CA-FB-001: Creación de Formularios
| ID | Criterio | Tipo |
|----|----------|------|
| CA-001-01 | El administrador puede crear formularios con nombre único | Automatizado |
| CA-001-02 | Se pueden arrastrar campos desde la barra lateral al canvas | Manual |
| CA-001-03 | Los campos se pueden reordenar arrastrándolos | Manual |
| CA-001-04 | Cada campo puede configurarse individualmente | Automatizado |
| CA-001-05 | El formulario se puede asociar a múltiples clasificaciones | Automatizado |
| CA-001-06 | Se puede duplicar un formulario existente | Automatizado |
| CA-001-07 | Se puede exportar/importar formularios en JSON | Automatizado |

### CA-FB-002: Tipos de Campos
| ID | Criterio | Tipo |
|----|----------|------|
| CA-002-01 | Todos los tipos de campos básicos funcionan correctamente | Automatizado |
| CA-002-02 | Los campos de selección muestran las opciones configuradas | Automatizado |
| CA-002-03 | Los campos de archivo permiten subir archivos | Manual |
| CA-002-04 | El campo de firma captura la firma digital | Manual |
| CA-002-05 | El campo repeater permite agregar/eliminar entradas | Automatizado |
| CA-002-06 | El campo data_grid permite edición tabular | Automatizado |
| CA-002-07 | Los campos calculados muestran valores correctos | Automatizado |

### CA-FB-003: Validaciones
| ID | Criterio | Tipo |
|----|----------|------|
| CA-003-01 | Los campos obligatorios muestran error si están vacíos | Automatizado |
| CA-003-02 | Los límites de caracteres se respetan | Automatizado |
| CA-003-03 | Los campos de email validan formato correcto | Automatizado |
| CA-003-04 | Los campos numéricos validan min/max | Automatizado |
| CA-003-05 | Las validaciones personalizadas (regex) funcionan | Automatizado |
| CA-003-06 | Las validaciones asíncronas (API) funcionan | Automatizado |

### CA-FB-004: Integración con Inspecciones
| ID | Criterio | Tipo |
|----|----------|------|
| CA-004-01 | Al seleccionar clasificación se muestran los formularios asociados | Automatizado |
| CA-004-02 | El modal de formulario se abre correctamente | Automatizado |
| CA-004-03 | Los datos se guardan al enviar el formulario | Automatizado |
| CA-004-04 | Se puede ver el formulario llenado en el detalle de inspección | Automatizado |
| CA-004-05 | Se puede editar un formulario ya llenado | Automatizado |

### CA-FB-005: Anidamiento y Estructura
| ID | Criterio | Tipo |
|----|----------|------|
| CA-005-01 | Se pueden anidar campos dentro de grupos | Manual |
| CA-005-02 | Se pueden anidar repeaters dentro de repeaters | Manual |
| CA-005-03 | Los tabs organizan correctamente los campos | Manual |
| CA-005-04 | El árbol de estructura refleja la jerarquía | Automatizado |
| CA-005-05 | No hay límite artificial de profundidad de anidamiento | Automatizado |

### CA-FB-006: Lógica Condicional
| ID | Criterio | Tipo |
|----|----------|------|
| CA-006-01 | Los campos condicionales se ocultan/muestran según reglas | Automatizado |
| CA-006-02 | Soporta operadores: igual, diferente, mayor, menor, contiene | Automatizado |
| CA-006-03 | Se pueden configurar campos "else" alternativos | Automatizado |
| CA-006-04 | La lógica funciona con campos dentro de repeaters | Automatizado |

### CA-FB-007: Características Avanzadas
| ID | Criterio | Tipo |
|----|----------|------|
| CA-007-01 | Los campos API cargan datos dinámicamente | Automatizado |
| CA-007-02 | Los campos dependientes se filtran en cascada | Automatizado |
| CA-007-03 | El scoring calcula y muestra puntuación correcta | Automatizado |
| CA-007-04 | El auto-guardado funciona según configuración | Automatizado |
| CA-007-05 | Las plantillas se insertan correctamente | Automatizado |

### CA-FB-008: Visualización en Detalle de Inspección
| ID | Criterio | Tipo |
|----|----------|------|
| CA-008-01 | El detalle de inspección muestra sección de formularios llenados | Automatizado |
| CA-008-02 | Se muestra resumen de cada formulario (nombre, autor, fecha, puntuación) | Automatizado |
| CA-008-03 | El botón "Ver formulario" abre modal de solo lectura | Automatizado |
| CA-008-04 | En modo lectura se muestran todos los valores correctamente | Automatizado |
| CA-008-05 | Las imágenes se muestran inline con opción de ampliar | Manual |
| CA-008-06 | Las firmas digitales se muestran como imagen | Automatizado |
| CA-008-07 | Los repeaters muestran todos los items expandidos | Automatizado |
| CA-008-08 | Los campos condicionales solo muestran los que aplican | Automatizado |
| CA-008-09 | La puntuación y desglose se muestra si el formulario tiene scoring | Automatizado |
| CA-008-10 | El modo vista compacta (acordeón) funciona correctamente | Manual |
| CA-008-11 | El modo vista expandida muestra todo en la página | Manual |

### CA-FB-009: Edición y Auditoría
| ID | Criterio | Tipo |
|----|----------|------|
| CA-009-01 | Se puede editar un formulario si la inspección está abierta | Automatizado |
| CA-009-02 | Los cambios se registran en el historial | Automatizado |
| CA-009-03 | El historial muestra quién editó, qué y cuándo | Automatizado |
| CA-009-04 | Se guardan valores anteriores y nuevos para auditoría | Automatizado |

### CA-FB-010: Exportación PDF
| ID | Criterio | Tipo |
|----|----------|------|
| CA-010-01 | Se puede descargar el formulario como PDF | Manual |
| CA-010-02 | El PDF incluye encabezado con info de inspección | Manual |
| CA-010-03 | El PDF incluye todos los campos y valores | Automatizado |
| CA-010-04 | El PDF incluye imágenes embebidas | Manual |
| CA-010-05 | El PDF incluye firmas digitales | Manual |
| CA-010-06 | El PDF incluye puntuación y desglose si aplica | Automatizado |

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Vue 3 + Quasar Framework
- **Drag & Drop:** Vue Draggable / SortableJS
- **Validación:** VeeValidate / Yup
- **Firma digital:** SignaturePad
- **PDF Generation:** jsPDF / pdfmake
- **Estado:** Pinia

### Backend
- **Framework:** NestJS
- **Base de datos:** PostgreSQL
- **ORM:** TypeORM
- **Validación:** class-validator
- **PDF Generation:** PDFKit / Puppeteer

---

## 📁 Estructura de Archivos Propuesta

```
backend/
├── src/
│   └── modules/
│       └── form-builder/
│           ├── form-builder.module.ts
│           ├── controllers/
│           │   ├── form-builder.controller.ts
│           │   └── form-submission.controller.ts
│           ├── services/
│           │   ├── form-template.service.ts
│           │   ├── form-submission.service.ts
│           │   ├── form-validator.service.ts      # Validaciones dinámicas
│           │   └── form-calculator.service.ts     # Campos calculados
│           ├── dto/
│           │   ├── create-form-template.dto.ts
│           │   ├── update-form-template.dto.ts
│           │   ├── create-form-submission.dto.ts
│           │   └── form-schema.dto.ts             # Validación del schema JSON
│           └── entities/
│               ├── form-template.entity.ts
│               ├── form-classification.entity.ts
│               ├── form-submission.entity.ts
│               └── form-draft.entity.ts           # Borradores

frontend/
├── src/
│   ├── pages/
│   │   ├── FormBuilderList.vue                    # Lista de formularios
│   │   ├── FormBuilderEditor.vue                  # Editor drag & drop
│   │   └── FormBuilderPreview.vue                 # Vista previa
│   ├── components/
│   │   └── form-builder/
│   │       ├── editor/
│   │       │   ├── FormCanvas.vue                 # Área de trabajo
│   │       │   ├── ComponentsSidebar.vue          # Barra de componentes
│   │       │   ├── StructureTree.vue              # Árbol jerárquico
│   │       │   ├── FieldConfigModal.vue           # Modal configuración
│   │       │   └── ConditionalBuilder.vue         # Constructor de condiciones
│   │       ├── renderer/
│   │       │   ├── FormRenderer.vue               # Renderiza formularios
│   │       │   ├── FormFillModal.vue              # Modal para llenar
│   │       │   └── ScoreDisplay.vue               # Muestra puntuación
│   │       ├── fields/
│   │       │   ├── basic/
│   │       │   │   ├── TextField.vue
│   │       │   │   ├── NumberField.vue
│   │       │   │   ├── DateField.vue
│   │       │   │   ├── TextareaField.vue
│   │       │   │   └── EmailField.vue
│   │       │   ├── selection/
│   │       │   │   ├── SelectField.vue
│   │       │   │   ├── RadioField.vue
│   │       │   │   ├── CheckboxField.vue
│   │       │   │   ├── ToggleField.vue
│   │       │   │   └── MultiSelectField.vue
│   │       │   ├── media/
│   │       │   │   ├── ImageField.vue
│   │       │   │   ├── FileField.vue
│   │       │   │   ├── SignatureField.vue
│   │       │   │   └── LocationField.vue
│   │       │   ├── structure/
│   │       │   │   ├── GroupField.vue             # Contenedor grupo
│   │       │   │   ├── RowField.vue               # Fila con columnas
│   │       │   │   ├── TabsField.vue              # Pestañas
│   │       │   │   ├── RepeaterField.vue          # Campos repetibles
│   │       │   │   ├── ConditionalField.vue       # Lógica condicional
│   │       │   │   └── DataGridField.vue          # Tabla editable
│   │       │   ├── advanced/
│   │       │   │   ├── CalculatedField.vue        # Campo calculado
│   │       │   │   ├── ApiSelectField.vue         # Select con API
│   │       │   │   ├── RatingField.vue            # Estrellas
│   │       │   │   └── SliderField.vue            # Deslizador
│   │       │   └── design/
│   │       │       ├── HeaderField.vue            # Título
│   │       │       ├── DividerField.vue           # Separador
│   │       │       ├── SpacerField.vue            # Espacio
│   │       │       └── ParagraphField.vue         # Texto informativo
│   │       ├── viewer/                            # VISUALIZACIÓN EN DETALLE
│   │       │   ├── FormSubmissionsList.vue        # Lista de formularios llenados
│   │       │   ├── FormViewerModal.vue            # Modal de solo lectura
│   │       │   ├── FormViewerInline.vue           # Vista expandida inline
│   │       │   ├── FormSubmissionCard.vue         # Tarjeta resumen de formulario
│   │       │   ├── FormHistoryLog.vue             # Historial de cambios
│   │       │   └── FormPdfGenerator.vue           # Generación de PDF
│   │       └── shared/
│   │           ├── FieldWrapper.vue               # Wrapper común
│   │           ├── FieldReadOnly.vue              # Campo en modo solo lectura
│   │           ├── ValidationMessages.vue         # Mensajes de error
│   │           ├── ImageViewer.vue                # Visor de imágenes ampliadas
│   │           └── FieldLabel.vue                 # Etiqueta con indicador
│   ├── composables/
│   │   ├── useFormBuilder.ts                      # Lógica del builder
│   │   ├── useFormRenderer.ts                     # Lógica del renderer
│   │   ├── useFormViewer.ts                       # Lógica de visualización
│   │   ├── useFormValidation.ts                   # Validaciones
│   │   ├── useFormCalculations.ts                 # Cálculos
│   │   ├── useFormPdf.ts                          # Generación PDF
│   │   └── useDragAndDrop.ts                      # Drag & drop
│   ├── stores/
│   │   └── formBuilder.ts                         # Estado Pinia
│   └── services/
│       └── formBuilderService.ts                  # Llamadas API
```

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos y Backend Core (4-5 días)
1. Crear tablas en PostgreSQL (templates, classifications, submissions, drafts)
2. Crear entidades TypeORM con relaciones
3. Crear DTOs de validación incluyendo schema JSON
4. Implementar servicios CRUD básicos
5. Crear controladores y endpoints
6. Tests unitarios de servicios

### Fase 2: Frontend - Editor Básico (5-6 días)
1. Crear página de lista de formularios
2. Implementar editor con drag & drop (Vue Draggable)
3. Crear barra lateral de componentes categorizada
4. Implementar canvas con soporte de anidamiento
5. Crear árbol de estructura jerárquico
6. Implementar modal de configuración de campos básicos
7. Guardado y carga de formularios

### Fase 3: Campos de Estructura (4-5 días)
1. Implementar GroupField con collapsible y columns
2. Implementar RowField con control de anchos
3. Implementar TabsField
4. Implementar RepeaterField con add/remove
5. Implementar anidamiento recursivo
6. Soporte de drag & drop dentro de contenedores

### Fase 4: Lógica Condicional y Cálculos (3-4 días)
1. Implementar ConditionalField
2. Crear constructor visual de condiciones
3. Implementar CalculatedField
4. Parser de fórmulas (mathjs o similar)
5. Integrar cálculos en tiempo real

### Fase 5: Renderizador de Formularios (4-5 días)
1. Crear componente FormRenderer principal
2. Implementar cada tipo de campo para llenado
3. Sistema de validaciones dinámicas
4. Soporte de campos anidados y repeaters
5. Crear modal de llenado
6. Implementar auto-guardado y borradores

### Fase 6: Campos Avanzados (3-4 días)
1. Implementar DataGridField (tabla editable)
2. Implementar ApiSelectField con dependencias
3. Implementar SignatureField
4. Implementar campos con scoring
5. Sistema de plantillas reutilizables

### Fase 7: Integración con Inspecciones (2-3 días)
1. Modificar formulario de inspecciones
2. Cargar formularios por clasificación
3. Vincular respuestas con inspecciones
4. Mostrar formularios en detalle de inspección
5. Permitir edición de respuestas

### Fase 8: Testing y Refinamiento (3-4 días)
1. Tests E2E del form builder
2. Tests de llenado de formularios complejos
3. Tests de anidamiento profundo
4. Ajustes de UX y rendimiento
5. Documentación de usuario
6. Documentación técnica

**Tiempo total estimado: 28-36 días**

### Priorización por MVP

**MVP (Mínimo Viable):** Fases 1, 2, 5 parcial, 7 = ~14-16 días
- Crear formularios básicos
- Campos simples (texto, número, select, checkbox, firma)
- Repeater básico
- Integración con inspecciones

**Versión Completa:** Todas las fases = ~28-36 días
- Anidamiento ilimitado
- Lógica condicional
- Campos calculados
- Data grid
- Scoring
- API selects

---

## 🎨 Guías de UX/UI

### Principios de Diseño

1. **Claridad extrema**: Cada acción debe ser obvia
2. **Feedback inmediato**: Mostrar resultados de acciones al instante
3. **Prevención de errores**: Validar antes de que el usuario cometa errores
4. **Recuperación fácil**: Permitir deshacer acciones
5. **Consistencia**: Seguir patrones de Quasar Framework

### Microinteracciones

- **Drag & Drop**: Animación suave al arrastrar componentes
- **Hover states**: Resaltar área de soltar
- **Guardado**: Indicador de "Guardando..." y confirmación
- **Validación**: Resaltar campos con error en rojo con mensaje claro
- **Éxito**: Toast de confirmación verde

### Accesibilidad

- Navegación por teclado en el editor
- Labels descriptivos en todos los campos
- Contraste de colores adecuado
- Indicadores visuales para campos obligatorios (*)

---

## 📚 Glosario

| Término | Definición |
|---------|------------|
| **Form Template** | Plantilla de formulario creada por el administrador |
| **Form Submission** | Respuesta de un formulario llenado por un usuario |
| **Canvas** | Área de trabajo donde se construye el formulario |
| **Repeater** | Campo especial que permite duplicar un grupo de campos |
| **Group** | Contenedor que agrupa campos relacionados visualmente |
| **Tabs** | Contenedor que organiza campos en pestañas |
| **Conditional** | Contenedor que muestra/oculta campos según condiciones |
| **Data Grid** | Campo tipo tabla con edición inline |
| **Calculated** | Campo cuyo valor se calcula automáticamente |
| **Clasificación** | Categoría de inspección del módulo existente |
| **Schema** | Estructura JSON que define el formulario |
| **Anidamiento** | Capacidad de colocar contenedores dentro de otros |
| **Scoring** | Sistema de puntuación basado en respuestas |
| **Template Field** | Campo que referencia una plantilla reutilizable |
| **API Select** | Campo select que carga opciones desde un endpoint |
| **Cascading** | Selects que se filtran en cadena según dependencias |

---

## ⚠️ Consideraciones Técnicas

### Rendimiento
1. **Límite de campos**: Recomendado máximo 100 campos por formulario (incluyendo anidados)
2. **Profundidad de anidamiento**: Técnicamente ilimitado, recomendado máximo 5 niveles
3. **Repeaters anidados**: Limitar máximo de items en repeaters profundos
4. **Lazy loading**: Cargar tabs bajo demanda si tienen muchos campos
5. **Debounce**: En campos calculados y validaciones asíncronas

### Almacenamiento
1. Las firmas se guardan como base64 en el JSON de respuesta
2. Los archivos grandes se suben al sistema de archivos, solo se guarda referencia
3. El schema del formulario se almacena en JSONB optimizado con índices GIN
4. Los borradores expiran después de 7 días por defecto

### Versionado
1. Implementar versionado de templates para no afectar submissions existentes
2. Al editar un template con submissions, crear nueva versión
3. Mantener historial de versiones para auditoría

### Seguridad
1. Sanitizar HTML en campos de texto
2. Validar tipos de archivo permitidos
3. Limitar tamaño de archivos
4. Validar formulas de campos calculados (no permitir código arbitrario)
5. Rate limiting en endpoints de validación asíncrona

### Migración y Compatibilidad
1. No afecta datos existentes de inspecciones
2. Es un módulo completamente nuevo
3. Backward compatible con schema version 1.0

### Permisos
1. Solo administradores pueden crear/editar formularios
2. Todos los usuarios pueden llenar formularios según permisos de inspecciones
3. Considerar permisos granulares por formulario en el futuro

---

## 🔮 Funcionalidades Futuras (Roadmap)

### Versión 2.1
- [ ] Importar/Exportar formularios como archivos JSON
- [ ] Historial de cambios en formularios
- [ ] Clonar formularios entre clasificaciones
- [ ] Modo offline para llenado de formularios

### Versión 2.2
- [ ] Reportes y analytics de formularios
- [ ] Gráficas de scoring por clasificación
- [ ] Exportar submissions a Excel/PDF
- [ ] Workflow de aprobaciones

### Versión 3.0
- [ ] Editor colaborativo en tiempo real
- [ ] AI para sugerir campos basado en nombre del formulario
- [ ] Reconocimiento de voz para llenado
- [ ] Integración con sistemas externos (webhooks)

---

**Documento creado:** 04/12/2024  
**Última actualización:** 04/12/2024  
**Autor:** Sistema KAPA  
**Versión:** 2.0
