<template>
  <div class="field-properties">
    <!-- Propiedades básicas -->
    <div class="text-subtitle2 q-mb-sm">General</div>
    
    <q-input
      v-model="localField.label"
      label="Nombre del campo"
      outlined
      dense
      class="q-mb-sm"
      hint="El texto que verá el usuario. Ej: 'Nombre completo'"
      @update:model-value="emitUpdate"
    />

    <q-input
      v-model="localField.key"
      label="Identificador interno"
      outlined
      dense
      readonly
      disable
      class="q-mb-sm"
      hint="Se genera automáticamente (no se puede editar)"
      @update:model-value="emitUpdate"
    />

    <q-input
      v-model="localField.placeholder"
      label="Texto de ayuda dentro del campo"
      outlined
      dense
      class="q-mb-sm"
      hint="Texto gris que aparece antes de escribir. Ej: 'Escriba aquí...'"
      @update:model-value="emitUpdate"
    />

    <q-toggle
      v-model="localField.required"
      label="¿Es obligatorio?"
      class="q-mb-sm"
      @update:model-value="emitUpdate"
    >
      <q-tooltip>Si activas esto, el usuario NO podrá enviar el formulario sin llenar este campo</q-tooltip>
    </q-toggle>

    <q-separator class="q-my-md" />

    <!-- Propiedades específicas por tipo -->
    
    <!-- Texto -->
    <template v-if="localField.type === 'text' || localField.type === 'textarea'">
      <div class="text-subtitle2 q-mb-sm">Validación</div>
      <q-input
        v-model.number="localField.validation.maxLength"
        label="Máximo de caracteres"
        outlined
        dense
        type="number"
        class="q-mb-sm"
        hint="¿Cuántas letras/números puede escribir como máximo?"
        @update:model-value="emitUpdate"
      />
      <q-select
        v-model="localField.validation.patternType"
        label="Formato de texto permitido"
        outlined
        dense
        class="q-mb-sm"
        :options="patternOptions"
        emit-value
        map-options
        clearable
        hint="Elige qué tipo de texto puede escribir el usuario"
        @update:model-value="onPatternTypeChange"
      />
    </template>

    <!-- Número -->
    <template v-if="localField.type === 'number'">
      <div class="text-subtitle2 q-mb-sm">Límites del número</div>
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-input
            v-model.number="localField.validation.min"
            label="Número mínimo"
            outlined
            dense
            type="number"
            hint="El menor número permitido"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="localField.validation.max"
            label="Número máximo"
            outlined
            dense
            type="number"
            hint="El mayor número permitido"
            @update:model-value="emitUpdate"
          />
        </div>
      </div>
      <q-input
        v-model.number="localField.validation.step"
        label="Incremento"
        outlined
        dense
        type="number"
        class="q-mt-sm"
        hint="De cuánto en cuánto sube/baja. Ej: 1, 0.5, 10"
        @update:model-value="emitUpdate"
      />
    </template>

    <!-- Select, Radio, Checkbox Group -->
    <template v-if="['select', 'radio', 'checkbox_group'].includes(localField.type)">
      <div class="text-subtitle2 q-mb-sm">Opciones</div>
      <div
        v-for="(opt, idx) in localField.options"
        :key="idx"
        class="row q-col-gutter-xs q-mb-xs items-center"
      >
        <div class="col">
          <q-input
            v-model="opt.label"
            dense
            outlined
            placeholder="Etiqueta"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            icon="delete"
            size="sm"
            color="negative"
            @click="removeOption(idx)"
          />
        </div>
      </div>
      <q-btn
        flat
        dense
        color="primary"
        icon="add"
        label="Agregar opción"
        class="q-mt-sm"
        @click="addOption"
      />
    </template>

    <!-- Rating -->
    <template v-if="localField.type === 'rating'">
      <div class="text-subtitle2 q-mb-sm">Configuración</div>
      <q-input
        v-model.number="localField.props.max"
        label="Máximo de estrellas"
        outlined
        dense
        type="number"
        class="q-mb-sm"
        @update:model-value="emitUpdate"
      />
      <q-toggle
        v-model="localField.props.allowHalf"
        label="Permitir medias estrellas"
        @update:model-value="emitUpdate"
      />
    </template>

    <!-- Header -->
    <template v-if="localField.type === 'header'">
      <div class="text-subtitle2 q-mb-sm">Configuración del Encabezado</div>
      <q-input
        v-model="localField.props.text"
        label="Texto del título"
        outlined
        dense
        class="q-mb-sm"
        hint="El título que verá el usuario"
        @update:model-value="emitUpdate"
      />
      <q-select
        v-model="localField.props.size"
        label="Tamaño del título"
        outlined
        dense
        :options="headerSizes"
        emit-value
        map-options
        hint="Qué tan grande se verá"
        @update:model-value="emitUpdate"
      />
    </template>

    <!-- Paragraph / Texto informativo -->
    <template v-if="localField.type === 'paragraph'">
      <div class="text-subtitle2 q-mb-sm">Configuración del Texto Informativo</div>
      <q-input
        v-model="localField.props.text"
        label="Texto a mostrar"
        outlined
        dense
        type="textarea"
        rows="4"
        class="q-mb-sm"
        hint="Las instrucciones o información que verá el usuario"
        @update:model-value="emitUpdate"
      />
      <q-select
        v-model="localField.props.style"
        label="Estilo del texto"
        outlined
        dense
        :options="paragraphStyles"
        emit-value
        map-options
        class="q-mb-sm"
        @update:model-value="emitUpdate"
      />
      <q-select
        v-model="localField.props.color"
        label="Color del texto"
        outlined
        dense
        :options="textColors"
        emit-value
        map-options
        @update:model-value="emitUpdate"
      />
      <q-banner dense class="bg-amber-1 q-mt-md text-caption" rounded>
        <template v-slot:avatar>
          <q-icon name="lightbulb" color="amber-8" />
        </template>
        <strong>Consejo:</strong> Usa este campo para dar instrucciones claras al usuario antes de un campo complicado.
      </q-banner>
    </template>

    <!-- Row / Columnas -->
    <template v-if="localField.type === 'row'">
      <div class="text-subtitle2 q-mb-sm">Configuración de Columnas</div>
      
      <q-select
        v-model.number="columnCount"
        label="Número de columnas"
        outlined
        dense
        :options="columnCountOptions"
        emit-value
        map-options
        class="q-mb-sm"
        hint="¿Cuántas columnas quieres en esta fila?"
        @update:model-value="updateColumnCount"
      />
      
      <div v-if="localField.columns && localField.columns.length > 0" class="q-mt-md">
        <div class="text-caption text-grey-7 q-mb-sm">Ancho de cada columna:</div>
        <div 
          v-for="(col, idx) in localField.columns" 
          :key="idx"
          class="row items-center q-mb-sm"
        >
          <div class="col-3 text-caption">Columna {{ idx + 1 }}:</div>
          <div class="col">
            <q-select
              v-model.number="col.colSpan"
              dense
              outlined
              :options="colSpanOptions"
              emit-value
              map-options
              @update:model-value="emitUpdate"
            />
          </div>
        </div>
        <div class="text-caption text-grey-6 q-mt-sm">
          <q-icon name="info" size="xs" /> Total: {{ totalColSpan }}/12 
          <span v-if="totalColSpan !== 12" class="text-negative">(debe sumar 12)</span>
          <span v-else class="text-positive">(correcto)</span>
        </div>
      </div>
      
      <q-banner dense class="bg-cyan-1 q-mt-md text-caption" rounded>
        <template v-slot:avatar>
          <q-icon name="view_column" color="cyan-8" />
        </template>
        <strong>Tip:</strong> Arrastra campos dentro de cada columna en el canvas. El total de anchos debe sumar 12 (sistema de cuadrícula).
      </q-banner>
    </template>

    <!-- Group -->
    <template v-if="localField.type === 'group'">
      <div class="text-subtitle2 q-mb-sm">Configuración de grupo</div>
      <q-toggle
        v-model="localField.props.collapsible"
        label="Colapsable"
        class="q-mb-sm"
        @update:model-value="emitUpdate"
      />
      <q-toggle
        v-model="localField.props.collapsed"
        label="Iniciar colapsado"
        class="q-mb-sm"
        :disable="!localField.props?.collapsible"
        @update:model-value="emitUpdate"
      />
      <q-toggle
        v-model="localField.props.showBorder"
        label="Mostrar borde"
        @update:model-value="emitUpdate"
      />
    </template>

    <!-- Repeater -->
    <template v-if="localField.type === 'repeater'">
      <div class="text-subtitle2 q-mb-sm">
        Configuración del Repetidor
        <q-btn flat round dense size="xs" icon="help" color="primary">
          <q-tooltip class="bg-blue-grey-9 text-body2" max-width="350px">
            <div class="q-pa-sm">
              <div class="text-weight-bold q-mb-sm">🔄 ¿Qué es un Repetidor?</div>
              <p>Permite al usuario agregar MÚLTIPLES registros del mismo tipo.</p>
              <p class="text-weight-bold q-mt-sm">Ejemplo práctico:</p>
              <p>Si necesitas registrar varios "Hallazgos" en una inspección, cada uno con:</p>
              <ul class="q-pl-md">
                <li>Descripción</li>
                <li>Foto</li>
                <li>Área afectada</li>
              </ul>
              <p class="q-mt-sm">El usuario verá un botón "+ Agregar" y podrá crear tantos hallazgos como necesite.</p>
            </div>
          </q-tooltip>
        </q-btn>
      </div>
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-input
            v-model.number="localField.props.minItems"
            label="Mínimo de registros"
            outlined
            dense
            type="number"
            hint="¿Cuántos debe llenar como mínimo?"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model.number="localField.props.maxItems"
            label="Máximo de registros"
            outlined
            dense
            type="number"
            hint="¿Cuántos puede agregar como máximo?"
            @update:model-value="emitUpdate"
          />
        </div>
      </div>
      <q-input
        v-model="localField.props.addButtonText"
        label="Texto del botón"
        outlined
        dense
        class="q-mt-sm"
        placeholder="+ Agregar"
        hint="Texto que verá el usuario en el botón. Ej: '+ Agregar hallazgo'"
        @update:model-value="emitUpdate"
      />
      <q-banner dense class="bg-blue-1 q-mt-md text-caption" rounded>
        <template v-slot:avatar>
          <q-icon name="info" color="primary" />
        </template>
        <strong>Siguiente paso:</strong> Arrastra los campos que quieres repetir dentro de este repetidor en el canvas (panel del centro).
      </q-banner>
    </template>

    <!-- Tabs -->
    <template v-if="localField.type === 'tabs'">
      <div class="text-subtitle2 q-mb-sm">Pestañas</div>
      <div
        v-for="(tab, idx) in localField.tabs"
        :key="idx"
        class="row q-col-gutter-xs q-mb-xs items-center"
      >
        <div class="col">
          <q-input
            v-model="tab.label"
            dense
            outlined
            placeholder="Nombre de pestaña"
            @update:model-value="emitUpdate"
          />
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            icon="delete"
            size="sm"
            color="negative"
            @click="removeTab(idx)"
            :disable="localField.tabs.length <= 1"
          />
        </div>
      </div>
      <q-btn
        flat
        dense
        color="primary"
        icon="add"
        label="Agregar pestaña"
        class="q-mt-sm"
        @click="addTab"
      />
    </template>

    <!-- Conditional -->
    <template v-if="localField.type === 'conditional'">
      <div class="text-subtitle2 q-mb-sm">
        Configuración de Condición
        <q-btn flat round dense size="xs" icon="help" color="primary">
          <q-tooltip class="bg-blue-grey-9 text-body2" max-width="350px">
            <div class="q-pa-sm">
              <div class="text-weight-bold q-mb-sm">🔀 ¿Qué es un Campo Condicional?</div>
              <p>Muestra u oculta campos según lo que responda el usuario en otro campo.</p>
              <p class="text-weight-bold q-mt-sm">Ejemplo:</p>
              <p>Si preguntas "¿Hubo accidente?" (Sí/No)</p>
              <p>Puedes hacer que SOLO si responde "Sí" aparezcan campos adicionales como:</p>
              <ul class="q-pl-md">
                <li>Descripción del accidente</li>
                <li>Número de afectados</li>
                <li>Fotos</li>
              </ul>
            </div>
          </q-tooltip>
        </q-btn>
      </div>
      <q-input
        v-model="localField.conditional.field"
        label="¿Qué campo debo revisar?"
        outlined
        dense
        class="q-mb-sm"
        hint="Escribe el 'Identificador interno' del campo que controla esta condición"
        @update:model-value="emitUpdate"
      />
      <q-select
        v-model="localField.conditional.operator"
        label="¿Cuándo muestro estos campos?"
        outlined
        dense
        :options="conditionalOperators"
        emit-value
        map-options
        class="q-mb-sm"
        @update:model-value="emitUpdate"
      />
      <q-input
        v-model="localField.conditional.value"
        label="Valor"
        outlined
        dense
        @update:model-value="emitUpdate"
      />
    </template>

    <!-- Calculated -->
    <template v-if="localField.type === 'calculated'">
      <div class="text-subtitle2 q-mb-sm">Fórmula</div>
      <q-input
        v-model="localField.formula"
        label="Fórmula"
        outlined
        dense
        type="textarea"
        rows="2"
        hint="Ej: {campo1} + {campo2}"
        @update:model-value="emitUpdate"
      />
    </template>

    <!-- File / Image -->
    <template v-if="['file', 'image'].includes(localField.type)">
      <div class="text-subtitle2 q-mb-sm">Configuración de archivo</div>
      <q-input
        v-model="localField.props.accept"
        label="Tipos aceptados"
        outlined
        dense
        class="q-mb-sm"
        hint="Ej: .pdf,.jpg,.png"
        @update:model-value="emitUpdate"
      />
      <q-input
        v-model.number="localField.props.maxSize"
        label="Tamaño máximo (MB)"
        outlined
        dense
        type="number"
        class="q-mb-sm"
        @update:model-value="emitUpdate"
      />
      <q-toggle
        v-model="localField.props.multiple"
        label="Permitir múltiples archivos"
        @update:model-value="emitUpdate"
      />
    </template>

    <q-separator class="q-my-md" />

    <!-- Valor por defecto -->
    <div class="text-subtitle2 q-mb-sm">Valor por defecto</div>
    <q-input
      v-model="localField.defaultValue"
      label="Valor inicial"
      outlined
      dense
      @update:model-value="emitUpdate"
    />
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

// Copia local del campo para evitar mutación directa
const localField = reactive({
  ...props.modelValue,
  validation: { 
    ...props.modelValue.validation,
    patternType: props.modelValue.validation?.pattern || ''
  },
  props: props.modelValue.props || {},
  conditional: props.modelValue.conditional || { field: '', operator: 'equals', value: '' },
});

// Opciones
const headerSizes = [
  { label: 'H1 - Grande', value: 'h1' },
  { label: 'H2 - Mediano', value: 'h2' },
  { label: 'H3 - Normal', value: 'h3' },
  { label: 'H4 - Pequeño', value: 'h4' },
  { label: 'H5 - Muy pequeño', value: 'h5' },
];

// Opciones para texto informativo (paragraph)
const paragraphStyles = [
  { label: '📝 Normal', value: 'normal' },
  { label: 'ℹ️ Información (fondo azul)', value: 'info' },
  { label: '⚠️ Advertencia (fondo amarillo)', value: 'warning' },
  { label: '✅ Éxito (fondo verde)', value: 'success' },
  { label: '❌ Error/Importante (fondo rojo)', value: 'error' },
];

const textColors = [
  { label: '⚫ Gris oscuro (normal)', value: 'grey-8' },
  { label: '🔵 Azul', value: 'primary' },
  { label: '🟢 Verde', value: 'positive' },
  { label: '🟠 Naranja', value: 'warning' },
  { label: '🔴 Rojo', value: 'negative' },
];

// Opciones de formato de texto (en lugar de regex técnico)
const patternOptions = [
  { label: '📝 Cualquier texto (sin restricción)', value: '' },
  { label: '🔤 Solo letras (sin números)', value: '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$' },
  { label: '🔢 Solo números', value: '^[0-9]+$' },
  { label: '🆔 Cédula colombiana (10 dígitos)', value: '^[0-9]{6,10}$' },
  { label: '📱 Celular colombiano (10 dígitos)', value: '^3[0-9]{9}$' },
  { label: '☎️ Teléfono fijo (7 dígitos)', value: '^[0-9]{7}$' },
  { label: '🔠 Letras y números', value: '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s]+$' },
  { label: '🚗 Placa vehículo (ABC123)', value: '^[A-Za-z]{3}[0-9]{3}$' },
  { label: '🏢 NIT empresa', value: '^[0-9]{9}-[0-9]$' },
];

const conditionalOperators = [
  { label: 'Cuando sea igual a...', value: 'equals' },
  { label: 'Cuando NO sea igual a...', value: 'not_equals' },
  { label: 'Cuando contenga...', value: 'contains' },
  { label: 'Cuando sea mayor que...', value: 'greater_than' },
  { label: 'Cuando sea menor que...', value: 'less_than' },
  { label: 'Cuando esté vacío', value: 'is_empty' },
  { label: 'Cuando NO esté vacío', value: 'is_not_empty' },
];

// Opciones para columnas (tipo row)
const columnCountOptions = [
  { label: '2 columnas', value: 2 },
  { label: '3 columnas', value: 3 },
  { label: '4 columnas', value: 4 },
];

const colSpanOptions = [
  { label: '1/12 (muy estrecha)', value: 1 },
  { label: '2/12', value: 2 },
  { label: '3/12 (1/4 del ancho)', value: 3 },
  { label: '4/12 (1/3 del ancho)', value: 4 },
  { label: '5/12', value: 5 },
  { label: '6/12 (mitad)', value: 6 },
  { label: '7/12', value: 7 },
  { label: '8/12 (2/3 del ancho)', value: 8 },
  { label: '9/12 (3/4 del ancho)', value: 9 },
  { label: '10/12', value: 10 },
  { label: '11/12', value: 11 },
  { label: '12/12 (ancho completo)', value: 12 },
];

// Ref para número de columnas
const columnCount = ref(localField.columns?.length || 2);

// Computed para total de colSpan
const totalColSpan = computed(() => {
  if (!localField.columns) return 0;
  return localField.columns.reduce((sum, col) => sum + (col.colSpan || 6), 0);
});

// Función para actualizar número de columnas
const updateColumnCount = (count) => {
  if (!localField.columns) localField.columns = [];
  
  const currentCount = localField.columns.length;
  const defaultSpan = Math.floor(12 / count);
  
  if (count > currentCount) {
    // Agregar columnas
    for (let i = currentCount; i < count; i++) {
      localField.columns.push({ colSpan: defaultSpan, fields: [] });
    }
  } else if (count < currentCount) {
    // Remover columnas (mover campos huérfanos a la última columna)
    const removedFields = [];
    for (let i = count; i < currentCount; i++) {
      if (localField.columns[i].fields) {
        removedFields.push(...localField.columns[i].fields);
      }
    }
    localField.columns = localField.columns.slice(0, count);
    if (removedFields.length > 0 && localField.columns[count - 1]) {
      localField.columns[count - 1].fields = [
        ...(localField.columns[count - 1].fields || []),
        ...removedFields
      ];
    }
  }
  
  // Ajustar colSpan para que sume 12
  const totalSpan = localField.columns.reduce((sum, col) => sum + col.colSpan, 0);
  if (totalSpan !== 12) {
    const adjustedSpan = Math.floor(12 / count);
    localField.columns.forEach((col, idx) => {
      col.colSpan = idx === count - 1 ? 12 - (adjustedSpan * (count - 1)) : adjustedSpan;
    });
  }
  
  emitUpdate();
};

// Métodos
const emitUpdate = () => {
  emit('update:modelValue', { ...localField });
};

// Manejar cambio de tipo de patrón
const onPatternTypeChange = (val) => {
  localField.validation.pattern = val || '';
  localField.validation.patternType = val;
  emitUpdate();
};

const addOption = () => {
  if (!localField.options) localField.options = [];
  const idx = localField.options.length + 1;
  localField.options.push({
    value: `opcion${idx}`,
    label: `Opción ${idx}`,
  });
  emitUpdate();
};

const removeOption = (idx) => {
  localField.options.splice(idx, 1);
  emitUpdate();
};

const addTab = () => {
  if (!localField.tabs) localField.tabs = [];
  localField.tabs.push({
    label: `Tab ${localField.tabs.length + 1}`,
    fields: [],
  });
  emitUpdate();
};

const removeTab = (idx) => {
  if (localField.tabs.length > 1) {
    localField.tabs.splice(idx, 1);
    emitUpdate();
  }
};

// Sincronizar cuando cambia el modelValue
watch(() => props.modelValue, (newVal) => {
  Object.assign(localField, {
    ...newVal,
    validation: newVal.validation || {},
    props: newVal.props || {},
    conditional: newVal.conditional || { field: '', operator: 'equals', value: '' },
  });
}, { deep: true });
</script>

<style scoped>
.field-properties {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}
</style>
