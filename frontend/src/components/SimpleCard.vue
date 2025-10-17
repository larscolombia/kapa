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
                <q-circular-progress show-value class="q-ma-md text-weight-bolder self-center" :value="percentage"
                    size="5vw" :color="percentage < 30 ? 'red-5' : value < 60 ? 'yellow-5' : 'kapa-green'" track-color="grey-3">
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
const props = defineProps(['cardTitle', 'cardDescription', 'cardIcon', 'percentage']);
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