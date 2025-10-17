<template>
    <div>
        <q-input v-model="newEmail" label="Agregar correo">
            <template v-slot:append>
                <q-btn @click="addEmail" icon="add" round color="primary" size="sm" />
            </template>
        </q-input>

        <div class="q-mt-md">
            <q-chip v-for="(email, index) in internalEmails" :key="index" removable @remove="removeEmail(index)"
                color="primary" text-color="white" class="q-mb-sm">
                {{ email }}
            </q-chip>
        </div>
    </div>
</template>

<script setup>
import { Notify } from 'quasar';
import { ref, watch } from 'vue';
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);
const newEmail = ref('');
const internalEmails = ref([...props.modelValue]);

const addEmail = () => {
    if (newEmail.value && validateEmail(newEmail.value)) {
        internalEmails.value.push(newEmail.value);
        emit('update:modelValue', [...internalEmails.value]);
        newEmail.value = ''; // Limpia el input después de agregar
    } else {
        Notify.create({
            message: 'El correo que esta intentando agregar no es válido, por favor verifiquelo.',
            color: 'red-5',
            position: 'bottom',
        });
    }
};

const removeEmail = (index) => {
    internalEmails.value.splice(index, 1);
    emit('update:modelValue', [...internalEmails.value]);
};

const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
};

// Sincroniza el estado interno con la prop cuando esta cambie
watch(
    () => props.modelValue,
    (newValue) => {
        internalEmails.value = [...newValue];
    }
);
</script>