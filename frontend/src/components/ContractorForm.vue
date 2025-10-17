<template>
    <q-dialog v-model="internalDialogOpen" @before-show="loadContractorData" @hide="resetForm">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-form @submit="onSubmit">
                <q-card-section class="row q-pb-none">
                    <div class="text-h6">
                        {{ props.contractorId
                            ? (props.parentContractorId ? 'Editar subcontratista' : 'Editar contratista')
                            : (props.parentContractorId ? 'Crear subcontratista' : 'Crear contratista')
                        }}
                    </div>
                    <q-space />
                    <q-toggle v-model="contractor.state" size="lg" left-label
                        :label="contractor.state ? 'Activo' : 'Inactivo'" :icon="contractor.state ? 'check' : 'clear'"
                        color="light-green-8" :class="contractor.state ? 'text-light-green-8' : 'text-red-8'" />
                </q-card-section>
                <q-card-section>
                    <q-input v-model="contractor.nit" label="NIT" @blur="validateForm" />
                    <q-input v-model="contractor.name" label="Nombre del contratista" @blur="validateForm" :disable="isEditableName" />
                    <q-input v-model="contractor.resident_engineer" label="Ingeniero Residente" @blur="validateForm" />
                    <q-input v-model="contractor.coordinator" label="Coordinador" @blur="validateForm" />
                    <q-input v-model="contractor.phone" label="Teléfono" type="tel" @blur="validateForm" />
                    <q-select v-model="contractor.projectIds" color="kapa-orange" multiple :options="projects"
                        emit-value map-options label="Proyectos" @blur="validateForm" />
                    <email-group-box v-model="contractor.emails" />
                </q-card-section>
                <!-- Contenido del formulario -->
                <q-card-actions align="right">
                    <span v-if="error" class="text-negative q-pa-sm col-8 text-caption"> <q-icon
                            name="warning"></q-icon> {{ error }}</span>
                    <q-space />
                    <q-btn flat label="Cancelar" color="primary" @click="internalDialogOpen = false" />
                    <q-btn label="Guardar" color="primary" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
defineOptions({ name: 'ContractorForm' })
import { computed, onBeforeMount, ref, getCurrentInstance } from 'vue';
import { getProjects, getProjectsByContractor } from 'src/services/projectService';
import { getContractor, createContractor, updateContractor } from 'src/services/contractorService';
import { getDocumentsByContractorId } from 'src/services/documentService';
import EmailGroupBox from './EmailGroupBox.vue';

const { proxy } = getCurrentInstance();
const props = defineProps(['dialogOpen', 'contractorId', 'parentContractorId']);
const emit = defineEmits(['update:dialogOpen', 'fomSubmitted']);
const confirnPassword = ref('');
const projects = ref([]);
const originalContractor = ref({
    contractor_id: 0,
    nit: '',
    name: '',
    resident_engineer: '',
    coordinator: '',
    phone: '',
    state: true,
    emails: [],
    projectIds: [],
    parent_contractor: null
});

const contractor = ref(originalContractor.value);
const error = ref(null);
const formTouched = ref(false);
const isEditableName = ref(false);

onBeforeMount(async () => {
    await loadProjects();
});

const loadContractorData = async () => {
    if (props.contractorId) {
        const response = await getContractor(props.contractorId);
        const docs = await getDocumentsByContractorId(props.contractorId);
        isEditableName.value = docs.length === 0 ? false : true;
        response.state = response.state === 'active' ? true : false;
        contractor.value = response;
    } else {
        resetForm();
    }
    // si existe un parentContractorId cargar los proyectos de ese contratista y le asigna el id al nuevo subcontratista
    if (props.parentContractorId) {
        contractor.value.parent_contractor = props.parentContractorId;
        await loadProjects();
    }
};

const resetForm = () => {
    contractor.value = { ...originalContractor.value };
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
        const contractorData = { ...contractor.value };
        contractorData.state = contractor.value.state ? 'active' : 'inactive';
        const validate = validateForm();
        if (!validate) return;
        if (props.contractorId) {
            await updateContractor(contractorData);
        } else {
            await createContractor(contractorData);
        }
        emit('fomSubmitted');
        internalDialogOpen.value = false;
        const person = props.parentContractorId ? 'Subcontratista' : 'Contratista';
        proxy.$kapaAlert({ type: 'success', message: `${person} guardado correctamente`, title: 'Exito!' });
    } catch (error) {
        proxy.$kapaAlert({ type: 'error', message: error.message, title: `Oh no!` });
    }
};

const validateForm = () => {
    if (!formTouched.value) return true;
    const { nit, name, resident_engineer, coordinator, phone, emails, projectIds, state } = contractor.value;
    if (!nit) error.value = 'El nit es obligatorio';
    else if (!name) error.value = 'El nombre del contratista es obligatorio';
    else if (!resident_engineer) error.value = 'El ingeniero residente es obligatorio';
    else if (!coordinator) error.value = 'El coordinador es obligatorio';
    else if (!phone) error.value = 'El teléfono es obligatorio';
    else if (projectIds.length === 0) error.value = 'Al menos un proyecto debe estar seleccionado';
    else error.value = null;
    return !error.value;
};

const loadProjects = async () => {
    const response = props.parentContractorId ? await getProjectsByContractor(props.parentContractorId) : await getProjects();
    projects.value = response.map((project) => {
        return { label: project.name, value: project.project_id };
    });
}
</script>
