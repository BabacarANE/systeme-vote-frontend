// src/layouts/MainLayout.vue
<template>
  <v-app>
    <!-- N'afficher le sidebar et la topbar que si ce n'est pas la page de vote -->
    <template v-if="!isVotePage">
      <component
        :is="sidebarComponent"
        v-model:drawer="drawer"
      />

      <TopBar
        :title="title"
        @toggle-drawer="drawer = !drawer"
      />
    </template>

    <v-main>
      <!-- Retirer le container fluid pour la page de vote -->
      <template v-if="isVotePage">
        <router-view></router-view>
      </template>
      <v-container v-else fluid>
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
import RepresentantSideBar from '@/components/layout/RepresentantSideBar.vue'
import PersonnelSideBar from '@/components/layout/PersonnelSideBar.vue'

const route = useRoute()
const drawer = ref(true)

// Ajout du computed pour détecter la page de vote
const isVotePage = computed(() => {
  return route.name === 'vote'
})

const sidebarComponent = computed(() => {
  const role = route.meta.role
  switch (role) {
    case 'ADMIN_DGE':
      return AdminSideBar
    case 'SUPERVISEUR_CENA':
      return SuperviseurSideBar
    case 'PERSONNEL_BV':
      return PersonnelSideBar
    case 'REPRESENTANT':
      return RepresentantSideBar
    default:
      return null
  }
})

const title = computed(() => {
  if (isVotePage.value) {
    return 'Système de Vote Électronique'
  }
  return 'Gestion Électorale'
})
</script>

<style scoped>
/* Ajouter du style pour enlever le padding sur la page de vote */
:deep(.v-main) {
  padding: 0 !important;
}
</style>
