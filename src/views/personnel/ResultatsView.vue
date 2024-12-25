<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'


const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const toast = useToast()
const loading = ref(false)
const resultats = ref({
  bureau: {
    nom: '',
    adresse: ''
  },
  resultat: {
    nombre_votants: 0,
    bulletins_nuls: 0,
    bulletins_blancs: 0,
    suffrages_exprimes: 0,
    pv: null
  },
  votes: []
})

const showPVDialog = ref(false)

const fetchResultats = async () => {
  loading.value = true
  try {
    const response = await axios.get('/personnel/resultats')
    resultats.value = response.data.data
    console.log(resultats)
  } catch (error) {
    toast.error('Erreur lors du chargement des résultats')
  } finally {
    loading.value = false
  }
}

onMounted(fetchResultats)
</script>

<template>
  <div class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4">
          <v-icon large color="primary" class="mr-2">mdi-chart-box</v-icon>
          Résultats du Bureau
        </h1>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="bureau-info">
              <div class="text-h6 mb-2 info-title">BUREAU PRINCIPALE</div>
              <div class="info-item">Bureau: {{ resultats.bureau.nom }}</div>
              <div class="info-item">Adresse: {{ resultats.bureau.adresse }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="4">
        <v-card height="100%" class="stat-card">
          <v-card-text class="text-center">
            <div class="text-h3 stat-number">{{ resultats.resultat.bulletins_nuls }}</div>
            <div class="stat-label">Bulletins Nuls</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card height="100%" class="stat-card">
          <v-card-text class="text-center">
            <div class="text-h3 stat-number">{{ resultats.resultat.bulletins_blancs }}</div>
            <div class="stat-label">Bulletins Blancs</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card height="100%" class="stat-card">
          <v-card-text class="text-center">
            <div class="text-h3 stat-number">{{ resultats.resultat.suffrages_exprimes }}</div>
            <div class="stat-label">Suffrages Exprimés</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4">
      <v-card-text>
        <v-table class="results-table">
          <thead>
          <tr>
            <th>Parti</th>
            <th>Voix</th>
            <th>Pourcentage</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(vote, i) in resultats.votes" :key="i">
            <td>{{ vote.candidature?.role_candidat?.parti }}</td>
            <td>{{ vote.nombre_voix }}</td>
            <td>{{ ((vote.nombre_voix / resultats.resultat.suffrages_exprimes) * 100).toFixed(2) }}%</td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Bouton pour voir le PV -->
    <div class="text-center mt-4">
      <v-btn
        v-if="resultats.pv_url"
        color="primary"
        size="large"
        class="pv-button"
        @click="showPVDialog = true"
      >
        <v-icon left class="mr-2">mdi-file-document</v-icon>
        Voir le PV
      </v-btn>
    </div>

    <!-- Dialog PV -->
    <v-dialog v-model="showPVDialog" fullscreen>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon @click="showPVDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>PV du Bureau</v-toolbar-title>
        </v-toolbar>


        <v-card-text class="pa-0">
          <embed
            :src="`${API_URL}/storage/${resultats.pv_url}`"

            type="application/pdf"
            width="100%"
            height="100%"
            class="pdf-viewer"
          />
        </v-card-text>

      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.v-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bureau-info {
  padding: 16px;
}

.info-title {
  color: #1976D2;
  font-weight: 600;
}

.info-item {
  margin-bottom: 8px;
  font-size: 1.1em;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  color: #1976D2;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 1.1em;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  padding: 12px;
}

.results-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.pv-button {
  min-width: 200px;
  text-transform: none;
  letter-spacing: 0.5px;
}

.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 600px) {
  .stat-card {
    margin-bottom: 16px;
  }

  .info-item {
    font-size: 1em;
  }

  .stat-number {
    font-size: 1.8em;
  }
}
</style>
