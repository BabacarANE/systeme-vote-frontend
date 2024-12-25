<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :rail="rail"
    permanent
    @click="rail = false"
    class="sidebar"
  >
    <v-list-item
      prepend-avatar="@/assets/LOGO.jpg"
      title="Personnel BV"
      nav
    >
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <!-- Gestion Bureau de Vote -->
      <v-list-item
        prepend-icon="mdi-office-building"
        title="Gestion Bureau de Vote"
        :to="{ name: 'personnel-bureaux-gestion' }"
        value="gestion-bureau"
      ></v-list-item>

      <!-- Génération PV -->
      <v-list-item
        prepend-icon="mdi-file-document"
        title="Générer PV"
        :to="{ name: 'personnel-pv-generer' }"
        value="generer-pv"
      ></v-list-item>

      <!-- Résultats -->
      <v-list-item
        prepend-icon="mdi-poll"
        title="Résultats"
        :to="{ name: 'personnel-resultats' }"
        value="resultats"
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
