<template>
  <div class="q-pa-md">
    <div class="row q-mb-md" v-if="contractor">
      <h4 class="col-12 text-h4 q-pl-md kapa-title">
        Empleados
        <span class="text-kapa-green q-ml-sm">
          - {{ contractor.name }}
        </span>
      </h4>
    </div>
    <q-table class="kapa-table q-pa-md" flat :rows="rows" :columns="columns" row-key="employee_id" :filter="filter"
      :loading="loading" selection="single" v-model:selected="selected" separator="cell">
      <template v-slot:top>
        <div class="q-gutter-sm">
          <q-btn class="col-xs-12 col-md-2" size="sm" color="kapa-blue" :disable="loading" label="Agregar Empleado"
            @click="addRowEmployee" />
          <q-btn class="col-xs-12 col-md-2" size="sm" color="kapa-orange" :disable="selected.length === 0"
            label="Eliminar Empleado" @click="deleteRowEmployee(selected[0].employee_id)" />
        </div>
        <q-space />
        <q-input class="col-xs-12 col-md-2" placeholder="Buscar" dense debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center text-primary q-gutter-sm q-pa-md">
          <q-icon class="col-12" size="5em" name="info_outline" />
          <span class="text-h5">Actualmente no hay datos para mostrar</span>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="identification" :props="props">
            {{ props.row.identification }}
            <q-popup-edit v-if="!hasDocumentsTheEmployee(props.row.employee_id)" v-model="props.row.identification"
              buttons label-set="Guardar" label-cancel="Cancelar" @update:model-value="updateRowEmployee(props.row)"
              v-slot="scope">
              <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
            <q-popup-edit v-if="!hasDocumentsTheEmployee(props.row.employee_id)" v-model="props.row.name" buttons
              label-set="Guardar" label-cancel="Cancelar" @update:model-value="updateRowEmployee(props.row)"
              v-slot="scope">
              <q-input v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="position" :props="props">
            {{ props.row.position }}
            <q-popup-edit v-model="props.row.position" buttons label-set="Guardar" label-cancel="Cancelar"
              @update:model-value="updateRowEmployee(props.row)" v-slot="scope">
              <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="actions" :props="props" class="q-gutter-sm">
            <q-btn
              @click="goTo('docsEmployees', { contractorId: $route.params.contractorId, projectId: $route.params.projectId, idEmployee: props.row.employee_id, typeDocs: 1 })"
              size="sm" color="kapa-green" label="Ingreso" icon="upload"
              :disable="disableInputFileEmployye(props.row)" />
            <q-btn
              @click="goTo('docsEmployees', { contractorId: $route.params.contractorId, projectId: $route.params.projectId, idEmployee: props.row.employee_id, typeDocs: 2 })"
              size="sm" color="primary" label="Egreso" icon="download" :disable="disableInputFileEmployye(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <ModalForm :isOpen="modalDeleteEmploye" title="Eliminar empleado" color="secondary"
      @update:isOpen="modalDeleteEmploye = $event">
      <p>¿Estás seguro de que deseas eliminar al empleado: {{ selected[0].name }} ?</p>
      <div class="q-mt-md">
        <q-btn flat label="Cancelar" color="primary" @click="modalDeleteEmploye = false" />
        <q-btn label="Eliminar" color="primary" @click="deleteEmploye(selected[0].employee_id)" />
      </div>
    </ModalForm>

    <ModalForm :isOpen="modalDeleteDocumentsAndEmploye" title="Eliminar documentos y empleado" color="secondary"
      @update:isOpen="modalDeleteDocumentsAndEmploye = $event" isFullWidth>
      <p class="text-subtitle1 text-weight-bold ">
        ¿Estás seguro de que deseas eliminar al empleado
        <span class="text-negative">{{ selected[0].name }}</span>
        y sus documentos?
      </p>
      <q-table :rows="docEmp" :columns="columnsDocs" row-key="document_id" />
      <div class="q-mt-md">
        <q-btn flat label="Cancelar" color="primary" @click="modalDeleteDocumentsAndEmploye = false" />
        <q-btn label="Eliminar" color="primary" @click="deleteDocumentsAndEmploye(selected[0].employee_id)" />
      </div>
    </ModalForm>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEmployeesByProjectContractorId, addEmployee, updateEmployee, deleteEmployee } from 'src/services/employeesService';
import { getProjectContractorByContractorIdAndProjectId } from 'src/services/projectContractorService';
import { getDocumentsByEmployeId } from 'src/services/documentService';
import { getProject } from 'src/services/projectService';
import { getContractor } from 'src/services/contractorService';
import { getEmployeeById } from 'src/services/employeesService';
import { useDocument } from 'src/composables/useDocument';
import ModalForm from 'src/components/ModalForm.vue';

const useDocumentComp = useDocument();
const router = useRouter();
const route = useRoute();

const projectContractorId = ref(null);
const contractor = ref(null);
const loading = ref(false);
const filter = ref('');
const selected = ref([]);
const employeeDocuments = ref({});
const rows = ref([]);
const columns = [
  { name: 'identification', align: 'left', label: 'No. identificación', field: 'identification', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre del empleado', field: 'name', sortable: true },
  { name: 'position', align: 'left', label: 'Posición', field: 'position', sortable: true },
  { name: 'actions', align: 'center', label: 'Acciones', field: row => row.employee_id },
];
const columnsDocs = [
  { name: 'name', align: 'left', label: 'Nombre del Documento', field: 'name', sortable: true },
  { name: 'state', align: 'left', label: 'Estado', field: 'state', format: val => mapStateToLabel(val), sortable: true },
  { name: 'criterion', align: 'left', label: 'Criterio', field: row => row.subcriterion.criterion.name, sortable: true },
  { name: 'subcriterion', align: 'left', label: 'Subcriterio', field: row => row.subcriterion.name, sortable: true },
];

const docEmp = ref(null);
const modalDeleteEmploye = ref(false);
const modalDeleteDocumentsAndEmploye = ref(false);

const stateOptions = [
  { label: 'Sin cargar', value: 'not_submitted' },
  { label: 'En revisión', value: 'submitted' },
  { label: 'Cumple', value: 'approved' },
  { label: 'No cumple', value: 'rejected' },
  { label: 'No aplica', value: 'not_applicable' },
  { label: 'Para ajuste', value: 'for_adjustment' },
];

const goTo = (routeName, params = {}) => {
  router.push({ name: routeName, params: params })
}

onMounted(async () => {
  // Cargar información del contratista y del project contractor en paralelo
  const [projectContractor, contractorData] = await Promise.all([
    getProjectContractorByContractorIdAndProjectId(route.params.contractorId, route.params.projectId),
    getContractor(route.params.contractorId)
  ]);
  
  projectContractorId.value = projectContractor.project_contractor_id;
  contractor.value = contractorData;
  await updateRowsEmployees();
});

async function updateRowsEmployees() {
  rows.value = await getEmployeesByProjectContractorId(projectContractorId.value);
}

async function addRowEmployee() {
  const employee = {
    identification: "",
    name: "",
    position: "",
    projectContractor: projectContractorId.value,
  }
  await addEmployee(employee);
  await updateRowsEmployees();
}

async function updateRowEmployee(rowEmployee) {
  const employee = {
    identification: rowEmployee.identification,
    name: rowEmployee.name,
    position: rowEmployee.position,
    projectContractor: rowEmployee.project_contractor_id,
  }
  await updateEmployee(rowEmployee.employee_id, employee);
}

async function deleteRowEmployee(idEmploye) {
  docEmp.value = await getDocumentsByEmployeId(idEmploye);
  if (docEmp.value.length <= 0) {
    modalDeleteEmploye.value = true;
  } else {
    modalDeleteDocumentsAndEmploye.value = true;
  }
}

async function deleteEmploye(idEmploye) {
  await deleteEmployee(idEmploye);
  selected.value = [];
  modalDeleteEmploye.value = false;
  await updateRowsEmployees();
}
async function deleteDocumentsAndEmploye(idEmploye) {
  const url = await getUrlFolder(idEmploye);

  await useDocumentComp.deleteDocumentsSend(docEmp.value, url);
  modalDeleteDocumentsAndEmploye.value = false;
  await deleteEmploye(idEmploye);

}

const hasDocumentsTheEmployee = (idEmploye) => {
  if (employeeDocuments.value[idEmploye] !== undefined) {
    return employeeDocuments.value[idEmploye];
  }

  getDocumentsByEmployeId(idEmploye).then(documents => {
    employeeDocuments.value[idEmploye] = documents.length >= 1;
  });

  return false;
};

const getUrlFolder = async (idEmploye) => {
  const project = await getProject(route.params.projectId);
  const contractor = await getContractor(route.params.contractorId);
  const employe = await getEmployeeById(idEmploye);

  const clientName = sanitize(project.client.name);
  const projectName = sanitize(project.name);
  const contractorName = sanitize(contractor.name);
  const employeeSegment = `${sanitize(employe.identification)}-${sanitize(employe.name)}`;

  const url = `${clientName}/${projectName}/${contractorName}/empleados/${employeeSegment}`;

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

function disableInputFileEmployye(row) {
  const requiredFields = ["name", "identification", "position"];
  for (const field of requiredFields) {
    if (!row[field]) {
      return true;
    }
  }
  return false;
}

function mapStateToLabel(state) {
  const found = stateOptions.find(option => option.value === state);
  return found ? found.label : state;
}

</script>
