<template>
    <q-dialog v-model="internalDialogOpen" @before-show="loadUserData" @hide="resetForm">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-form @submit="onSubmit">
                <q-card-section class="row q-pb-none">
                    <div class="text-h6">{{ props.userId ? 'Editar usuario' : 'Crear usuario' }}</div>
                    <q-space />
                    <q-toggle v-model="user.state" size="lg" left-label :label="user.state ? 'Activo' : 'Inactivo'"
                        :icon="user.state ? 'check' : 'clear'" color="light-green-8"
                        :class="user.state ? 'text-light-green-8' : 'text-red-8'" />
                </q-card-section>
                <q-card-section>
                    <q-input v-model="user.name" label="Nombre" @blur="validateForm" />
                    <q-input v-model="user.email" label="Correo" @blur="validateForm" />
                    <q-input v-model="user.password" type="password" label="Contraseña" v-if="!props.userId" @blur="validateForm" />
                    <q-input v-model="confirnPassword" type="password" label="Confirmar contraseña"
                        v-if="!props.userId" @blur="validateForm" />
                    <q-select v-model="user.role" :options="roles" emit-value map-options label="Rol" @blur="validateForm" />
                </q-card-section>
                <!-- Contenido del formulario -->
                <q-card-actions align="right">
                    <span v-if="error" class="text-negative q-pa-sm col-8 text-caption"> <q-icon name="warning"></q-icon> {{ error }}</span>
                    <q-space />
                    <q-btn flat label="Cancelar" color="primary" @click="internalDialogOpen = false" />
                    <q-btn label="Guardar" color="primary" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>

</template>

<script setup>
defineOptions({
    name: 'UserForm'
})
import { computed, onBeforeMount, ref, getCurrentInstance } from 'vue';
import { getRoles } from 'src/services/roleService';
import { getUser, createUser, updateUser } from 'src/services/userService';

const { proxy } = getCurrentInstance();
const props = defineProps(['dialogOpen', 'userId']);
const emit = defineEmits(['update:dialogOpen', 'fomSubmitted']);
const confirnPassword = ref('');
const roles = ref([]);
const originalUser = ref({
    user_id: 0,
    name: '',
    password: '',
    email: '',
    role: '',
    state: true
});
const user = ref(originalUser.value);
const error = ref(null);
const formTouched = ref(false);

onBeforeMount(async () => {
    const response = await getRoles();
    roles.value = response.map((role) => {
        return { label: role.name, value: role.role_id };
    });
});

const loadUserData = async () => {
    if (props.userId) {
        const response = await getUser(props.userId);
        response.role = response.role.role_id;
        response.state = response.state === 'active' ? true : false;
        user.value = response;
    } else {
        resetForm();
    }
};

const resetForm = () => {
    user.value = { ...originalUser.value };
    confirnPassword.value = '';
    error.value = null;
    formTouched.value = false;
};

// Computed property para sincronizar la prop con el estado interno
const internalDialogOpen = computed({
    get: () => props.dialogOpen,
    set: (value) => {
        emit('update:dialogOpen', value);
    },
});

const onSubmit = async () => {
    try {
        formTouched.value = true;
        const userData = { ...user.value };
        userData.state = user.value.state ? 'active' : 'inactive';
        const validate = validateForm();
        if (!validate) return;
        if (props.userId) {
            await updateUser(userData);
        } else {
            await createUser(userData);
        }
        emit('fomSubmitted');
        internalDialogOpen.value = false;
        proxy.$kapaAlert({ type: 'success', message: 'Usuario guardado correctamente', title: 'Exito!' });
    } catch (error) {
        proxy.$kapaAlert({ type: 'error', message: error.message, title: `Oh no!` });
    }
};

const validatePassword = () => {
    if (props.userId) return true; // No se debe validar la contraseña para un usuario existente
    const { password } = user.value;
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}:?;|'<>,./\\]).{8,}$/;
    const validPassword = regex.test(password);
    if (!password || password !== confirnPassword.value) {
        error.value = !password ? 'La contraseña es obligatoria' : 'Las contraseñas no coinciden';
        return false;
    }
    if (!validPassword) {
        error.value = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un caracter especial y un número';
        return false;
    }
    error.value = null;
    return true;
};

const validateEmail = () => {
    const { email } = user.value;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = regex.test(email);
    if (!email || !validEmail) {
        error.value = !email ? 'El correo electrónico es obligatorio' : 'El correo electrónico no es válido';
        return false;
    }
    error.value = null;
    return true;
};

const validateForm = () => {
    if (!formTouched.value) return true;
    const { name, role } = user.value;
    if (!name) error.value = 'El nombre es obligatorio';
    else if (!validateEmail()) return false;
    else if (!validatePassword()) return false;
    else if (!role) error.value = 'El rol es obligatorio';
    else error.value = null;
    return !error.value;
};
</script>