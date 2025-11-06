<template>
  <div class="q-pa-md">
    <div class="row" v-if="subCriterions.length > 0">
      <h4 class="col-12 text-h4 q-pl-md kapa-title" >
        {{ route.params.typeDocs == 1 ? 'Ingreso' : route.params.typeDocs == 2 ? 'Egreso' : 'Desconocido' }}
        <span v-if="projectContractor.contractor" class="text-kapa-green q-ml-sm">
          - {{ projectContractor.contractor.name }}
        </span>
      </h4>
      <SubCriterionCard v-for="(subCri, index) in subCriterions" :key="index" :subcriterion="subCri" :projectContractor="projectContractor" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getSubCriterionsWithEmployeeRequired } from 'src/services/subcriterionService';
import { getProjectContractorByContractorIdAndProjectId } from 'src/services/projectContractorService';
import SubCriterionCard from 'src/components/SubCriterionCard.vue';

const route = useRoute();
const subCriterions = ref([]);
const loading = ref(false)
const projectContractor = ref({});


onMounted(async () => {
  loading.value = true;
  projectContractor.value = await getProjectContractorByContractorIdAndProjectId(route.params.contractorId, route.params.projectId);
  const subCri = await getSubCriterionsWithEmployeeRequired();
  subCriterions.value =  subCri.filter(doc => doc.criterion.documentType.type_id === parseInt(route.params.typeDocs));
  loading.value = false;
})

</script>
