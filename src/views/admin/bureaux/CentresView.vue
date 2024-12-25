<template>
  <div style="padding-top: 100px; padding-left: 250px;">
    <v-container>
      <!-- Titre et bouton d'ajout -->
      <v-row>
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Gestion des Centres de Vote</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="dialog = true"
          >
            Nouveau Centre de Vote
          </v-btn>
        </v-col>
      </v-row>

      <!-- Alert d'erreur -->
      <v-alert
        v-if="error"
        type="error"
        closable
        variant="tonal"
        class="mb-4"
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <!-- Filtres -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Rechercher"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedRegion"
            :items="regions"
            label="Filtre par région"
            item-title="nom"
            item-value="id"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="onRegionChange"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedDepartement"
            :items="departements"
            label="Filtre par département"
            item-title="nom"
            item-value="id"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            :disabled="!selectedRegion"
            @update:model-value="onDepartementChange"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedCommune"
            :items="communes"
            label="Filtre par commune"
            item-title="nom"
            item-value="id"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            :disabled="!selectedDepartement"
            @update:model-value="fetchCentres"
          />
        </v-col>
      </v-row>

      <!-- Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="centres"
          :loading="loading"
          :search="search"
        >
          <template #[`item.nombre_bureaux`]="{ item }">
            {{ item.nombre_de_bureau }}
          </template>

          <template #[`item.actions`]="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              class="mr-2"
              @click="showDetails(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              class="mr-2"
              @click="editItem(item)"
            />
            <v-btn
              icon="mdi-office-building-cog"
              size="small"
              color="success"
              class="mr-2"
              @click="manageBureaux(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              @click="confirmDelete(item)"
            />
          </template>
        </v-data-table>
      </v-card>

      <!-- Dialog Form -->
      <v-dialog
        v-model="dialog"
        max-width="600px"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="save">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="editedItem.region_id"
                      :items="regions"
                      label="Région"
                      item-title="nom"
                      item-value="id"
                      :rules="[v => !!v || 'La région est requise']"
                      @update:model-value="loadDepartements"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="editedItem.departement_id"
                      :items="departements"
                      label="Département"
                      item-title="nom"
                      item-value="id"
                      :rules="[v => !!v || 'Le département est requis']"
                      :disabled="!editedItem.region_id"
                      @update:model-value="loadCommunes"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="editedItem.commune_id"
                      :items="communes"
                      label="Commune"
                      item-title="nom"
                      item-value="id"
                      :rules="[v => !!v || 'La commune est requise']"
                      :disabled="!editedItem.departement_id"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.nom"
                      label="Nom du centre"
                      :rules="[
                        v => !!v || 'Le nom est requis',
                        v => v.length >= 2 || 'Minimum 2 caractères'
                      ]"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.adresse"
                      label="Adresse"
                      :rules="[v => !!v || 'L\'adresse est requise']"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model.number="editedItem.nombre_de_bureau"
                      label="Nombre de bureaux"
                      type="number"
                      :rules="[
                        v => !!v || 'Le nombre de bureaux est requis',
                        v => v > 0 || 'Le nombre doit être supérieur à 0'
                      ]"
                      required
                    />
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="closeDialog"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              :disabled="!valid"
              @click="save"
            >
              Sauvegarder
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog Détails -->
      <!-- Dialog Détails -->
      <v-dialog v-model="detailsDialog" max-width="500px">
        <v-card>
          <v-card-title class="bg-primary text-white">
            Détails du centre de vote
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="detailsDialog = false"
              class="text-white"
            ></v-btn>
          </v-card-title>

          <v-card-text class="pt-4">
            <v-list>
              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-office-building</v-icon>
                </template>
                <v-list-item-title>Nom</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.nom || '-' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>Adresse</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.adresse || '-' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-city</v-icon>
                </template>
                <v-list-item-title>Commune</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.commune?.nom || '-' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-door</v-icon>
                </template>
                <v-list-item-title>Bureaux prévus</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.nombre_de_bureau || '0' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="success">mdi-door-open</v-icon>
                </template>
                <v-list-item-title>Bureaux actifs</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.bureaux_de_vote?.length || '0' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Électeurs inscrits</v-list-item-title>
                <v-list-item-subtitle>{{ electeursInscrits }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="detailsDialog = false"
            >
              FERMER
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog Confirmation Suppression -->
      <v-dialog
        v-model="deleteDialog"
        max-width="500px"
      >
        <v-card>
          <v-card-title>Confirmation</v-card-title>
          <v-card-text>
            Voulez-vous vraiment supprimer ce centre de vote ?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="deleteDialog = false"
            >
              Annuler
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="deleteItem"
            >
              Confirmer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/plugins/axios'

const router = useRouter()
const route = useRoute()

// États
const loading = ref(false)
const dialog = ref(false)
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(true)
const search = ref('')
const error = ref(null)

const centres = ref([])
const regions = ref([])
const departements = ref([])
const communes = ref([])

const selectedRegion = ref(null)
const selectedDepartement = ref(null)
const selectedCommune = ref(null)
const form = ref(null)

const headers = [
  { title: 'Nom', key: 'nom' },
  { title: 'Adresse', key: 'adresse' },
  { title: 'Commune', key: 'commune.nom' },
  { title: 'Bureaux prévus', key: 'nombre_bureaux' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const defaultItem = {
  id: null,
  nom: '',
  adresse: '',
  nombre_de_bureau: 1,
  commune_id: null,
  departement_id: null,
  region_id: null
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// Computed
const formTitle = computed(() =>
  editedItem.value.id ? 'Modifier le centre de vote' : 'Nouveau centre de vote'
)

// Méthodes
const fetchRegions = async () => {
  try {
    const { data } = await axios.get('/regions')
    regions.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des régions'
  }
}

const loadDepartements = async (regionId) => {
  if (!regionId) return
  try {
    const { data } = await axios.get(`/departements?region_id=${regionId}`)
    departements.value = data.data
    editedItem.value.departement_id = null
    editedItem.value.commune_id = null
  } catch (err) {
    error.value = 'Erreur lors du chargement des départements'
  }
}

const loadCommunes = async (departementId) => {
  if (!departementId) return
  try {
    const { data } = await axios.get(`/communes?departement_id=${departementId}`)
    communes.value = data.data
    editedItem.value.commune_id = null
  } catch (err) {
    error.value = 'Erreur lors du chargement des communes'
  }
}

const fetchCentres = async () => {
  loading.value = true
  try {
    let url = '/centres-de-vote'
    const params = new URLSearchParams()

    if (selectedCommune.value) {
      params.append('commune_id', selectedCommune.value)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const { data } = await axios.get(url)
    centres.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des centres de vote'
  } finally {
    loading.value = false
  }
}

const onRegionChange = async (regionId) => {
  selectedDepartement.value = null
  selectedCommune.value = null
  if (regionId) {
    await loadDepartements(regionId)
  } else {
    departements.value = []
    communes.value = []
  }
  fetchCentres()
}

const onDepartementChange = async (departementId) => {
  selectedCommune.value = null
  if (departementId) {
    await loadCommunes(departementId)
  } else {
    communes.value = []
  }
  fetchCentres()
}

// Computed pour calculer le total des électeurs inscrits
const electeursInscrits = computed(() => {
  if (!selectedItem.value?.bureaux_de_vote) return '0'
  return selectedItem.value.bureaux_de_vote.reduce((total, bureau) => {
    return total + (bureau.nombre_inscrits || 0)
  }, 0)
})

// Méthode mise à jour pour charger les détails
const showDetails = async (item) => {
  try {
    selectedItem.value = null // Reset pour éviter d'afficher les anciennes données
    const { data } = await axios.get(`/centres-de-vote/${item.id}`)
    selectedItem.value = data.data
    detailsDialog.value = true
  } catch (err) {
    error.value = 'Erreur lors du chargement des détails'
  }
}


const editItem = (item) => {
  editedItem.value = { ...item }
  if (item.commune?.departement?.region_id) {
    editedItem.value.region_id = item.commune.departement.region_id
    editedItem.value.departement_id = item.commune.departement_id
    loadDepartements(item.commune.departement.region_id).then(() => {
      loadCommunes(item.commune.departement_id)
    })
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  form.value?.reset()
}

const save = async () => {
  if (!form.value?.validate()) return

  try {
    const formData = {
      nom: editedItem.value.nom,
      adresse: editedItem.value.adresse,
      nombre_de_bureau: parseInt(editedItem.value.nombre_de_bureau),
      commune_id: editedItem.value.commune_id
    }

    if (editedItem.value.id) {
      await axios.put(`/centres-de-vote/${editedItem.value.id}`, formData)
      error.value = 'Centre de vote modifié avec succès'
    } else {
      await axios.post('/centres-de-vote', formData)
      error.value = 'Centre de vote créé avec succès'
    }

    await fetchCentres()
    closeDialog()
  } catch (err) {
    error.value = 'Erreur lors de la sauvegarde du centre de vote'
  }
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  try {
    await axios.delete(`/centres-de-vote/${selectedItem.value.id}`)
    error.value = 'Centre de vote supprimé avec succès'
    await fetchCentres()
    deleteDialog.value = false
  } catch (err) {
    error.value = 'Erreur lors de la suppression du centre de vote'
  }
}

const manageBureaux = (item) => {
  router.push({
    name: 'bureaux-vote',
    params: { centreId: item.id }
  })
}

// Watchers
watch([selectedRegion, selectedDepartement, selectedCommune], () => {
  fetchCentres()
}, { deep: true })

// Initialization
onMounted(async () => {
  if (route.params.centreId) {
    await loadInitialData(route.params.centreId)
  } else {
    await fetchRegions()
    await fetchCentres()
  }
})
</script>

<style scoped>
.filter-section {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
}

.details-list {
  padding: 0;
}

.details-list-item {
  margin-bottom: 12px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.details-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.details-content {
  color: rgba(0, 0, 0, 0.87);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.v-list-item {
  min-height: 48px;
}

.v-list-item-title {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
}

.v-list-item-subtitle {
  font-size: 1rem !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.v-card-text {
  padding-top: 20px !important;
}
</style>
