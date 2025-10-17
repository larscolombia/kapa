<template>
    <div class="q-pa-md">
        <h4 class="text-h4 col-12 q-pl-md kapa-title text-primary">Administración de proyectos</h4>
        <q-table class="kapa-table" flat title="Treats" :rows="rows" :columns="columns" row-key="id" :filter="filter"
            :loading="loading" :pagination="pagination" :rows-per-page-options="[5, 10, 20, 0]"
            rows-per-page-label="Filas por página">
            <template v-slot:top>
                <q-btn v-if="authStore.hasPermission('project_management', 'can_edit')" class="col-xs-12 col-md-2" color="light-green-8" :disable="loading" label="Agregar proyecto"
                    @click="showProjectForm(0)" />
                <q-space />
                <q-input class="col-xs-12 col-md-2" placeholder="Buscar" dense debounce="300" color="primary"
                    v-model="filter">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:no-data>
                <div class="full-width row flex-center text-primary q-gutter-sm q-pa-md">
                    <q-icon class="col-12" size="5em" name="info_outline" />
                    <span class="text-h5">Actualmente no hay datos para mostrar</span>
                </div>
            </template>
            <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-x-sm text-center">
                    <q-btn size="sm" color="primary" label="editar" icon="edit"
                        @click="showProjectForm(props.row.project_id)" v-if="authStore.hasPermission('user_management', 'can_edit')" />
                    <q-btn size="sm" color="light-blue-8" label="info" icon="info" @click="showProjectInfo(props.row.projectContractors)" />
                </q-td>
            </template>

            <template v-slot:body-cell-state="props">
                <q-td :props="props">
                    <q-chip size="sm" :color="props.row.state === 'active' ? 'light-green-8' : 'red-5'"
                        :label="props.row.state === 'active' ? 'Activo' : 'Inactivo'" text-color="white"></q-chip>
                </q-td>
            </template>
        </q-table>
        <project-form :dialogOpen="formDialogOpen" :projectId="projectToUpdate" @update:dialogOpen="formDialogOpen = $event" @fomSubmitted="loadProjects" />
        <project-info :dialogOpen="infoDialogOpen" :projectInfo="projectInfo" @update:dialogOpen="infoDialogOpen = $event" @fomSubmitted="loadProjects" />
    </div>
</template>

<script setup>
defineOptions({
    name: 'ProjectsPage'
});
import { onBeforeMount, ref } from 'vue'
import { getProjects } from 'src/services/projectService';
import ProjectForm from 'components/ProjectForm.vue';
import ProjectInfo from 'components/ProjectInfo.vue';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

const loading = ref(false)
const filter = ref('')
const originalRows = ref([])
const rows = ref([])
const formDialogOpen = ref(false)
const infoDialogOpen = ref(false)
const projectInfo = ref(null)
const projectToUpdate = ref(null)

const columns = [
    { name: 'name', align: 'left', label: 'Nombre del proyecto', field: 'name', sortable: true },
    { name: 'address', align: 'left', label: 'Dirección', field: 'address', sortable: true },
    { name: 'supervisor', align: 'left', label: 'Supervisor', field: 'supervisor', sortable: true },
    { name: 'start_date', align: 'left', label: 'Fecha de inicio', field: 'start_date', sortable: true },
    { name: 'end_date', align: 'left', label: 'Fecha de finalización', field: 'end_date', sortable: true },
    { name: 'state', align: 'center', label: 'Estado', field: 'state' },
    { name: 'client', align: 'center', label: 'Cliente', field: row => row.client.name },
    { name: 'actions', align: 'center', label: 'Acciones', field: 'project_id' }
]
onBeforeMount(async () => {
    await loadProjects()
})

const loadProjects = async () => {
    loading.value = true
    originalRows.value = await getProjects()
    rows.value = [...originalRows.value]
    loading.value = false
}

const showProjectForm = (projectId) => {
    projectToUpdate.value = projectId
    formDialogOpen.value = true
}

const showProjectInfo = (contractors) => {
    projectInfo.value = contractors
    infoDialogOpen.value = true
}

</script>
<style>
.kapa-table {
    border-radius: 20px;
}
</style>