<template>
  <q-page padding>
    <div class="row"
      v-if="authStore.hasPermission('user_management', 'can_view') || authStore.hasPermission('project_management', 'can_view') || authStore.hasPermission('contractor_management', 'can_view')">
      <h4 class="text-h4 col-12 q-pl-md kapa-title">Administración</h4>
      <simple-card v-if="authStore.hasPermission('user_management', 'can_view')" cardTitle="Administración de usuarios"
        cardIcon="people_alt" @click="goTo('adminUsers')" />
      <simple-card v-if="authStore.hasPermission('project_management', 'can_view')"
        cardTitle="Administración de proyectos" cardIcon="design_services" @click="goTo('adminProjects')" />
      <simple-card v-if="authStore.hasPermission('contractor_management', 'can_view')"
        cardTitle="Administración de contratistas" cardIcon="engineering" @click="goTo('adminContractors')" />
    </div>
    <div class="row">
      <h3 class="text-h4 col-12 q-pl-md kapa-title">Clientes</h3>
      <simple-card cardTitle="Owens Illinois - Planta Peldar Soacha" cardIcon="assignment"
        @click="goTo('clientProjects', { clientId: 1 })" />
      <simple-card cardTitle="Owens Illinois - Planta Peldar Cogua" cardIcon="assignment"
        @click="goTo('clientProjects', { clientId: 2 })" />
    </div>
  </q-page>
</template>

<script setup>
import SimpleCard from 'components/SimpleCard.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
const authStore = useAuthStore();
defineOptions({
  name: 'IndexPage'
});

const router = useRouter();
const goTo = (routeName, params = {}) => {
  if (Object.keys(params).length > 0) {
    router.push({ name: routeName, params: params })
  } else {
    router.push({ name: routeName })
  }
}

</script>
