<template>
  <q-page padding>
    <div class="row">
      <!-- Título y campo de búsqueda -->
      <h4 class="text-h4 col-12 q-pl-md kapa-title row">
        <span>Contratistas del proyecto - <span class="text-kapa-green text-bold"> {{ project.name }} </span></span>
        <q-space />
        <q-input outlined debounce="300" v-model="searchTerm" placeholder="Buscar contratista..." dense class="col-3"
          clearable />
      </h4>

      <!-- Iterar contratistas -->
      <div v-if="hasParentContractors">
        <div v-for="(parentContractor, index) in filteredContractors" :key="index"
          class="col-12 row q-pb-xl items-center">
          <!-- Contratista padre -->
          <span class="col-12 q-pl-md text-italic divider">
            Contratista: {{ parentContractor.name }}
          </span>
          <simple-card :cardTitle="parentContractor.name" :percentage="parentContractor.completition_percentage || 0"
            @click="goTo('criterion', { contractorId: parentContractor.contractor_id, projectId: $route.params.projectId })"
            :cardDescription="'Contratista principal'" />

          <!-- Subcontratistas -->
          <simple-card v-for="(child, childIndex) in parentContractor.children" :key="childIndex"
            :cardTitle="child.name" :percentage="child.completition_percentage || 0" :cardDescription="'Subcontratista'"
            @click="goTo('criterion', { contractorId: child.contractor_id, projectId: $route.params.projectId })" />
        </div>
      </div>
      
      <!-- Mostrar todos los contratistas cuando no hay padres -->
      <div v-else class="col-12 row q-pb-xl items-center">
        <simple-card v-for="(contractor, index) in filteredContractors" :key="index" :cardTitle="contractor.name"
          :percentage="contractor.completition_percentage || 0"
          @click="goTo('criterion', { contractorId: contractor.contractor_id, projectId: $route.params.projectId })"
          :cardDescription="'Subcontratista'" />
      </div>

      <!-- Mensaje de error -->
      <h5 v-if="errorMessage" class="text-h5 text-yellow-10 col-12 q-pl-md">
        <q-icon name="warning" /> {{ errorMessage }}
      </h5>
    </div>
  </q-page>
</template>

<script setup>
defineOptions({ name: 'ProjectContractorsPage' });
import { onBeforeMount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getProject, getProjectContractors } from 'src/services/projectService';
import SimpleCard from 'components/SimpleCard.vue';

const router = useRouter();
const $route = router.currentRoute.value;
const project = ref({});
const projectContractors = ref([]);
const groupedContractors = ref([]); // Contratistas agrupados
const hasParentContractors = ref(false); // Indica si hay contratistas padres
const errorMessage = ref('');
const searchTerm = ref(''); // Valor de búsqueda

onBeforeMount(async () => {
  try {
    project.value = await getProject($route.params.projectId);
    const contractors = await getProjectContractors($route.params.projectId);
    projectContractors.value = contractors;

    // Agrupar contratistas si hay padres
    if (contractors.some(c => c.parent_contractor === null)) {
      groupedContractors.value = groupContractors(contractors);
      hasParentContractors.value = true;
    } else {
      groupedContractors.value = contractors; // No hay padres, mostrar todos los contratistas
      hasParentContractors.value = false;
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
});

// Función para agrupar contratistas
const groupContractors = (contractors) => {
  const parents = contractors.filter(c => c.parent_contractor === null);
  const children = contractors.filter(c => c.parent_contractor !== null);

  // Agregar hijos a cada padre
  return parents.map(parent => ({
    ...parent,
    children: children.filter(child => child.parent_contractor === parent.contractor_id)
  }));
};

// Computed para filtrar contratistas por nombre
const filteredContractors = computed(() => {
  if (!searchTerm.value) {
    return groupedContractors.value;
  }

  const term = searchTerm.value.toLowerCase();

  if (hasParentContractors.value) {
    return groupedContractors.value
      .map(parent => {
        // Filtrar hijos por nombre
        const filteredChildren = parent.children.filter(child =>
          child.name.toLowerCase().includes(term)
        );

        // Incluir al padre si coincide o si tiene hijos coincidentes
        if (parent.name.toLowerCase().includes(term) || filteredChildren.length > 0) {
          return { ...parent, children: filteredChildren };
        }

        return null;
      })
      .filter(parent => parent !== null); // Eliminar padres que no cumplen con el filtro
  } else {
    return groupedContractors.value.filter(contractor =>
      contractor.name.toLowerCase().includes(term)
    );
  }
});

const goTo = (routeName, params = {}) => {
  router.push({ name: routeName, params: params });
};
</script>

<style scoped lang="scss">
.divider {
  font-size: 21px;
  display: flex;
  align-items: center;
  color: $secondary;
}

.divider::before,
.divider::after {
  flex: 1;
  content: '';
  padding: 1px;
  background-color: $secondary;
  margin: 5px;
}
</style>
