<template>
  <div class="q-pa-md">
    <q-card flat class="bg-white file-card">
      <q-card-section class="q-pb-sm">
        <div class="file-title">{{ file.displayName }}</div>
        <div class="file-extension">{{ getFileExtension() }}</div>
      </q-card-section>
      
      <q-card-section class="text-center q-py-md">
        <div class="relative-position">
          <q-icon :name="getFileIcon()" :color="getFileColor()" size="4rem" />
          <!-- Icono de warning si el archivo no existe -->
          <q-icon 
            v-if="!fileExists"
            name="warning"
            color="orange"
            size="1.5rem"
            class="absolute-top-right"
            style="transform: translate(50%, -50%);"
          >
            <q-tooltip class="bg-orange text-white">
              Archivo no encontrado en el servidor S3
            </q-tooltip>
          </q-icon>
        </div>
      </q-card-section>
      
      <q-card-actions class="q-px-md q-pb-md">
        <q-btn 
          v-if="fileExists"
          flat 
          dense 
          icon="visibility" 
          label="Vista Previa"
          color="primary" 
          class="full-width q-mb-xs"
          @click="previewFile"
          :loading="previewLoading"
        />
        <q-btn 
          v-else
          flat 
          dense 
          icon="refresh" 
          label="Re-subir archivo"
          color="orange" 
          class="full-width q-mb-xs"
          @click="openReuploadModal"
        />
        <q-btn 
          flat 
          dense 
          icon="download" 
          label="Descargar"
          color="green" 
          class="full-width"
          @click="downloadFile"
          :disable="!fileExists"
        />
      </q-card-actions>
    </q-card>

    <!-- Modal de Vista Previa -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="col text-center text-weight-medium">
            Vista Previa: {{ file.displayName }}
          </div>
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 50px);">
          <!-- PDF Viewer -->
          <iframe 
            v-if="isPDF()" 
            :src="previewUrl" 
            style="width: 100%; height: 100%; border: none;"
            @load="previewLoading = false"
          ></iframe>

          <!-- Office Online Viewer -->
          <iframe 
            v-else-if="isOfficeDocument()" 
            :src="previewUrl" 
            style="width: 100%; height: 100%; border: none;"
            @load="previewLoading = false"
          ></iframe>

          <!-- Image Viewer -->
          <div v-else-if="isImage()" class="full-height flex flex-center bg-grey-1">
            <img 
              :src="file.url" 
              style="max-width: 100%; max-height: 100%; object-fit: contain;"
              @load="previewLoading = false"
            />
          </div>

          <!-- Text Viewer -->
          <div v-else-if="isText()" class="q-pa-md">
            <pre class="text-body1">{{ textContent }}</pre>
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
              @click="downloadFile"
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

    <!-- Modal Re-subir Archivo -->
    <q-dialog v-model="reuploadDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Re-subir archivo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-pa-md bg-orange-1 text-orange-8 rounded-borders q-mb-md">
            <q-icon name="warning" class="q-mr-sm" />
            El archivo <strong>{{ file.displayName }}</strong> no se encuentra en el servidor S3.
            Por favor, selecciona el archivo para subirlo nuevamente.
          </div>
          
          <q-file 
            v-model="reuploadFile" 
            outlined 
            label="Seleccionar archivo"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="refresh" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn 
            label="Re-subir" 
            color="orange" 
            @click="reuploadFileAction" 
            :loading="reuploadLoading"
            :disable="!reuploadFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { checkFileExists } from 'src/utils/s3Manager';

const props = defineProps(['file']);

const previewDialog = ref(false);
const previewLoading = ref(false);
const textContent = ref('');

// Variables para re-subir archivos
const reuploadDialog = ref(false);
const reuploadFile = ref(null);
const reuploadLoading = ref(false);
const fileExists = ref(true);

// Verificar si el archivo existe al montar el componente
onMounted(async () => {
  // Para archivos de Soportes de Interés (isS3), asumimos que existen
  // ya que fueron migrados correctamente a S3
  // La verificación desde el navegador falla porque el bucket es privado
  if (props.file.url && props.file.isS3) {
    fileExists.value = true; // Asumimos que existen para Soportes de Interés
  } else if (props.file.url && !props.file.isS3) {
    try {
      // Solo verificamos archivos locales o URLs públicas
      const url = new URL(props.file.url);
      const key = url.pathname.substring(1);
      fileExists.value = await checkFileExists(key);
    } catch (error) {
      console.error('Error verificando archivo:', error);
      fileExists.value = false;
    }
  }
});

const getFileExtension = () => {
  const extension = props.file.name.split('.').pop().toLowerCase();
  return extension.toUpperCase();
};

const getFileIcon = () => {
  const extension = getFileExtension().toLowerCase();
  const iconMap = {
    pdf: 'picture_as_pdf',
    doc: 'article',
    docx: 'article',
    xls: 'table_chart',
    xlsx: 'table_chart',
    ppt: 'slideshow',
    pptx: 'slideshow',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    txt: 'description',
    default: 'description'
  };
  return iconMap[extension] || iconMap.default;
};

const getFileColor = () => {
  const extension = getFileExtension().toLowerCase();
  const colorMap = {
    pdf: 'red-6',
    doc: 'blue-6',
    docx: 'blue-6',
    xls: 'green-6',
    xlsx: 'green-6',
    ppt: 'orange-6',
    pptx: 'orange-6',
    jpg: 'purple-6',
    jpeg: 'purple-6',
    png: 'purple-6',
    gif: 'purple-6',
    txt: 'grey-6',
    default: 'grey-6'
  };
  return colorMap[extension] || colorMap.default;
};

const isPDF = () => {
  return getFileExtension().toLowerCase() === 'pdf';
};

const isOfficeDocument = () => {
  const extension = getFileExtension().toLowerCase();
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
};

const isImage = () => {
  const extension = getFileExtension().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
};

const isText = () => {
  const extension = getFileExtension().toLowerCase();
  return ['txt'].includes(extension);
};

const previewUrl = ref('');

const getPreviewUrl = async () => {
  if (props.file.isS3) {
    // Para archivos S3, obtener URL firmada con disposition=inline para vista previa
    try {
      const encodedFileKey = encodeURIComponent(props.file.url);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/supports/presigned-url/${encodedFileKey}?disposition=inline`);
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error obteniendo URL firmada:', error);
      return '';
    }
  }
  return props.file.url;
};

const getOfficePreviewUrl = async () => {
  // Para archivos S3, obtener URL firmada primero con disposition=inline
  let fileUrl = props.file.url;
  if (props.file.isS3) {
    try {
      const encodedFileKey = encodeURIComponent(props.file.url);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/supports/presigned-url/${encodedFileKey}?disposition=inline`);
      const data = await response.json();
      fileUrl = data.url;
    } catch (error) {
      console.error('Error obteniendo URL firmada:', error);
      return '';
    }
  } else {
    fileUrl = window.location.origin + props.file.url;
  }
  const encodedUrl = encodeURIComponent(fileUrl);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
};

const previewFile = async () => {
  previewLoading.value = true;
  previewDialog.value = true;

  // Obtener URL de vista previa
  if (isPDF()) {
    previewUrl.value = await getPreviewUrl();
  } else if (isOfficeDocument()) {
    previewUrl.value = await getOfficePreviewUrl();
  } else if (isText()) {
    try {
      const url = await getPreviewUrl();
      const response = await fetch(url);
      textContent.value = await response.text();
    } catch (error) {
      textContent.value = 'Error al cargar el archivo de texto';
    }
  }

  // Si no necesita carga especial, quitar el loading inmediatamente
  if (!isPDF() && !isOfficeDocument() && !isText()) {
    previewLoading.value = false;
  }
};

const downloadFile = async () => {
  if (props.file.isS3) {
    try {
      // Obtener URL firmada del backend con disposition=attachment para descarga
      const encodedFileKey = encodeURIComponent(props.file.url);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/supports/presigned-url/${encodedFileKey}?disposition=attachment`);
      const data = await response.json();
      
      // Descargar usando la URL firmada
      const link = document.createElement('a');
      link.href = data.url;
      link.download = props.file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
    }
  } else {
    // Para archivos locales
    const link = document.createElement('a');
    link.href = props.file.url;
    link.download = props.file.displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Funciones para re-subir archivos
const openReuploadModal = () => {
  reuploadFile.value = null;
  reuploadDialog.value = true;
};

const reuploadFileAction = async () => {
  if (!reuploadFile.value) return;
  
  reuploadLoading.value = true;
  
  try {
    // Aquí podrías implementar la lógica de subida
    // Por ahora, simularemos que se sube correctamente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar nuevamente si el archivo existe
    if (props.file.url) {
      const url = new URL(props.file.url);
      const key = url.pathname.substring(1);
      fileExists.value = await checkFileExists(key);
    }
    
    reuploadDialog.value = false;
    // Aquí podrías mostrar un mensaje de éxito
  } catch (error) {
    console.error('Error al re-subir archivo:', error);
    // Aquí podrías mostrar un mensaje de error
  } finally {
    reuploadLoading.value = false;
  }
};
</script>

<style scoped>
.file-card {
  width: 280px;
  min-height: 250px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.file-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: #2c3e50;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6rem;
}

.file-extension {
  font-size: 0.75rem;
  font-weight: 500;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 4px;
}

@media (max-width: 600px) {
  .file-card {
    width: 100%;
    max-width: 300px;
  }
}
</style>