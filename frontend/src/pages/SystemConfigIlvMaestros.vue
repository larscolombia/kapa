<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn flat icon="arrow_back" @click="$router.push({ name: 'systemConfig' })" class="q-mr-sm" />
      <div class="text-h5">
        <q-icon name="report_problem" color="orange" class="q-mr-sm" />
        Maestros ILV
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
          :class="{ 'bg-orange-1': selectedTipo === item.tipo }"
          @click="selectTipo(item.tipo)"
        >
          <div class="text-weight-bold">{{ item.label }}</div>
          <div class="text-h6 text-orange">{{ item.count }}</div>
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
              <q-chip size="sm" color="orange-2">
                {{ getTipoLabel(props.row.tipo) }}
              </q-chip>
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
              label="Clave (identificador único) *"
              outlined
              hint="Usar snake_case sin espacios (ej: tipo_ejemplo)"
              :rules="[val => !!val || 'La clave es requerida', val => /^[a-z0-9_]+$/.test(val) || 'Solo letras minúsculas, números y guiones bajos']"
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

            <!-- Campo para subcategorías -->
            <q-select
              v-if="showAplicaATipo"
              v-model="form.aplica_a_tipo"
              :options="padresOptions"
              label="Aplica a (categoría padre)"
              outlined
              emit-value
              map-options
              clearable
              hint="Solo para subcategorías: seleccione la categoría padre"
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
const categoriasPadre = ref([]); // Para el select de categorías padre en subcategorías
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
  aplica_a_tipo: null,
});

const columns = [
  { name: 'maestro_id', label: 'ID', field: 'maestro_id', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'clave', label: 'Clave', field: 'clave', align: 'left', sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'left', sortable: true },
  { name: 'orden', label: 'Orden', field: 'orden', align: 'center', sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
];

const tiposOptions = computed(() => {
  if (!config.value?.ilv?.tipos) return [];
  return Object.entries(config.value.ilv.tipos).map(([key, val]) => ({
    label: val.label,
    value: key,
  }));
});

const padresOptions = computed(() => {
  // Para subcategorías, necesitamos las claves de las categorías padre
  if (form.value.tipo === 'subcategoria_hid') {
    return categoriasPadre.value
      .filter(m => m.activo)
      .map(m => ({ label: m.valor, value: m.clave }));
  }
  return [];
});

const showAplicaATipo = computed(() => {
  return form.value.tipo === 'subcategoria_hid';
});

// Watcher para cargar categorías padre cuando cambia el tipo a subcategoria_hid
watch(() => form.value.tipo, async (newTipo) => {
  if (newTipo === 'subcategoria_hid' && categoriasPadre.value.length === 0) {
    await loadCategoriasPadre();
  }
});

const filteredMaestros = computed(() => {
  let result = maestros.value;
  
  if (filter.value) {
    const search = filter.value.toLowerCase();
    result = result.filter(m => 
      m.valor.toLowerCase().includes(search) ||
      m.clave.toLowerCase().includes(search) ||
      m.tipo.toLowerCase().includes(search)
    );
  }
  
  return result;
});

const getTipoLabel = (tipo) => {
  return config.value?.ilv?.tipos?.[tipo]?.label || tipo;
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
    summary.value = await systemConfigService.getIlvMaestrosSummary();
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
    maestros.value = await systemConfigService.getIlvMaestros(filters);
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

const loadCategoriasPadre = async () => {
  // Cargar las categorías padre para el select de subcategorías
  try {
    categoriasPadre.value = await systemConfigService.getIlvMaestrosByTipo('categoria_hid');
  } catch (error) {
    console.error('Error loading categorias padre:', error);
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
    aplica_a_tipo: null,
  };
  
  // Cargar categorías padre si se va a crear una subcategoría
  if (form.value.tipo === 'subcategoria_hid' || !form.value.tipo) {
    await loadCategoriasPadre();
  }
  
  dialogOpen.value = true;
};

const openEditDialog = async (item) => {
  isEditing.value = true;
  selectedItem.value = item;
  form.value = {
    tipo: item.tipo,
    clave: item.clave,
    valor: item.valor,
    orden: item.orden,
    activo: item.activo,
    aplica_a_tipo: item.aplica_a_tipo,
  };
  
  // Cargar categorías padre si se va a editar una subcategoría
  if (item.tipo === 'subcategoria_hid') {
    await loadCategoriasPadre();
  }
  
  dialogOpen.value = true;
};

const saveMaestro = async () => {
  saving.value = true;
  try {
    if (isEditing.value) {
      const { tipo, ...updateData } = form.value;
      await systemConfigService.updateIlvMaestro(selectedItem.value.maestro_id, updateData);
      Notify.create({
        type: 'positive',
        message: 'Registro actualizado correctamente',
      });
    } else {
      await systemConfigService.createIlvMaestro(form.value);
      Notify.create({
        type: 'positive',
        message: 'Registro creado correctamente',
      });
    }
    dialogOpen.value = false;
    await Promise.all([loadMaestros(), loadSummary()]);
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
    await systemConfigService.deleteIlvMaestro(selectedItem.value.maestro_id);
    Notify.create({
      type: 'positive',
      message: 'Registro desactivado correctamente',
    });
    deleteDialogOpen.value = false;
    await Promise.all([loadMaestros(), loadSummary()]);
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
    await systemConfigService.reactivateIlvMaestro(item.maestro_id);
    Notify.create({
      type: 'positive',
      message: 'Registro reactivado correctamente',
    });
    await Promise.all([loadMaestros(), loadSummary()]);
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
});
</script>
