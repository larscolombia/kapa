<template>
  <div class="q-pa-sm">
    <q-card flat class="bg-white row justify-center kapa-card-lg">
      <q-card-section class="column items-center">
        <q-circular-progress show-value font-size="1.25rem" :value="value" size="min(90px, 15vw)" :thickness="0.22"
          :color="value < 30 ? 'red-5' : value < 60 ? 'yellow-5' : 'kapa-green'" track-color="grey-3" class="q-ma-md text-weight-bolder">
          {{ value }} <q-icon name="percent" />
        </q-circular-progress>
        <p class="q-pa-md text-weight-medium text-center text-truncate">
          <span v-if="criterion">{{ criterion.name }}</span>
          <span v-if="contractor && contractor.contractor">{{ contractor.contractor.name }}</span>
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
defineOptions({
  name: 'PercentageCard'
})
const props = defineProps(['criterion', 'contractor', 'value']);
</script>
<style>
.kapa-card-lg {
  width: 18vw;
  min-width: 150px;
  min-height: 24vh;
  border-radius: 20px;
  transition: 0.2s;
}

.kapa-card-lg:hover {
  transform: translate(0, -10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06) !important;
  cursor: pointer;
}

.text-truncate {
  padding: 0 10px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .kapa-card-lg {
    width: 25vw;
    min-height: 30vh;
  }

  .text-truncate {
    width: 23vw;
  }
}

@media (max-width: 600px) {
  .kapa-card-lg {
    width: 85vw;
    min-height: auto;
  }

  .text-truncate {
    width: 85vw;
    max-width: none;
  }
}
</style>
