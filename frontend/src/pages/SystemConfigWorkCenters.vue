<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn flat icon="arrow_back" @click="$router.push({ name: 'systemConfig' })" class="q-mr-sm" />
      <div class="text-h5">
        <q-icon name="business" class="q-mr-sm" />
        Administrar Centros de Trabajo
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Centro de Trabajo" @click="openCreateDialog" />
    </div>

    <!-- Tabla -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="workCenters"
          :columns="columns"
          row-key="client_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 15 }"
          :filter="filter"
          flat
          bordered
        >
          <template v-slot:top-right>
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
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="edit" color="primary" @click="openEditDialog(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} Centro de Trabajo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="saveWorkCenter" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nombre del Centro de Trabajo *"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
            />

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
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Confirmar eliminación</span>
        </q-card-section>

        <q-card-section>
          ¿Está seguro que desea eliminar el centro de trabajo <strong>{{ selectedItem?.name }}</strong>?
          <br /><br />
          <span class="text-caption text-negative">
            Esta acción no se puede deshacer. El centro de trabajo no debe tener proyectos asociados.
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteWorkCenter" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Notify } from 'quasar';
import * as systemConfigService from 'src/services/systemConfigService';

const workCenters = ref([]);
const loading = ref(false);
const filter = ref('');

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);
const selectedItem = ref(null);

const form = ref({
  name: '',
});

const columns = [
  { name: 'client_id', label: 'ID', field: 'client_id', align: 'left', sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
];

const loadWorkCenters = async () => {
  loading.value = true;
  try {
    workCenters.value = await systemConfigService.getWorkCenters();
  } catch (error) {
    console.error('Error loading work centers:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al cargar los centros de trabajo',
    });
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  form.value = { name: '' };
  dialogOpen.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  selectedItem.value = item;
  form.value = { name: item.name };
  dialogOpen.value = true;
};

const saveWorkCenter = async () => {
  saving.value = true;
  try {
    if (isEditing.value) {
      await systemConfigService.updateWorkCenter(selectedItem.value.client_id, form.value);
      Notify.create({
        type: 'positive',
        message: 'Centro de trabajo actualizado correctamente',
      });
    } else {
      await systemConfigService.createWorkCenter(form.value);
      Notify.create({
        type: 'positive',
        message: 'Centro de trabajo creado correctamente',
      });
    }
    dialogOpen.value = false;
    await loadWorkCenters();
  } catch (error) {
    console.error('Error saving work center:', error);
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar el centro de trabajo',
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  selectedItem.value = item;
  deleteDialogOpen.value = true;
};

const deleteWorkCenter = async () => {
  deleting.value = true;
  try {
    await systemConfigService.deleteWorkCenter(selectedItem.value.client_id);
    Notify.create({
      type: 'positive',
      message: 'Centro de trabajo eliminado correctamente',
    });
    deleteDialogOpen.value = false;
    await loadWorkCenters();
  } catch (error) {
    console.error('Error deleting work center:', error);
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al eliminar el centro de trabajo',
    });
  } finally {
    deleting.value = false;
  }
};

onMounted(loadWorkCenters);
</script>
