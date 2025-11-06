<!-- src/pages/LoginPage.vue -->
<template>
    <q-layout view="lHh Lpr lFf">
        <q-page-container>
            <q-page>
                <q-carousel class="fullscreen" animated v-model="slide" navigation infinite :autoplay="autoplay" arrows
                    transition-prev="slide-down" vertical transition-next="slide-up" @mouseenter="autoplay = false"
                    @mouseleave="autoplay = true">
                    <q-carousel-slide :name="1" img-src="../assets/bg-1.webp" />
                    <q-carousel-slide :name="2" img-src="../assets/bg-2.webp" />
                    <q-carousel-slide :name="3" img-src="../assets/bg-3.webp" />
                </q-carousel>
                <q-card class="absolute-full z-top q-ma-xl q-pa-lg login-form">
                    <q-card-section class="text-center">
                        <img src="../assets/Logo_KAPA.png" alt="Logo KAPA" style="width: 100%">
                        <div class="text-h4 text-primary">{{ showForgot ? 'Recuperar contraseña' : 'Iniciar sesión' }}
                        </div>
                    </q-card-section>
                    <!-- Contenedor principal con display: flex para alinear verticalmente -->
                    <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                        <!-- Inputs centrados verticalmente -->
                        <q-card-section class="q-pa-none">
                            <div v-if="showForgot" class="row justify-between">
                                <div class="col-12">
                                    <q-input v-model="username" size="lg" label="Correo" class="col-12" @keydown.enter.prevent="ForgotPassword" />
                                </div>
                            </div>
                            <div v-else class="row justify-between">
                                <div class="col-12">
                                    <q-input v-model="username" label="Usuario" class="col-12" />
                                    <q-input v-model="password" type="password" label="Contraseña" class="col-12" @keydown.enter.prevent="Login" />
                                </div>
                            </div>
                        </q-card-section>
                    </div>

                    <!-- Botones abajo -->
                    <q-card-section class="q-pa-none">
                        <div class="col-12">
                            <q-btn v-if="showForgot" type="submit" @click="ForgotPassword" label="Enviar correo"
                                color="primary" class="q-mt-xl full-width" :loading="loading" />
                            <q-btn v-else type="submit" label="Ingresar" @click="Login" color="primary"
                                class="q-mt-xl full-width" :loading="loading" />

                            <q-btn v-if="showForgot" type="button" label="Cancelar" @click="changeForm" color="primary"
                                class="q-mt-sm q-mr-sm full-width" flat />
                            <q-btn v-else type="button" label="Olvide mi contraseña" @click="changeForm" color="primary"
                                class="q-mt-sm full-width" flat />
                        </div>
                        <div class="col-12 text-center">
                            <q-banner v-if="error" class="text-negative bg-red-2">{{ error }}</q-banner>
                            <q-banner v-if="forgotMessage" class="text-yellow-10 bg-yellow-2">{{ forgotMessage
                                }}</q-banner>
                        </div>
                    </q-card-section>
                </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from 'src/composables/useAuth';
import { useRouter } from 'vue-router';
// import { useReCaptcha } from 'vue-recaptcha-v3'

const { loginUser, forgotUserPassword, error } = useAuth();
const router = useRouter();
const username = ref('');
const password = ref('');
const forgotMessage = ref('');
const showForgot = ref(false);
const slide = ref(1);
const autoplay = ref(true);
// const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()
const loading = ref(false);
const Login = async () => {
    loading.value = true;
    error.value = '';
    // Temporalmente deshabilitado reCAPTCHA para pruebas
    // await recaptchaLoaded()
    // const recaptchaResponse = await executeRecaptcha('login');
    await loginUser({ email: username.value, password: password.value });
    loading.value = false;
    if (!error.value) {
        router.push('/');
    }
};

const changeForm = () => {
    showForgot.value = !showForgot.value;
    username.value = '';
    password.value = '';
    forgotMessage.value = '';
    error.value = '';
}
const ForgotPassword = async () => {
    loading.value = true;
    const message = await forgotUserPassword({ email: username.value });
    forgotMessage.value = message;
    loading.value = false;
};
</script>
<style>
.login-form {
    max-width: 30vw;
    display: flex;
    flex-direction: column;
    height: 80vh;
}

@media screen and (max-width: 600px) {
    .login-form {
        max-width: 90vw;
        height: 70vh;
    }
}
</style>
