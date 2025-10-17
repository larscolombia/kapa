<template>
    <div class="q-pa-md">
        <h4 class="text-h4 col-12 q-pl-md kapa-title text-primary">Administración de usuarios</h4>
        <q-table class="kapa-table" flat title="Treats" :rows="rows" :columns="columns" row-key="id" :filter="filter"
            :loading="loading" :pagination="pagination" :rows-per-page-options="[5,10,20,0]" rows-per-page-label="Filas por página">
            <template v-slot:top>
                <q-btn v-if="authStore.hasPermission('user_management', 'can_edit')" class="col-xs-12 col-md-2" color="light-green-8" :disable="loading" label="Agregar usuario"
                    @click="showUserForm(0)" />
                <q-space />
                <q-input class="col-xs-12 col-md-2" placeholder="Buscar" dense debounce="300" color="primary"
                    v-model="filter">
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
            <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                    <q-btn size="sm" color="primary" label="editar" icon="edit"
                        @click="showUserForm(props.row.user_id)" />
                </q-td>
            </template>

            <template v-slot:body-cell-state="props">
                <q-td :props="props" class="q-gutter-x-sm text-center">
                    <q-chip size="sm" :color="props.row.state === 'active' ? 'light-green-8' : 'red-5'"
                        :label="props.row.state === 'active' ? 'Activo' : 'Inactivo'" text-color="white"></q-chip>
                </q-td>
            </template>
        </q-table>
        <user-form :dialogOpen="dialogOpen" :userId="userToUpdate" @update:dialogOpen="dialogOpen = $event" @fomSubmitted="loadUsers" />
    </div>
</template>

<script setup>
defineOptions({
    name: 'UsersPage'
});
import { onBeforeMount, ref } from 'vue'
import { getUsers } from 'src/services/userService';
import UserForm from 'components/UserForm.vue';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const loading = ref(false)
const filter = ref('')
const originalRows = ref([])
const rows = ref([])
const dialogOpen = ref(false)
const userToUpdate = ref(null)

const columns = [
    { name: 'name', align: 'left', label: 'Nombre del usuario', field: 'name', sortable: true },
    { name: 'email', align: 'left', label: 'Correo del usuario', field: 'email', sortable: true },
    { name: 'role', align: 'left', label: 'Rol', field: row => row.role.name },
    { name: 'state', align: 'center', label: 'Estado', field: 'state' },
    { name: 'actions', align: 'center', label: 'Acciones', field: row => row.user_id }
]
if(!authStore.hasPermission('user_management', 'can_edit')) columns.splice(4, 1)
onBeforeMount(async () => {
    await loadUsers()
})

const loadUsers = async () => {
    loading.value = true
    originalRows.value = await getUsers()
    rows.value = [...originalRows.value]
    loading.value = false
}

const showUserForm = (userId) => {
    userToUpdate.value = userId
    dialogOpen.value = true
}

</script>
<style>
.kapa-table {
    border-radius: 20px;
}
</style>