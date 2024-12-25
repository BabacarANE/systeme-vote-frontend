<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :rail="rail"
    permanent
    @click="rail = false"
    class="sidebar"
  >
    <v-list>
      <!-- Correction du header -->
      <v-list-item
        nav
      >
        <template #prepend>
          <v-avatar size="36">
            <v-img src="/assets/LOGO.jpg" alt="Logo"></v-img>
          </v-avatar>
        </template>
        <template #title>
          Superviseur CENA
        </template>
        <template #append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Tableau de bord"
        to="/superviseur"
        value="dashboard"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-alert-circle"
        title="Gestion des Contestations"
        to="/superviseur/contestations"
        value="contestations"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-file-document"
        title="Gestion des PV"
        to="/superviseur/pv"
        value="pv"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-poll"
        title="Gestion des Résultats"
        to="/superviseur/resultats"
        value="resultats"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-history"
        title="Journal"
        to="/superviseur/journal"
        value="journal"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  drawer: {
    type: Boolean,
    required: true
  }
})

defineEmits(['update:drawer'])

const rail = ref(false)
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #008000 0%, #FFD700 50%, #FF0000 100%);
}

.v-list {
  background: transparent;
}

.v-list-item {
  color: white !important;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-list-group__header.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.2);
}

.v-divider {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
