// src/layouts/DefaultLayout.vue
<template>
  <v-app>
    <!-- TopBar -->
    <TopBar
      @toggle-drawer="drawer = !drawer"
      :title="currentPageTitle"
    />

    <!-- SideBar -->
    <component
      :is="currentSideBar"
      v-model:drawer="drawer"
    />

    <!-- Contenu Principal -->
    <v-main>
      <v-container fluid class="pa-6">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import AdminSideBar from '@/components/layout/AdminSideBar.vue'
import SuperviseurSideBar from '@/components/layout/SuperviseurSideBar.vue'
import PersonnelSideBar from '@/components/layout/PersonnelSideBar.vue'
import RepresentantSideBar from '@/components/layout/RepresentantSideBar.vue'

const route = useRoute()
const drawer = ref(true)

// Détermine quel SideBar afficher selon le rôle
const currentSideBar = computed(() => {
  const path = route.path
  if (path.includes('/admin')) return AdminSideBar
  if (path.includes('/superviseur')) return SuperviseurSideBar
  if (path.includes('/personnel')) return PersonnelSideBar
  if (path.includes('/representant')) return RepresentantSideBar
  return AdminSideBar // par défaut
})

// Titre de la page courante
const currentPageTitle = computed(() => {
  return route.meta.title || 'Gestion Électorale'
})
</script>
