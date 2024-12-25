<template>
  <div style="padding-top: 100px; padding-left: 250px;">
    <v-container>
      <!-- Titre et bouton d'ajout -->
      <v-row>
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Gestion des Bureaux de Vote</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"

          >
            Nouveau Bureau de Vote
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
            v-model="selectedCentre"
            :items="centres"
            label="Filtre par centre"
            item-title="nom"
            item-value="id"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="fetchBureaux"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="statutFilter"
            :items="['ACTIF', 'INACTIF']"
            label="Filtre par statut"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="fetchBureaux"
          />
        </v-col>
      </v-row>

      <!-- Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="bureaux"
          :loading="loading"
          :search="search"
        >
          <template #[`item.statut`]="{ item }">
            <v-chip
              :color="getStatusColor(item.statut)"
              size="small"
              class="text-uppercase"
            >
              {{ item.statut }}
            </v-chip>
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
              icon="mdi-ballot"
              size="small"
              color="success"
              class="mr-2"
              @click="gererVotes(item)"
              v-if="item.statut === 'ACTIF'"
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
            <v-form ref="form" v-model="valid">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="editedItem.centre_de_vote_id"
                      :items="centres"
                      label="Centre de vote"
                      item-title="nom"
                      item-value="id"
                      :rules="[v => !!v || 'Le centre de vote est requis']"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.nom"
                      label="Nom du bureau"
                      :rules="[
                        v => !!v || 'Le nom est requis',
                        v => v.length >= 2 || 'Minimum 2 caractères'
                      ]"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="editedItem.statut"
                      :items="['ACTIF', 'INACTIF']"
                      label="Statut"
                      :rules="[v => !!v || 'Le statut est requis']"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model.number="editedItem.nombre_inscrits"
                      label="Nombre d'électeurs inscrits"
                      type="number"
                      :rules="[
                        v => !!v || 'Le nombre d\'électeurs est requis',
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
      <v-dialog v-model="detailsDialog" max-width="500px">
        <v-card>
          <v-card-title class="bg-primary text-white">
            Détails du bureau de vote
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
                  <v-icon color="primary">mdi-domain</v-icon>
                </template>
                <v-list-item-title>Centre de vote</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.centre_de_vote?.nom || '-' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Statut</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="getStatusColor(selectedItem?.statut)"
                    size="small"
                    class="text-uppercase"
                  >
                    {{ selectedItem?.statut }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Électeurs inscrits</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.nombre_inscrits || '0' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="selectedItem?.liste_electorale">
                <template v-slot:prepend>
                  <v-icon color="success">mdi-clipboard-list</v-icon>
                </template>
                <v-list-item-title>Liste électorale</v-list-item-title>
                <v-list-item-subtitle>{{ selectedItem?.liste_electorale?.code }}</v-list-item-subtitle>
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
            Voulez-vous vraiment supprimer ce bureau de vote ?
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
const valid = ref(false)
const search = ref('')
const error = ref(null)

const bureaux = ref([])
const centres = ref([])

const selectedCentre = ref(null)
const statutFilter = ref(null)
const currentCentre = ref(null)
const form = ref(null)

const headers = [
  { title: 'Nom', key: 'nom' },
  { title: 'Centre', key: 'centre_de_vote.nom' },
  { title: 'Statut', key: 'statut' },
  { title: 'Électeurs inscrits', key: 'nombre_inscrits', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const defaultItem = {
  id: null,
  nom: '',
  centre_de_vote_id: null,
  statut: 'INACTIF',
  nombre_inscrits: 500
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// Computed
const formTitle = computed(() =>
  editedItem.value.id ? 'Modifier le bureau de vote' : 'Nouveau bureau de vote'
)

// Méthodes
const fetchCentres = async () => {
  try {
    const { data } = await axios.get('/centres-de-vote')
    centres.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des centres de vote'
  }
}

const fetchBureaux = async () => {
  loading.value = true
  try {
    let url = '/bureaux-de-vote'
    const params = new URLSearchParams()

    if (selectedCentre.value) {
      params.append('centre_de_vote_id', selectedCentre.value)
    }
    if (statutFilter.value) {
      params.append('statut', statutFilter.value)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const { data } = await axios.get(url)
    bureaux.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des bureaux de vote'
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editedItem.value = {
    ...defaultItem,
    centre_de_vote_id: selectedCentre.value,
    statut: 'INACTIF',
    nombre_inscrits: 500
  };
  dialog.value = true;
};

const showDetails = async (item) => {
  try {
    selectedItem.value = null
    const { data } = await axios.get(`/bureaux-de-vote/${item.id}`)
    selectedItem.value = data.data
    detailsDialog.value = true
  } catch (err) {
    error.value = 'Erreur lors du chargement des détails'
  }
}

const editItem = (item) => {
  editedItem.value = {
    id: item.id,
    nom: item.nom,
    centre_de_vote_id: item.centre_de_vote_id,
    statut: item.statut,
    nombre_inscrits: item.nombre_inscrits
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  if (form.value) form.value.reset()
}
const save = async () => {
  if (!form.value?.validate()) return

  try {
    const formData = {
      nom: editedItem.value.nom,
      // Utiliser le bon nom du champ pour le centre de vote
      centre_de_vote_id: parseInt(editedItem.value.centre_de_vote_id),
      statut: editedItem.value.statut || 'INACTIF',
      nombre_inscrits: parseInt(editedItem.value.nombre_inscrits)
    }

    console.log('Données à envoyer:', formData)

    if (editedItem.value.id) {
      console.log('Update bureau:', editedItem.value.id)
      const { data } = await axios.put(`/bureaux-de-vote/${editedItem.value.id}`, formData)
      console.log('Réponse update:', data)
    } else {
      console.log('Create bureau')
      const { data } = await axios.post('/bureaux-de-vote', formData)
      console.log('Réponse create:', data)
    }

    await fetchBureaux()
    dialog.value = false
  } catch (err) {
    console.error('Erreur complète:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la sauvegarde'
  }
}


const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  try {
    await axios.delete(`/bureaux-de-vote/${selectedItem.value.id}`)
    error.value = 'Bureau de vote supprimé avec succès'
    await fetchBureaux()
    deleteDialog.value = false
  } catch (err) {
    error.value = 'Erreur lors de la suppression du bureau de vote'
    console.error(err)
  }
}

const gererVotes = (item) => {
  router.push({
    name: 'gestion-votes',
    params: { bureauId: item.id }
  })
}

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIF':
      return 'success'
    case 'INACTIF':
      return 'error'
    default:
      return 'grey'
  }
}

const loadInitialData = async () => {
  try {
    await fetchCentres()

    if (route.params.centreId) {
      const centreId = parseInt(route.params.centreId)
      selectedCentre.value = centreId

      const { data } = await axios.get(`/centres-de-vote/${centreId}`)
      currentCentre.value = data.data

      const params = new URLSearchParams()
      params.append('centre_de_vote_id', centreId)
      const response = await axios.get(`/bureaux-de-vote?${params}`)
      bureaux.value = response.data.data
    } else {
      await fetchBureaux()
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement initial des données'
    console.error(err)
  }
}

// Watchers
watch([selectedCentre, statutFilter], () => {
  fetchBureaux()
}, { deep: true })

// Initialization
onMounted(() => {
  loadInitialData()
})
</script>


<style scoped>
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.text-subtitle-1 {
  opacity: 0.7;
}

.status-chip {
  min-width: 80px;
  justify-content: center;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
}

.detail-item {
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
}
</style>

