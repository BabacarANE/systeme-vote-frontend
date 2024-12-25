// src/views/admin/DashboardView.vue
<template style="padding-top: 100px; padding-left: 200px;">
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Tableau de bord Administratif</h1>
      </v-col>
    </v-row>

    <!-- Statistiques générales -->
    <v-row>
      <v-col cols="12" md="3">
        <dashboard-card
          title="Total Électeurs"
          :value="stats.totalElecteurs"
          icon="mdi-account-group"
          color-class="primary-gradient"
        />
      </v-col>
      <v-col cols="12" md="3">
        <dashboard-card
          title="Bureaux de Vote"
          :value="stats.totalBureaux"
          icon="mdi-office-building"
          color-class="secondary-gradient"
        />
      </v-col>
      <v-col cols="12" md="3">
        <dashboard-card
          title="Candidats"
          :value="stats.totalCandidats"
          icon="mdi-account-tie"
          color-class="error-gradient"
        />
      </v-col>
      <v-col cols="12" md="3">
        <dashboard-card
          title="Taux Participation"
          :value="`${stats.tauxParticipation}%`"
          icon="mdi-chart-bar"
          color-class="primary-gradient"
        />
      </v-col>
    </v-row>

    <!-- Graphiques -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Répartition par Région</v-card-title>
          <v-card-text style="height: 300px;">
            <!-- Insérer ici le composant de graphique -->
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Progression du Vote</v-card-title>
          <v-card-text style="height: 300px;">
            <!-- Insérer ici le composant de graphique -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tableau des dernières activités -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            Dernières Activités
            <v-btn color="primary">Voir tout</v-btn>
          </v-card-title>
          <v-card-text>
            <v-table>
              <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Statut</th>
              </tr>
              </thead>
              <tbody>
              <!-- Données du tableau -->
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'

const stats = ref({
  totalElecteurs: 0,
  totalBureaux: 0,
  totalCandidats: 0,
  tauxParticipation: 0
})

onMounted(async () => {
  // Charger les statistiques depuis l'API
  // Pour l'exemple, utilisons des données statiques
  stats.value = {
    totalElecteurs: 1500000,
    totalBureaux: 1200,
    totalCandidats: 15,
    tauxParticipation: 75.5
  }
})
</script>
