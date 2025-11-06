<template>
    <div class="q-pa-md">
        <q-card flat class="bg-white row justify-between kapa-card">
            <q-card-section class="column col-12">
                <div class="title">{{ cardTitle }}</div>
                <div class="description text-weight-regular text-italic text-kapa-green">{{ cardDescription }}</div>
            </q-card-section>
            <q-card-section class="column col-12 self-end" v-if="cardIcon">
                <q-icon :name="cardIcon" size="64px" />
            </q-card-section>
            <q-card-section class="column col-12" v-if="percentage >= 0">
                <!-- Ícono de información -->
                <div class="row justify-center q-mb-sm" v-if="percentageDetails">
                    <q-icon name="info" size="20px" color="primary" class="cursor-pointer">
                        <q-tooltip 
                            class="bg-primary text-body2" 
                            anchor="top middle" 
                            self="bottom middle"
                            max-width="300px"
                        >
                            <div class="text-weight-bold q-mb-xs">Detalle del Porcentaje</div>
                            <div class="q-mb-xs">
                                <q-icon name="description" size="16px" /> 
                                Documentos cargados: <strong>{{ percentageDetails.loadedDocuments }}</strong>
                            </div>
                            <div class="q-mb-xs">
                                <q-icon name="assignment" size="16px" /> 
                                Total requerido: <strong>{{ percentageDetails.totalSubcriterions }}</strong>
                            </div>
                            <div class="q-mb-xs">
                                <q-icon name="verified" size="16px" color="green-3" /> 
                                Aprobados: <strong>{{ percentageDetails.approved }}</strong>
                            </div>
                            <div class="q-mb-xs" v-if="percentageDetails.submitted > 0">
                                <q-icon name="error" size="16px" color="blue-3" /> 
                                En revisión: <strong>{{ percentageDetails.submitted }}</strong>
                            </div>
                            <div class="q-mb-xs" v-if="percentageDetails.rejected > 0">
                                <q-icon name="feedback" size="16px" color="red-3" /> 
                                Rechazados: <strong>{{ percentageDetails.rejected }}</strong>
                            </div>
                            <div v-if="percentageDetails.notApplicable > 0">
                                <q-icon name="indeterminate_check_box" size="16px" color="grey-3" /> 
                                No aplica: <strong>{{ percentageDetails.notApplicable }}</strong>
                            </div>
                        </q-tooltip>
                    </q-icon>
                </div>
                
                <q-circular-progress show-value class="q-ma-md text-weight-bolder self-center" :value="percentage"
                    size="5vw" :color="percentage < 30 ? 'red-5' : percentage < 60 ? 'yellow-5' : 'kapa-green'" track-color="grey-3">
                    {{ percentage }} <q-icon name="percent" />
                </q-circular-progress>
            </q-card-section>
        </q-card>
    </div>
</template>
<script setup>
defineOptions({
    name: 'SimpleCard'
})
const props = defineProps(['cardTitle', 'cardDescription', 'cardIcon', 'percentage', 'percentageDetails']);
</script>
<style>
.kapa-card {
    width: 10vw;
    min-height: 12rem;
    border-radius: 20px;
    transition: 0.2s;
}

.kapa-card:hover {
    transform: translate(0, -10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06) !important;
    cursor: pointer;
}

.title {
    font-size: clamp(0.8rem, 1vw, 1.1rem) !important;
    font-weight: bold;
    line-height: 110%;
    padding-bottom: 2px;
}

@media (max-width: 600px) {
    .q-card {
        width: 85vw;
        max-width: none;
    }
}

@media (min-width: 601px) and (max-width: 1024px) {
    .title {
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@media (min-width: 1025px) {
    .title {
        -webkit-line-clamp: 3;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>