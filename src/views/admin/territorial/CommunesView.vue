// src/views/admin/territorial/CommuneView.vue
<template>
  <div style="padding-top: 100px; padding-left: 250px;">
    <v-container>
      <!-- Titre et bouton d'ajout -->
      <v-row>
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Gestion des Communes</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="dialog = true"
          >
            Nouvelle Commune
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
        <v-col cols="12" md="4">
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
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedRegion"
            :items="regions"
            label="Filtrer par région"
            item-title="nom"
            item-value="id"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="onRegionChange"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedDepartement"
            :items="departements"
            label="Filtrer par département"
            item-title="nom"
            item-value="id"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            :disabled="!selectedRegion"
            @update:model-value="fetchCommunes"
          />
        </v-col>
      </v-row>

      <!-- Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="communes"
          :loading="loading"
          :search="search"
        >
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
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.nom"
                      label="Nom"
                      :rules="[
                        v => !!v || 'Le nom est requis',
                        v => v.length >= 2 || 'Minimum 2 caractères'
                      ]"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.code"
                      label="Code"
                      :rules="[
                        v => !!v || 'Le code est requis',
                        v => v.length >= 2 || 'Minimum 2 caractères'
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

      <!-- Dialog Confirmation Suppression -->
      <v-dialog
        v-model="deleteDialog"
        max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">Confirmation</span>
          </v-card-title>

          <v-card-text>
            Voulez-vous vraiment supprimer cette commune ?
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'

const router = useRouter()

// États
const loading = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(true)
const search = ref('')
const error = ref(null)
const communes = ref([])
const regions = ref([])
const departements = ref([])
const selectedRegion = ref(null)
const selectedDepartement = ref(null)
const form = ref(null)

const headers = [
  { title: 'Code', align: 'start', key: 'code' },
  { title: 'Nom', align: 'start', key: 'nom' },
  { title: 'Département', align: 'start', key: 'departement.nom' },
  { title: 'Actions', align: 'end', key: 'actions', sortable: false }
]

const defaultItem = {
  id: null,
  nom: '',
  code: '',
  region_id: null,
  departement_id: null
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// Computed
const formTitle = computed(() => editedItem.value.id ? 'Modifier la commune' : 'Nouvelle commune')

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
  } catch (err) {
    error.value = 'Erreur lors du chargement des départements'
  }
}

const fetchCommunes = async () => {
  loading.value = true
  try {
    let url = '/communes'
    const params = new URLSearchParams()

    if (selectedDepartement.value) {
      params.append('departement_id', selectedDepartement.value)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const { data } = await axios.get(url)
    communes.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des communes'
  } finally {
    loading.value = false
  }
}

const onRegionChange = async (regionId) => {
  selectedDepartement.value = null
  if (regionId) {
    await loadDepartements(regionId)
  } else {
    departements.value = []
  }
  fetchCommunes()
}

const editItem = (item) => {
  editedItem.value = { ...item }
  if (item.departement?.region_id) {
    editedItem.value.region_id = item.departement.region_id
    loadDepartements(item.departement.region_id)
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
    if (editedItem.value.id) {
      await axios.put(`/communes/${editedItem.value.id}`, editedItem.value)
      error.value = 'Commune modifiée avec succès'
    } else {
      await axios.post('/communes', editedItem.value)
      error.value = 'Commune créée avec succès'
    }

    await fetchCommunes()
    closeDialog()
  } catch (err) {
    error.value = 'Erreur lors de la sauvegarde de la commune'
  }
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  try {
    await axios.delete(`/communes/${selectedItem.value.id}`)
    error.value = 'Commune supprimée avec succès'
    await fetchCommunes()
    deleteDialog.value = false
  } catch (err) {
    error.value = 'Erreur lors de la suppression de la commune'
  }
}

// Initialisation
onMounted(async () => {
  await fetchRegions()
  await fetchCommunes()
})
</script>

<style scoped>
.v-card-text {
  padding-top: 20px;
}

.filter-section {
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.actions-cell {
  min-width: 120px;
}

.stats-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
}

.stats-item:last-child {
  border-bottom: none;
}

.dialog-card {
  border-radius: 8px;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 500;
}
</style>
