<template>
  <div class="render-field" :class="{ 'is-hidden': !shouldShow }">
    <!-- Texto -->
    <q-input
      v-if="field.type === 'text'"
      :model-value="modelValue"
      :label="fieldLabel"
      :placeholder="field.placeholder"
      :readonly="readonly"
      :rules="validationRules"
      outlined
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Textarea -->
    <q-input
      v-else-if="field.type === 'textarea'"
      :model-value="modelValue"
      :label="fieldLabel"
      :placeholder="field.placeholder"
      :readonly="readonly"
      :rules="validationRules"
      type="textarea"
      rows="3"
      outlined
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Número -->
    <q-input
      v-else-if="field.type === 'number'"
      :model-value="modelValue"
      :label="fieldLabel"
      :placeholder="field.placeholder"
      :readonly="readonly"
      :rules="validationRules"
      type="number"
      :min="field.validation?.min"
      :max="field.validation?.max"
      :step="field.validation?.step || 1"
      outlined
      dense
      @update:model-value="$emit('update:modelValue', Number($event))"
    />

    <!-- Email -->
    <q-input
      v-else-if="field.type === 'email'"
      :model-value="modelValue"
      :label="fieldLabel"
      :placeholder="field.placeholder"
      :readonly="readonly"
      :rules="emailRules"
      type="email"
      outlined
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template v-slot:prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <!-- Fecha -->
    <q-input
      v-else-if="field.type === 'date'"
      :model-value="modelValue"
      :label="fieldLabel"
      :readonly="readonly"
      :rules="validationRules"
      outlined
      dense
      mask="##/##/####"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              :model-value="modelValue"
              mask="DD/MM/YYYY"
              @update:model-value="$emit('update:modelValue', $event)"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Cerrar" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <!-- Hora -->
    <q-input
      v-else-if="field.type === 'time'"
      :model-value="modelValue"
      :label="fieldLabel"
      :readonly="readonly"
      :rules="validationRules"
      outlined
      dense
      mask="##:##"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template v-slot:append>
        <q-icon name="schedule" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time
              :model-value="modelValue"
              format24h
              @update:model-value="$emit('update:modelValue', $event)"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Cerrar" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <!-- Select -->
    <q-select
      v-else-if="field.type === 'select'"
      :model-value="modelValue"
      :label="fieldLabel"
      :options="field.options || []"
      :readonly="readonly"
      :rules="validationRules"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      outlined
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Radio -->
    <div v-else-if="field.type === 'radio'" class="q-mb-sm">
      <div class="text-caption text-grey-8 q-mb-xs">{{ fieldLabel }}</div>
      <q-option-group
        :model-value="modelValue"
        :options="field.options || []"
        :disable="readonly"
        type="radio"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>

    <!-- Checkbox simple -->
    <q-checkbox
      v-else-if="field.type === 'checkbox'"
      :model-value="modelValue"
      :label="field.label"
      :disable="readonly"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Checkbox group -->
    <div v-else-if="field.type === 'checkbox_group'" class="q-mb-sm">
      <div class="text-caption text-grey-8 q-mb-xs">{{ fieldLabel }}</div>
      <q-option-group
        :model-value="modelValue || []"
        :options="field.options || []"
        :disable="readonly"
        type="checkbox"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>

    <!-- Toggle -->
    <q-toggle
      v-else-if="field.type === 'toggle'"
      :model-value="modelValue"
      :label="field.label"
      :disable="readonly"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Rating -->
    <div v-else-if="field.type === 'rating'" class="q-mb-sm">
      <div class="text-caption text-grey-8 q-mb-xs">{{ fieldLabel }}</div>
      <q-rating
        :model-value="modelValue || 0"
        :max="field.props?.max || 5"
        :readonly="readonly"
        size="md"
        color="amber"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>

    <!-- File -->
    <q-file
      v-else-if="field.type === 'file'"
      :model-value="modelValue"
      :label="fieldLabel"
      :accept="field.props?.accept"
      :max-file-size="(field.props?.maxSize || 10) * 1024 * 1024"
      :multiple="field.props?.multiple"
      :readonly="readonly"
      outlined
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template v-slot:prepend>
        <q-icon name="attach_file" />
      </template>
    </q-file>

    <!-- Divider -->
    <q-separator v-else-if="field.type === 'divider'" class="q-my-md" />

    <!-- Header -->
    <component
      v-else-if="field.type === 'header'"
      :is="field.props?.size || 'h3'"
      class="q-my-md"
    >
      {{ field.props?.text || field.label }}
    </component>

    <!-- Paragraph / Texto informativo -->
    <q-banner
      v-else-if="field.type === 'paragraph'"
      :class="getParagraphClass(field.props?.style)"
      class="q-mb-md"
      dense
      rounded
    >
      <template v-slot:avatar>
        <q-icon :name="getParagraphIcon(field.props?.style)" :color="field.props?.color || 'grey-8'" />
      </template>
      <span :class="`text-${field.props?.color || 'grey-8'}`" style="white-space: pre-wrap;">
        {{ field.props?.text || field.label }}
      </span>
    </q-banner>

    <!-- Row / Columnas -->
    <div v-else-if="field.type === 'row'" class="row-layout q-mb-md">
      <div v-if="field.label" class="text-subtitle2 q-mb-sm">{{ field.label }}</div>
      <div class="row q-col-gutter-md">
        <div 
          v-for="(column, colIdx) in field.columns" 
          :key="colIdx"
          :class="`col-12 col-md-${column.colSpan || 6}`"
        >
          <template v-for="childField in column.fields" :key="childField.id">
            <render-field
              :field="childField"
              :model-value="getRowFieldValue(colIdx, childField.key)"
              :all-values="allValues"
              :readonly="readonly"
              @update:model-value="updateRowField(colIdx, childField.key, $event)"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Group -->
    <q-card v-else-if="field.type === 'group'" flat bordered class="q-mb-md">
      <q-expansion-item
        v-if="field.props?.collapsible"
        :label="field.label"
        :default-opened="!field.props?.collapsed"
        header-class="bg-grey-2"
      >
        <q-card-section>
          <template v-for="childField in field.fields" :key="childField.id">
            <render-field
              :field="childField"
              :model-value="(modelValue || {})[childField.key]"
              :all-values="allValues"
              :readonly="readonly"
              @update:model-value="updateNestedField(childField.key, $event)"
            />
          </template>
        </q-card-section>
      </q-expansion-item>
      <template v-else>
        <q-card-section class="bg-grey-2">
          <div class="text-subtitle2">{{ field.label }}</div>
        </q-card-section>
        <q-card-section>
          <template v-for="childField in field.fields" :key="childField.id">
            <render-field
              :field="childField"
              :model-value="(modelValue || {})[childField.key]"
              :all-values="allValues"
              :readonly="readonly"
              @update:model-value="updateNestedField(childField.key, $event)"
            />
          </template>
        </q-card-section>
      </template>
    </q-card>

    <!-- Repeater -->
    <q-card v-else-if="field.type === 'repeater'" flat bordered class="q-mb-md">
      <q-card-section class="bg-grey-2">
        <div class="text-subtitle2">{{ field.label }}</div>
      </q-card-section>
      <q-card-section>
        <div
          v-for="(item, idx) in (modelValue || [])"
          :key="idx"
          class="repeater-item q-mb-md q-pa-sm bg-grey-1 rounded-borders"
        >
          <div class="row items-center q-mb-sm">
            <div class="col text-caption text-grey-7">Elemento {{ idx + 1 }}</div>
            <div class="col-auto">
              <q-btn
                v-if="!readonly"
                flat
                round
                dense
                icon="delete"
                size="sm"
                color="negative"
                @click="removeRepeaterItem(idx)"
              />
            </div>
          </div>
          <template v-for="childField in field.fields" :key="childField.id">
            <render-field
              :field="childField"
              :model-value="item[childField.key]"
              :all-values="allValues"
              :readonly="readonly"
              @update:model-value="updateRepeaterItem(idx, childField.key, $event)"
            />
          </template>
        </div>
        <q-btn
          v-if="!readonly && canAddRepeaterItem"
          flat
          color="primary"
          icon="add"
          :label="field.props?.addButtonText || '+ Agregar'"
          @click="addRepeaterItem"
        />
      </q-card-section>
    </q-card>

    <!-- Tabs -->
    <q-card v-else-if="field.type === 'tabs'" flat bordered class="q-mb-md">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab
          v-for="(tab, idx) in field.tabs"
          :key="idx"
          :name="idx"
          :label="tab.label"
        />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel
          v-for="(tab, idx) in field.tabs"
          :key="idx"
          :name="idx"
        >
          <template v-for="childField in tab.fields" :key="childField.id">
            <render-field
              :field="childField"
              :model-value="(modelValue || {})[childField.key]"
              :all-values="allValues"
              :readonly="readonly"
              @update:model-value="updateNestedField(childField.key, $event)"
            />
          </template>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Calculated (readonly display) -->
    <q-input
      v-else-if="field.type === 'calculated'"
      :model-value="calculatedValue"
      :label="fieldLabel"
      readonly
      outlined
      dense
      bg-color="grey-2"
    >
      <template v-slot:prepend>
        <q-icon name="functions" />
      </template>
    </q-input>

    <!-- Default: campo no soportado -->
    <div v-else class="text-grey q-pa-sm">
      Campo no soportado: {{ field.type }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: null,
  },
  allValues: {
    type: Object,
    default: () => ({}),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

// State para tabs
const activeTab = ref(0);

// Funciones para el párrafo/texto informativo
const getParagraphClass = (style) => {
  const classes = {
    'normal': 'bg-grey-2',
    'info': 'bg-blue-1',
    'warning': 'bg-amber-1',
    'success': 'bg-green-1',
    'error': 'bg-red-1',
  };
  return classes[style] || classes.normal;
};

const getParagraphIcon = (style) => {
  const icons = {
    'normal': 'article',
    'info': 'info',
    'warning': 'warning',
    'success': 'check_circle',
    'error': 'error',
  };
  return icons[style] || icons.normal;
};

// Computed
const fieldLabel = computed(() => {
  return props.field.required ? `${props.field.label} *` : props.field.label;
});

const shouldShow = computed(() => {
  if (!props.field.conditional?.field) return true;
  
  const { field, operator, value } = props.field.conditional;
  const fieldValue = props.allValues[field];
  
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'contains':
      return String(fieldValue).includes(value);
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    case 'less_than':
      return Number(fieldValue) < Number(value);
    case 'is_empty':
      return !fieldValue || fieldValue === '';
    case 'is_not_empty':
      return fieldValue && fieldValue !== '';
    default:
      return true;
  }
});

const calculatedValue = computed(() => {
  if (!props.field.formula) return '';
  
  let formula = props.field.formula;
  
  // Reemplazar {campo} por valores
  const matches = formula.match(/\{(\w+)\}/g);
  if (matches) {
    matches.forEach(match => {
      const key = match.slice(1, -1);
      const value = props.allValues[key] || 0;
      formula = formula.replace(match, value);
    });
  }
  
  try {
    // Evaluar fórmula de forma segura
    return Function(`'use strict'; return (${formula})`)();
  } catch (e) {
    return 'Error en fórmula';
  }
});

const validationRules = computed(() => {
  const rules = [];
  
  if (props.field.required) {
    rules.push(val => !!val || 'Este campo es requerido');
  }
  
  if (props.field.validation?.maxLength) {
    rules.push(val => !val || val.length <= props.field.validation.maxLength || 
      `Máximo ${props.field.validation.maxLength} caracteres`);
  }
  
  if (props.field.validation?.min !== undefined) {
    rules.push(val => val === null || val === '' || Number(val) >= props.field.validation.min || 
      `El valor mínimo es ${props.field.validation.min}`);
  }
  
  if (props.field.validation?.max !== undefined) {
    rules.push(val => val === null || val === '' || Number(val) <= props.field.validation.max || 
      `El valor máximo es ${props.field.validation.max}`);
  }
  
  return rules;
});

const emailRules = computed(() => {
  const rules = [...validationRules.value];
  rules.push(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email inválido');
  return rules;
});

const canAddRepeaterItem = computed(() => {
  const maxItems = props.field.props?.maxItems;
  const currentLength = (props.modelValue || []).length;
  return !maxItems || currentLength < maxItems;
});

// Métodos
const updateNestedField = (key, value) => {
  emit('update:modelValue', {
    ...(props.modelValue || {}),
    [key]: value,
  });
};

const addRepeaterItem = () => {
  const currentItems = props.modelValue || [];
  emit('update:modelValue', [...currentItems, {}]);
};

const removeRepeaterItem = (idx) => {
  const currentItems = [...(props.modelValue || [])];
  currentItems.splice(idx, 1);
  emit('update:modelValue', currentItems);
};

const updateRepeaterItem = (idx, key, value) => {
  const currentItems = [...(props.modelValue || [])];
  currentItems[idx] = {
    ...currentItems[idx],
    [key]: value,
  };
  emit('update:modelValue', currentItems);
};

// Métodos para Row/Columnas
// Los valores de las columnas se almacenan directamente en el objeto padre
// ya que cada campo tiene un key único
const getRowFieldValue = (colIdx, fieldKey) => {
  // Los valores se almacenan flat, no por columna
  return props.modelValue?.[fieldKey];
};

const updateRowField = (colIdx, fieldKey, value) => {
  // Actualizar el valor flat
  emit('update:modelValue', {
    ...(props.modelValue || {}),
    [fieldKey]: value,
  });
};
</script>

<style scoped>
.render-field.is-hidden {
  display: none;
}

.repeater-item {
  border: 1px solid #e0e0e0;
}

.row-layout {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e8e8e8;
}
</style>
