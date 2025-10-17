<template>
    <q-dialog v-model="internalDialogOpen" @before-show="resetForm" @hide="resetForm">
        <q-card style="width: 500px; max-width: 80vw;">
            <q-form @submit.prevent="submitForm">
                <q-card-section class="row q-pb-none">
                    <div class="text-h6">Cambiar contraseña</div>
                </q-card-section>

                <q-card-section>
                    <q-input v-model="password" type="password" label="Nueva Contraseña" :rules="[passwordRules]"
                        class="q-mb-md" />
                    <q-input v-model="confirmPassword" type="password" label="Confirmar Contraseña"
                        :rules="[val => val === password || 'Las contraseñas no coinciden']" class="q-mb-md" />
                </q-card-section>

                <q-card-actions align="right">
                    <span v-if="error" class="text-negative q-pa-sm col-6 text-caption">
                        <q-icon name="warning"></q-icon> {{ error }}
                    </span>
                    <span v-if="changePasswordMessage" class="text-green-10 q-pa-sm col-6 text-caption">
                        <q-icon name="check"></q-icon> {{ changePasswordMessage }}
                    </span>
                    <q-space />
                    <q-btn flat label="Cancelar" color="primary" @click="internalDialogOpen = false" />
                    <q-btn label="Guardar" color="primary" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useAuth } from 'src/composables/useAuth';

defineOptions({ name: 'ChangePassword' });

const props = defineProps(['dialogOpen']);

onBeforeMount(() => {
    resetForm();
})

const emit = defineEmits(['update:dialogOpen']);

const password = ref('');
const confirmPassword = ref('');
const changePasswordMessage = ref(null);

const { changeUserPassword, error } = useAuth();

const internalDialogOpen = computed({
    get: () => props.dialogOpen,
    set: (value) => emit('update:dialogOpen', value),
});

// Reglas de validación para la contraseña
const passwordRules = val => {
    const hasUpperCase = /[A-Z]/.test(val);
    const hasLowerCase = /[a-z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    const isValidLength = val.length >= 8;

    if (!isValidLength) {
        return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!hasUpperCase) {
        return 'La contraseña debe tener al menos una letra mayúscula';
    }
    if (!hasLowerCase) {
        return 'La contraseña debe tener al menos una letra minúscula';
    }
    if (!hasNumber) {
        return 'La contraseña debe tener al menos un número';
    }
    if (!hasSpecialChar) {
        return 'La contraseña debe tener al menos un carácter especial';
    }
    return true; // Si todas las condiciones se cumplen
};

// Restablecer formulario
const resetForm = () => {
    password.value = '';
    confirmPassword.value = '';
    error.value = null;
    changePasswordMessage.value = null;
};

const submitForm = async () => {
    if (password.value === confirmPassword.value) {
        const newPasswordObject = {
            newPassword: password.value,
        };
        changePasswordMessage.value = await changeUserPassword(newPasswordObject);
    } else {
        error.value = 'Las contraseñas no coinciden';
    }
};
</script>

<style scoped>
/* Estilos personalizados, si es necesario */
</style>