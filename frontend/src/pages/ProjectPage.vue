<template>
  <q-page padding>
    <h4 class="text-h4 col-12 q-pl-md kapa-title">Proyectos</h4>
    <div class="row q-gutter-md">
      <q-card v-for="(pro, index) in projects" :key="index" flat class="bg-white row justify-center kapa-card" @click="goTo(pro.project_id)" bordered>
        <q-card-section class="column items-center">
          <h5 class="q-pa-md text-weight-medium text-center text-truncate">
            {{ pro.name }}
          </h5>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { getProjects } from 'src/services/projectService';
import { useRouter } from 'vue-router';

const projects = ref(null);
const loading = ref(false);

onBeforeMount(async () => {
  loading.value = true;
  projects.value = await getProjects();
  console.log(projects.value);

  loading.value = false;
})

const router = useRouter();
function goTo(idProject){
  router.push(`project/${idProject}/contractor/`);
}

</script>
<style>
.kapa-card {
  width: 18vw;
  min-width: 150px;
  height: 24vh;
  border-radius: 2px;
  transition: 0.2s;
}

.kapa-card:hover {
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
  .kapa-card {
    width: 25vw;
    height: 25vh;
  }

  .text-truncate {
    width: 23vw;
  }
}

@media (max-width: 600px) {
  .kapa-card {
    width: 85vw;
    height: auto;
  }

  .text-truncate {
    width: 85vw;
    max-width: none;
  }
}
</style>
