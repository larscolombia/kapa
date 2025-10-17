<template>
  <q-dialog v-model="internalDialogOpen" @before-show="loadProjectData" @hide="resetForm">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-form @submit="onSubmit">
        <q-card-section class="row q-pb-none">
          <div class="text-h6">{{ props.projectId ? 'Editar proyecto' : 'Crear proyecto' }}</div>
          <q-space />
          <q-toggle v-model="project.state" size="lg" left-label :label="project.state ? 'Activo' : 'Inactivo'"
            :icon="project.state ? 'check' : 'clear'" color="light-green-8"
            :class="project.state ? 'text-light-green-8' : 'text-red-8'" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="project.name" label="Nombre del proyecto" @blur="validateForm" :disable="isEditableName" />
          <q-input v-model="project.address" label="Dirección" @blur="validateForm" />
          <q-input v-model="project.supervisor" label="Supervisor" @blur="validateForm" />
          <date-picker v-model="project.start_date" labelValue="Fecha de inicio" @input="validateForm" />
          <date-picker v-model="project.end_date" labelValue="Fecha de fin" @input="validateForm" />
          <q-select v-model="project.client" :options="clients" emit-value map-options label="Cliente"
            @blur="validateForm" />
        </q-card-section>
        <!-- Contenido del formulario -->
        <q-card-actions align="right">
          <span v-if="error" class="text-negative q-pa-sm col-8 text-caption"> <q-icon name="warning"></q-icon> {{ error
            }}</span>
          <q-space />
          <q-btn flat label="Cancelar" color="primary" @click="internalDialogOpen = false" />
          <q-btn label="Guardar" color="primary" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineOptions({ name: 'ProjectForm' })
import { computed, onBeforeMount, ref, getCurrentInstance } from 'vue';
import { getClients } from 'src/services/clientService';
import { getProject, createProject, updateProject } from 'src/services/projectService';
import { getDocumentsByProjectId } from 'src/services/documentService';
import DatePicker from './DatePicker.vue';

const { proxy } = getCurrentInstance();
const props = defineProps(['dialogOpen', 'projectId']);
const emit = defineEmits(['update:dialogOpen', 'fomSubmitted']);
const confirnPassword = ref('');
const clients = ref([]);
const originalProject = ref({
  project_id: 0,
  name: '',
  address: '',
  supervisor: '',
  start_date: '',
  end_date: '',
  state: true,
  client: null
});
const project = ref(originalProject.value);
const error = ref(null);
const formTouched = ref(false);
const isEditableName = ref(false);


onBeforeMount(async () => {
  const response = await getClients();
  clients.value = response.map((client) => {
    return { label: client.name, value: client.client_id };
  });
});

const loadProjectData = async () => {
  if (props.projectId) {
    const response = await getProject(props.projectId);
    const docs = await getDocumentsByProjectId(props.projectId);
    isEditableName.value = docs.length === 0 ? false : true;
    response.client = response.client.client_id;
    response.state = response.state === 'active' ? true : false;
    project.value = response;
  } else {
    resetForm();
  }
};

const resetForm = () => {
  project.value = { ...originalProject.value };
  confirnPassword.value = '';
  error.value = null;
  formTouched.value = false;
};

// Computed property para sincronizar la prop con el estado interno
const internalDialogOpen = computed({
  get: () => props.dialogOpen,
  set: (value) => {
    emit('update:dialogOpen', value);
  },
});

const onSubmit = async () => {
  try {
    formTouched.value = true;
    const projectData = { ...project.value };
    projectData.state = project.value.state ? 'active' : 'inactive';
    const validate = validateForm();
    if (!validate) return;
    if (props.projectId) {
      await updateProject(projectData);
    } else {
      await createProject(projectData);
    }
    emit('fomSubmitted');
    internalDialogOpen.value = false;
    proxy.$kapaAlert({ type: 'success', message: 'Proyecto guardado correctamente', title: 'Exito!' });
  } catch (error) {
    proxy.$kapaAlert({ type: 'error', message: error.message, title: `Oh no!` });
  }
};

const validateDates = () => {
  const { start_date, end_date } = project.value;
  if (!start_date) error.value = 'La fecha de inicio es obligatoria';
  else if (!end_date) error.value = 'La fecha de fin es obligatoria';
  else if (start_date > end_date) error.value = 'La fecha de inicio no puede ser mayor a la fecha de fin';
  else error.value = null;
  return !!error.value;
};


const validateForm = () => {
  if (!formTouched.value) return true;
  const { name, address, supervisor, start_date, end_date, client } = project.value;
  if (!name) error.value = 'El nombre es obligatorio';
  else if (!address) error.value = 'La dirección es obligatoria';
  else if (!supervisor) error.value = 'El supervisor es obligatorio';
  else if (validateDates()) return false;
  else if (!client) error.value = 'El cliente es obligatorio';
  else error.value = null;
  return !error.value;
};
</script>
