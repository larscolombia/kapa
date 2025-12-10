<template>
  <q-layout view="hHh LpR fff">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <img src="../assets/Logo_KAPA.png" alt="Logo KAPA" style="height: 10vh">
        </q-toolbar-title>
        <div class="q-item">
          <q-item-section class="text-white text-h6 text-bold text-right">
            {{ user.name }}
          </q-item-section>
          <q-item-section class="text-white text-right text-weight-medium">
            {{ user.email }}
          </q-item-section>
          <q-item-section class="text-white text-right ">
            {{ user.role.name }}
          </q-item-section>
          <q-item-section class="text-blue-8 text-right" style="font-size: x-small;">
            V2.0 by <a href="https://lars.net.co" target="_blank" class="text-blue-4" style="text-decoration: none;">LARS</a>
          </q-item-section>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" class="bg-primary text-white" side="left" :mini="miniState">
      <svg class="curve" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 0 0 Q 50 50 100 0 L 100 100 L 0 100 Z" :fill="getPaletteColor('primary')" />
      </svg>
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable v-ripple @click="miniState = !miniState">
            <q-item-section avatar>
              <q-icon :name="miniState ? 'menu' : 'arrow_back'" />
            </q-item-section>

            <q-item-section>
              Minimizar
            </q-item-section>
          </q-item>
          <div v-for="page, index in pages" :key="index">
            <q-item clickable v-ripple @click="goTo(page.routeName)"
              v-if="authStore.hasPermission(page.moduleName, 'can_view') || page.routeName === 'home'">
              <q-item-section avatar>
                <q-icon :name="page.icon" />
              </q-item-section>

              <q-item-section>
                {{ page.name }}
              </q-item-section>
            </q-item>
          </div>

          <q-separator color="secondary" />

          <q-item clickable v-ripple to="/supports-of-interest" :active="false">
            <q-item-section avatar>
              <q-icon name="description" />
            </q-item-section>

            <q-item-section>
              Soportes de interés
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="refreshPermissions">
            <q-item-section avatar>
              <q-icon name="refresh" />
            </q-item-section>

            <q-item-section>
              Actualizar permisos
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="dialogOpen = true">
            <q-item-section avatar>
              <q-icon name="lock" />
            </q-item-section>

            <q-item-section>
              Cambiar contraseña
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section>
              Cerrar sesión
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <change-password :dialogOpen="dialogOpen" @update:dialogOpen="dialogOpen = $event" />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { colors } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import ChangePassword from 'components/ChangePassword.vue';
import { getPermissions } from 'src/services/authService';
import { Notify } from 'quasar';

const authStore = useAuthStore()
const router = useRouter()
const user = ref(authStore.user);


const dialogOpen = ref(false)

const refreshPermissions = async () => {
  try {
    const newPermissions = await getPermissions();
    authStore.setPermissions(newPermissions);
    Notify.create({
      type: 'positive',
      message: 'Permisos actualizados correctamente',
      position: 'top'
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error al actualizar permisos',
      position: 'top'
    });
  }
}

const pages = [
  {
    name: 'Inicio',
    icon: 'home',
    routeName: 'home'
  },
  {
    name: 'Administrar usuarios',
    icon: 'people_alt',
    routeName: 'adminUsers',
    moduleName: 'user_management',
  },
  {
    name: 'Administrar proyectos',
    icon: 'design_services',
    routeName: 'adminProjects',
    moduleName: 'project_management',
  },
  {
    name: 'Administrar contratistas',
    icon: 'engineering',
    routeName: 'adminContractors',
    moduleName: 'contractor_management',
  },
  {
    name: 'Administrador de soportes',
    icon: 'folder_special',
    routeName: 'adminSupports',
    moduleName: 'supports_management',
  },
  {
    name: 'Reportes de Auditoría',
    icon: 'assessment',
    routeName: 'adminReports',
    moduleName: 'reports_management',
  },
  {
    name: 'ILV - Dashboard',
    icon: 'dashboard',
    routeName: 'ilvDashboard',
    moduleName: 'ilv_management',
  },
  {
    name: 'ILV - Reportes',
    icon: 'report_problem',
    routeName: 'ilvReportes',
    moduleName: 'ilv_management',
  },
  {
    name: 'Inspecciones - Dashboard',
    icon: 'dashboard',
    routeName: 'inspeccionesDashboard',
    moduleName: 'inspecciones_management',
  },
  {
    name: 'Inspecciones - Reportes',
    icon: 'checklist',
    routeName: 'inspeccionesLista',
    moduleName: 'inspecciones_management',
  },
  {
    name: 'Generador de Formularios para Inspecciones',
    icon: 'dynamic_form',
    routeName: 'formBuilderList',
    moduleName: 'form_builder_manage',
  },
  {
    name: 'Configuración del Sistema',
    icon: 'settings',
    routeName: 'systemConfig',
    moduleName: 'system_config',
  }
]

const { getPaletteColor } = colors
const leftDrawerOpen = ref(true)
const miniState = ref(true)

const { logoutUser } = useAuth()
const logout = async () => {
  await logoutUser();
}

const goTo = (routeName) => {
  router.push({ name: routeName })
}
</script>

<style>
.curve {
  position: absolute;
  top: -18px;
  left: 34px;
  width: 40px;
  height: 40px;
  z-index: 0;
  transform: rotate(130deg);
}
</style>
