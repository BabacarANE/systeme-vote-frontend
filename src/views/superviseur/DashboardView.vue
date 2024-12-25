<!-- src/views/superviseur/DashboardView.vue -->
<template>
  <div>
    <h1>Dashboard Superviseur CENA</h1>
    <v-btn @click="logout">Se déconnecter</v-btn>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
