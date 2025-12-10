<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h5 class="q-my-none">
          <q-icon name="description" class="q-mr-sm" />
          Gestión de Formularios
        </h5>
        <p class="text-grey-7 q-mb-none">
          Crea y administra formularios dinámicos para inspecciones
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Formulario"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              dense
              outlined
              placeholder="Buscar por nombre..."
              clearable
              @update:model-value="debouncedSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.is_active"
              dense
              outlined
              :options="statusOptions"
              emit-value
              map-options
              label="Estado"
              clearable
              @update:model-value="loadTemplates"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.maestro_id"
              dense
              outlined
              :options="classificationsOptions"
              option-value="maestro_id"
              option-label="valor"
              emit-value
              map-options
              label="Clasificación"
              clearable
              @update:model-value="loadTemplates"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de formularios -->
    <q-card flat bordered>
      <q-table
        :rows="templates"
        :columns="columns"
        row-key="form_template_id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        flat
      >
        <!-- Estado -->
        <template v-slot:body-cell-is_active="props">
          <q-td :props="props">
            <q-badge :color="props.row.is_active ? 'positive' : 'grey'" :label="props.row.is_active ? 'Activo' : 'Inactivo'" />
          </q-td>
        </template>

        <!-- Borrador -->
        <template v-slot:body-cell-is_draft="props">
          <q-td :props="props">
            <q-badge v-if="props.row.is_draft" color="warning" label="Borrador" />
            <span v-else class="text-grey">-</span>
          </q-td>
        </template>

        <!-- Clasificaciones -->
        <template v-slot:body-cell-classifications="props">
          <q-td :props="props">
            <div v-if="props.row.classifications?.length">
              <q-badge
                v-for="c in props.row.classifications.slice(0, 2)"
                :key="c.form_classification_id"
                color="info"
                class="q-mr-xs q-mb-xs"
              >
                {{ c.clasificacion?.valor || 'N/A' }}
              </q-badge>
              <q-badge
                v-if="props.row.classifications.length > 2"
                color="grey"
              >
                +{{ props.row.classifications.length - 2 }}
              </q-badge>
            </div>
            <span v-else class="text-grey">Sin asignar</span>
          </q-td>
        </template>

        <!-- Fecha de creación -->
        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="editTemplate(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="content_copy"
              color="secondary"
              @click="duplicateTemplate(props.row)"
            >
              <q-tooltip>Duplicar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="link"
              color="info"
              @click="openAssignDialog(props.row)"
            >
              <q-tooltip>Asignar Clasificaciones</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Sin resultados -->
        <template v-slot:no-data>
          <div class="full-width row flex-center text-grey q-pa-xl">
            <q-icon name="inbox" size="48px" class="q-mr-md" />
            <span>No hay formularios. Crea uno nuevo para comenzar.</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Crear/Editar -->
    <q-dialog v-model="createDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingTemplate ? 'Editar Formulario' : 'Nuevo Formulario' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <form-builder-editor
            v-if="createDialog"
            :template="editingTemplate"
            @save="onSaveTemplate"
            @cancel="createDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Asignar Clasificaciones -->
    <q-dialog v-model="assignDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Asignar Clasificaciones</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-grey-7">
            Selecciona las clasificaciones de inspección que usarán este formulario:
          </p>
          <q-select
            v-model="selectedClassifications"
            :options="classificationsOptions"
            multiple
            use-chips
            stack-label
            option-value="maestro_id"
            option-label="valor"
            emit-value
            map-options
            label="Clasificaciones"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Guardar"
            :loading="savingClassifications"
            @click="saveClassifications"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { debounce } from 'quasar';
import formBuilderService from 'src/services/formBuilderService';
import FormBuilderEditor from 'src/components/form-builder/FormBuilderEditor.vue';

const $q = useQuasar();

// State
const loading = ref(false);
const templates = ref([]);
const classifications = ref([]);
const createDialog = ref(false);
const assignDialog = ref(false);
const editingTemplate = ref(null);
const assigningTemplate = ref(null);
const selectedClassifications = ref([]);
const savingClassifications = ref(false);

// Filtros
const filters = reactive({
  search: '',
  is_active: null,
  is_draft: null,
  maestro_id: null,
});

// Paginación
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Columnas de la tabla
const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'version', label: 'Versión', field: 'version', align: 'center' },
  { name: 'is_active', label: 'Estado', field: 'is_active', align: 'center' },
  { name: 'is_draft', label: 'Borrador', field: 'is_draft', align: 'center' },
  { name: 'classifications', label: 'Clasificaciones', align: 'left' },
  { name: 'created_at', label: 'Creado', field: 'created_at', align: 'center', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' },
];

// Opciones de estado
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false },
];

// Computed
const classificationsOptions = ref([]);

// Métodos
const loadTemplates = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...filters,
    };
    
    // Eliminar valores null/undefined
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    const result = await formBuilderService.getTemplates(params);
    templates.value = result.data;
    pagination.value.rowsNumber = result.total;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar formularios',
      caption: error.message,
    });
  } finally {
    loading.value = false;
  }
};

const loadClassifications = async () => {
  try {
    classificationsOptions.value = await formBuilderService.getAvailableClassifications();
  } catch (error) {
    console.error('Error loading classifications:', error);
  }
};

const debouncedSearch = debounce(loadTemplates, 300);

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadTemplates();
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const openCreateDialog = () => {
  editingTemplate.value = null;
  createDialog.value = true;
};

const editTemplate = (template) => {
  editingTemplate.value = template;
  createDialog.value = true;
};

const onSaveTemplate = async (template) => {
  createDialog.value = false;
  await loadTemplates();
  $q.notify({
    type: 'positive',
    message: editingTemplate.value ? 'Formulario actualizado' : 'Formulario creado',
  });
};

const duplicateTemplate = async (template) => {
  try {
    await formBuilderService.duplicateTemplate(template.form_template_id);
    await loadTemplates();
    $q.notify({
      type: 'positive',
      message: 'Formulario duplicado correctamente',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al duplicar',
      caption: error.message,
    });
  }
};

const openAssignDialog = (template) => {
  assigningTemplate.value = template;
  selectedClassifications.value = template.classifications?.map(c => c.maestro_id) || [];
  assignDialog.value = true;
};

const saveClassifications = async () => {
  savingClassifications.value = true;
  try {
    const data = selectedClassifications.value.map((maestro_id, index) => ({
      maestro_id,
      orden: index,
      is_required: false,
    }));
    
    await formBuilderService.assignClassifications(
      assigningTemplate.value.form_template_id,
      data
    );
    
    assignDialog.value = false;
    await loadTemplates();
    
    $q.notify({
      type: 'positive',
      message: 'Clasificaciones asignadas correctamente',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al asignar clasificaciones',
      caption: error.message,
    });
  } finally {
    savingClassifications.value = false;
  }
};

const confirmDelete = (template) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el formulario "${template.name}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await formBuilderService.deleteTemplate(template.form_template_id);
      await loadTemplates();
      $q.notify({
        type: 'positive',
        message: 'Formulario eliminado',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar',
        caption: error.message,
      });
    }
  });
};

// Lifecycle
onMounted(() => {
  loadTemplates();
  loadClassifications();
});
</script>
