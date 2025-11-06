<template>
  <div class="q-pa-md">
    <h4 class="text-h4 col-12 q-pl-md kapa-title text-primary">Administrador de Soportes</h4>
    
    <q-table 
      class="kapa-table" 
      flat 
      title="Archivos de Soporte" 
      :rows="rows" 
      :columns="columns" 
      row-key="support_file_id" 
      :filter="filter"
      :loading="loading" 
      :pagination="pagination" 
      :rows-per-page-options="[10,20,50,0]" 
      rows-per-page-label="Filas por página"
    >
      <template v-slot:top>
        <q-btn 
          v-if="authStore.hasPermission('supports_management', 'can_edit')" 
          class="col-xs-12 col-md-2" 
          color="light-green-8" 
          :disable="loading" 
          label="Agregar Soporte"
          icon="add"
          @click="showSupportForm()" 
        />
        <q-space />
        
        <q-select
          v-model="selectedCategory"
          :options="categoryFilterOptions"
          label="Filtrar por categoría"
          outlined
          dense
          class="q-mr-sm"
          style="min-width: 200px"
          @update:model-value="filterByCategory"
        />
        
        <q-input 
          class="col-xs-12 col-md-2" 
          placeholder="Buscar" 
          dense 
          debounce="300" 
          color="primary"
          v-model="filter"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      
      <template v-slot:no-data>
        <div class="full-width row flex-center text-primary q-gutter-sm q-pa-md">
          <q-icon class="col-12" size="5em" name="info_outline" />
          <span class="text-h5">Actualmente no hay archivos de soporte</span>
        </div>
      </template>
      
      <template v-slot:body-cell-category="props">
        <q-td :props="props">
          <q-chip 
            :color="getCategoryColor(props.row.category)" 
            text-color="white" 
            size="sm"
          >
            {{ getCategoryDisplayName(props.row.category) }}
          </q-chip>
        </q-td>
      </template>
      
      <template v-slot:body-cell-file_size="props">
        <q-td :props="props">
          {{ formatFileSize(props.row.file_size) }}
        </q-td>
      </template>
      
      <template v-slot:body-cell-mime_type="props">
        <q-td :props="props">
          <q-chip 
            :color="getFileTypeColor(props.row.name)" 
            text-color="white" 
            size="sm"
            :icon="getFileTypeIcon(props.row.name)"
          >
            {{ getFileTypeLabel(props.row.name) }}
          </q-chip>
        </q-td>
      </template>
      
      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">
          {{ formatDate(props.row.created_at) }}
        </q-td>
      </template>
      
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn 
            size="sm" 
            color="blue" 
            icon="visibility"
            round
            flat
            @click="viewSupportFile(props.row)" 
          >
            <q-tooltip>Vista Previa</q-tooltip>
          </q-btn>
          <q-btn 
            size="sm" 
            color="green" 
            icon="download"
            round
            flat
            @click="downloadFile(props.row)"
          >
            <q-tooltip>Descargar</q-tooltip>
          </q-btn>
          <q-btn 
            v-if="authStore.hasPermission('supports_management', 'can_edit')"
            size="sm" 
            color="primary" 
            icon="edit"
            round
            flat
            @click="showSupportForm(props.row.support_file_id)" 
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn 
            v-if="authStore.hasPermission('supports_management', 'can_edit')"
            size="sm" 
            color="negative" 
            icon="delete"
            round
            flat
            @click="confirmDelete(props.row)" 
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    
    <support-form 
      :dialogOpen="dialogOpen" 
      :supportFileId="supportFileToUpdate" 
      @update:dialogOpen="dialogOpen = $event" 
      @formSubmitted="loadSupportFiles" 
    />
    
    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que deseas eliminar este archivo de soporte?</span>
        </q-card-section>
        
        <q-card-section>
          <div class="text-body2">
            <strong>{{ fileToDelete?.display_name }}</strong><br>
            Esta acción no se puede deshacer.
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Eliminar" 
            color="negative" 
            @click="deleteSupportFileConfirmed" 
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Preview Dialog -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="col text-center text-weight-medium">
            Vista Previa: {{ currentPreviewFile?.display_name }}
          </div>
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 50px);">
          <!-- PDF Viewer -->
          <iframe 
            v-if="isPDF(currentPreviewFile)" 
            :src="previewUrl" 
            style="width: 100%; height: 100%; border: none;"
            @load="previewLoading = false"
          ></iframe>

          <!-- Office Online Viewer -->
          <iframe 
            v-else-if="isOfficeDocument(currentPreviewFile)" 
            :src="officePreviewUrl" 
            style="width: 100%; height: 100%; border: none;"
            @load="previewLoading = false"
          ></iframe>

          <!-- Image Viewer -->
          <div v-else-if="isImage(currentPreviewFile)" class="full-height flex flex-center bg-grey-1">
            <img 
              :src="previewUrl" 
              style="max-width: 100%; max-height: 100%; object-fit: contain;"
              @load="previewLoading = false"
            />
          </div>

          <!-- Unsupported File Type -->
          <div v-else class="full-height flex flex-center column">
            <q-icon name="description" size="5rem" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Vista previa no disponible</div>
            <div class="text-body2 text-grey-5">Este tipo de archivo no se puede previsualizar</div>
            <q-btn 
              color="primary" 
              label="Descargar archivo" 
              icon="download"
              class="q-mt-md"
              @click="downloadFile(currentPreviewFile)"
            />
          </div>

          <!-- Loading State -->
          <div v-if="previewLoading" class="absolute-center">
            <q-spinner size="3rem" color="primary" />
            <div class="text-subtitle1 q-mt-md text-center">Cargando vista previa...</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AdminSupportsPage'
});

import { onBeforeMount, ref, computed, getCurrentInstance } from 'vue';
import { getSupportFiles, deleteSupportFile, getSupportCategories } from 'src/services/supportService';
import { useAuthStore } from 'src/stores/auth';
import SupportForm from 'components/SupportForm.vue';

const { proxy } = getCurrentInstance();
const authStore = useAuthStore();

const loading = ref(false);
const deleting = ref(false);
const filter = ref('');
const selectedCategory = ref('all');
const originalRows = ref([]);
const rows = ref([]);
const dialogOpen = ref(false);
const deleteDialog = ref(false);
const supportFileToUpdate = ref(null);
const fileToDelete = ref(null);
const categories = ref([]);

// Preview variables
const previewDialog = ref(false);
const previewLoading = ref(false);
const currentPreviewFile = ref(null);
const previewUrl = ref('');
const officePreviewUrl = ref('');

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10
});

const columns = [
  { 
    name: 'display_name', 
    align: 'left', 
    label: 'Nombre', 
    field: 'display_name', 
    sortable: true,
    style: 'width: 250px'
  },
  { 
    name: 'category', 
    align: 'center', 
    label: 'Categoría', 
    field: 'category', 
    sortable: true 
  },
  { 
    name: 'file_size', 
    align: 'right', 
    label: 'Tamaño', 
    field: 'file_size', 
    sortable: true 
  },
  { 
    name: 'mime_type', 
    align: 'center', 
    label: 'Tipo', 
    field: 'mime_type', 
    sortable: true 
  },
  { 
    name: 'created_at', 
    align: 'center', 
    label: 'Fecha de creación', 
    field: 'created_at', 
    sortable: true 
  },
  { 
    name: 'actions', 
    align: 'center', 
    label: 'Acciones', 
    field: 'support_file_id',
    style: 'width: 150px'
  }
];

// Remove actions column if user doesn't have edit permissions
if (!authStore.hasPermission('supports_management', 'can_edit')) {
  columns.splice(-1, 1);
}

const categoryFilterOptions = computed(() => [
  { label: 'Todas las categorías', value: 'all' },
  ...categories.value.map(cat => ({
    label: getCategoryDisplayName(cat),
    value: cat
  }))
]);

onBeforeMount(async () => {
  await loadSupportFiles();
  await loadCategories();
});

const loadSupportFiles = async () => {
  loading.value = true;
  try {
    originalRows.value = await getSupportFiles();
    filterByCategory();
  } catch (error) {
    proxy.$kapaAlert({ 
      type: 'error', 
      message: 'Error al cargar los archivos de soporte', 
      title: 'Error' 
    });
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    categories.value = await getSupportCategories();
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

const filterByCategory = () => {
  if (selectedCategory.value === 'all') {
    rows.value = [...originalRows.value];
  } else {
    rows.value = originalRows.value.filter(row => row.category === selectedCategory.value);
  }
};

const showSupportForm = (supportFileId = null) => {
  supportFileToUpdate.value = supportFileId;
  dialogOpen.value = true;
};

const viewSupportFile = async (supportFile) => {
  currentPreviewFile.value = supportFile;
  previewLoading.value = true;
  previewDialog.value = true;
  
  try {
    // Obtener presigned URLs para vista previa
    if (isPDF(supportFile) || isImage(supportFile)) {
      previewUrl.value = await getPresignedUrlForFile(supportFile, 'inline');
    } else if (isOfficeDocument(supportFile)) {
      const signedUrl = await getPresignedUrlForFile(supportFile, 'inline');
      officePreviewUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`;
    }
    
    // If it doesn't need special loading, remove loading immediately
    if (!isPDF(supportFile) && !isOfficeDocument(supportFile) && !isImage(supportFile)) {
      previewLoading.value = false;
    }
  } catch (error) {
    console.error('Error al cargar vista previa:', error);
    previewLoading.value = false;
  }
};

// Helper to get presigned URL
const getPresignedUrlForFile = async (file, disposition = 'inline') => {
  if (!file) return '';
  
  try {
    const encodedFileKey = encodeURIComponent(file.file_path);
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/supports/presigned-url/${encodedFileKey}?disposition=${disposition}`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error obteniendo URL firmada:', error);
    return '';
  }
};

// Preview helper functions
const getFileExtension = (file) => {
  if (!file || !file.name) return '';
  return file.name.split('.').pop().toLowerCase();
};

const isPDF = (file) => {
  return getFileExtension(file) === 'pdf';
};

const isOfficeDocument = (file) => {
  const extension = getFileExtension(file);
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
};

const isImage = (file) => {
  const extension = getFileExtension(file);
  return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
};

const downloadFile = async (file) => {
  if (!file) return;
  
  try {
    const signedUrl = await getPresignedUrlForFile(file, 'attachment');
    
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = file.display_name || file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    proxy.$kapaAlert({ 
      type: 'error', 
      message: 'Error al descargar el archivo', 
      title: 'Error' 
    });
  }
};

const confirmDelete = (supportFile) => {
  fileToDelete.value = supportFile;
  deleteDialog.value = true;
};

const deleteSupportFileConfirmed = async () => {
  if (!fileToDelete.value) return;
  
  try {
    deleting.value = true;
    await deleteSupportFile(fileToDelete.value.support_file_id);
    
    proxy.$kapaAlert({ 
      type: 'success', 
      message: 'Archivo de soporte eliminado correctamente', 
      title: '¡Éxito!' 
    });
    
    deleteDialog.value = false;
    fileToDelete.value = null;
    await loadSupportFiles();
  } catch (error) {
    proxy.$kapaAlert({ 
      type: 'error', 
      message: 'Error al eliminar el archivo de soporte', 
      title: 'Error' 
    });
  } finally {
    deleting.value = false;
  }
};

const getCategoryDisplayName = (category) => {
  // Normalize category that may arrive as an object, JSON or malformed string
  const categoryMap = {
    'apendices': 'Apéndices',
    'manual_contratistas': 'Manual de contratistas',
    'otros': 'Otros',
    'procedimientos': 'Procedimientos EHS',
    'estandares': 'Estándares EHS'
  };

  if (!category && category !== 0) return '';

  // If it's already an object (edge case), prefer known props
  if (typeof category === 'object') {
    return category.label || category.value || JSON.stringify(category);
  }

  // If comes as a JSON-string, try to parse
  if (typeof category === 'string') {
    const raw = category.trim();
    // Common malformed case: "[object Object]"
    if (raw === '[object Object]') {
      return '';
    }

    // Try to detect keywords and map them
    const low = raw.toLowerCase();
    if (low.includes('manual')) return categoryMap['manual_contratistas'];
    if (low.includes('apend')) return categoryMap['apendices'];
    if (low.includes('proced')) return categoryMap['procedimientos'];
    if (low.includes('estandar')) return categoryMap['estandares'];
    if (low.includes('otro')) return categoryMap['otros'];

    // If direct map exists
    return categoryMap[raw] || raw;
  }

  return String(category);
};

const getCategoryColor = (category) => {
  const colorMap = {
    'apendices': 'blue-6',
    'manual_contratistas': 'green-6',
    'otros': 'purple-6',
    'procedimientos': 'orange-6',
    'estandares': 'red-6'
  };
  return colorMap[category] || 'grey-6';
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getFileTypeLabel = (fileName) => {
  if (!fileName) return 'Desconocido';
  
  const extension = fileName.split('.').pop().toLowerCase();
  const typeMap = {
    'pdf': 'PDF',
    'doc': 'Word',
    'docx': 'Word',
    'xls': 'Excel',
    'xlsx': 'Excel',
    'ppt': 'PowerPoint',
    'pptx': 'PowerPoint',
    'jpg': 'Imagen',
    'jpeg': 'Imagen',
    'png': 'Imagen',
    'gif': 'Imagen',
    'txt': 'Texto',
    'zip': 'Comprimido',
    'rar': 'Comprimido'
  };
  return typeMap[extension] || extension.toUpperCase();
};

const getFileTypeIcon = (fileName) => {
  if (!fileName) return 'description';
  
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'picture_as_pdf',
    'doc': 'article',
    'docx': 'article',
    'xls': 'table_chart',
    'xlsx': 'table_chart',
    'ppt': 'slideshow',
    'pptx': 'slideshow',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'txt': 'description',
    'zip': 'folder_zip',
    'rar': 'folder_zip'
  };
  return iconMap[extension] || 'description';
};

const getFileTypeColor = (fileName) => {
  if (!fileName) return 'grey-6';
  
  const extension = fileName.split('.').pop().toLowerCase();
  const colorMap = {
    'pdf': 'red-6',
    'doc': 'blue-6',
    'docx': 'blue-6',
    'xls': 'green-6',
    'xlsx': 'green-6',
    'ppt': 'orange-6',
    'pptx': 'orange-6',
    'jpg': 'purple-6',
    'jpeg': 'purple-6',
    'png': 'purple-6',
    'gif': 'purple-6',
    'txt': 'grey-7',
    'zip': 'amber-6',
    'rar': 'amber-6'
  };
  return colorMap[extension] || 'grey-6';
};
</script>

<style>
.kapa-table {
  border-radius: 20px;
}
</style>