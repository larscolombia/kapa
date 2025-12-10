<template>
  <div class="field-preview">
    <!-- Texto -->
    <q-input
      v-if="field.type === 'text'"
      :label="field.placeholder || 'Texto...'"
      outlined
      dense
      readonly
    />

    <!-- Textarea -->
    <q-input
      v-else-if="field.type === 'textarea'"
      :label="field.placeholder || 'Texto largo...'"
      outlined
      dense
      type="textarea"
      rows="2"
      readonly
    />

    <!-- Número -->
    <q-input
      v-else-if="field.type === 'number'"
      :label="field.placeholder || '0'"
      outlined
      dense
      type="number"
      readonly
    />

    <!-- Email -->
    <q-input
      v-else-if="field.type === 'email'"
      :label="field.placeholder || 'email@ejemplo.com'"
      outlined
      dense
      readonly
    >
      <template v-slot:prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <!-- Fecha -->
    <q-input
      v-else-if="field.type === 'date'"
      label="dd/mm/yyyy"
      outlined
      dense
      readonly
    >
      <template v-slot:append>
        <q-icon name="event" />
      </template>
    </q-input>

    <!-- Hora -->
    <q-input
      v-else-if="field.type === 'time'"
      label="--:--"
      outlined
      dense
      readonly
    >
      <template v-slot:append>
        <q-icon name="schedule" />
      </template>
    </q-input>

    <!-- Datetime -->
    <q-input
      v-else-if="field.type === 'datetime'"
      label="dd/mm/yyyy --:--"
      outlined
      dense
      readonly
    >
      <template v-slot:append>
        <q-icon name="event_available" />
      </template>
    </q-input>

    <!-- Select -->
    <q-select
      v-else-if="field.type === 'select'"
      :label="field.placeholder || 'Seleccionar...'"
      :options="field.options || []"
      outlined
      dense
      readonly
    />

    <!-- Radio -->
    <div v-else-if="field.type === 'radio'" class="q-gutter-sm">
      <q-radio
        v-for="opt in (field.options || []).slice(0, 3)"
        :key="opt.value"
        :val="opt.value"
        :label="opt.label"
        disable
      />
    </div>

    <!-- Checkbox simple -->
    <q-checkbox
      v-else-if="field.type === 'checkbox'"
      :label="field.label"
      disable
    />

    <!-- Checkbox group -->
    <div v-else-if="field.type === 'checkbox_group'" class="q-gutter-sm">
      <q-checkbox
        v-for="opt in (field.options || []).slice(0, 3)"
        :key="opt.value"
        :label="opt.label"
        disable
      />
    </div>

    <!-- Toggle -->
    <q-toggle
      v-else-if="field.type === 'toggle'"
      :label="field.label"
      disable
    />

    <!-- Rating -->
    <q-rating
      v-else-if="field.type === 'rating'"
      :max="field.props?.max || 5"
      size="sm"
      color="amber"
      readonly
    />

    <!-- Archivo -->
    <q-file
      v-else-if="field.type === 'file'"
      :label="field.placeholder || 'Seleccionar archivo'"
      outlined
      dense
      readonly
    >
      <template v-slot:prepend>
        <q-icon name="attach_file" />
      </template>
    </q-file>

    <!-- Imagen -->
    <div v-else-if="field.type === 'image'" class="image-upload-preview">
      <q-icon name="add_photo_alternate" size="32px" color="grey" />
      <span class="text-grey text-caption">Click para subir imagen</span>
    </div>

    <!-- Firma -->
    <div v-else-if="field.type === 'signature'" class="signature-preview">
      <q-icon name="draw" size="24px" color="grey" />
      <span class="text-grey text-caption">Área de firma</span>
    </div>

    <!-- Ubicación -->
    <q-input
      v-else-if="field.type === 'location'"
      label="Obtener ubicación GPS"
      outlined
      dense
      readonly
    >
      <template v-slot:append>
        <q-icon name="my_location" />
      </template>
    </q-input>

    <!-- Calculado -->
    <div v-else-if="field.type === 'calculated'" class="calculated-preview">
      <q-icon name="functions" size="16px" class="q-mr-xs" />
      <span class="text-grey-7">Campo calculado</span>
    </div>

    <!-- Group -->
    <div v-else-if="field.type === 'group'" class="group-preview">
      <div class="text-caption text-grey">Contenedor de grupo</div>
    </div>

    <!-- Tabs -->
    <div v-else-if="field.type === 'tabs'" class="tabs-preview">
      <q-tabs
        dense
        narrow-indicator
        align="left"
        class="text-grey"
      >
        <q-tab
          v-for="(tab, idx) in (field.tabs || [])"
          :key="idx"
          :name="idx"
          :label="tab.label"
        />
      </q-tabs>
    </div>

    <!-- Repeater -->
    <div v-else-if="field.type === 'repeater'" class="repeater-preview">
      <div class="text-caption text-grey">
        <q-icon name="repeat" size="xs" class="q-mr-xs" />
        Grupo repetible
      </div>
    </div>

    <!-- Conditional -->
    <div v-else-if="field.type === 'conditional'" class="conditional-preview">
      <div class="text-caption text-grey">
        <q-icon name="call_split" size="xs" class="q-mr-xs" />
        Mostrar si condición
      </div>
    </div>

    <!-- Divider -->
    <q-separator v-else-if="field.type === 'divider'" />

    <!-- Header -->
    <component
      v-else-if="field.type === 'header'"
      :is="field.props?.size || 'h3'"
      class="q-my-none"
    >
      {{ field.props?.text || 'Título' }}
    </component>

    <!-- Paragraph / Texto informativo -->
    <q-banner
      v-else-if="field.type === 'paragraph'"
      :class="getParagraphClass(field.props?.style)"
      dense
      rounded
    >
      <template v-slot:avatar>
        <q-icon :name="getParagraphIcon(field.props?.style)" :color="field.props?.color || 'grey-8'" />
      </template>
      <span :class="`text-${field.props?.color || 'grey-8'}`">
        {{ field.props?.text || 'Texto informativo...' }}
      </span>
    </q-banner>

    <!-- Row / Columnas (preview simplificado) -->
    <div v-else-if="field.type === 'row'" class="row-preview">
      <div class="text-caption text-grey-7 q-mb-xs">
        <q-icon name="view_column" size="xs" class="q-mr-xs" />
        {{ field.columns?.length || 2 }} columnas
      </div>
      <div class="row q-col-gutter-xs">
        <div 
          v-for="(col, idx) in field.columns" 
          :key="idx"
          :class="`col-${col.colSpan || 6}`"
        >
          <div class="column-preview-item">
            <span class="text-caption text-grey-6">{{ col.fields?.length || 0 }} campos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Default -->
    <div v-else class="text-grey text-caption">
      Campo: {{ field.type }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  field: {
    type: Object,
    required: true,
  },
});

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
</script>

<style scoped lang="scss">
.field-preview {
  pointer-events: none;
}

.image-upload-preview,
.signature-preview {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.calculated-preview {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.group-preview,
.row-preview,
.repeater-preview,
.conditional-preview {
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
  border: 1px dashed #ccc;
}

.column-preview-item {
  background: #e8e8e8;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
