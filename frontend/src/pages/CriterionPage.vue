<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-12 text-h4 q-pl-md kapa-title row items-center">
        <span class="q-mr-auto">
          Ingreso
          <span v-if="contractor" class="text-kapa-green q-ml-sm">
            - {{ contractor.name }}
          </span>
        </span>
        <div class="q-gutter-md">
          <q-btn v-if="authStore.hasPermission('send_results', 'can_view')" class="q-mr-sm" color="light-green-8"
            label="Enviar resultados" :loading="loading" @click="sendRes" />
          <q-btn v-if="authStore.hasPermission('send_notification', 'can_view')" color="light-green-8" label="Notificar"
            :loading="loadingNot" @click="sendNot" />
        </div>
      </h4>

      <PercentageCard
        @click="goTo('subcriterion', { idCriterion: crit.criterion_id, contractorId: $route.params.contractorId, projectId: $route.params.projectId })"
        v-for="(crit, index) in incomeCriterions" :key="index" :criterion="crit" :value="crit.approvalPercentage" />
    </div>

    <div class="row">
      <h3 class="text-h4 col-12 q-pl-md kapa-title">Egreso</h3>
      <PercentageCard
        @click="goTo('subcriterion', { idCriterion: crit.criterion_id, contractorId: $route.params.contractorId, projectId: $route.params.projectId })"
        v-for="(crit, index) in egressCriterions" :key="index" :criterion="crit" :value="crit.approvalPercentage" />
    </div>

    <div class="row">
      <h3 class="text-h4 col-12 q-pl-md kapa-title">Empleados</h3>
      <q-card flat class="bg-white row justify-center kapa-card-lg"
        @click="goTo('employees', { contractorId: $route.params.contractorId, projectId: $route.params.projectId })">
        <q-card-section class="column items-center">
          <q-icon name="groups" size="9em" />
          <p class="q-pa-md text-weight-medium text-center text-truncate">
            <span>Documentos por empleado</span>
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, getCurrentInstance } from 'vue';
import { getCriterionsByProjectContractor } from 'src/services/criterionService.js';
import { getProject } from 'src/services/projectService';
import { sendResults } from 'src/services/contractorService.js';
import { getContractor } from 'src/services/contractorService.js';
import { sendNotification } from 'src/services/documentService';
import PercentageCard from 'src/components/PercentageCard.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const { proxy } = getCurrentInstance();
const router = useRouter();
const $route = router.currentRoute.value;
const allCriterions = ref(null);
const incomeCriterions = ref(null);
const egressCriterions = ref(null);
const loading = ref(false);
const loadingNot = ref(false);
const contractor = ref(null);

onBeforeMount(async () => {
  loading.value = true;
  
  // Cargar criterios y contratista en paralelo
  const [criterions, contractorData] = await Promise.all([
    getCriterionsByProjectContractor($route.params.projectId, $route.params.contractorId),
    getContractor($route.params.contractorId)
  ]);
  
  allCriterions.value = criterions;
  contractor.value = contractorData;
  incomeCriterions.value = allCriterions.value.filter(crit => crit.documentType.type_id === 1);
  egressCriterions.value = allCriterions.value.filter(crit => crit.documentType.type_id === 2);
  loading.value = false;
})

const goTo = (routeName, params = {}) => {
  router.push({ name: routeName, params: params })
}

const sendRes = async () => {
  try {
    loading.value = true;
    const requestObject = {
      projectId: $route.params.projectId,
      contractorId: $route.params.contractorId,
      email: import.meta.env.VITE_EMAIL_DEFAULT,
    }
    await sendResults(requestObject);
    proxy.$kapaAlert({ type: 'success', message: 'Se han enviado los resultados correctamente', title: 'Exito!' });
  } catch (error) {
    console.log(error);
    proxy.$kapaAlert({ type: 'error', message: error.message, title: 'Error!' });
  } finally {
    loading.value = false;
  }
}
const sendNot = async () => {
  try {
    loadingNot.value = true;

    const { projectId, contractorId } = $route.params;
    const project = await getProject(projectId);

    const emailMap = {
      1: import.meta.env.VITE_EMAIL_PLANTA_SOACHA,
      2: import.meta.env.VITE_EMAIL_PLANTA_COGUA,
    };

    const email = emailMap[project.client.client_id];
    if (!email) {
      throw new Error("No se encontró un correo electrónico válido para este cliente.");
    }
    const requestObject = {
      projectId,
      contractorId,
      email,
    };
    const not = await sendNotification(requestObject);
    proxy.$kapaAlert(not);
  } catch (error) {
    console.log(error);
    proxy.$kapaAlert({ type: 'error', message: error.message, title: 'Error!' });
  } finally {
    loadingNot.value = false;
  }
}
</script>
