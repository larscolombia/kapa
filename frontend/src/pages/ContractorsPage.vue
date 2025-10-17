<template>
    <div class="q-pa-md">
        <h4 class="text-h4 col-12 q-pl-md kapa-title text-primary">Administración de contratistas</h4>
        <q-table class="kapa-table" flat title="Treats" :rows="rows" :columns="columns" row-key="id" :filter="filter"
            :loading="loading" :pagination="pagination" :rows-per-page-options="[5, 10, 20, 0]"
            rows-per-page-label="Filas por página">
            <template v-slot:top>
                <q-btn v-if="authStore.hasPermission('contractor_management', 'can_edit')" class="col-xs-12 col-md-2" color="light-green-8" :disable="loading" label="Agregar contratista"
                    @click="showContractorForm(0)" />
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
                        @click="showContractorForm(props.row.contractor_id)" />
                    <q-btn size="sm" color="secondary" label="subcontratistas" icon="people"
                        @click="showSubContractorList(props.row.contractor_id)" />
                </q-td>
            </template>

            <template v-slot:body-cell-state="props">
                <q-td :props="props">
                    <q-chip size="sm" :color="props.row.state === 'active' ? 'light-green-8' : 'red-5'"
                        :label="props.row.state === 'active' ? 'Activo' : 'Inactivo'" text-color="white"></q-chip>
                </q-td>
            </template>
        </q-table>
        <contractor-form :dialogOpen="contractorFormDialogOpen" :contractorId="contractorToUpdate" @update:dialogOpen="contractorFormDialogOpen = $event" @fomSubmitted="loadContractors" />
        <sub-contractor-list :dialogOpen="subContractorListDialogOpen" :contractorId="contractorToUpdate" @update:dialogOpen="subContractorListDialogOpen = $event" />
    </div>
</template>

<script setup>
defineOptions({
    name: 'ContractorsPage'
});
import { onBeforeMount, ref } from 'vue'
import { getContractors } from 'src/services/contractorService';
import ContractorForm from 'components/ContractorForm.vue';
import SubContractorList from 'src/components/SubContractorList.vue';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

const loading = ref(false)
const filter = ref('')
const originalRows = ref([])
const rows = ref([])
const contractorFormDialogOpen = ref(false)
const subContractorListDialogOpen = ref(false) 
const contractorToUpdate = ref(null)

const columns = [
    { name: 'nit', align: 'left', label: 'NIT', field: 'nit', sortable: true },
    { name: 'name', align: 'left', label: 'Nombre del contratista', field: 'name', sortable: true },
    { name: 'resident_engineer', align: 'left', label: 'Ingeniero Residente', field: 'resident_engineer', sortable: true },
    { name: 'coordinator', align: 'left', label: 'Coordinador', field: 'coordinator', sortable: true },
    { name: 'phone', align: 'left', label: 'Teléfono', field: 'phone', sortable: true },
    { name: 'state', align: 'center', label: 'Estado', field: 'state' },
    { name: 'actions', align: 'center', label: 'Acciones', field: row => row.contractor_id }
]
if(!authStore.hasPermission('contractor_management', 'can_edit')) columns.splice(6, 1)
onBeforeMount(async () => {
    await loadContractors()
})

const loadContractors = async () => {
    loading.value = true
    originalRows.value = await getContractors()
    rows.value = [...originalRows.value]
    loading.value = false
}

const showContractorForm = (contractorId) => {
    contractorToUpdate.value = contractorId
    contractorFormDialogOpen.value = true
}

const showSubContractorList = (contractorId) => {
    contractorToUpdate.value = contractorId
    subContractorListDialogOpen.value = true
}

</script>
<style>
.kapa-table {
    border-radius: 20px;
}
</style>