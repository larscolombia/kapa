<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-12 text-h4 q-pl-md kapa-title row justify-between">
        Soportes de interés
      </h4>
    </div>
    <div class="row">
      <SimpleCard cardTitle="Manual de contratistas" cardIcon="description" @click="goTo('supportsOfInterest', 'contractors-manual')"/>
      <SimpleCard cardTitle="Apéndices" cardIcon="description" @click="goTo('supportsOfInterest', 'appendices')" />
      <SimpleCard cardTitle=" Procedimientos y/o estándares EHS" cardIcon="description" @click="goTo('supportsOfInterest', 'ehs-procedures-standards')" />
      <SimpleCard cardTitle="Finalización de proyecto (dossier)" cardIcon="description" @click="goTo('supportsOfInterest', 'dossier')" />
      <SimpleCard cardTitle="Otros" cardIcon="description" @click="goTo('supportsOfInterest', 'others')" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import SimpleCard from 'components/SimpleCard.vue';

const router = useRouter()

const goTo = (routeName, div) => {
  router.push({ name: routeName, params: { div: div } })
}

</script>
