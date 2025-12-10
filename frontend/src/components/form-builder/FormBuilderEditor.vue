<template>
  <div class="form-builder-editor">
    <!-- Indicador de autoguardado -->
    <div v-if="lastAutoSave" class="text-caption text-grey-6 q-mb-sm">
      <q-icon name="cloud_done" size="xs" class="q-mr-xs" />
      Guardado localmente: {{ formatAutoSaveTime(lastAutoSave) }}
      <q-btn 
        flat 
        dense 
        size="xs" 
        color="primary" 
        label="Guardar ahora" 
        class="q-ml-sm"
        @click="saveLocalDraft"
      />
    </div>

    <!-- Toolbar -->
    <div class="row q-mb-md items-center">
      <div class="col">
        <q-input
          v-model="formData.name"
          label="Nombre del formulario *"
          outlined
          dense
          :rules="[val => !!val || 'El nombre es requerido']"
        />
      </div>
      <div class="col-auto q-ml-md">
        <q-toggle
          v-model="formData.is_active"
          label="Activo"
          color="positive"
        />
        <q-toggle
          v-model="formData.is_draft"
          label="Borrador"
          color="warning"
          class="q-ml-md"
        />
      </div>
    </div>

    <q-input
      v-model="formData.description"
      label="Descripción"
      outlined
      dense
      type="textarea"
      rows="2"
      class="q-mb-md"
    />

    <!-- Editor principal -->
    <div class="row q-col-gutter-md editor-main-row">
      <!-- Panel de componentes -->
      <div class="col-12 col-md-3 sticky-panel">
        <q-card flat bordered class="sticky-card">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle2">
              <q-icon name="widgets" class="q-mr-sm" />
              Componentes
            </div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="componentSearch"
              dense
              outlined
              placeholder="Buscar..."
              clearable
              class="q-mb-sm"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" />
              </template>
            </q-input>

            <q-list dense>
              <!-- Básicos -->
              <q-item-label header class="text-weight-bold">
                🔤 Básicos
              </q-item-label>
              <draggable
                :list="filteredBasicFields"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneField"
                item-key="type"
              >
                <template #item="{ element }">
                  <q-item
                    clickable
                    dense
                    class="component-item"
                    @click="addFieldToCanvas(element)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="element.icon" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ element.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round dense size="xs" icon="help_outline" color="grey">
                        <q-tooltip class="bg-blue-grey-9 text-body2" max-width="300px" anchor="center right" self="center left">
                          {{ element.help }}
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </template>
              </draggable>

              <!-- Selección -->
              <q-item-label header class="text-weight-bold q-mt-sm">
                📋 Selección
              </q-item-label>
              <draggable
                :list="filteredSelectionFields"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneField"
                item-key="type"
              >
                <template #item="{ element }">
                  <q-item
                    clickable
                    dense
                    class="component-item"
                    @click="addFieldToCanvas(element)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="element.icon" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ element.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round dense size="xs" icon="help_outline" color="grey">
                        <q-tooltip class="bg-blue-grey-9 text-body2" max-width="300px" anchor="center right" self="center left">
                          {{ element.help }}
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </template>
              </draggable>

              <!-- Estructura -->
              <q-item-label header class="text-weight-bold q-mt-sm">
                🏗️ Estructura
              </q-item-label>
              <draggable
                :list="filteredStructureFields"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneField"
                item-key="type"
              >
                <template #item="{ element }">
                  <q-item
                    clickable
                    dense
                    class="component-item"
                    @click="addFieldToCanvas(element)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="element.icon" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ element.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round dense size="xs" icon="help_outline" color="grey">
                        <q-tooltip class="bg-blue-grey-9 text-body2" max-width="300px" anchor="center right" self="center left">
                          {{ element.help }}
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </template>
              </draggable>

              <!-- Especiales -->
              <q-item-label header class="text-weight-bold q-mt-sm">
                🎯 Especiales
              </q-item-label>
              <draggable
                :list="filteredSpecialFields"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneField"
                item-key="type"
              >
                <template #item="{ element }">
                  <q-item
                    clickable
                    dense
                    class="component-item"
                    @click="addFieldToCanvas(element)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="element.icon" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ element.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round dense size="xs" icon="help_outline" color="grey">
                        <q-tooltip class="bg-blue-grey-9 text-body2" max-width="300px" anchor="center right" self="center left">
                          {{ element.help }}
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </template>
              </draggable>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Canvas del formulario -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="canvas-card">
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="col text-subtitle2">
                <q-icon name="view_quilt" class="q-mr-sm" />
                Vista previa del formulario
              </div>
              <div class="col-auto">
                <q-badge :label="`${formData.schema.fields.length} campos`" />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="canvas-area">
            <draggable
              v-model="formData.schema.fields"
              group="fields"
              item-key="id"
              handle=".drag-handle"
              animation="200"
              ghost-class="ghost"
              class="canvas-dropzone"
              :class="{ 'empty-canvas': formData.schema.fields.length === 0 }"
            >
              <template #item="{ element, index }">
                <div
                  class="field-item"
                  :class="{ 
                    selected: selectedField?.id === element.id,
                    'row-container': element.type === 'row'
                  }"
                  @click="selectField(element)"
                >
                  <div class="field-header row items-center">
                    <q-icon name="drag_indicator" class="drag-handle cursor-move q-mr-sm text-grey" />
                    <q-icon :name="getFieldIcon(element.type)" class="q-mr-sm" size="sm" />
                    <span class="field-label">{{ element.label || element.type }}</span>
                    <q-badge v-if="element.required" color="red" label="*" class="q-ml-sm" />
                    <!-- Selector de columnas para filas -->
                    <template v-if="element.type === 'row'">
                      <q-select
                        v-model="element.props.columns"
                        :options="columnOptions"
                        dense
                        outlined
                        class="q-ml-md"
                        style="width: 120px"
                        emit-value
                        map-options
                        @click.stop
                        @update:model-value="updateRowColumns(element)"
                      />
                    </template>
                    <q-space />
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      size="sm"
                      color="negative"
                      @click.stop="removeField(index)"
                    />
                  </div>
                  
                  <!-- Preview del campo -->
                  <div v-if="element.type !== 'row'" class="field-preview q-mt-sm">
                    <field-preview :field="element" />
                  </div>

                  <!-- Contenedor de columnas para tipo ROW -->
                  <div v-if="element.type === 'row'" class="row-columns q-mt-sm">
                    <div class="row q-col-gutter-sm">
                      <div 
                        v-for="(col, colIdx) in (element.columns || [{fields:[]}, {fields:[]}])" 
                        :key="colIdx"
                        :class="getColumnClass(element.props?.columns || 2, colIdx)"
                      >
                        <div class="column-dropzone">
                          <div class="column-header text-caption text-grey q-mb-xs">
                            Columna {{ colIdx + 1 }}
                          </div>
                          <draggable
                            v-model="col.fields"
                            group="fields"
                            item-key="id"
                            handle=".drag-handle"
                            animation="200"
                            class="column-fields"
                          >
                            <template #item="{ element: colField, index: colFieldIdx }">
                              <div
                                class="field-item nested column-field"
                                :class="{ selected: selectedField?.id === colField.id }"
                                @click.stop="selectField(colField)"
                              >
                                <div class="field-header row items-center">
                                  <q-icon name="drag_indicator" class="drag-handle cursor-move q-mr-xs text-grey" size="xs" />
                                  <q-icon :name="getFieldIcon(colField.type)" class="q-mr-xs" size="xs" />
                                  <span class="field-label text-caption">{{ colField.label || colField.type }}</span>
                                  <q-space />
                                  <q-btn
                                    flat
                                    round
                                    dense
                                    icon="close"
                                    size="xs"
                                    color="negative"
                                    @click.stop="removeColumnField(element, colIdx, colFieldIdx)"
                                  />
                                </div>
                              </div>
                            </template>
                          </draggable>
                          <div v-if="!col.fields || col.fields.length === 0" class="text-center text-grey-5 q-pa-sm text-caption" style="min-height: 60px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; border-radius: 4px;">
                            Arrastra aquí
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Campos anidados (para group, repeater, etc.) -->
                  <div v-if="element.fields && element.type !== 'row'" class="nested-fields q-mt-sm q-pl-md">
                    <draggable
                      v-model="element.fields"
                      group="fields"
                      item-key="id"
                      handle=".drag-handle"
                      animation="200"
                      class="nested-dropzone"
                    >
                      <template #item="{ element: nestedEl, index: nestedIdx }">
                        <div
                          class="field-item nested"
                          :class="{ selected: selectedField?.id === nestedEl.id }"
                          @click.stop="selectField(nestedEl)"
                        >
                          <div class="field-header row items-center">
                            <q-icon name="drag_indicator" class="drag-handle cursor-move q-mr-sm text-grey" />
                            <q-icon :name="getFieldIcon(nestedEl.type)" class="q-mr-xs" size="xs" />
                            <span class="field-label text-caption">{{ nestedEl.label || nestedEl.type }}</span>
                            <q-space />
                            <q-btn
                              flat
                              round
                              dense
                              icon="delete"
                              size="xs"
                              color="negative"
                              @click.stop="removeNestedField(element, nestedIdx)"
                            />
                          </div>
                        </div>
                      </template>
                    </draggable>
                    <div class="text-center text-grey q-pa-sm text-caption">
                      Arrastra campos aquí
                    </div>
                  </div>
                </div>
              </template>
            </draggable>

            <!-- Empty state -->
            <div v-if="formData.schema.fields.length === 0" class="empty-state text-center q-pa-xl">
              <q-icon name="add_box" size="64px" color="grey-4" />
              <p class="text-grey-6 q-mt-md">
                Arrastra componentes aquí o haz clic en ellos para agregarlos
              </p>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Panel de propiedades -->
      <div class="col-12 col-md-3 sticky-panel">
        <q-card flat bordered class="sticky-card">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle2">
              <q-icon name="tune" class="q-mr-sm" />
              Propiedades
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="selectedField">
              <field-properties
                v-model="selectedField"
                @update:model-value="onFieldUpdate"
              />
            </div>
            <div v-else class="text-center text-grey q-pa-md">
              <q-icon name="touch_app" size="48px" color="grey-4" />
              <p class="q-mt-sm">Selecciona un campo para editar sus propiedades</p>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Acciones -->
    <div class="row justify-end q-mt-md q-gutter-sm">
      <q-btn
        flat
        label="Cancelar"
        @click="$emit('cancel')"
      />
      <q-btn
        outline
        color="info"
        label="Vista Previa"
        icon="visibility"
        @click="showPreview = true"
      />
      <q-btn
        color="primary"
        label="Guardar"
        icon="save"
        :loading="saving"
        @click="save"
      />
    </div>

    <!-- Dialog de vista previa -->
    <q-dialog v-model="showPreview" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista Previa: {{ formData.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <form-renderer
            :schema="formData.schema"
            :readonly="false"
            v-model="previewData"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';
import { v4 as uuidv4 } from 'uuid';
import formBuilderService from 'src/services/formBuilderService';
import FieldPreview from './FieldPreview.vue';
import FieldProperties from './FieldProperties.vue';
import FormRenderer from './FormRenderer.vue';

const props = defineProps({
  template: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['save', 'cancel']);

const $q = useQuasar();

// State
const saving = ref(false);
const selectedField = ref(null);
const componentSearch = ref('');
const showPreview = ref(false);
const previewData = ref({});
const lastAutoSave = ref(null);
const hasUnsavedChanges = ref(false);
const autoSaveInterval = ref(null);

// Clave para localStorage basada en el template ID o 'new'
const getStorageKey = () => {
  return `form_builder_draft_${props.template?.form_template_id || 'new'}`;
};

// Form data
const formData = reactive({
  name: '',
  description: '',
  is_active: true,
  is_draft: true,
  schema: {
    fields: [],
    version: '1.0',
  },
  settings: {},
});

// Definición de tipos de campos con ayuda para usuarios
const basicFields = [
  { type: 'text', label: 'Texto', icon: 'text_fields', help: 'Campo para escribir texto corto como nombres, títulos, etc. Ejemplo: "Nombre del trabajador"' },
  { type: 'textarea', label: 'Texto largo', icon: 'notes', help: 'Campo para escribir textos largos con varias líneas. Ejemplo: "Descripción del hallazgo" o "Observaciones"' },
  { type: 'number', label: 'Número', icon: 'pin', help: 'Campo para ingresar solo números. Ejemplo: "Cantidad de extintores" o "Número de personas"' },
  { type: 'email', label: 'Email', icon: 'email', help: 'Campo para correos electrónicos. Valida automáticamente que tenga formato correcto (ejemplo@dominio.com)' },
  { type: 'date', label: 'Fecha', icon: 'event', help: 'Muestra un calendario para seleccionar una fecha. Ejemplo: "Fecha de inspección"' },
  { type: 'time', label: 'Hora', icon: 'schedule', help: 'Permite seleccionar una hora. Ejemplo: "Hora de inicio"' },
  { type: 'datetime', label: 'Fecha y Hora', icon: 'event_available', help: 'Combina selector de fecha y hora en uno solo. Ejemplo: "Fecha y hora del incidente"' },
];

const selectionFields = [
  { type: 'select', label: 'Lista desplegable', icon: 'arrow_drop_down_circle', help: 'Menú desplegable donde el usuario elige UNA opción de una lista. Ejemplo: "Tipo de riesgo" con opciones Alto, Medio, Bajo' },
  { type: 'radio', label: 'Opción única', icon: 'radio_button_checked', help: 'Muestra todas las opciones visibles y el usuario elige UNA. Útil cuando hay pocas opciones (2-5). Ejemplo: "¿Cumple? Sí / No"' },
  { type: 'checkbox', label: 'Casilla verificación', icon: 'check_box', help: 'Una casilla que se marca o desmarca. Ejemplo: "¿El área está señalizada?" ☑️' },
  { type: 'checkbox_group', label: 'Múltiples opciones', icon: 'checklist', help: 'Lista donde el usuario puede marcar VARIAS opciones. Ejemplo: "EPP observados" con opciones: Casco, Guantes, Gafas, etc.' },
  { type: 'toggle', label: 'Interruptor', icon: 'toggle_on', help: 'Botón de encendido/apagado. Igual que la casilla pero más visual. Ejemplo: "¿Activo?"' },
  { type: 'rating', label: 'Calificación', icon: 'star', help: 'Estrellas para calificar del 1 al 5 (o más). Ejemplo: "Calificación del área"' },
];

const structureFields = [
  { type: 'group', label: 'Grupo', icon: 'folder', help: 'Caja para agrupar varios campos relacionados con un título. Ejemplo: Agrupar "Datos del inspector" (nombre, cargo, cédula)' },
  { type: 'row', label: 'Columnas', icon: 'view_column', help: '📊 Divide el formulario en columnas para poner campos lado a lado. Puedes elegir 2, 3 o 4 columnas. Ideal para campos cortos como Fecha y Hora, o Nombre y Apellido.' },
  { type: 'tabs', label: 'Pestañas', icon: 'tab', help: 'Organiza campos en pestañas (como las de un navegador). Útil para formularios muy largos' },
  { type: 'repeater', label: 'Repetidor', icon: 'repeat', help: '⭐ IMPORTANTE: Permite agregar MÚLTIPLES registros del mismo tipo. Ejemplo: "Agregar hallazgo" donde cada hallazgo tiene descripción, foto, área. El usuario puede agregar tantos como necesite con un botón "+"' },
  { type: 'conditional', label: 'Condicional', icon: 'call_split', help: 'Muestra u oculta campos según una respuesta anterior. Ejemplo: Si responde "Sí" a "¿Hubo accidente?", aparecen campos adicionales' },
  { type: 'divider', label: 'Divisor', icon: 'horizontal_rule', help: 'Línea horizontal para separar visualmente secciones del formulario' },
  { type: 'header', label: 'Encabezado', icon: 'title', help: 'Título grande para nombrar secciones. Ejemplo: "INFORMACIÓN GENERAL" o "HALLAZGOS"' },
  { type: 'paragraph', label: 'Texto informativo', icon: 'article', help: '📝 Texto de ayuda o instrucciones para el usuario. Ejemplo: "Por favor complete todos los campos marcados con asterisco (*). Las fotos son opcionales pero ayudan a documentar mejor el hallazgo."' },
];

// Opciones de columnas para el componente Row
const columnOptions = [
  { label: '2 columnas', value: 2 },
  { label: '3 columnas', value: 3 },
  { label: '4 columnas', value: 4 },
  { label: '1-2 (33%-66%)', value: '1-2' },
  { label: '2-1 (66%-33%)', value: '2-1' },
];

const specialFields = [
  { type: 'file', label: 'Archivo', icon: 'attach_file', help: 'Permite subir documentos (PDF, Word, Excel, etc.). Ejemplo: "Adjuntar informe"' },
  { type: 'image', label: 'Imagen', icon: 'image', help: 'Permite subir o tomar fotos. Ejemplo: "Foto de evidencia"' },
  { type: 'signature', label: 'Firma', icon: 'draw', help: 'Campo para firmar con el dedo o mouse. Ejemplo: "Firma del inspector"' },
  { type: 'location', label: 'Ubicación', icon: 'location_on', help: 'Captura la ubicación GPS actual. Ejemplo: "Ubicación del hallazgo"' },
  { type: 'calculated', label: 'Calculado', icon: 'functions', help: 'Campo que calcula automáticamente basado en otros campos. Ejemplo: Si tienes "cantidad" y "precio", puede calcular el "total"' },
];

// Filtrado de campos
const filterFields = (fields) => {
  if (!componentSearch.value) return fields;
  const search = componentSearch.value.toLowerCase();
  return fields.filter(f => f.label.toLowerCase().includes(search));
};

const filteredBasicFields = computed(() => filterFields(basicFields));
const filteredSelectionFields = computed(() => filterFields(selectionFields));
const filteredStructureFields = computed(() => filterFields(structureFields));
const filteredSpecialFields = computed(() => filterFields(specialFields));

// Métodos
const generateId = () => uuidv4().split('-')[0];

const cloneField = (fieldDef) => {
  const id = generateId();
  const baseField = {
    id,
    type: fieldDef.type,
    key: `${fieldDef.type}_${id}`,
    label: fieldDef.label,
    required: false,
    placeholder: '',
    validation: {},
    props: {},
  };

  // Propiedades específicas por tipo
  switch (fieldDef.type) {
    case 'select':
    case 'radio':
    case 'checkbox_group':
      baseField.options = [
        { value: 'opcion1', label: 'Opción 1' },
        { value: 'opcion2', label: 'Opción 2' },
      ];
      break;
    case 'group':
    case 'repeater':
    case 'conditional':
      baseField.fields = [];
      break;
    case 'row':
      baseField.props = { columns: 2 };
      baseField.columns = [
        { fields: [] },
        { fields: [] },
      ];
      break;
    case 'tabs':
      baseField.tabs = [
        { label: 'Tab 1', fields: [] },
        { label: 'Tab 2', fields: [] },
      ];
      break;
    case 'rating':
      baseField.props = { max: 5, allowHalf: false };
      break;
    case 'number':
      baseField.validation = { min: null, max: null, step: 1 };
      break;
    case 'header':
      baseField.props = { size: 'h3', text: 'Título de sección' };
      break;
    case 'paragraph':
      baseField.props = { 
        text: 'Escriba aquí las instrucciones o información para el usuario...', 
        style: 'normal',
        color: 'grey-8'
      };
      break;
  }

  return baseField;
};

const addFieldToCanvas = (fieldDef) => {
  const newField = cloneField(fieldDef);
  formData.schema.fields.push(newField);
  selectField(newField);
};

const selectField = (field) => {
  selectedField.value = field;
};

const removeField = (index) => {
  formData.schema.fields.splice(index, 1);
  if (selectedField.value && !formData.schema.fields.find(f => f.id === selectedField.value.id)) {
    selectedField.value = null;
  }
};

const removeNestedField = (parentField, index) => {
  parentField.fields.splice(index, 1);
};

// Eliminar campo de una columna
const removeColumnField = (rowField, colIdx, fieldIdx) => {
  if (rowField.columns && rowField.columns[colIdx]) {
    rowField.columns[colIdx].fields.splice(fieldIdx, 1);
  }
};

// Obtener clase de columna según configuración
const getColumnClass = (columns, index) => {
  if (columns === 2) return 'col-6';
  if (columns === 3) return 'col-4';
  if (columns === 4) return 'col-3';
  if (columns === '1-2') return index === 0 ? 'col-4' : 'col-8';
  if (columns === '2-1') return index === 0 ? 'col-8' : 'col-4';
  return 'col-6';
};

// Actualizar número de columnas
const updateRowColumns = (rowField) => {
  const numCols = typeof rowField.props.columns === 'number' 
    ? rowField.props.columns 
    : (rowField.props.columns === '1-2' || rowField.props.columns === '2-1' ? 2 : 2);
  
  // Asegurar que existan las columnas necesarias
  if (!rowField.columns) {
    rowField.columns = [];
  }
  
  // Agregar columnas si faltan
  while (rowField.columns.length < numCols) {
    rowField.columns.push({ fields: [] });
  }
  
  // Si se reduce el número de columnas, mover campos huérfanos a la última columna
  if (rowField.columns.length > numCols) {
    const orphanFields = [];
    for (let i = numCols; i < rowField.columns.length; i++) {
      if (rowField.columns[i].fields) {
        orphanFields.push(...rowField.columns[i].fields);
      }
    }
    rowField.columns = rowField.columns.slice(0, numCols);
    if (orphanFields.length > 0) {
      rowField.columns[numCols - 1].fields.push(...orphanFields);
    }
  }
};

const getFieldIcon = (type) => {
  const allFields = [...basicFields, ...selectionFields, ...structureFields, ...specialFields];
  return allFields.find(f => f.type === type)?.icon || 'help';
};

const onFieldUpdate = (updatedField) => {
  // Buscar el campo en el schema y actualizarlo
  const index = formData.schema.fields.findIndex(f => f.id === updatedField.id);
  if (index !== -1) {
    // Actualizar el campo en el schema manteniendo la referencia del array
    Object.assign(formData.schema.fields[index], updatedField);
    // Actualizar también el selectedField
    selectedField.value = formData.schema.fields[index];
  } else {
    // Buscar en campos anidados (grupos, repetidores, etc.)
    updateNestedField(formData.schema.fields, updatedField);
  }
};

// Función recursiva para actualizar campos anidados
const updateNestedField = (fields, updatedField) => {
  for (const field of fields) {
    if (field.id === updatedField.id) {
      Object.assign(field, updatedField);
      return true;
    }
    // Buscar en campos anidados
    if (field.fields && field.fields.length > 0) {
      if (updateNestedField(field.fields, updatedField)) return true;
    }
    // Buscar en tabs
    if (field.tabs) {
      for (const tab of field.tabs) {
        if (tab.fields && updateNestedField(tab.fields, updatedField)) return true;
      }
    }
  }
  return false;
};

const save = async () => {
  if (!formData.name) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del formulario es requerido',
    });
    return;
  }

  saving.value = true;
  try {
    let result;
    if (props.template?.form_template_id) {
      result = await formBuilderService.updateTemplate(
        props.template.form_template_id,
        formData
      );
    } else {
      result = await formBuilderService.createTemplate(formData);
    }
    
    // Limpiar borrador local después de guardar exitosamente
    clearLocalDraft();
    hasUnsavedChanges.value = false;
    
    $q.notify({
      type: 'positive',
      message: 'Formulario guardado exitosamente',
      icon: 'check_circle',
    });
    
    emit('save', result);
  } catch (error) {
    console.error('Error al guardar:', error);
    
    // Guardar borrador local cuando falla el servidor
    saveLocalDraft();
    
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    
    $q.notify({
      type: 'negative',
      message: isAuthError ? 'Sesión expirada o sin permisos' : 'Error al guardar en servidor',
      caption: isAuthError 
        ? 'Tu trabajo se guardó localmente. Inicia sesión nuevamente para guardar en el servidor.'
        : `${errorMessage}. Tu trabajo se guardó localmente.`,
      timeout: 10000,
      actions: isAuthError ? [
        { label: 'Ir a Login', color: 'white', handler: () => window.location.href = '/login' }
      ] : [],
    });
  } finally {
    saving.value = false;
  }
};

// ========================================
// AUTOGUARDADO LOCAL
// ========================================

// Guardar borrador en localStorage
const saveLocalDraft = () => {
  try {
    const draft = {
      formData: JSON.parse(JSON.stringify(formData)),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(draft));
    lastAutoSave.value = new Date();
    console.log('📝 Borrador guardado localmente:', lastAutoSave.value);
  } catch (e) {
    console.error('Error guardando borrador local:', e);
  }
};

// Cargar borrador de localStorage
const loadLocalDraft = () => {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const draft = JSON.parse(saved);
      return draft;
    }
  } catch (e) {
    console.error('Error cargando borrador local:', e);
  }
  return null;
};

// Limpiar borrador local
const clearLocalDraft = () => {
  try {
    localStorage.removeItem(getStorageKey());
    console.log('🗑️ Borrador local eliminado');
  } catch (e) {
    console.error('Error eliminando borrador local:', e);
  }
};

// Restaurar desde borrador local
const restoreFromDraft = (draft) => {
  if (draft?.formData) {
    Object.assign(formData, draft.formData);
    $q.notify({
      type: 'info',
      message: 'Borrador restaurado',
      caption: `Guardado el ${new Date(draft.savedAt).toLocaleString()}`,
      icon: 'restore',
    });
  }
};

// Iniciar autoguardado cada 30 segundos
const startAutoSave = () => {
  autoSaveInterval.value = setInterval(() => {
    if (hasUnsavedChanges.value && formData.schema.fields.length > 0) {
      saveLocalDraft();
      $q.notify({
        type: 'info',
        message: 'Autoguardado local',
        caption: 'Tu progreso se guardó localmente',
        icon: 'save',
        timeout: 2000,
        position: 'bottom-right',
      });
    }
  }, 30000); // 30 segundos
};

// Detener autoguardado
const stopAutoSave = () => {
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value);
    autoSaveInterval.value = null;
  }
};

// Formatear tiempo de autoguardado
const formatAutoSaveTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
  return date.toLocaleTimeString();
};

// Detectar cambios en el formulario
watch(formData, () => {
  hasUnsavedChanges.value = true;
}, { deep: true });

// Cargar datos si estamos editando
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    formData.name = newTemplate.name;
    formData.description = newTemplate.description;
    formData.is_active = newTemplate.is_active;
    formData.is_draft = newTemplate.is_draft;
    formData.schema = newTemplate.schema || { fields: [], version: '1.0' };
    formData.settings = newTemplate.settings || {};
  }
  
  // Verificar si hay borrador local más reciente
  setTimeout(() => {
    checkForLocalDraft();
  }, 500);
}, { immediate: true });

// Verificar si hay un borrador local
const checkForLocalDraft = () => {
  const draft = loadLocalDraft();
  if (draft) {
    const savedDate = new Date(draft.savedAt);
    const formattedDate = savedDate.toLocaleString();
    
    $q.dialog({
      title: '📝 Borrador encontrado',
      message: `Se encontró un borrador guardado localmente el ${formattedDate}. ¿Deseas restaurarlo?`,
      html: true,
      cancel: {
        label: 'Descartar',
        color: 'negative',
        flat: true,
      },
      ok: {
        label: 'Restaurar',
        color: 'primary',
      },
      persistent: true,
    }).onOk(() => {
      restoreFromDraft(draft);
    }).onCancel(() => {
      clearLocalDraft();
    });
  }
};

// Lifecycle hooks
onMounted(() => {
  startAutoSave();
  
  // Advertir antes de cerrar la página si hay cambios sin guardar
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  stopAutoSave();
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

const handleBeforeUnload = (e) => {
  if (hasUnsavedChanges.value && formData.schema.fields.length > 0) {
    saveLocalDraft(); // Guardar antes de salir
    e.preventDefault();
    e.returnValue = ''; // Chrome requiere esto
  }
};
</script>

<style scoped lang="scss">
.form-builder-editor {
  min-height: calc(100vh - 200px);
}

.editor-main-row {
  align-items: flex-start;
}

.sticky-panel {
  position: sticky;
  top: 80px;
  align-self: flex-start;
  max-height: calc(100vh - 100px);
  
  .sticky-card {
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
}

@media (max-width: 1023px) {
  .sticky-panel {
    position: relative;
    top: 0;
    max-height: none;
    
    .sticky-card {
      max-height: none;
    }
  }
}

.component-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 4px;
  background: white;
  cursor: grab;
  
  &:hover {
    background: #f5f5f5;
    border-color: $primary;
  }
}

.canvas-card {
  min-height: 500px;
}

.canvas-area {
  min-height: 400px;
  background: #fafafa;
  border-radius: 8px;
}

.canvas-dropzone {
  min-height: 300px;
  padding: 8px;
}

.empty-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-item {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $primary;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }
  
  &.nested {
    border-width: 1px;
    padding: 8px;
    background: #f9f9f9;
  }

  &.row-container {
    background: #f8f9fa;
    border-style: dashed;
  }

  &.column-field {
    margin-bottom: 4px;
    padding: 6px 8px;
    font-size: 12px;
  }
}

// Estilos para columnas
.row-columns {
  background: #fff;
  border-radius: 4px;
  padding: 8px;
}

.column-dropzone {
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 4px;
  padding: 8px;
  min-height: 80px;

  &:hover {
    border-color: $primary;
    background: #f0f7ff;
  }
}

.column-header {
  text-align: center;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.column-fields {
  min-height: 40px;
}

.field-header {
  .field-label {
    font-weight: 500;
  }
}

.nested-dropzone {
  min-height: 50px;
  background: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 8px;
}

.empty-state {
  color: #999;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.drag-handle {
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}
</style>
