<template>
  <div class="dynamic-forms-section">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-pa-md">
      <q-spinner size="sm" color="primary" class="q-mr-sm" />
      <span class="text-grey">Cargando formularios...</span>
    </div>

    <!-- Sin formularios -->
    <div v-else-if="forms.length === 0" class="text-grey text-center q-pa-md">
      <q-icon name="assignment" size="32px" class="q-mb-sm" />
      <div>No hay formularios configurados para esta clasificación</div>
    </div>

    <!-- Lista de formularios -->
    <template v-else>
      <div
        v-for="form in forms"
        :key="form.form_template_id"
        class="form-card q-mb-md"
      >
        <q-expansion-item
          :label="form.name"
          :caption="form.description"
          :icon="getSubmissionStatus(form.form_template_id).icon"
          :header-class="getSubmissionStatus(form.form_template_id).class"
          expand-separator
          default-opened
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon
                :name="getSubmissionStatus(form.form_template_id).icon"
                :color="getSubmissionStatus(form.form_template_id).color"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ form.name }}</q-item-label>
              <q-item-label caption>{{ form.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="getSubmissionStatus(form.form_template_id).badgeColor"
                :label="getSubmissionStatus(form.form_template_id).label"
              />
            </q-item-section>
          </template>

          <q-card>
            <q-card-section>
              <!-- Modo lectura -->
              <template v-if="readonly || hasSubmission(form.form_template_id)">
                <form-renderer
                  :schema="form.schema"
                  :model-value="getSubmissionData(form.form_template_id)"
                  :readonly="true"
                  :show-submit-button="false"
                />
                <div v-if="!readonly && hasSubmission(form.form_template_id)" class="q-mt-md">
                  <q-btn
                    flat
                    color="primary"
                    icon="edit"
                    label="Editar respuestas"
                    @click="editForm(form)"
                  />
                </div>
              </template>

              <!-- Modo edición -->
              <template v-else>
                <form-renderer
                  :schema="form.schema"
                  v-model="formDataMap[form.form_template_id]"
                  :readonly="false"
                  :show-submit-button="false"
                />
                <div class="row q-mt-md q-gutter-sm justify-end">
                  <q-btn
                    flat
                    label="Guardar borrador"
                    :loading="savingDraft[form.form_template_id]"
                    @click="saveDraft(form)"
                  />
                  <q-btn
                    color="primary"
                    label="Guardar"
                    icon="save"
                    :loading="submitting[form.form_template_id]"
                    @click="submitForm(form)"
                  />
                </div>
              </template>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </template>

    <!-- Dialog de edición -->
    <q-dialog v-model="editDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Editar: {{ editingForm?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelEdit" />
        </q-card-section>
        <q-card-section v-if="editingForm">
          <form-renderer
            :schema="editingForm.schema"
            v-model="editFormData"
            :readonly="false"
            :show-submit-button="false"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelEdit" />
          <q-btn
            color="primary"
            label="Guardar cambios"
            icon="save"
            :loading="submitting[editingForm?.form_template_id]"
            @click="updateSubmission"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import formBuilderService from 'src/services/formBuilderService';
import FormRenderer from './FormRenderer.vue';

const props = defineProps({
  clasificacionId: {
    type: Number,
    required: true,
  },
  reportId: {
    type: Number,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['formSubmitted', 'formUpdated']);

const $q = useQuasar();

// State
const loading = ref(true);
const forms = ref([]);
const submissions = ref([]);
const formDataMap = reactive({});
const submitting = reactive({});
const savingDraft = reactive({});
const editDialog = ref(false);
const editingForm = ref(null);
const editFormData = ref({});

// Cargar formularios y submissions
const loadData = async () => {
  loading.value = true;
  try {
    // Cargar formularios asociados a la clasificación
    forms.value = await formBuilderService.getTemplatesByClassification(props.clasificacionId);

    // Cargar submissions existentes para este reporte
    submissions.value = await formBuilderService.getSubmissionsByReport(props.reportId);

    // Inicializar formDataMap con submissions existentes o borradores
    for (const form of forms.value) {
      const existingSubmission = submissions.value.find(
        s => s.form_template_id === form.form_template_id
      );
      
      if (existingSubmission) {
        formDataMap[form.form_template_id] = { ...existingSubmission.data };
      } else {
        // Intentar cargar borrador
        try {
          const draft = await formBuilderService.getDraft(form.form_template_id, props.reportId);
          if (draft) {
            formDataMap[form.form_template_id] = { ...draft.data };
          } else {
            formDataMap[form.form_template_id] = {};
          }
        } catch {
          formDataMap[form.form_template_id] = {};
        }
      }
    }
  } catch (error) {
    console.error('Error loading forms:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar formularios',
      caption: error.message,
    });
  } finally {
    loading.value = false;
  }
};

// Verificar si tiene submission
const hasSubmission = (templateId) => {
  return submissions.value.some(s => s.form_template_id === templateId);
};

// Obtener datos de submission
const getSubmissionData = (templateId) => {
  const submission = submissions.value.find(s => s.form_template_id === templateId);
  return submission?.data || {};
};

// Estado de la submission
const getSubmissionStatus = (templateId) => {
  const submission = submissions.value.find(s => s.form_template_id === templateId);
  
  if (submission) {
    return {
      icon: 'check_circle',
      color: 'positive',
      badgeColor: 'positive',
      label: 'Completado',
      class: 'bg-green-1',
    };
  }
  
  if (formDataMap[templateId] && Object.keys(formDataMap[templateId]).length > 0) {
    return {
      icon: 'edit_note',
      color: 'warning',
      badgeColor: 'warning',
      label: 'En progreso',
      class: 'bg-orange-1',
    };
  }
  
  return {
    icon: 'radio_button_unchecked',
    color: 'grey',
    badgeColor: 'grey',
    label: 'Pendiente',
    class: '',
  };
};

// Guardar borrador
const saveDraft = async (form) => {
  savingDraft[form.form_template_id] = true;
  try {
    await formBuilderService.saveDraft({
      form_template_id: form.form_template_id,
      inspeccion_report_id: props.reportId,
      data: formDataMap[form.form_template_id],
    });
    
    $q.notify({
      type: 'info',
      message: 'Borrador guardado',
      icon: 'save',
      timeout: 2000,
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar borrador',
      caption: error.message,
    });
  } finally {
    savingDraft[form.form_template_id] = false;
  }
};

// Enviar formulario
const submitForm = async (form) => {
  submitting[form.form_template_id] = true;
  try {
    const result = await formBuilderService.submitForm({
      form_template_id: form.form_template_id,
      inspeccion_report_id: props.reportId,
      data: formDataMap[form.form_template_id],
      status: 'completed',
    });
    
    // Actualizar submissions locales
    submissions.value.push(result);
    
    $q.notify({
      type: 'positive',
      message: `Formulario "${form.name}" guardado correctamente`,
    });
    
    emit('formSubmitted', result);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar formulario',
      caption: error.message,
    });
  } finally {
    submitting[form.form_template_id] = false;
  }
};

// Editar formulario existente
const editForm = (form) => {
  editingForm.value = form;
  editFormData.value = { ...getSubmissionData(form.form_template_id) };
  editDialog.value = true;
};

const cancelEdit = () => {
  editDialog.value = false;
  editingForm.value = null;
  editFormData.value = {};
};

// Actualizar submission existente
const updateSubmission = async () => {
  if (!editingForm.value) return;
  
  const templateId = editingForm.value.form_template_id;
  submitting[templateId] = true;
  
  try {
    const existingSubmission = submissions.value.find(
      s => s.form_template_id === templateId
    );
    
    if (existingSubmission) {
      await formBuilderService.updateSubmission(existingSubmission.form_submission_id, {
        data: editFormData.value,
        status: 'completed',
      });
      
      // Actualizar local
      existingSubmission.data = { ...editFormData.value };
      formDataMap[templateId] = { ...editFormData.value };
    }
    
    $q.notify({
      type: 'positive',
      message: 'Formulario actualizado correctamente',
    });
    
    cancelEdit();
    emit('formUpdated', existingSubmission);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar',
      caption: error.message,
    });
  } finally {
    submitting[templateId] = false;
  }
};

// Watch para recargar cuando cambia la clasificación
watch(() => props.clasificacionId, () => {
  loadData();
});

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.form-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
