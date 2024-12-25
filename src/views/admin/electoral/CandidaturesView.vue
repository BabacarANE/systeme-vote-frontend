<template>
  <v-container style="padding-top: 60px; padding-left: 220px;">
    <!-- En-tête -->
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Candidatures</h1>
        <v-btn
          color="primary"
          @click="openCreateDialog"
          prepend-icon="mdi-plus"
        >
          Nouvelle Candidature
        </v-btn>
      </v-col>
    </v-row>

    <!-- Message d'erreur -->
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
          v-model="electionFilter"
          :items="elections"
          item-title="titre"
          item-value="id"
          label="Filtre par élection"
          density="comfortable"
          variant="outlined"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <!-- Table des candidatures -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredCandidatures"
        :loading="loading"
        :search="search"
        items-per-page="10"
        :sort-by="[{ key: 'election.titre', order: 'desc' }]"
      >
        <template #[`item.role_candidat.personne`]="{ item }">
          {{ item.role_candidat?.personne?.nom }} {{ item.role_candidat?.personne?.prenom }}
        </template>
        <!-- Colonne Statut -->
        <template #item.statut="{ item }">
          <v-chip :color="getStatusColor(item.statut)">
            {{ item.statut }}
          </v-chip>
        </template>

        <!-- Colonne Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <!-- Bouton Détails -->
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              @click="showDetails(item)"
              :title="'Voir les détails'"
            />

            <!-- Boutons d'édition/suppression (uniquement pour les candidatures en attente) -->
            <template v-if="item.statut === 'EN_ATTENTE' && item.election.statut === 'PLANIFIEE'">
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="warning"
                @click="editItem(item)"
                :title="'Modifier'"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                @click="confirmDelete(item)"
                :title="'Supprimer'"
              />
              <v-btn
                icon="mdi-check"
                size="small"
                color="success"
                @click="validateCandidate(item)"
                :title="'Valider'"
              />
              <v-btn
                icon="mdi-close"
                size="small"
                color="error"
                @click="rejectCandidate(item)"
                :title="'Rejeter'"
              />
            </template>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de création/édition -->
    <v-dialog v-model="dialog" persistent max-width="800">
      <v-card>
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form
            ref="formRef"
            v-model="isFormValid"
            @submit.prevent="save"
            lazy-validation
          >
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.election_id"
                    :items="filteredElections"
                    item-title="titre"
                    item-value="id"
                    label="Élection"
                    :rules="[(v) => !!v || 'L\'élection est requise']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.role_candidat_id"
                    :items="candidats"
                    item-title="nom_complet"
                    item-value="id"
                    label="Candidat"
                    :rules="[(v) => !!v || 'Le candidat est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.statut"
                    :items="statutOptions"
                    item-title="text"
                    item-value="value"
                    label="Statut"
                    :rules="[(v) => !!v || 'Le statut est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.date_inscription"
                    label="Date d'inscription"
                    type="date"
                    :rules="[(v) => !!v || 'La date d\'inscription est requise']"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="editedItem.bulletin"
                    label="Bulletin de candidature"
                    accept="application/pdf,image/*"

                    required
                    show-size
                    truncate-length="25"
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
            :loading="isSaving"
            :disabled="!isFormValid"
            @click="save"
          >
            Sauvegarder
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de détails -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center">
          Détails de la candidature
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            class="text-white"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-election</v-icon>
                  </template>
                  <v-list-item-title>Élection</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem?.election?.titre }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-account-tie</v-icon>
                  </template>
                  <v-list-item-title>Candidat</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.role_candidat?.personne?.nom }}
                    {{ selectedItem?.role_candidat?.personne?.prenom }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon :color="getStatusColor(selectedItem?.statut)">
                      {{ getStatusIcon(selectedItem?.statut) }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Statut</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem?.statut }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item v-if="selectedItem?.bulletin">
                  <template #prepend>
                    <v-icon color="primary">mdi-file-document</v-icon>
                  </template>
                  <v-list-item-title>Bulletin</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-btn
                      color="primary"
                      variant="text"
                      @click="downloadBulletin(selectedItem)"
                    >
                      Télécharger
                    </v-btn>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Date d'inscription</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(selectedItem?.date_inscription) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Confirmation de suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cette candidature ?
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
            :loading="isDeleting"
            @click="deleteItem"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de validation -->
    <v-dialog v-model="validateDialog" max-width="500">
      <v-card>
        <v-card-title>Validation de la candidature</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="validateComment"
            label="Commentaire de validation"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="validateDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            :loading="isValidating"
            @click="confirmValidation"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de rejet -->
    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card>
        <v-card-title>Rejet de la candidature</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="rejectReason"
            label="Motif de rejet"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="rejectDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            :loading="isRejecting"
            @click="confirmRejection"
          >
            Rejeter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// États
const loading = ref(false)
const error = ref(null)
const dialog = ref(false)
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const validateDialog = ref(false)
const rejectDialog = ref(false)
const formRef = ref(null)
const isFormValid = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const isValidating = ref(false)
const isRejecting = ref(false)
const search = ref('')
const electionFilter = ref(null)
const validateComment = ref('')
const rejectReason = ref('')

// Données
const candidatures = ref([])
const elections = ref([])
const candidats = ref([])

// État initial de l'item
const defaultItem = {
  election_id: '',
  role_candidat_id: '',
  statut: 'EN_ATTENTE',
  date_inscription: new Date().toISOString().substr(0, 10),
  bulletin: null
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// En-têtes du tableau
const headers = [
  { title: 'Élection', key: 'election.titre', sortable: true },
  { title: 'Candidat', key: 'role_candidat.personne', sortable: true }, // Modifié ici
  { title: 'Statut', key: 'statut', sortable: true },
  { title: 'Date d\'inscription', key: 'date_inscription', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

// Options pour le select de statut
const statutOptions = [
  { text: 'En attente', value: 'EN_ATTENTE' },
  { text: 'Validée', value: 'VALIDEE' },
  { text: 'Rejetée', value: 'REJETEE' }
]

// Règles de validation pour le bulletin
const bulletinRules = [
  v => !!v || 'Le bulletin est requis',
  v => !v || v.size <= 8388608 || 'Le fichier ne doit pas dépasser 8 Mo'
]

// Computed
const formTitle = computed(() =>
  editedItem.value.id ? 'Modifier la candidature' : 'Nouvelle candidature'
)

const filteredElections = computed(() =>
  elections.value.filter(e => e.statut === 'PLANIFIEE')
)

const filteredCandidatures = computed(() => {
  if (!electionFilter.value) return candidatures.value
  return candidatures.value.filter(c => c.election_id === electionFilter.value)
})

// Méthodes
const fetchCandidatures = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/candidatures?include=election,role_candidat.personne')
    candidatures.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des candidatures'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const fetchElections = async () => {
  try {
    const { data } = await axios.get('/elections?include=candidatures')
    elections.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des élections'
    console.error('Erreur:', err)
  }
}

const fetchCandidats = async () => {
  try {
    const { data } = await axios.get('/candidats?include=personne')
    candidats.value = data.data.map(item => ({
      id: item.id,
      nom_complet: `${item.personne.nom} ${item.personne.prenom}`
    }))
  } catch (err) {
    error.value = 'Erreur lors du chargement des candidats'
    console.error('Erreur:', err)
  }
}

const openCreateDialog = () => {
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  if (formRef.value) {
    formRef.value.reset()
  }
}

const save = async () => {
  console.log('Démarrage de la fonction save')
  if (!formRef.value || !await formRef.value.validate()) {
    return
  }

  isSaving.value = true

  try {
    // Création du FormData
    const formData = new FormData()
    formData.append('election_id', editedItem.value.election_id)
    formData.append('role_candidat_id', editedItem.value.role_candidat_id)
    formData.append('statut', editedItem.value.statut)
    formData.append('date_inscription', editedItem.value.date_inscription)

    // Ajout du bulletin si présent
    if (editedItem.value.bulletin instanceof File) {
      formData.append('bulletin', editedItem.value.bulletin)
    }

    console.log('Données à envoyer:', {
      election_id: editedItem.value.election_id,
      role_candidat_id: editedItem.value.role_candidat_id,
      statut: editedItem.value.statut,
      date_inscription: editedItem.value.date_inscription,
      bulletin: editedItem.value.bulletin ? editedItem.value.bulletin.name : 'Aucun fichier'
    })

    let response
    if (editedItem.value.id) {
      response = await axios.post(`candidatures/${editedItem.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      response = await axios.post('candidatures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    console.log('Réponse serveur:', response.data)
    toast.success('Candidature enregistrée avec succès')
    await fetchCandidatures()
    closeDialog()

  } catch (error) {
    console.error('Erreur:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    isSaving.value = false
  }
}
const showDetails = (item) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const editItem = (item) => {
  editedItem.value = { ...item }
  dialog.value = true
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  isDeleting.value = true
  try {
    await axios.delete(`/candidatures/${selectedItem.value.id}`)
    toast.success('Candidature supprimée avec succès')
    await fetchCandidatures()
    deleteDialog.value = false
  } catch (error) {
    console.error('Erreur:', error)
    toast.error('Erreur lors de la suppression de la candidature')
  } finally {
    isDeleting.value = false
  }
}

const validateCandidate = async (item) => {
  selectedItem.value = item
  try {
    // Appel direct à l'API sans dialog
    await axios.post(`candidatures/${item.id}/valider`)
    toast.success('Candidature validée avec succès')
    await fetchCandidatures()
  } catch (error) {
    console.error('Erreur:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la validation')
  }
}

const rejectCandidate = (item) => {
  selectedItem.value = item
  rejectReason.value = ''
  rejectDialog.value = true
}

const confirmRejection = async () => {
  if (!rejectReason.value) {
    toast.error('Le motif de rejet est requis')
    return
  }

  isRejecting.value = true
  try {
    await axios.post(`/candidatures/${selectedItem.value.id}/rejeter`, {
      motif_rejet: rejectReason.value
    })
    toast.success('Candidature rejetée avec succès')
    await fetchCandidatures()
    rejectDialog.value = false
  } catch (error) {
    console.error('Erreur:', error)
    toast.error(error.response?.data?.message || 'Erreur lors du rejet')
  } finally {
    isRejecting.value = false
  }
}

const downloadBulletin = (item) => {
  window.open(item.bulletin, '_blank')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const getStatusColor = (status) => {
  switch (status) {
    case 'EN_ATTENTE': return 'warning'
    case 'VALIDEE': return 'success'
    case 'REJETEE': return 'error'
    default: return ''
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'EN_ATTENTE': return 'mdi-clock-time-three-outline'
    case 'VALIDEE': return 'mdi-check-circle'
    case 'REJETEE': return 'mdi-close-circle'
    default: return ''
  }
}

// Initialisation
onMounted(() => {
  fetchCandidatures()
  fetchElections()
  fetchCandidats()
})
</script>

<style scoped>
.v-data-table {
  background: white !important;
}

.gap-2 {
  gap: 8px;
}

.v-card-title {
  padding: 16px;
  font-size: 1.25rem;
  font-weight: 500;
}

.v-card-text {
  padding-top: 20px;
}

.v-btn {
  text-transform: none;
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
</style>
