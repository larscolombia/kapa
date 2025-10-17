<template>
  <div class="fullscreen bg-accent text-white text-center q-pa-md flex flex-center">
    <div>
      <img src="../assets/Logo_KAPA.png" alt="Logo KAPA" style="width: 50%">
      <div style="font-size: 6vh" class="text-primary">
        Restablecer Contraseña
      </div>

      <div class="text-h6 q-mb-lg text-secondary" style="opacity:.4">
        Por favor, ingrese su nueva contraseña
      </div>

      <q-form @submit.prevent="submitForm">
        <q-input filled v-model="password" type="password" label="Nueva Contraseña" :rules="[passwordRules]"
          class="q-mb-md" />
        <q-input filled v-model="confirmPassword" type="password" label="Confirmar Contraseña"
          :rules="[val => val === password || 'Las contraseñas no coinciden']" class="q-mb-md" />
        <q-btn class="q-my-lg" color="white" text-color="primary" unelevated type="submit"
          label="Restablecer Contraseña" no-caps />
      </q-form>

      <q-banner v-if="error" class="text-negative bg-red-2">{{ error }}</q-banner>
      <q-banner v-if="restoreMessage" class="text-green-10 bg-green-2">
        {{ restoreMessage }}
        <q-btn flat color="green-10" to="/" label="Regresar al login" no-caps />
      </q-banner>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from 'src/composables/useAuth';
defineOptions({ name: 'RestorePassword' });

const props = defineProps(['token']);
const { restoreUserPassword, error } = useAuth();
const password = ref('');
const confirmPassword = ref('');
const restoreMessage = ref(null);

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

const submitForm = async () => {
  if (password.value === confirmPassword.value) {
    const newPasswordObject = {
      token: props.token,
      newPassword: password.value
    }
    const message = await restoreUserPassword(newPasswordObject);
    restoreMessage.value = message;
  } else {
    console.log('Las contraseñas no coinciden');
  }
};
</script>

<style scoped></style>
