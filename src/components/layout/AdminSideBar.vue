// src/components/layout/AdminSideBar.vue
<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :rail="rail"
    permanent
    @click="rail = false"
    color="green"
    class="sidebar"
  >
    <v-list-item
      prepend-avatar="@/assets/LOGO.jpg"
      title="DGE Admin"
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

    <v-list>
      <!-- Gestion Territoriale -->
      <v-list-group value="gestion-territoriale">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-map"
            title="Gestion Territoriale"
            color="white"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="(item, i) in territorialItems"
          :key="i"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          link
        ></v-list-item>
      </v-list-group>

      <!-- Gestion Centre et Bureau -->
      <v-list-group value="gestion-bureaux">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-office-building"
            title="Gestion Centre et Bureau"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="(item, i) in bureauItems"
          :key="i"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          link
        ></v-list-item>
      </v-list-group>

      <!-- Gestion Électorale -->
      <v-list-group value="gestion-electorale">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-vote"
            title="Gestion Électorale"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="(item, i) in electoralItems"
          :key="i"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          link
        ></v-list-item>
      </v-list-group>

      <!-- Gestion des Personnes -->
      <v-list-group value="gestion-personnes">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-group"
            title="Gestion des Personnes"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="(item, i) in personneItems"
          :key="i"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          link
        ></v-list-item>
      </v-list-group>

      <!-- Résultats -->
      <v-list-item
        prepend-icon="mdi-poll"
        title="Résultats"
        to="/admin/resultats"
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

const territorialItems = [
  { title: 'Pays', value: 'pays', to: '/admin/pays' },
  { title: 'Régions', value: 'regions', to: '/admin/regions' },
  { title: 'Départements', value: 'departements', to: '/admin/departements' },
  { title: 'Communes', value: 'communes', to: '/admin/communes' }
]

const bureauItems = [
  { title: 'Centres de Vote', value: 'centres', to: '/admin/centres-vote' },
  { title: 'Bureaux de Vote', value: 'bureaux', to: '/admin/bureaux-vote' }
]

const electoralItems = [
  { title: 'Élections', value: 'elections', to: '/admin/elections' },
  { title: 'Candidatures', value: 'candidatures', to: '/admin/candidatures' },
  { title: 'Affectations', value: 'affectations', to: '/admin/affectations' }
]

const personneItems = [
  { title: 'Candidats', value: 'candidats', to: '/admin/candidats' },
  { title: 'Électeurs', value: 'electeurs', to: '/admin/electeurs' },
  { title: 'Utilisateurs', value: 'utilisateurs', to: '/admin/utilisateurs' }
]
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
