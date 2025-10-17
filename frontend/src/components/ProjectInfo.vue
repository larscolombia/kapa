<template>
    <q-dialog v-model="internalDialogOpen" @before-show="resetForm" @hide="resetForm">
        <q-card style="width: 600px; max-width: 80vw;">
            <q-card-section class="row q-pb-none">
                <div class="text-h6">Información del Proyecto</div>
            </q-card-section>

            <q-card-section v-if="projectInfo && projectInfo.length > 0">
                <div v-for="contractor in projectInfo" :key="contractor.contractor_id" class="q-mb-md">
                    <q-banner rounded class="bg-accent">
                        <div class="text-h6 text-primary">{{ contractor.name }}</div>
                        <div class="text-secondary"><strong>NIT:</strong> {{ contractor.nit }}</div>
                        <div class="text-secondary"><strong>Ingeniero Residente:</strong> {{ contractor.resident_engineer }}</div>
                        <div class="text-secondary"><strong>Coordinador:</strong> {{ contractor.coordinator }}</div>
                        <div class="text-secondary"><strong>Teléfono:</strong> {{ contractor.phone }}</div>
                        <div class="text-secondary"><strong>Correos Electrónicos:</strong></div>
                        <ul class="text-secondary">
                            <li v-for="email in contractor.emails" :key="email">
                                <q-icon name="mail"></q-icon> {{ email }}
                            </li>
                        </ul>
                    </q-banner>
                </div>
            </q-card-section>

            <q-card-section v-else>
                No hay contratistas asignados a este proyecto
            </q-card-section>

            <q-card-actions align="right">
                <q-btn label="Cerrar" color="primary" @click="internalDialogOpen = false" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed } from 'vue';
defineOptions({ name: 'ProjectInfo' });

const props = defineProps(['projectInfo', 'dialogOpen']);

const emit = defineEmits(['update:dialogOpen']);

const internalDialogOpen = computed({
    get: () => props.dialogOpen,
    set: (value) => emit('update:dialogOpen', value),
});

</script>

<style scoped>
ul {
    list-style-type: none;
}
</style>