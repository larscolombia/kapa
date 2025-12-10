<template>
  <q-dialog :model-value="dialogOpen" @update:model-value="$emit('update:dialogOpen', $event)" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ supportFileId ? 'Editar' : 'Agregar' }} Archivo de Soporte</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input
            filled
            v-model="supportFile.display_name"
            label="Título del documento *"
            hint="Nombre que aparecerá en la lista de soportes"
            lazy-rules
            :rules="[val => val && val.length > 0 || 'El título es obligatorio']"
          />

          <q-select
            filled
            v-model="supportFile.category"
            :options="categoryOptions"
            label="Categoría *"
            hint="¿En qué sección debe aparecer este documento?"
            emit-value
            map-options
            lazy-rules
            :rules="[val => val || 'La categoría es obligatoria']"
          />

          <div class="q-gutter-sm">
            <div class="text-subtitle2">Archivo del documento *</div>
            
            <!-- File Upload with Drag and Drop -->
            <q-file
              v-if="!props.supportFileId"
              filled
              v-model="uploadedFile"
              label="Selecciona o arrastra un archivo"
              hint="Archivos permitidos: PDF, Word, Excel, PowerPoint, Imágenes"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
              max-file-size="52428800"
              @update:model-value="handleFileUpload"
              @rejected="onFileRejected"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
              
              <template v-slot:hint>
                <div class="text-caption">
                  Tamaño máximo: 50MB | Formatos: PDF, Word, Excel, PowerPoint, Imágenes
                </div>
              </template>
              
              <template v-slot:after>
                <q-btn 
                  v-if="uploadedFile"
                  round 
                  dense 
                  flat 
                  icon="clear" 
                  @click.stop="clearFile"
                >
                  <q-tooltip>Limpiar archivo</q-tooltip>
                </q-btn>
              </template>
            </q-file>
            
            <!-- File info when editing -->
            <div v-else class="q-pa-md bg-grey-2 rounded-borders">
              <div class="row items-center">
                <q-icon :name="getFileIcon()" :color="getFileTypeColor()" size="md" class="q-mr-md" />
                <div class="col">
                  <div class="text-body1">{{ supportFile.name }}</div>
                  <div class="text-caption text-grey-7">{{ formatFileSize(supportFile.file_size) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="uploadedFile" class="q-pa-sm bg-green-1 rounded-borders">
            <div class="text-caption text-green-8">
              <q-icon name="check_circle" class="q-mr-xs" />
              Archivo seleccionado: {{ uploadedFile.name }} ({{ formatFileSize(uploadedFile.size) }})
            </div>
          </div>

          <div v-if="supportFile.file_path" class="q-pa-sm bg-blue-1 rounded-borders">
            <div class="text-caption text-blue-8">
              <q-icon name="info" class="q-mr-xs" />
              Ruta S3: {{ supportFile.file_path }}
            </div>
          </div>

          <div>
            <q-btn label="Cancelar" type="reset" color="primary" flat class="q-ml-sm" />
            <q-btn 
              :label="props.supportFileId ? 'Actualizar' : 'Crear'" 
              type="submit" 
              color="primary" 
              :loading="loading"
              :disable="!props.supportFileId && !uploadedFile"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section v-if="error" class="text-negative">
        {{ error }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onBeforeMount, ref, getCurrentInstance, watch } from 'vue';
import { getSupportFileById, createSupportFile, updateSupportFile } from 'src/services/supportService';
import { api } from 'src/boot/axios';

const { proxy } = getCurrentInstance();
const props = defineProps(['dialogOpen', 'supportFileId']);
const emit = defineEmits(['update:dialogOpen', 'formSubmitted']);

const loading = ref(false);
const error = ref(null);
const uploadedFile = ref(null);
const fileName = ref('');
const fileExtension = ref('');

const originalSupportFile = ref({
  name: '',
  display_name: '',
  category: '',
  file_path: '',
  file_size: 0,
  mime_type: '',
});

// Function to upload file using the backend endpoint
const uploadSupportFile = async (file, supportFileData) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('displayName', supportFileData.display_name);

  // Ensure we send category as a string (value) not as an object
  let categoryValue = '';
  try {
    if (!supportFileData || supportFileData.category == null) {
      categoryValue = '';
    } else if (typeof supportFileData.category === 'string') {
      categoryValue = supportFileData.category;
    } else if (typeof supportFileData.category === 'object') {
      // Prefer .value, fallback to .label
      categoryValue = supportFileData.category.value || supportFileData.category.label || JSON.stringify(supportFileData.category);
    } else {
      categoryValue = String(supportFileData.category);
    }
  } catch (e) {
    categoryValue = '';
  }

  formData.append('category', categoryValue);
  formData.append('createdBy', '1'); // TODO: usar ID del usuario actual

  const response = await fetch('/api/upload/support-file', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

const supportFile = ref({ ...originalSupportFile.value });

const categoryOptions = [
  { label: 'Apéndices', value: 'apendices' },
  { label: 'Manual de contratistas', value: 'manual_contratistas' },
  { label: 'Finalización de proyecto (dossier)', value: 'dossier' },
  { label: 'Otros', value: 'otros' },
  { label: 'Procedimientos y/o estándares EHS', value: 'ehs_procedures' },
];

const fileTypeOptions = [
  { label: 'PDF', value: 'pdf', mime: 'application/pdf' },
  { label: 'Word (.docx)', value: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'Word (.doc)', value: 'doc', mime: 'application/msword' },
  { label: 'Excel (.xlsx)', value: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { label: 'Excel (.xls)', value: 'xls', mime: 'application/vnd.ms-excel' },
  { label: 'PowerPoint (.pptx)', value: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { label: 'Imagen (.jpg)', value: 'jpg', mime: 'image/jpeg' },
  { label: 'Imagen (.png)', value: 'png', mime: 'image/png' },
  { label: 'Texto (.txt)', value: 'txt', mime: 'text/plain' },
];

const handleFileUpload = (file) => {
  if (!file) return;
  
  uploadedFile.value = file;
  
  // Auto-fill display name if empty
  if (!supportFile.value.display_name) {
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    supportFile.value.display_name = nameWithoutExt;
  }
  
  // Extract file info
  const extension = file.name.split('.').pop().toLowerCase();
  fileExtension.value = extension;
  
  // Generate unique file name with timestamp
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_');
  
  supportFile.value.name = `${timestamp}_${file.name}`;
  supportFile.value.file_path = `soportes-de-interes/${timestamp}_${file.name}`;
  supportFile.value.file_size = file.size;
  supportFile.value.mime_type = file.type;
};

const clearFile = () => {
  uploadedFile.value = null;
  supportFile.value.name = '';
  supportFile.value.file_path = '';
  supportFile.value.file_size = 0;
  supportFile.value.mime_type = '';
};

const onFileRejected = (rejectedEntries) => {
  const reasons = rejectedEntries.map(entry => {
    if (entry.failedPropValidation === 'max-file-size') {
      return 'El archivo excede el tamaño máximo de 50MB';
    }
    if (entry.failedPropValidation === 'accept') {
      return 'Tipo de archivo no permitido';
    }
    return 'Archivo rechazado';
  });
  
  proxy.$kapaAlert({ 
    type: 'error', 
    message: reasons.join(', '), 
    title: 'Error al seleccionar archivo' 
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = () => {
  if (!fileExtension.value) return 'description';
  
  const iconMap = {
    pdf: 'picture_as_pdf',
    docx: 'article',
    doc: 'article', 
    xlsx: 'table_chart',
    xls: 'table_chart',
    pptx: 'slideshow',
    jpg: 'image',
    png: 'image',
    txt: 'description'
  };
  
  return iconMap[fileExtension.value] || 'description';
};

const getFileTypeColor = () => {
  if (!fileExtension.value) return 'grey';
  
  const colorMap = {
    pdf: 'red',
    docx: 'blue',
    doc: 'blue',
    xlsx: 'green',
    xls: 'green',
    pptx: 'orange',
    jpg: 'purple',
    png: 'purple',
    txt: 'grey'
  };
  
  return colorMap[fileExtension.value] || 'grey';
};

const loadSupportFileData = async () => {
  if (props.supportFileId) {
    try {
      loading.value = true;
      const response = await getSupportFileById(props.supportFileId);
      supportFile.value = { ...response };
      
      // Parse existing file data for editing
      if (supportFile.value.name) {
        const nameParts = supportFile.value.name.split('.');
        if (nameParts.length > 1) {
          fileExtension.value = nameParts.pop();
          fileName.value = nameParts.join('.');
        } else {
          fileName.value = supportFile.value.name;
        }
      }
    } catch (err) {
      error.value = 'Error al cargar los datos del archivo de soporte';
      console.error('Error loading support file:', err);
    } finally {
      loading.value = false;
    }
  }
};

const onSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Upload file if it's a new file
    if (uploadedFile.value && !props.supportFileId) {
      try {
        const uploadResult = await uploadSupportFile(uploadedFile.value, supportFile.value);
        console.log('Archivo subido exitosamente:', uploadResult);

        // If the upload-handler already created the DB record, it will return support_file_id
        if (uploadResult && uploadResult.file && uploadResult.file.support_file_id) {
          // Update local supportFile with returned DB values
          supportFile.value.name = uploadResult.file.name || supportFile.value.name;
          supportFile.value.file_path = uploadResult.file.file_path || supportFile.value.file_path;
          supportFile.value.file_size = uploadResult.file.file_size || supportFile.value.file_size;
          supportFile.value.mime_type = uploadResult.file.mime_type || supportFile.value.mime_type;
          supportFile.value.support_file_id = uploadResult.file.support_file_id;

          proxy.$kapaAlert({ 
            type: 'success', 
            message: 'Archivo de soporte creado y subido correctamente', 
            title: '¡Éxito!' 
          });

          // Refresh list by emitting event
        } else {
          // If upload-handler didn't create the DB record, call API to create it
          await createSupportFile(supportFile.value);
          proxy.$kapaAlert({ 
            type: 'success', 
            message: 'Archivo de soporte creado y subido correctamente', 
            title: '¡Éxito!' 
          });
        }

      } catch (uploadError) {
        console.error('Error subiendo archivo:', uploadError);
        throw new Error('Error al subir el archivo: ' + uploadError.message);
      }
    } else {
      if (props.supportFileId) {
        await updateSupportFile(props.supportFileId, supportFile.value);
        proxy.$kapaAlert({ 
          type: 'success', 
          message: 'Archivo de soporte actualizado correctamente', 
          title: '¡Éxito!' 
        });
      } else {
        // No file uploaded and creating new: still create record
        await createSupportFile(supportFile.value);
        proxy.$kapaAlert({ 
          type: 'success', 
          message: 'Archivo de soporte creado correctamente', 
          title: '¡Éxito!' 
        });
      }
    }

    emit('formSubmitted');
    emit('update:dialogOpen', false);
  } catch (err) {
    error.value = err.message || err.response?.data?.message || 'Error al procesar la solicitud';
    console.error('Error submitting form:', err);
    proxy.$kapaAlert({ 
      type: 'error', 
      message: error.value, 
      title: 'Error' 
    });
  } finally {
    loading.value = false;
  }
};

const onReset = () => {
  supportFile.value = { ...originalSupportFile.value };
  uploadedFile.value = null;
  fileName.value = '';
  fileExtension.value = '';
  error.value = null;
  emit('update:dialogOpen', false);
};

watch(
  () => props.dialogOpen,
  (newVal) => {
    if (newVal) {
      loadSupportFileData();
    } else {
      // Reset form when dialog closes
      supportFile.value = { ...originalSupportFile.value };
      uploadedFile.value = null;
      fileName.value = '';
      fileExtension.value = '';
      error.value = null;
    }
  }
);
</script>

<style scoped>
.q-card {
  max-width: 600px;
}
</style>