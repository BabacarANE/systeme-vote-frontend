```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Candidats</h1>
        <v-btn
          color="primary"
          @click="openCreateDialog"
          prepend-icon="mdi-plus"
        >
          Nouveau Candidat
        </v-btn>
      </v-col>
    </v-row>

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

    <v-row class="mb-4">
      <v-col cols="12" md="6">
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
      <v-col cols="12" md="6">
        <v-select
          v-model="partiFilter"
          :items="partis"
          label="Filtre par parti"
          density="comfortable"
          variant="outlined"
          hide-details
          clearable
          @update:model-value="fetchCandidats"
        />
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="candidats"
        :loading="loading"
        :search="search"
        items-per-page="10"
      >
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              @click="showDetails(item.raw)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              @click="editItem(item.raw)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              @click="confirmDelete(item.raw)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de création/édition -->
    <v-dialog v-model="dialog" persistent max-width="800">
      <v-card>
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container>
              <!-- Informations personnelles -->
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 font-weight-bold mb-2">
                    Informations personnelles
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.nom"
                    label="Nom"
                    :rules="[v => !!v || 'Le nom est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.prenom"
                    label="Prénom"
                    :rules="[v => !!v || 'Le prénom est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.sexe"
                    :items="['M', 'F']"
                    label="Sexe"
                    :rules="[v => !!v || 'Le sexe est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.date_naissance"
                    label="Date de naissance"
                    type="date"
                    :rules="[v => !!v || 'La date de naissance est requise']"
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
              </v-row>

              <!-- Informations candidat -->
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 font-weight-bold mb-2">
                    Informations candidat
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.parti"
                    label="Parti politique"
                    :rules="[v => !!v || 'Le parti est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.profession"
                    label="Profession"
                    :rules="[v => !!v || 'La profession est requise']"
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

    <!-- Dialog de détails -->
    <v-dialog v-model="detailsDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center">
          Détails du candidat
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            class="text-white"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-card-text class="pt-4">
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-account</v-icon>
              </template>
              <v-list-item-title>Nom complet</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.nom }} {{ selectedItem?.prenom }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-calendar</v-icon>
              </template>
              <v-list-item-title>Date de naissance</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.date_naissance }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-flag</v-icon>
              </template>
              <v-list-item-title>Parti politique</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.parti }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-briefcase</v-icon>
              </template>
              <v-list-item-title>Profession</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.profession }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-identifier</v-icon>
              </template>
              <v-list-item-title>Code</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.code }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Confirmation de suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer ce candidat ?
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
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// États
const loading = ref(false)
const dialog = ref(false)
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(false)
const search = ref('')
const error = ref(null)

// Données
const candidats = ref([])
const partis = ref([])
const partiFilter = ref(null)
const form = ref(null)

// En-têtes du tableau
const headers = [
  { title: 'Nom', key: 'nom', sortable: true },
  { title: 'Prénom', key: 'prenom', sortable: true },
  { title: 'Parti', key: 'parti', sortable: true },
  { title: 'Profession', key: 'profession', sortable: true },
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

// Item par défaut
const defaultItem = {
  nom: '',
  prenom: '',
  date_naissance: '',
  sexe: '',
  adresse: '',
  parti: '',
  profession: ''
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// Computed
const formTitle = computed(() =>
  editedItem.value.id ? 'Modifier le candidat' : 'Nouveau candidat'
)

// Méthodes
const fetchCandidats = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/candidats?include=personne')
    candidats.value = data.data.map(item => ({
      id: item.id,
      nom: item.personne.nom,
      prenom: item.personne.prenom,
      date_naissance: item.personne.date_naissance,
      sexe: item.personne.sexe,
      adresse: item.personne.adresse,
      parti: item.parti,
      profession: item.profession,
      code: item.code
    }))
    partis.value = [...new Set(candidats.value.map(c => c.parti))]
  } catch (err) {
    error.value = 'Erreur lors du chargement des candidats'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const showDetails = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const editItem = (item) => {
  editedItem.value = { ...item }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    form.value?.reset()
  }, 300)
}

const save = async () => {
  if (!form.value?.validate()) return

  try {
    const dataToSend = {
      nom: editedItem.value.nom,
      prenom: editedItem.value.prenom,
      date_naissance: editedItem.value.date_naissance,
      sexe: editedItem.value.sexe,
      adresse: editedItem.value.adresse,
      parti: editedItem.value.parti,
      profession: editedItem.value.profession
    }

    await axios.post('/register/candidat', dataToSend)
    toast.success('Candidat enregistré avec succès')
    await fetchCandidats()
    closeDialog()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement'
    console.error('Erreur:', err)
  }
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  try {
    await axios.delete(`/candidats/${selectedItem.value.id}`)
    toast.success('Candidat supprimé avec succès')
    await fetchCandidats()
    deleteDialog.value = false
  } catch (err) {
    error.value = 'Erreur lors de la suppression'
    console.error('Erreur:', err)
    toast.error('Erreur lors de la suppression du candidat')
  }
}

// Watchers
watch(partiFilter, async (newValue) => {
  if (newValue) {
    loading.value = true
    try {
      const { data } = await axios.get(`/candidats?include=personne&parti=${newValue}`)
      candidats.value = data.data.map(item => ({
        id: item.id,
        nom: item.personne.nom,
        prenom: item.personne.prenom,
        date_naissance: item.personne.date_naissance,
        sexe: item.personne.sexe,
        adresse: item.personne.adresse,
        parti: item.parti,
        profession: item.profession,
        code: item.code
      }))
    } catch (err) {
      error.value = 'Erreur lors du filtrage par parti'
      console.error('Erreur:', err)
    } finally {
      loading.value = false
    }
  } else {
    fetchCandidats()
  }
})
// Initialisation
onMounted(() => {
  fetchCandidats()
})
</script>

<style scoped>
.v-data-table {
  background: white !important;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.v-list-item {
  min-height: 48px;
  margin-bottom: 8px;
}

.v-list-item-title {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  font-size: 1rem !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.text-subtitle-1.font-weight-bold {
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 16px;
}

.gap-2 {
  gap: 8px;
}

/* Style pour les dialogues */
:deep(.v-card-title) {
  padding: 16px;
  font-size: 1.25rem;
  font-weight: 500;
}

:deep(.v-card-text) {
  padding-top: 20px;
}

:deep(.v-btn) {
  text-transform: none;
}

/* Style pour le formulaire */
:deep(.v-text-field .v-input__details) {
  padding-inline-start: 16px;
}

:deep(.v-input--error) {
  margin-bottom: 16px;
}

/* Animations de transition */
.v-dialog {
  transition: opacity 0.2s ease-in-out;
}

.v-dialog-transition-enter-active,
.v-dialog-transition-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.v-dialog-transition-enter,
.v-dialog-transition-leave-to {
  opacity: 0;
}
</style>
