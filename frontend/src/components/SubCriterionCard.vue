<template>
  <div class="q-pa-md">
    <q-card v-if="documents.length > 0" flat class="bg-white kapa-card-subcriterion">
      <!-- Icono de advertencia si el archivo no existe en S3 -->
      <q-icon 
        v-if="!fileExistsInS3 && documents[0].state !== 'not_applicable' && documents[0].state !== 'not_submitted'" 
        name="warning" 
        color="orange-6" 
        size="1.5em" 
        class="warning-icon"
      >
        <q-tooltip class="bg-orange-6 text-white">
          Archivo no encontrado en S3: {{ documents[0].name || 'Archivo' }}
        </q-tooltip>
      </q-icon>
      
      <q-tooltip transition-show="scale" class="bg-primary text-body2" transition-hide="scale" max-width="300px"
        anchor="center right" self="center middle" :delay="1000">
        <q-icon name="info" /> {{ subcriterion.name }}
      </q-tooltip>
      <q-icon :name="getIconName(documents[0].state)" :color="getStateColor(documents[0].state)" class="corner-icon"
        size="2em" />
      <q-card-section class="column items-center" @click="manageOpenModal">
        <div class="q-pa-md q-mt-lg text-weight-medium text-center text-truncate">
          {{ subcriterion.name }}
        </div>
        <h5 :class="`text-${getStateColor(documents[0].state)} q-ma-sm text-weight-regular text-center`">
          {{ getStateLabel(documents[0].state) }}
          <div v-if="hasExpirationDate && new Date(documents[0].endDate) >= new Date()" class="text-caption">Vence: {{
            documents[0].endDate }}</div>
          <div v-if="hasExpirationDate && new Date(documents[0].endDate) < new Date()" class="text-caption">Documento
            vencido</div>
        </h5>
      </q-card-section>
      <q-card-actions align="around" v-if="documents[0].state !== 'not_applicable'">
        <div class="q-gutter-xs row">
          <q-btn v-if="showButton(documents[0].state, true) && rol !== 4" @click="openModalUpload" size="sm" color="light-green-8"
            label="Cargar" icon="upload_file" class="col-auto" />
          
          <!-- Botón de re-subir archivo si no existe en S3 -->
          <q-btn v-if="!fileExistsInS3 && documents[0].state !== 'not_submitted' && documents[0].state !== 'not_applicable'" 
            @click="openModalReupload" size="sm" color="orange-8" :loading="isReupload"
            label="Re-subir" icon="refresh" class="col-auto" />
          
          <!-- Botón de vista previa solo si el archivo existe en S3 -->
          <q-btn v-if="fileExistsInS3 && showButton(documents[0].state, false)" @click="previewDocument" size="sm" color="blue-8" :loading="isPreview"
            label="Ver" icon="visibility" class="col-auto" />
          
          <q-btn v-if="showButton(documents[0].state, false)" @click="manageDownloads" size="sm" color="light-green-8" :loading="isDownload"
            label="Descargar" icon="download" class="col-auto" />
        </div>
      </q-card-actions>
    </q-card>
  </div>

  <!-- ? Modal Resultado -->
  <ModalForm :isOpen="modalResult" title="Resultado de la revisión" color="secondary"
    @update:isOpen="modalResult = $event">
    <q-form @submit="submitResult" @reset="resetFormResult" class="q-gutter-md">
      <p class="text-weight-medium">Estado:</p>
      <q-select outlined dense v-model="stateDoc" :options="stateOptions"
        :rules="[val => !!val || 'Debes seleccionar una opción']" option-value="value" option-label="label" emit-value
        map-options />
      <p class="text-weight-medium">Comentario:</p>
      <q-input v-model="comment" :rules="[val => !!val || 'Debes escribir un comentario']" outlined type="textarea" />
      <q-card-actions class="q-mt-md" align="right">
        <q-btn flat label="Cancelar" color="primary" @click="modalResult = false" />
        <q-btn label="Guardar" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </ModalForm>

  <!-- ? Modal Comentario -->
  <ModalForm :isOpen="modalComment" title="Comentario" color="secondary" @update:isOpen="modalComment = $event">
    <p>{{ documents[0].comments }}</p>
  </ModalForm>

  <!-- ? Modal Cargar -->
  <ModalForm :isOpen="modalUpload" :title="`Cargar ${multipleRequired ? 'documentos' : 'documento'}`" color="secondary"
    @update:isOpen="modalUpload = $event">
    <q-form @submit="fileUpload" @reset="resetFormUpload" class="q-gutter-md">
      <p class="text-weight-medium">{{ multipleRequired ? 'Selecciona los archivos:' : 'Selecciona el archivo:' }}</p>
      <q-file outlined use-chips v-model="fileInput" dense :multiple="multipleRequired">
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <div v-show="hasExpirationDate">
        <p class="text-weight-medium">Indica la vigencia del documento (fecha desde y hasta):</p>
        <q-date v-model="range" range class="full-width" :locale="kapaLocale" />
      </div>

      <q-card-actions class="q-mt-md" align="right">
        <q-btn flat label="Cancelar" color="primary" @click="modalUpload = false" />
        <q-btn label="Cargar" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </ModalForm>

  <!-- ? Modal Re-subir Archivo -->
  <ModalForm :isOpen="modalReupload" title="Re-subir archivo faltante" color="orange"
    @update:isOpen="modalReupload = $event">
    <q-form @submit="fileReupload" @reset="resetFormReupload" class="q-gutter-md">
      <div class="q-pa-md bg-orange-1 text-orange-8 rounded-borders">
        <q-icon name="warning" class="q-mr-sm" />
        El archivo <strong>{{ documents[0]?.name }}</strong> no se encuentra en el servidor S3.
        Por favor, selecciona el archivo para subirlo nuevamente.
      </div>
      
      <p class="text-weight-medium">Selecciona el archivo:</p>
      <q-file outlined use-chips v-model="reuploadFileInput" dense>
        <template v-slot:prepend>
          <q-icon name="refresh" />
        </template>
      </q-file>

      <div v-show="hasExpirationDate">
        <p class="text-weight-medium">Indica la vigencia del documento (fecha desde y hasta):</p>
        <q-date v-model="reuploadRange" range class="full-width" :locale="kapaLocale" />
      </div>

      <q-card-actions class="q-mt-md" align="right">
        <q-btn flat label="Cancelar" color="primary" @click="modalReupload = false" />
        <q-btn label="Re-subir" color="orange" type="submit" />
      </q-card-actions>
    </q-form>
  </ModalForm>

  <!-- ? Modal Vista Previa -->
  <q-dialog v-model="previewDialog" maximized>
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="col text-center text-weight-medium">
          Vista Previa: {{ props.subcriterion.name }}
        </div>
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>

      <q-card-section class="q-pa-none" style="height: calc(100vh - 50px);">
        <!-- PDF Viewer -->
        <iframe 
          v-if="isPDF()" 
          :src="previewUrl" 
          style="width: 100%; height: 100%; border: none;"
          @load="isPreview = false"
        ></iframe>

        <!-- Office Online Viewer -->
        <iframe 
          v-else-if="isOfficeDocument()" 
          :src="getOfficePreviewUrl()" 
          style="width: 100%; height: 100%; border: none;"
          @load="isPreview = false"
        ></iframe>

        <!-- Image Viewer -->
        <div v-else-if="isImage()" class="full-height flex flex-center bg-grey-1">
          <img 
            :src="previewUrl" 
            style="max-width: 100%; max-height: 100%; object-fit: contain;"
            @load="isPreview = false"
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
            @click="manageDownloads"
          />
        </div>

        <!-- Loading State -->
        <div v-if="isPreview" class="absolute-center">
          <q-spinner size="3rem" color="primary" />
          <div class="text-subtitle1 q-mt-md text-center">Cargando vista previa...</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { getDocumentsBySubcriterionId, getDocumentsByEmployeIdAndSubcriterionID } from 'src/services/documentService';
import { getCriterionById } from 'src/services/criterionService';
import { getProject } from 'src/services/projectService';
import { getContractor } from 'src/services/contractorService';
import { getEmployeeById } from 'src/services/employeesService';
import { useDocument } from 'src/composables/useDocument';
import ModalForm from './ModalForm.vue';
import { Loading, QSpinner, QSpinnerPuff } from 'quasar';

const route = useRoute();
const { proxy } = getCurrentInstance();
const authStore = useAuthStore();
const useDocumentComp = useDocument();

const props = defineProps(['subcriterion', 'projectContractor']);
const rol = ref(authStore.user.role.role_id);
const projectContractorId = ref(props.projectContractor.project_contractor_id);
const nitContractor = ref(props.projectContractor.contractor?.nit);
const nameProjet = ref(props.projectContractor.project?.name);
const employeeId = ref(route.params.idEmployee);
const employeeIdValue = employeeId.value ? employeeId.value : null;

const kapaLocale = {
  days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  daysShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
  format24h: true,
  pluralDay: 'dias',
  singularDay: 'dia',
}

const documents = ref([]);
const multipleRequired = ref(false);
const hasExpirationDate = ref(false);
const loading = ref(false)
const isDownload = ref(false);
const isPreview = ref(false);

// Variables para vista previa
const previewDialog = ref(false);
const previewUrl = ref('');
const textContent = ref('');

const stateDoc = ref(null);
const comment = ref(null);
const fileInput = ref([]);
const range = ref({});

const modalResult = ref(false);
const modalComment = ref(false);
const modalUpload = ref(false);
const modalReupload = ref(false);

// Variables para re-subir archivos
const reuploadFileInput = ref(null);
const reuploadRange = ref(null);
const fileExistsInS3 = ref(true);

const stateOptions = ref([]);
const stateOptionsAux = ref(
  [
    { label: 'Cumple', value: 'approved' },
    { label: 'No cumple', value: 'rejected' },
    { label: 'No aplica', value: 'not_applicable' },
    { label: 'Para ajuste', value: 'for_adjustment' },
  ]);

onMounted(async () => {
  await refreshSubCriterion();
});

async function refreshSubCriterion() {
  loading.value = true;
  Loading.show({
    spinner: QSpinner,
    message: 'Cargando...',
    backgroundColor: 'primary',
  })
  documents.value = employeeId.value ? await getDocumentsByEmployeIdAndSubcriterionID(employeeId.value, props.subcriterion.subcriterion_id) : await getDocumentsBySubcriterionId(props.subcriterion.subcriterion_id, projectContractorId.value);
  multipleRequired.value = props.subcriterion.multiple_required;
  hasExpirationDate.value = props.subcriterion.hasExpirationDate;
  if (!documents.value[0]) {
    documents.value[0] = { state: "not_submitted" };
  }
  
  // VERIFICACIÓN S3 DESHABILITADA - Asumir que todos los archivos existen
  // porque el bucket tiene todos los documentos migrados (21,682 archivos)
  if (documents.value.length > 0 && documents.value[0].document_id) {
    fileExistsInS3.value = true; // Asumir que existe
  } else {
    fileExistsInS3.value = false; // No hay documento cargado
  }
  
  loading.value = false;
  Loading.hide()
}

async function fileUpload() {
  Loading.show({
    spinner: QSpinnerPuff,
    message: 'Subiendo archivo...',
    backgroundColor: 'primary',
  })
  const url = await getUrl();

  await useDocumentComp.deleteCurrentDocuments(props.subcriterion.subcriterion_id, projectContractorId.value, employeeIdValue, url);

  const files = Array.isArray(fileInput.value) ? fileInput.value : [fileInput.value];
  const startDate = range.value == null ? range.value : range.value.from;
  const endDate = range.value == null ? range.value : range.value.to;


  const createDocumentPromises = files.map(async (file) => {
    await useDocumentComp.processDocument(file, projectContractorId.value, employeeIdValue, props.subcriterion.subcriterion_id, url, startDate, endDate);
  });
  await Promise.all(createDocumentPromises);

  modalUpload.value = false;
  resetFormUpload();
  await refreshSubCriterion();
  proxy.$kapaAlert({ type: 'success', message: 'Archivo cargado correctamente', title: 'Exito!' });
  Loading.hide()
}
async function manageDownloads() {
  isDownload.value = true;
  const url = await getUrl();
  await useDocumentComp.downloadDocument(props.subcriterion.subcriterion_id, projectContractorId.value, employeeIdValue, url);
  isDownload.value = false;
}
async function submitResult() {
  await useDocumentComp.uploadStateDocument(props.subcriterion.subcriterion_id, projectContractorId.value, comment.value, stateDoc.value, employeeIdValue);
  modalResult.value = false;
  resetFormResult();
  await refreshSubCriterion();
  proxy.$kapaAlert({ type: 'success', message: 'Estado del documento actualizado correctamente', title: 'Exito!' });
}

const getUrl = async () => {
    const project = await getProject(route.params.projectId);
    const contractor = await getContractor(route.params.contractorId);

    const criterion = route.params.idCriterion
        ? await getCriterionById(route.params.idCriterion)
        : route.params.typeDocs === "1" ? "Ingreso" : "Egreso";

    const employe = route.params.idCriterion
        ? route.params.idEmploye ? await getEmployeeById(route.params.idEmploye) : null
        : await getEmployeeById(route.params.idEmployee);

    const clientName = sanitize(project.client.name);
    const projectName = sanitize(project.name);
    const contractorName = sanitize(contractor.name);
    const typeDoc = employe ? sanitize(criterion) : sanitize(criterion.documentType.name);
    const criterionName = employe ? null : sanitize(criterion.name);
    const subCriterionName = sanitize(props.subcriterion.name);

    const url = employe
        ? `${clientName}/${projectName}/${contractorName}/empleados/${sanitize(employe.identification)}-${sanitize(employe.name)}/${typeDoc}/${subCriterionName}/`
        : `${clientName}/${projectName}/${contractorName}/${typeDoc}/${criterionName}/${subCriterionName}/`;

    return url;
};

const sanitize = (segment) => {
    return segment
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9()\/_\s]/g, "")
        .replace(/\//g, "_")
        .replace(/\s+/g, "-")
        .slice(0, 240);
};

// Funciones para vista previa
const getFileName = () => {
  if (documents.value && documents.value[0] && documents.value[0].name) {
    return documents.value[0].name;
  }
  return props.subcriterion.name;
};

const getFileExtension = () => {
  const fileName = getFileName();
  const extension = fileName.split('.').pop().toLowerCase();
  return extension;
};

const isPDF = () => {
  return getFileExtension() === 'pdf';
};

const isOfficeDocument = () => {
  const extension = getFileExtension();
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
};

const isImage = () => {
  const extension = getFileExtension();
  return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
};

const isText = () => {
  const extension = getFileExtension();
  return ['txt'].includes(extension);
};

const getOfficePreviewUrl = () => {
  // Para documentos de Office, usar la URL firmada directamente con Office Online Viewer
  const encodedUrl = encodeURIComponent(previewUrl.value);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
};

const previewDocument = async () => {
  isPreview.value = true;
  
  try {
    // Usar la misma lógica de descarga para obtener la URL del documento
    const url = await getUrl();
    // Pasar forPreview=true para obtener disposition=inline
    const downloadResponse = await useDocumentComp.getDocumentUrl(props.subcriterion.subcriterion_id, projectContractorId.value, employeeIdValue, url, true);
    
    if (downloadResponse && downloadResponse.url) {
      previewUrl.value = downloadResponse.url;
      previewDialog.value = true;
      
      // Si es un archivo de texto, cargar el contenido
      if (isText()) {
        try {
          const response = await fetch(previewUrl.value);
          textContent.value = await response.text();
        } catch (error) {
          textContent.value = 'Error al cargar el archivo de texto';
        }
      }
      
      // Si no necesita carga especial, quitar el loading inmediatamente
      if (!isPDF() && !isOfficeDocument() && !isText()) {
        isPreview.value = false;
      }
    } else {
      proxy.$kapaAlert({ type: 'error', message: 'No se pudo obtener la URL del documento', title: 'Error!' });
      isPreview.value = false;
    }
  } catch (error) {
    console.error('Error al obtener vista previa:', error);
    proxy.$kapaAlert({ type: 'error', message: 'Error al cargar vista previa', title: 'Error!' });
    isPreview.value = false;
  }
};

// Funciones para re-subir archivos
async function openModalReupload() {
  resetFormReupload();
  modalReupload.value = true;
}

function resetFormReupload() {
  reuploadFileInput.value = null;
  reuploadRange.value = null;
}

async function fileReupload() {
  Loading.show({
    spinner: QSpinnerPuff,
    message: 'Re-subiendo archivo...',
    backgroundColor: 'orange',
  })
  const url = await getUrl();

  const files = [reuploadFileInput.value];
  const startDate = reuploadRange.value == null ? reuploadRange.value : reuploadRange.value.from;
  const endDate = reuploadRange.value == null ? reuploadRange.value : reuploadRange.value.to;

  await useDocumentComp.uploadDocument(files, projectContractorId.value, props.subcriterion.subcriterion_id, startDate, endDate, employeeIdValue, url);
  modalReupload.value = false;
  resetFormReupload();
  await refreshSubCriterion();
  proxy.$kapaAlert({ type: 'success', message: 'Archivo re-subido correctamente', title: 'Éxito!' });
  Loading.hide()
}


function manageOpenModal() {
  const docState = documents.value[0].state;
  if (rol.value === 1 || rol.value === 2) {
    resetFormResult();
    if (docState !== 'not_submitted' && docState !== 'submitted') {
      stateDoc.value = docState;
    }
    if (docState !== 'not_submitted') {
      comment.value = documents.value[0].comments;
      stateOptions.value = stateOptionsAux.value;
      modalResult.value = true;
    }
    if (docState === 'not_submitted') {
      comment.value = documents.value[0].comments;
      stateOptions.value = stateOptionsAux.value.filter(option => option.value === 'not_applicable');
      modalResult.value = true;
    }
  } else {
    if (docState === 'rejected' || docState === 'for_adjustment') {
      modalComment.value = true;
    }
  }
};

async function openModalUpload() {
  resetFormUpload();
  modalUpload.value = true;
}
function resetFormUpload() {
  fileInput.value = null;
  range.value = null;
}
function resetFormResult() {
  stateDoc.value = null;
  comment.value = null;
}
function getStateLabel(value) {
  const states = [
    { label: 'Sin cargar', value: 'not_submitted' },
    { label: 'En revisión', value: 'submitted' },
    { label: 'Cumple', value: 'approved' },
    { label: 'No cumple', value: 'rejected' },
    { label: 'No aplica', value: 'not_applicable' },
    { label: 'Para ajuste', value: 'for_adjustment' },

  ];
  const option = states.find(option => option.value === value);
  return option ? option.label : 'Valor no encontrado';
};
function getIconName(state) {
  switch (state) {
    case 'approved':
      return 'verified';
    case 'rejected':
      return 'feedback';
    case 'submitted':
      return 'error';
    case 'not_applicable':
      return 'indeterminate_check_box';
    case 'not_submitted':
      return 'file_download_off';
    case 'for_adjustment':
      return 'edit';

    default:
      break;
  }
}

function getStateColor(state) {
  switch (state) {
    case 'approved':
      return 'green-5';
    case 'rejected':
      return 'red-5';
    case 'submitted':
      return 'kapa-blue';
    case 'not_applicable':
      return 'grey-10';
    case 'not_submitted':
      return 'grey-7';
    case 'for_adjustment':
      return 'kapa-orange';

    default:
      break;
  }
}
function showButton(state, btn) {
  const btnStates = ['not_applicable', 'not_submitted'];
  const nonBtnStates = ['submitted', 'approved'];

  if (btn) {
    return !nonBtnStates.includes(state);
  } else {
    return !btnStates.includes(state);
  }
}

</script>
<style>
.corner-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}

.kapa-card-subcriterion {
  position: relative;
  width: 18vw;
  min-width: 150px;
  min-height: 24vh;
  border-radius: 20px;
  transition: 0.2s;
}

.kapa-card-subcriterion:hover {
  transform: translate(0, -10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06) !important;
  cursor: pointer;
}

.text-truncate {
  padding: 0 10px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .kapa-card-subcriterion {
    width: 25vw;
    min-height: 25vh;
  }

  .text-truncate {
    width: 23vw;
  }
}

@media (max-width: 600px) {
  .kapa-card-subcriterion {
    width: 85vw;
    min-height: auto;
  }

  .text-truncate {
    width: 80vw;
    max-width: none;
  }
}
</style>
