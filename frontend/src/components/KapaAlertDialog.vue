<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin text-center">
      <q-card-section :class="`text-${color} items-center justify-center`">
        <q-icon :name="icon" size="4rem" />
        <div class="text-h4">{{ title }}</div>
      </q-card-section>
      <q-card-section v-if="message" class="q-pt-none">
        <span class="text-subtitle q-pb-md text-weight-light">{{ message }}</span>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn v-if="showCancel" :color="color" flat label="Cancel" @click="onDialogCancel" />
        <q-btn :color="color" label="OK" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'

const props = defineProps(['title', 'message', 'icon', 'color', 'showCancel'])

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function onOKClick() {
  onDialogOK()
}
</script>