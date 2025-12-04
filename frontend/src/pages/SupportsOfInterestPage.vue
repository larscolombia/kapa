<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-12 text-h4 q-pl-md kapa-title row justify-between">
        Soportes de interés - {{ divisionDisplayName }}
      </h4>
    </div>
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner color="primary" size="3em" />
    </div>
    <div v-else class="row q-gutter-md justify-start">
      <FileCard 
        v-for="(file, index) in files" 
        :key="index" 
        :file="file"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import FileCard from 'components/FileCard.vue';
import { getSupportsByCategoryService } from 'src/services/supportsService';
import { Notify } from 'quasar';

const route = useRoute();
const div = route.params.div;

// Mapeo de categorías de URL a categorías de DB
const categoryMapping = {
  'appendices': 'apendices',
  'contractors-manual': 'manual_contratistas',
  'dossier': 'dossier',
  'others': 'otros',
  'ehs-procedures-standards': 'ehs_procedures'
};

const division = [
  { name: 'appendices', displayName: 'Apéndices' },
  { name: 'contractors-manual', displayName: 'Manual de contratistas' },
  { name: 'dossier', displayName: 'Finalización de proyecto (dossier)' },
  { name: 'others', displayName: 'Otros' },
  { name: 'ehs-procedures-standards', displayName: 'Procedimientos y/o estándares EHS' },
];

const files = ref([]);
const divisionDisplayName = ref('');
const loading = ref(false);

const loadFiles = async () => {
  loading.value = true;
  try {
    const dbCategories = categoryMapping[div];
    console.log('📁 Categoría URL:', div);
    console.log('📁 Categoría DB mapeada:', dbCategories);
    let allFiles = [];
    
    if (Array.isArray(dbCategories)) {
      // Si hay múltiples categorías, obtener archivos de todas
      for (const category of dbCategories) {
        console.log('📥 Obteniendo archivos de categoría:', category);
        const response = await getSupportsByCategoryService(category);
        console.log('📦 Respuesta recibida:', response);
        if (Array.isArray(response)) {
          allFiles = [...allFiles, ...response];
        }
      }
    } else {
      // Categoría única
      const category = dbCategories || div;
      console.log('📥 Obteniendo archivos de categoría única:', category);
      const response = await getSupportsByCategoryService(category);
      console.log('📦 Respuesta recibida:', response);
      allFiles = Array.isArray(response) ? response : [];
    }
    
    console.log('📚 Total archivos antes de mapear:', allFiles.length);
    
    files.value = allFiles.map(file => ({
      displayName: file.display_name,
      name: file.name,
      url: file.file_path,
      support_file_id: file.support_file_id,
      isS3: true
    }));
    
    console.log('✅ Archivos mapeados:', files.value.length);
  } catch (error) {
    console.error('❌ Error cargando archivos:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al cargar los archivos de soporte',
      position: 'top-right'
    });
    files.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const foundDivision = division.find(d => d.name === div);
  divisionDisplayName.value = foundDivision?.displayName || 'Categoría no encontrada';
  
  await loadFiles();
});
</script>
