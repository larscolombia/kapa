<template>
  <q-page padding>
    <div class="row">
      <h4 class="text-h4 col-12 q-pl-md kapa-title">
        Proyectos del cliente - <span class="text-kapa-green text-bold"> {{ client.name }} </span>
      </h4>
      <simple-card v-for="project, index in clientProjects" :key="index" :cardTitle="project.name"
        cardIcon="folder_shared" @click="goTo('projectContractors', { projectId: project.project_id })" />
      <h5 v-if="errorMessage" class="text-h5 text-yellow-10 col-12 q-pl-md">
        <q-icon name="warning" /> {{ errorMessage }}
      </h5>
    </div>
  </q-page>
</template>

<script setup>
defineOptions({ name: 'ClientProjectsPage' });
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getClient, getClientProjects } from 'src/services/clientService';
import SimpleCard from 'components/SimpleCard.vue';

const router = useRouter();
const $route = router.currentRoute.value;
const client = ref({});
const clientProjects = ref([]);
const errorMessage = ref('');

onBeforeMount(async () => {
  try {
    client.value = await getClient($route.params.clientId);
    clientProjects.value = await getClientProjects($route.params.clientId);
  } catch (error) {
    errorMessage.value = error.message;
  }
})

const goTo = (routeName, params = {}) => {
  router.push({ name: routeName, params: params })
}

</script>
