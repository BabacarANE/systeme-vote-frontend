<template>
  <div class="pa-4">
    <v-row>
      <!-- En-tête avec les informations de l'élection -->
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <span class="text-h5">Consultation des PVs</span>
            <v-chip v-if="election" color="primary" class="ml-4">
              {{ election.titre }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle v-if="election">
            Date de l'élection: {{ formatDate(election.date) }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtres -->
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.region"
          :items="regions"
          label="Région"
          item-title="nom"
          item-value="nom"
          clearable
          @update:model-value="filterResults"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.departement"
          :items="departements"
          label="Département"
          item-title="nom"
          item-value="nom"
          clearable
          :disabled="!filters.region"
          @update:model-value="filterResults"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.commune"
          :items="communes"
          label="Commune"
          item-title="nom"
          item-value="nom"
          clearable
          :disabled="!filters.departement"
          @update:model-value="filterResults"
        />
      </v-col>
    </v-row>

    <!-- Table des PVs -->
    <v-data-table
      :headers="headers"
      :items="filteredResultats"
      :loading="loading"
      :no-data-text="noDataText"
      class="elevation-1"
    >
      <!-- Region -->
      <template #item.region="{ item }">
        {{ item.raw.bureau_vote.centre_vote.region }}
      </template>

      <!-- Departement -->
      <template #item.departement="{ item }">
        {{ item.raw.bureau_vote.centre_vote.departement }}
      </template>

      <!-- Commune -->
      <template #item.commune="{ item }">
        {{ item.raw.bureau_vote.centre_vote.commune }}
      </template>

      <!-- Centre -->
      <template #item.centre="{ item }">
        {{ item.raw.bureau_vote.centre_vote.nom }}
      </template>

      <!-- Bureau -->
      <template #item.bureau="{ item }">
        {{ item.raw.bureau_vote.nom }}
      </template>

      <!-- Participation -->
      <template #item.participation="{ item }">
        {{ item.raw.statistiques.nombre_votants }}
        ({{ calculatePercentage(item.raw.statistiques.nombre_votants, item.raw.bureau_vote.nombre_inscrits) }}%)
      </template>

      <!-- Date -->
      <template #item.date="{ item }">
        {{ formatDateTime(item.raw.date_creation) }}
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-file-document-outline"
          color="primary"
          size="small"
          @click="openPV(item.raw)"
          :loading="loadingPV"
        >
          <v-tooltip activator="parent" location="top">
            Voir le PV
          </v-tooltip>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialogue d'affichage du PV -->
    <v-dialog v-model="showPVDialog" fullscreen hide-overlay>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon @click="showPVDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>PV du bureau {{ selectedPV?.bureau_vote?.nom }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-card-text class="pa-4">
          <div v-if="pvContent" class="pv-container">
            <!-- Ici le contenu du PV sera affiché directement -->
            <iframe :src="pvContent" style="width: 100%; height: 800px;" frameborder="0"></iframe>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const toast = useToast()
const loading = ref(false)
const loadingPV = ref(false)
const resultats = ref([])
const election = ref(null)
const showPVDialog = ref(false)
const selectedPV = ref(null)
const pvContent = ref(null)

// Filtres
const filters = ref({
  region: null,
  departement: null,
  commune: null
})

const headers = [
  { title: 'Région', key: 'region', align: 'start' },
  { title: 'Département', key: 'departement', align: 'start' },
  { title: 'Commune', key: 'commune', align: 'start' },
  { title: 'Centre', key: 'centre', align: 'start' },
  { title: 'Bureau', key: 'bureau', align: 'start' },
  { title: 'Participation', key: 'participation', align: 'end' },
  { title: 'Date de création', key: 'date', align: 'start' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false }
]

// Computed properties pour les filtres
const regions = computed(() => {
  const uniqueRegions = new Set(resultats.value.map(r => r.bureau_vote.centre_vote.region))
  return Array.from(uniqueRegions).map(nom => ({ nom }))
})

const departements = computed(() => {
  if (!filters.value.region) return []
  const depts = resultats.value
    .filter(r => r.bureau_vote.centre_vote.region === filters.value.region)
    .map(r => r.bureau_vote.centre_vote.departement)
  return Array.from(new Set(depts)).map(nom => ({ nom }))
})

const communes = computed(() => {
  if (!filters.value.departement) return []
  const coms = resultats.value
    .filter(r => r.bureau_vote.centre_vote.departement === filters.value.departement)
    .map(r => r.bureau_vote.centre_vote.commune)
  return Array.from(new Set(coms)).map(nom => ({ nom }))
})

const filteredResultats = computed(() => {
  let filtered = resultats.value

  if (filters.value.region) {
    filtered = filtered.filter(r =>
      r.bureau_vote.centre_vote.region === filters.value.region
    )
  }

  if (filters.value.departement) {
    filtered = filtered.filter(r =>
      r.bureau_vote.centre_vote.departement === filters.value.departement
    )
  }

  if (filters.value.commune) {
    filtered = filtered.filter(r =>
      r.bureau_vote.centre_vote.commune === filters.value.commune
    )
  }

  return filtered
})

const noDataText = computed(() => {
  if (!election.value) return 'Aucune élection en cours'
  return 'Aucun PV disponible'
})

// Méthodes
const fetchPVs = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/pv')
    resultats.value = data.data.resultats
    election.value = data.data.election
  } catch (error) {
    toast.error('Erreur lors du chargement des PVs')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openPV = async (pv) => {
  loadingPV.value = true
  selectedPV.value = pv
  showPVDialog.value = true

  try {
    // On utilise une URL blob pour afficher le PDF dans l'iframe
    const response = await axios.get(`/pv/${pv.id}`, {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    pvContent.value = URL.createObjectURL(blob)
  } catch (error) {
    toast.error("Erreur lors de l'ouverture du PV")
    console.error(error)
    showPVDialog.value = false
  } finally {
    loadingPV.value = false
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

const formatDateTime = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}

const calculatePercentage = (value, total) => {
  if (!total) return '0'
  return ((value / total) * 100).toFixed(2)
}

const filterResults = () => {
  // Réinitialiser les filtres dépendants
  if (!filters.value.region) {
    filters.value.departement = null
    filters.value.commune = null
  }
  if (!filters.value.departement) {
    filters.value.commune = null
  }
}

// Nettoyage des URLs blob à la fermeture du dialogue
watch(showPVDialog, (newValue) => {
  if (!newValue && pvContent.value) {
    URL.revokeObjectURL(pvContent.value)
    pvContent.value = null
    selectedPV.value = null
  }
})

onMounted(fetchPVs)
</script>

<style scoped>
.pv-container {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
}
</style>
