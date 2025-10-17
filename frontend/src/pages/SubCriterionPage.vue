<template>
  <div class="q-pa-md">
    <div class="row" v-if="subCriterions.length > 0">
      <h4 class="col-12 text-h4 q-pl-md kapa-title" >
        {{ subCriterions[0].criterion.name }}
      </h4>
      <SubCriterionCard v-for="(subCri, index) in subCriterions" :key="index" :subcriterion="subCri" :projectContractor="projectContractor" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getSubCriterionsByCriterionId } from 'src/services/subcriterionService';
import { getProjectContractorByContractorIdAndProjectId } from 'src/services/projectContractorService';
import SubCriterionCard from 'src/components/SubCriterionCard.vue';

const route = useRoute();
const idCriterion = route.params.idCriterion;
const subCriterions = ref([]);
const loading = ref(false)
const projectContractor = ref({});

onMounted(async () => {
  loading.value = true;
  projectContractor.value = await getProjectContractorByContractorIdAndProjectId(route.params.contractorId, route.params.projectId);
  const subCri = await getSubCriterionsByCriterionId(idCriterion);
  subCriterions.value = subCri.filter(sub => sub.employee_required === false);
  loading.value = false;
})

</script>
