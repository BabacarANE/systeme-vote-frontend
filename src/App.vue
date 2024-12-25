<!-- src/App.vue -->
<template>
  <v-app>
    <!-- Afficher le routeur view -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Vérifier s'il y a un token stocké
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    authStore.setToken(storedToken)
    // Optionnel : Valider le token avec le backend
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>
