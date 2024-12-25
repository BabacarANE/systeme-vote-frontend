<template>
  <div>
    <!-- En-tête avec les actions principales -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Journal des Votes</h1>
        <v-btn-group>
          <v-btn
            color="primary"
            prepend-icon="mdi-filter-variant"
            @click="showFilters = !showFilters"
            class="mr-2"
          >
            Filtres
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-chart-bar"
            @click="showStats = true"
            class="mr-2"
          >
            Statistiques
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-microsoft-excel"
            @click="exportData"
          >
            Exporter
          </v-btn>
        </v-btn-group>
      </v-col>
    </v-row>

    <!-- Panneau des filtres -->
    <v-expand-transition>
      <v-card v-if="showFilters" class="mb-4">
        <v-card-text>
          <v-row>
            <!-- Filtres de date -->
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="6">
                  <v-menu
                    v-model="dateDebutMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="filters.date_debut"
                        label="Date début"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                      />
                    </template>
                    <v-date-picker
                      v-model="filters.date_debut"
                      @update:model-value="dateDebutMenu = false"
                    />
                  </v-menu>
                </v-col>
                <v-col cols="6">
                  <v-menu
                    v-model="dateFinMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="filters.date_fin"
                        label="Date fin"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                      />
                    </template>
                    <v-date-picker
                      v-model="filters.date_fin"
                      @update:model-value="dateFinMenu = false"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-col>

            <!-- Filtre numéro électeur -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="filters.numero_electeur"
                label="Numéro électeur"
                prepend-icon="mdi-card-account-details"
                clearable
              />
            </v-col>

            <!-- Filtres territoriaux -->
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.pays_id"
                :items="territorialData.pays"
                item-title="nom"
                item-value="id"
                label="Pays"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.region_id"
                :items="territorialData.regions"
                item-title="nom"
                item-value="id"
                label="Région"
                clearable
                :disabled="!filters.pays_id"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="filters.departement_id"
                :items="territorialData.departements"
                item-title="nom"
                item-value="id"
                label="Département"
                clearable
                :disabled="!filters.region_id"
              />
            </v-col>
          </v-row>

          <!-- Actions des filtres -->
          <v-row>
            <v-col class="text-right">
              <v-btn
                color="error"
                variant="text"
                @click="resetFilters"
                class="mr-2"
              >
                Réinitialiser
              </v-btn>
              <v-btn
                color="primary"
                @click="applyFilters"
              >
                Appliquer
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- Tableau des données -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :server-items-length="totalItems"
        class="elevation-1"
        @update:page="page = $event"
      >
        <!-- Slots pour chaque colonne -->
        <template v-slot:item.horodatage="{ item }">
          {{ item?.horodatage ? formatDateTime(item.horodatage) : '-' }}
        </template>

        <template v-slot:item.numero_electeur="{ item }">
          {{ item?.numero_electeur || '-' }}
        </template>

        <template v-slot:item.lieu_vote="{ item }">
          {{ formatLieuVote(item) }}
        </template>

        <template v-slot:item.ip_address="{ item }">
          {{ item?.ip_address || '-' }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog Statistiques -->
    <v-dialog v-model="showStats" fullscreen>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showStats = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Statistiques des votes</v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          <v-container fluid>
            <!-- Cartes de statistiques -->
            <v-row>
              <v-col cols="12" md="3">
                <v-card>
                  <v-card-text class="text-center">
                    <div class="text-h6 mb-2">Total votes</div>
                    <div class="text-h4">{{ statsData.global.total_votes }}</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3">
                <v-card>
                  <v-card-text class="text-center">
                    <div class="text-h6 mb-2">Taux de participation</div>
                    <div class="text-h4">{{ statsData.global.taux_participation }}%</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Graphiques -->
            <v-row class="mt-6">
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Distribution horaire</v-card-title>
                  <v-card-text style="height: 400px">
                    <VChart :option="chartOptions" autoresize />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
// Imports
import { ref, reactive, computed, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import axiosInstance from '@/plugins/axios'
import { formatDateTime } from '@/utils/dateFormatter'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'

// Configuration d'ECharts
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// États
const loading = ref(false)
const showStats = ref(false)
const showFilters = ref(false)
const dateDebutMenu = ref(false)
const dateFinMenu = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const items = ref([])
const totalItems = ref(0)

// États réactifs
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

const filters = reactive({
  date_debut: null,
  date_fin: null,
  numero_electeur: '',
  pays_id: null,
  region_id: null,
  departement_id: null
})

const territorialData = reactive({
  pays: [],
  regions: [],
  departements: []
})

const statsData = reactive({
  global: {
    total_votes: 0,
    taux_participation: 0,
    bureaux_actifs: 0,
    moyenne_votes_heure: 0
  },
  distribution_horaire: [],
  distribution_journaliere: [],
  territorial: {
    par_region: [],
    par_departement: [],
    par_commune: []
  }
})

// Computed properties
const headers = computed(() => [
  {
    title: 'Date/Heure',
    key: 'horodatage',
    sortable: true,
    align: 'start'
  },
  {
    title: 'N° Électeur',
    key: 'numero_electeur',
    sortable: true
  },
  {
    title: 'Lieu de vote',
    key: 'lieu_vote',
    sortable: false
  },
  {
    title: 'IP',
    key: 'ip_address',
    sortable: false
  }
])

const chartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: statsData.distribution_horaire.map(h => `${h.heure}h`),
    axisLabel: { interval: 0 }
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    name: 'Votes',
    type: 'bar',
    data: statsData.distribution_horaire.map(h => h.total),
    itemStyle: {
      color: '#1867C0'
    },
    label: {
      show: true,
      position: 'top'
    }
  }]
}))

// Méthodes
const showNotification = (text, color = 'success') => {
  snackbar.show = true
  snackbar.text = text
  snackbar.color = color
  snackbar.timeout = color === 'error' ? 6000 : 3000
}

const fetchData = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value,
      per_page: itemsPerPage.value,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      )
    })

    const response = await axiosInstance.get(`/journal-votes/search?${params}`)

    if (response.data?.success) {
      items.value = response.data.data?.data || []
      totalItems.value = response.data.data?.total || 0
    } else {
      items.value = []
      totalItems.value = 0
    }
  } catch (error) {
    console.error('Erreur fetchData:', error)
    showNotification('Erreur lors du chargement des données', 'error')
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const loadTerritorialData = async (type, parentId = null) => {
  try {
    let endpoint = '/journal-votes'

    switch(type) {
      case 'pays':
        endpoint += '/pays'
        break
      case 'regions':
        endpoint += `/pays/${parentId}/regions`
        break
      case 'departements':
        endpoint += `/regions/${parentId}/departements`
        break
      case 'communes':
        endpoint += `/departements/${parentId}/communes`
        break
      case 'centres':
        endpoint += `/communes/${parentId}/centres`
        break
      case 'bureaux':
        endpoint += `/centres/${parentId}/bureaux`
        break
    }

    const { data } = await axiosInstance.get(endpoint)
    if (data.success && data.data) {
      territorialData[type] = data.data
    }
  } catch (error) {
    console.error('Erreur loadTerritorialData:', error)
    showNotification('Erreur lors du chargement des données territoriales', 'error')
    territorialData[type] = []
  }
}

const loadStatistics = async () => {
  try {
    const [global, horaire, journalier, territorial] = await Promise.all([
      axiosInstance.get('/journal-votes/statistiques/global'),
      axiosInstance.get('/journal-votes/analyse-horaire'),
      axiosInstance.get('/journal-votes/analyse-journaliere'),
      axiosInstance.get('/journal-votes/statistiques/territorial')
    ])

    statsData.global = global.data
    statsData.distribution_horaire = horaire.data
    statsData.distribution_journaliere = journalier.data
    statsData.territorial = territorial.data
  } catch (error) {
    console.error('Erreur loadStatistics:', error)
    showNotification('Erreur lors du chargement des statistiques', 'error')
  }
}

const exportData = async () => {
  try {
    const params = new URLSearchParams(filters)
    const response = await axiosInstance.get(`/journal-votes/export?${params}`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `journal-votes-${formatDateTime(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showNotification('Export réalisé avec succès')
  } catch (error) {
    console.error('Erreur exportData:', error)
    showNotification('Erreur lors de l\'export', 'error')
  }
}

// Suite du script setup...

// Reset filters (suite)
const resetFilters = () => {
  Object.keys(filters).forEach(key => filters[key] = null)
  page.value = 1
  Object.keys(territorialData).forEach(key => {
    if (key !== 'pays') territorialData[key] = []
  })
  fetchData()
}

const formatLieuVote = (item) => {
  if (!item?.bureau_de_vote) return '-'

  const bureau = item.bureau_de_vote
  const centre = bureau.centre_de_vote
  const commune = centre?.commune

  return [
    bureau.nom,
    centre?.nom,
    commune?.nom
  ].filter(Boolean).join(' - ') || '-'
}

const applyFilters = () => {
  page.value = 1
  fetchData()
}

// Watchers
watch(() => filters.pays_id, async (newVal) => {
  if (newVal) {
    await loadTerritorialData('regions', newVal)
  }
  filters.region_id = null
  filters.departement_id = null

  // Réinitialisation des données territoriales
  territorialData.regions = []
  territorialData.departements = []
})

watch(() => filters.region_id, async (newVal) => {
  if (newVal) {
    await loadTerritorialData('departements', newVal)
  }
  filters.departement_id = null
  territorialData.departements = []
})

watch(() => filters.departement_id, async (newVal) => {
  if (newVal) {
    await loadTerritorialData('communes', newVal)
  }
})

watch(page, () => {
  fetchData()
})

watch(showStats, async (val) => {
  if (val) {
    await loadStatistics()
  }
})

// Initialisation
onMounted(async () => {
  await loadTerritorialData('pays')
  await fetchData()
})
</script>
