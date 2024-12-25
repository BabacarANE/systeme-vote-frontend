<template>
  <div class="pa-4">
    <v-card class="mb-4">
      <v-card-title class="text-h4">
        Consultation des PVs
        <v-chip v-if="election" color="primary" class="ml-4">
          {{ election.titre }}
        </v-chip>
      </v-card-title>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="resultats"
      :loading="loading"
      class="elevation-1"
    >
      <template #item.centre="{ item }">
        {{ item.bureau_vote?.centre_vote?.nom }}
      </template>

      <template #item.bureau="{ item }">
        {{ item.bureau_vote?.nom }}
      </template>

      <template #item.participation="{ item }">
        {{ item.statistiques?.nombre_votants }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" color="primary" @click="showPV(item)" class="mr-2">
          <v-tooltip activator="parent" location="top">Voir le PV</v-tooltip>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog pour voir le PV -->
    <v-dialog v-model="showDetailDialog" fullscreen>
      <v-card v-if="selectedPV">
        <v-toolbar dark color="primary">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            PV - {{ selectedPV.bureau_vote?.nom }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Informations du bureau -->
            <v-col cols="12" md="6">
              <v-card flat outlined>
                <v-card-title class="text-subtitle-1">Informations</v-card-title>
                <v-card-text>
                  <div class="d-flex flex-column gap-2">
                    <div><strong>Région:</strong> {{ selectedPV.bureau_vote?.centre_vote?.region }}</div>
                    <div><strong>Département:</strong> {{ selectedPV.bureau_vote?.centre_vote?.departement }}</div>
                    <div><strong>Commune:</strong> {{ selectedPV.bureau_vote?.centre_vote?.commune }}</div>
                    <div><strong>Centre:</strong> {{ selectedPV.bureau_vote?.centre_vote?.nom }}</div>
                    <div><strong>Bureau:</strong> {{ selectedPV.bureau_vote?.nom }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Statistiques -->
            <v-col cols="12" md="6">
              <v-card flat outlined>
                <v-card-title class="text-subtitle-1">Statistiques</v-card-title>
                <v-card-text>
                  <div class="d-flex flex-column gap-2">
                    <div><strong>Votants:</strong> {{ selectedPV.statistiques?.nombre_votants }}</div>
                    <div><strong>Bulletins nuls:</strong> {{ selectedPV.statistiques?.bulletins_nuls }}</div>
                    <div><strong>Bulletins blancs:</strong> {{ selectedPV.statistiques?.bulletins_blancs }}</div>
                    <div><strong>Suffrages exprimés:</strong> {{ selectedPV.statistiques?.suffrages_exprimes }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Affichage du PV -->
            <v-col cols="12">
              <v-card flat outlined class="mt-4">
                <v-card-title class="text-subtitle-1">PV</v-card-title>
                <v-card-text>
                  <embed
                    :src="`${API_URL}/storage/${selectedPV.pv}`"
                    type="application/pdf"
                    width="100%"
                    height="800px"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const toast = useToast()
const loading = ref(false)
const resultats = ref([])
const election = ref(null)
const showDetailDialog = ref(false)
const selectedPV = ref(null)

const headers = [
  { title: 'Centre', key: 'centre', align: 'start' },
  { title: 'Bureau', key: 'bureau', align: 'start' },
  { title: 'Participation', key: 'participation', align: 'end' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false }
]

const fetchPVs = async () => {
  loading.value = true
  try {
    const response = await axios.get('/pv')
    resultats.value = response.data.data.resultats
    election.value = response.data.data.election
  } catch (error) {
    console.error('Erreur:', error)
    toast.error('Erreur lors du chargement des PVs')
  } finally {
    loading.value = false
  }
}

const showPV = (item) => {
  selectedPV.value = item
  showDetailDialog.value = true
}

const closeDialog = () => {
  showDetailDialog.value = false
  selectedPV.value = null
}

onMounted(fetchPVs)
</script>
