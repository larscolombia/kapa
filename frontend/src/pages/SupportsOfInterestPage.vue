<template>
  <div class="q-pa-md">
    <div class="row">
      <h4 class="col-12 text-h4 q-pl-md kapa-title row justify-between">
        Soportes de interés - {{ divisionDisplayName }}
      </h4>
      <SimpleCard v-for="(file, index) in files" :key="index" :cardTitle="file.displayName" cardIcon="description"
        @click="downloadSupportOfInterest(file.url, file.displayName)" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SimpleCard from 'components/SimpleCard.vue';

const route = useRoute();
const div = route.params.div;

const importFiles = [

  { name: 'Apendice A Aplicacion y aprobacion de la empresa contratista.xlsx', category: 'appendices' },
  { name: 'Apendice B Preinicio del contrato.xlsx', category: 'appendices' },
  { name: 'Apendice C Declaracion de productos quimicos.xlsx', category: 'appendices' },
  { name: 'Apendice D Plan de trabajo en sitio.xlsx', category: 'appendices' },
  { name: 'Apendice E Lista de puntos de contacto.xlsx', category: 'appendices' },

  { name: 'Apéndice G Evaluación del Contratista.xlsx', category: 'appendices' },
  { name: 'Aceptación de manual de contratistas.docx', category: 'contractors-manual' },
  { name: 'Manual de contratistas versión 8.pdf', category: 'contractors-manual' },
  { name: 'Lista de chequeo de finalización de contratación (Dossier).DOCX', category: 'dossier' },
  { name: 'Formato Reporte final EHS O-I proyecto (Dossier).xlsx', category: 'dossier' },
  { name: 'Solicitud de Ingreso Personal Contratista.xlsx', category: 'others' },
  { name: 'Estandares de alto riesgo.pdf', category: 'ehs-procedures-standards' },
  { name: 'Estándar Diseño Escaleras Barandas Pasamanos y Controles Acceso.pdf', category: 'ehs-procedures-standards' },
  { name: 'Procedimiento para Izar Cargas.pdf', category: 'ehs-procedures-standards' },
  { name: 'Procedimiento para Trabajo en alturas Actualización.pdf', category: 'ehs-procedures-standards' },
  { name: 'Procedimiento para Trabajo en Espacio Confinado.pdf', category: 'ehs-procedures-standards' },
  { name: 'Procedimiento para trabajos en caliente.pdf', category: 'ehs-procedures-standards' },
];

const division = [
  { name: 'appendices', displayName: 'Apéndices' },
  { name: 'contractors-manual', displayName: 'Manual de contratistas' },
  { name: 'dossier', displayName: 'Finalización de proyecto (dossier)' },
  { name: 'others', displayName: 'Otros' },
  { name: 'ehs-procedures-standards', displayName: 'Procedimientos y/o estándares EHS' },
];

const files = ref([]);
const divisionDisplayName = ref('');

onMounted(() => {
  const foundDivision = division.find(d => d.name === div);
  divisionDisplayName.value = foundDivision?.displayName || 'Categoría no encontrada';

  files.value = importFiles
    .filter(file => file.category === div)
    .map(file => ({
      displayName: file.name.substring(0, file.name.lastIndexOf('.')),
      name: file.name,
      url: `/soportes-de-interes/${file.name}`
    }));
});

function downloadSupportOfInterest(url, displayName) {
  const link = document.createElement('a');
  link.href = url;
  link.download = displayName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>
