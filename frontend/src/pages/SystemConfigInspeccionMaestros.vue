<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn flat icon="arrow_back" @click="$router.push({ name: 'systemConfig' })" class="q-mr-sm" />
      <div class="text-h5">
        <q-icon name="checklist" color="teal" class="q-mr-sm" />
        Maestros Inspecciones
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Registro" @click="openCreateDialog" />
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedTipo"
              :options="tiposOptions"
              label="Tipo de Maestro"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="loadMaestros"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              placeholder="Buscar..."
              dense
              outlined
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-toggle v-model="showInactive" label="Mostrar inactivos" @update:model-value="loadMaestros" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen por tipo -->
    <div v-if="!selectedTipo" class="row q-col-gutter-sm q-mb-md">
      <div v-for="item in summary" :key="item.tipo" class="col-6 col-md-3 col-lg-2">
        <q-card 
          class="cursor-pointer text-center q-pa-sm" 
          :class="{ 'bg-teal-1': selectedTipo === item.tipo }"
          @click="selectTipo(item.tipo)"
        >
          <div class="text-weight-bold">{{ item.label }}</div>
          <div class="text-h6 text-teal">{{ item.count }}</div>
        </q-card>
      </div>
    </div>

    <!-- Tabla -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="filteredMaestros"
          :columns="columns"
          row-key="maestro_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 20 }"
          flat
          bordered
        >
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip 
                :color="props.row.activo ? 'positive' : 'negative'" 
                text-color="white"
                size="sm"
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-chip size="sm" color="teal-2">
                {{ getTipoLabel(props.row.tipo) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-padre="props">
            <q-td :props="props">
              <span v-if="props.row.padre_id">
                {{ getPadreName(props.row.padre_id) }}
              </span>
              <span v-else class="text-grey">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="edit" color="primary" @click="openEditDialog(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn 
                v-if="props.row.activo" 
                flat dense icon="delete" 
                color="negative" 
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Desactivar</q-tooltip>
              </q-btn>
              <q-btn 
                v-else 
                flat dense icon="restore" 
                color="positive" 
                @click="reactivate(props.row)"
              >
                <q-tooltip>Reactivar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} Registro</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="saveMaestro" class="q-gutter-md">
            <q-select
              v-model="form.tipo"
              :options="tiposOptions"
              label="Tipo *"
              outlined
              emit-value
              map-options
              :disable="isEditing"
              :rules="[val => !!val || 'El tipo es requerido']"
            />

            <q-input
              v-model="form.clave"
              label="Clave (identificador único)"
              outlined
              hint="Opcional. Usar snake_case sin espacios (ej: tipo_ejemplo)"
            />

            <q-input
              v-model="form.valor"
              label="Valor (texto a mostrar) *"
              outlined
              :rules="[val => !!val || 'El valor es requerido']"
            />

            <q-input
              v-model.number="form.orden"
              label="Orden"
              type="number"
              outlined
              hint="Orden de aparición en listas"
            />

            <!-- Campo para clasificaciones que dependen de tipo de inspección -->
            <q-select
              v-if="showPadreId"
              v-model="form.padre_id"
              :options="padresOptions"
              label="Tipo de Inspección (padre)"
              outlined
              emit-value
              map-options
              clearable
              hint="Solo para clasificaciones: seleccione el tipo de inspección padre"
            />

            <q-toggle v-model="form.activo" label="Activo" />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup />
              <q-btn type="submit" label="Guardar" color="primary" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo Confirmar Eliminación -->
    <q-dialog v-model="deleteDialogOpen" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm text-h6">Confirmar desactivación</span>
        </q-card-section>

        <q-card-section>
          ¿Está seguro que desea desactivar el registro <strong>{{ selectedItem?.valor }}</strong>?
          <br /><br />
          <span class="text-caption text-grey">
            El registro será marcado como inactivo y no aparecerá en los formularios.
            Puede reactivarlo más tarde si lo necesita.
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Desactivar" color="warning" @click="deleteMaestro" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Notify } from 'quasar';
import * as systemConfigService from 'src/services/systemConfigService';

const maestros = ref([]);
const allMaestros = ref([]); // Para buscar nombres de padres
const summary = ref([]);
const config = ref(null);
const loading = ref(false);
const filter = ref('');
const selectedTipo = ref(null);
const showInactive = ref(false);

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);
const selectedItem = ref(null);

const form = ref({
  tipo: '',
  clave: '',
  valor: '',
  orden: 0,
  activo: true,
  padre_id: null,
});

const columns = [
  { name: 'maestro_id', label: 'ID', field: 'maestro_id', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'clave', label: 'Clave', field: 'clave', align: 'left', sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'left', sortable: true },
  { name: 'padre', label: 'Padre', field: 'padre_id', align: 'left' },
  { name: 'orden', label: 'Orden', field: 'orden', align: 'center', sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
];

const tiposOptions = computed(() => {
  if (!config.value?.inspecciones?.tipos) return [];
  return Object.entries(config.value.inspecciones.tipos).map(([key, val]) => ({
    label: val.label,
    value: key,
  }));
});

const padresOptions = computed(() => {
  // Para clasificaciones, necesitamos los tipos de inspección técnica
  if (form.value.tipo === 'clasificacion_inspeccion') {
    return allMaestros.value
      .filter(m => m.activo)
      .map(m => ({ label: m.valor, value: m.maestro_id }));
  }
  return [];
});

const showPadreId = computed(() => {
  return form.value.tipo === 'clasificacion_inspeccion';
});

// Watcher para cargar tipos de inspección cuando cambia el tipo a clasificacion_inspeccion
watch(() => form.value.tipo, async (newTipo) => {
  if (newTipo === 'clasificacion_inspeccion' && allMaestros.value.length === 0) {
    await loadTiposInspeccion();
  }
});

const filteredMaestros = computed(() => {
  let result = maestros.value;
  
  if (filter.value) {
    const search = filter.value.toLowerCase();
    result = result.filter(m => 
      m.valor.toLowerCase().includes(search) ||
      (m.clave?.toLowerCase().includes(search) || false) ||
      m.tipo.toLowerCase().includes(search)
    );
  }
  
  return result;
});

const getTipoLabel = (tipo) => {
  return config.value?.inspecciones?.tipos?.[tipo]?.label || tipo;
};

const getPadreName = (padreId) => {
  if (!padreId) return '-';
  const padre = allMaestros.value.find(m => m.maestro_id === padreId);
  return padre?.valor || `ID: ${padreId}`;
};

const selectTipo = (tipo) => {
  selectedTipo.value = tipo;
  loadMaestros();
};

const loadConfig = async () => {
  try {
    config.value = await systemConfigService.getMaestrosConfig();
  } catch (error) {
    console.error('Error loading config:', error);
  }
};

const loadSummary = async () => {
  try {
    summary.value = await systemConfigService.getInspeccionMaestrosSummary();
  } catch (error) {
    console.error('Error loading summary:', error);
  }
};

const loadMaestros = async () => {
  loading.value = true;
  try {
    const filters = {};
    if (selectedTipo.value) {
      filters.tipo = selectedTipo.value;
    }
    if (!showInactive.value) {
      filters.activo = true;
    }
    maestros.value = await systemConfigService.getInspeccionMaestros(filters);
  } catch (error) {
    console.error('Error loading maestros:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al cargar los maestros',
    });
  } finally {
    loading.value = false;
  }
};

const loadTiposInspeccion = async () => {
  // Cargar los tipos de inspección técnica para el select de clasificaciones
  try {
    allMaestros.value = await systemConfigService.getInspeccionMaestrosByTipo('tipo_inspeccion_tecnica');
  } catch (error) {
    console.error('Error loading tipos inspeccion:', error);
  }
};

const openCreateDialog = async () => {
  isEditing.value = false;
  form.value = {
    tipo: selectedTipo.value || '',
    clave: '',
    valor: '',
    orden: 0,
    activo: true,
    padre_id: null,
  };
  
  // Cargar tipos de inspección si se va a crear una clasificación
  if (form.value.tipo === 'clasificacion_inspeccion' || !form.value.tipo) {
    await loadTiposInspeccion();
  }
  
  dialogOpen.value = true;
};

const openEditDialog = async (item) => {
  isEditing.value = true;
  selectedItem.value = item;
  form.value = {
    tipo: item.tipo,
    clave: item.clave || '',
    valor: item.valor,
    orden: item.orden,
    activo: item.activo,
    padre_id: item.padre_id,
  };
  
  // Cargar tipos de inspección si se va a editar una clasificación
  if (item.tipo === 'clasificacion_inspeccion') {
    await loadTiposInspeccion();
  }
  
  dialogOpen.value = true;
};

const saveMaestro = async () => {
  saving.value = true;
  try {
    if (isEditing.value) {
      const { tipo, ...updateData } = form.value;
      await systemConfigService.updateInspeccionMaestro(selectedItem.value.maestro_id, updateData);
      Notify.create({
        type: 'positive',
        message: 'Registro actualizado correctamente',
      });
    } else {
      await systemConfigService.createInspeccionMaestro(form.value);
      Notify.create({
        type: 'positive',
        message: 'Registro creado correctamente',
      });
    }
    dialogOpen.value = false;
    await Promise.all([loadMaestros(), loadSummary(), loadTiposInspeccion()]);
  } catch (error) {
    console.error('Error saving maestro:', error);
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar el registro',
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  selectedItem.value = item;
  deleteDialogOpen.value = true;
};

const deleteMaestro = async () => {
  deleting.value = true;
  try {
    await systemConfigService.deleteInspeccionMaestro(selectedItem.value.maestro_id);
    Notify.create({
      type: 'positive',
      message: 'Registro desactivado correctamente',
    });
    deleteDialogOpen.value = false;
    await Promise.all([loadMaestros(), loadSummary(), loadTiposInspeccion()]);
  } catch (error) {
    console.error('Error deleting maestro:', error);
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al desactivar el registro',
    });
  } finally {
    deleting.value = false;
  }
};

const reactivate = async (item) => {
  try {
    await systemConfigService.reactivateInspeccionMaestro(item.maestro_id);
    Notify.create({
      type: 'positive',
      message: 'Registro reactivado correctamente',
    });
    await Promise.all([loadMaestros(), loadSummary(), loadTiposInspeccion()]);
  } catch (error) {
    console.error('Error reactivating maestro:', error);
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al reactivar el registro',
    });
  }
};

onMounted(async () => {
  await loadConfig();
  await loadSummary();
  await loadMaestros();
  // Cargar tipos de inspección para mostrar nombres de padres en la tabla
  await loadTiposInspeccion();
});
</script>
