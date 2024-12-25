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
      title="Représentant"
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
      <v-list-item
        prepend-icon="mdi-file-document"
        title="Consulter PV"
        to="/representant/pv"
        value="pv"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-alert-circle"
        title="Gestion des Contestations"
        to="/representant/contestations"
        value="contestations"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-poll"
        title="Consulter les Résultats"
        to="/representant/resultats"
        value="resultats"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-account-search"
        title="Vérifier un électeur"
        to="/representant/electeur"
        value="electeur"
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

.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.2);
}

.v-divider {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
