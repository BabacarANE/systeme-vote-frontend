// src/components/layout/TopBar.vue
<template>
  <v-app-bar color="white" elevation="1">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>{{ title }}</v-app-bar-title>

    <template v-slot:append>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item title="Profile"></v-list-item>
          <v-list-item title="Déconnexion" @click="handleLogout"></v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  title: {
    type: String,
    default: 'Gestion Électorale'
  }
})

const emit = defineEmits(['toggle-drawer'])
const router = useRouter()
const authStore = useAuthStore()

const toggleDrawer = () => {
  emit('toggle-drawer')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
