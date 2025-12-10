<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        icon="arrow_back"
        @click="goBack"
      />
      <div class="col q-ml-sm">
        <h5 class="q-my-none">
          {{ isEditing ? 'Editar Formulario' : 'Nuevo Formulario' }}
        </h5>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner size="lg" color="primary" />
    </div>

    <!-- Editor -->
    <form-builder-editor
      v-else
      :template="template"
      @save="onSave"
      @cancel="goBack"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import formBuilderService from 'src/services/formBuilderService';
import FormBuilderEditor from 'src/components/form-builder/FormBuilderEditor.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const template = ref(null);

const isEditing = computed(() => !!route.params.id);

const loadTemplate = async () => {
  if (!route.params.id) return;
  
  loading.value = true;
  try {
    template.value = await formBuilderService.getTemplateById(route.params.id);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el formulario',
      caption: error.message,
    });
    goBack();
  } finally {
    loading.value = false;
  }
};

const onSave = (savedTemplate) => {
  $q.notify({
    type: 'positive',
    message: isEditing.value ? 'Formulario actualizado' : 'Formulario creado',
  });
  router.push({ name: 'formBuilderList' });
};

const goBack = () => {
  router.push({ name: 'formBuilderList' });
};

onMounted(() => {
  loadTemplate();
});
</script>
