<template>
    <q-input v-model="internalDate" mask="date" @update:model-value="emitDate" :label="labelValue">
        <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="popupRef" cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="internalDate" @update:model-value="onDateSelected" />
                </q-popup-proxy>
            </q-icon>
        </template>
    </q-input>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps(['modelValue', 'labelValue']);
const emit = defineEmits(['update:modelValue']);
const internalDate = ref(props.modelValue);
const popupRef = ref(null);

const emitDate = (newDate) => {
    emit('update:modelValue', newDate);
};

const onDateSelected = (newDate) => {
    emitDate(newDate);
    popupRef.value.hide();
};

watch(
    () => props.modelValue,
    (newValue) => {
        internalDate.value = newValue;
    }
);
</script>