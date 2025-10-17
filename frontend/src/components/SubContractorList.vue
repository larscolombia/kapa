<template>
    <q-dialog v-model="internalDialogOpen" @before-show="loadSubContractors">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-card-section class="row q-pb-none">
                <div class="text-h6">Subcontratistas</div>
            </q-card-section>
            <q-card-section class="row q-pb-none" style="min-height: 50vh;">
                <div v-if="loading" class="flex justify-center items-center full-width">
                    <q-spinner-puff size="3em" color="primary" />
                </div>
                <div v-else class="q-pa-md full-width">
                    <q-list padding separator v-if="subContractors.length != 0">
                        <div v-for="subContractor in subContractors" :key="subContractor.contractor_id">
                            <q-item clickable v-ripple class="rounded-borders"
                                @click="showContractorForm(subContractor.contractor_id)">
                                <q-item-section avatar top>
                                    <q-avatar icon="assignment" color="secondary" text-color="white" />
                                </q-item-section>

                                <!-- Sección principal: Nombre -->
                                <q-item-section>
                                    <q-item-label class="text-h6 text-weight-light">{{ subContractor.name }}</q-item-label>
                                    <q-item-label caption>
                                        <b>NIT:</b> {{ subContractor.nit }} |
                                        <b>Residente:</b> {{ subContractor.resident_engineer || 'Sin residente' }} |
                                        <b>Tel:</b> {{ subContractor.phone || 'N/D' }}
                                    </q-item-label>
                                </q-item-section>

                                <!-- Estado como badge lateral -->
                                <q-item-section side>
                                    <q-badge :color="subContractor.state == 'active' ? 'green' : 'red'">
                                        {{ subContractor.state == 'active' ? 'Activo' : 'Inactivo' }}
                                    </q-badge>
                                </q-item-section>
                            </q-item>
                        </div>
                    </q-list>
                    <div v-else class="full-width row flex-center text-primary q-gutter-sm q-pa-md light-dimmed">
                        <q-icon class="col-12" size="5em" name="info_outline" />
                        <span class="text-h5">No hay subcontratistas asignados a este contratista</span>
                    </div>
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" @click="internalDialogOpen = false" />
                <q-btn label="Agregar subcontratista" color="primary" @click="showContractorForm(0)" />
            </q-card-actions>
        </q-card>
    </q-dialog>
    <contractor-form :dialogOpen="contractorFormDialogOpen" :parentContractorId="contractorId"
        :contractorId="contractorToUpdate" @update:dialogOpen="contractorFormDialogOpen = $event"
        @fomSubmitted="loadSubContractors" />
</template>

<script setup>
defineOptions({ name: 'SubContractorList' })
import ContractorForm from 'components/ContractorForm.vue';
import { computed, onBeforeMount, ref, getCurrentInstance } from 'vue';
import { getProjectsByContractor } from 'src/services/projectService';
import { getSubContractorsByContractor } from 'src/services/contractorService';

const props = defineProps(['dialogOpen', 'contractorId']);
const emit = defineEmits(['update:dialogOpen']);
const projects = ref([]);
const subContractors = ref([]);
const loading = ref(false);
const contractorFormDialogOpen = ref(false);
const contractorToUpdate = ref(null);

onBeforeMount(async () => {
    const response = await getProjectsByContractor(props.contractorId);
    projects.value = response.map((project) => {
        return { label: project.name, value: project.project_id };
    });
});

const loadSubContractors = async () => {
    loading.value = true;
    try {
        subContractors.value = await getSubContractorsByContractor(props.contractorId);;
    } finally {
        loading.value = false;
    }
};

// Computed property para sincronizar la prop con el estado interno
const internalDialogOpen = computed({
    get: () => props.dialogOpen,
    set: (value) => {
        emit('update:dialogOpen', value);
    },
});

const showContractorForm = (contractorId) => {
    console.log("🚀 ~ showContractorForm ~ contractorId:", contractorId)
    contractorToUpdate.value = contractorId
    contractorFormDialogOpen.value = true
}
</script>