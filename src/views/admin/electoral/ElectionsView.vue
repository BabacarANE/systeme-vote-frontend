<template>
  <v-container style="padding-top: 60px; padding-left: 175px;">
    <!-- En-tête -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Élections</h1>
        <v-btn
          color="primary"
          @click="openCreateDialog"
          prepend-icon="mdi-plus"
        >
          Nouvelle Élection
        </v-btn>
      </v-col>
    </v-row>

    <!-- Alerte d'erreur -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Table des élections -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="elections"
        :loading="loading"
        :search="search"
      >
        <template #top>
          <v-card-title class="d-flex align-center pa-4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Rechercher"
              single-line
              hide-details
              density="comfortable"
              class="mr-4"
            />
          </v-card-title>
        </template>

        <!-- Colonne Statut -->
        <template #item.statut="{ item }">
          <v-chip
            :color="getStatusColor(item.statut)"
            size="small"
          >
            {{ item.statut }}
          </v-chip>
        </template>

        <!-- Colonne Date -->
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <!-- Colonne Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-tooltip text="Voir les détails" location="top">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  color="info"
                  v-bind="props"
                  @click="showDetails(item)"
                  variant="text"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              v-if="item.statut === 'PLANIFIEE'"
              text="Modifier"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="warning"
                  v-bind="props"
                  @click="editItem(item)"
                  variant="text"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              v-if="item.statut === 'PLANIFIEE'"
              text="Démarrer l'élection"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-play"
                  size="small"
                  color="success"
                  v-bind="props"
                  @click="startElection(item)"
                  variant="text"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              v-if="item.statut === 'EN_COURS'"
              text="Terminer l'élection"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-stop"
                  size="small"
                  color="error"
                  v-bind="props"
                  @click="endElection(item)"
                  variant="text"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              v-if="['PLANIFIEE', 'EN_COURS'].includes(item.statut)"
              text="Annuler l'élection"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-cancel"
                  size="small"
                  color="warning"
                  v-bind="props"
                  @click="cancelElection(item)"
                  variant="text"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de création/édition -->
    <v-dialog v-model="dialogs.form" persistent max-width="800px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ editedItem.id ? 'Modifier l\'élection' : 'Nouvelle élection' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.titre"
                    label="Titre de l'élection"
                    :rules="[v => !!v || 'Le titre est requis']"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.date"
                    label="Date de l'élection"
                    type="date"
                    :rules="[
                      v => !!v || 'La date est requise',
                      v => new Date(v) > new Date() || 'La date doit être dans le futur'
                    ]"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.statut"
                    :items="['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']"
                    label="Statut"
                    :rules="[v => !!v || 'Le statut est requis']"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.description"
                    label="Description"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="text"
            @click="closeDialog"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            :loading="loading"
            :disabled="!formValid"
            @click="save"
          >
            Sauvegarder
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de détails -->
    <v-dialog v-model="dialogs.details" max-width="800px">
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center pa-4">
          Détails de l'élection
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            class="text-white"
            @click="dialogs.details = false"
          />
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-3">mdi-ballot</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Titre</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem?.titre }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-3">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Date</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedItem?.date) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon :color="getStatusColor(selectedItem?.statut)" class="mr-3">
                      {{ getStatusIcon(selectedItem?.statut) }}
                    </v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Statut</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem?.statut }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-3">mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Candidats</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.candidatures?.length || 0 }} candidat(s)
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-3">mdi-account-multiple-check</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Personnel affecté</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.affectations?.length || 0 }} membre(s)
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col v-if="selectedItem?.description" cols="12">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary" class="mr-3">mdi-text</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Description</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem?.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation pour les actions -->
    <v-dialog v-model="dialogs.confirm" max-width="500px">
      <v-card>
        <v-card-title>{{ confirmDialog.title }}</v-card-title>
        <v-card-text>{{ confirmDialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="dialogs.confirm = false"
          >
            Annuler
          </v-btn>
          <v-btn
            :color="confirmDialog.color"
            variant="text"
            :loading="loading"
            @click="confirmDialog.action"
          >
            Confirmer
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
const search = ref('')
const formValid = ref(true)
const form = ref(null)

// Données
const elections = ref([])
const selectedItem = ref(null)
const editedItem = ref({
  titre: '',
  date: '',
  statut: 'PLANIFIEE',
  description: ''
})

// États des dialogues
const dialogs = ref({
  form: false,
  details: false,
  confirm: false
})

// Configuration dialog de confirmation
const confirmDialog = ref({
  title: '',
  message: '',
  action: null,
  color: 'primary'
})

// En-têtes du tableau
const headers = [
  { title: 'Titre', key: 'titre', sortable: true },
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Statut', key: 'statut', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

// Méthodes
const fetchElections = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/elections?include=candidatures,affectations')
    elections.value = data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement des élections'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editedItem.value = {
    titre: '',
    date: '',
    statut: 'PLANIFIEE',
    description: ''
  }
  dialogs.value.form = true
}

const editItem = (item) => {
  editedItem.value = { ...item }
  dialogs.value.form = true
}

const showDetails = (item) => {
  selectedItem.value = item
  dialogs.value.details = true
}

const closeDialog = () => {
  dialogs.value.form = false
  setTimeout(() => {
    editedItem.value = {
      titre: '',
      date: '',
      statut: 'PLANIFIEE',
      description: ''
    }
    form.value?.reset()
  }, 300)
}

const save = async () => {
  if (!form.value?.validate()) return

  loading.value = true
  try {
    if (editedItem.value.id) {
      await axios.put(`/elections/${editedItem.value.id}`, editedItem.value)
      toast.success('Élection modifiée avec succès')
    } else {
      await axios.post('/elections', editedItem.value)
      toast.success('Élection créée avec succès')
    }
    await fetchElections()
    closeDialog()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}
// ... suite du script précédent

const startElection = async (item) => {
  confirmDialog.value = {
    title: 'Démarrer l\'élection',
    message: 'Êtes-vous sûr de vouloir démarrer cette élection ?',
    color: 'success',
    action: async () => {
      loading.value = true
      try {
        await axios.post(`/elections/${item.id}/demarrer`)
        toast.success('Élection démarrée avec succès')
        await fetchElections()
        dialogs.value.confirm = false
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors du démarrage de l\'élection'
        console.error('Erreur:', err)
      } finally {
        loading.value = false
      }
    }
  }
  dialogs.value.confirm = true
}

const endElection = async (item) => {
  confirmDialog.value = {
    title: 'Terminer l\'élection',
    message: 'Êtes-vous sûr de vouloir terminer cette élection ? Cette action est irréversible.',
    color: 'error',
    action: async () => {
      loading.value = true
      try {
        await axios.post(`/elections/${item.id}/terminer`)
        toast.success('Élection terminée avec succès')
        await fetchElections()
        dialogs.value.confirm = false
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors de la terminaison de l\'élection'
        console.error('Erreur:', err)
      } finally {
        loading.value = false
      }
    }
  }
  dialogs.value.confirm = true
}

const cancelElection = async (item) => {
  confirmDialog.value = {
    title: 'Annuler l\'élection',
    message: 'Êtes-vous sûr de vouloir annuler cette élection ? Cette action est irréversible.',
    color: 'warning',
    action: async () => {
      loading.value = true
      try {
        await axios.post(`/elections/${item.id}/annuler`, {
          motif_annulation: 'Annulation administrative'
        })
        toast.success('Élection annulée avec succès')
        await fetchElections()
        dialogs.value.confirm = false
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors de l\'annulation de l\'élection'
        console.error('Erreur:', err)
      } finally {
        loading.value = false
      }
    }
  }
  dialogs.value.confirm = true
}

// Fonctions utilitaires
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status) => {
  const statusColors = {
    'PLANIFIEE': 'info',
    'EN_COURS': 'success',
    'TERMINEE': 'secondary',
    'ANNULEE': 'error'
  }
  return statusColors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const statusIcons = {
    'PLANIFIEE': 'mdi-calendar-clock',
    'EN_COURS': 'mdi-play-circle',
    'TERMINEE': 'mdi-check-circle',
    'ANNULEE': 'mdi-cancel'
  }
  return statusIcons[status] || 'mdi-help-circle'
}

// Initialisation
onMounted(() => {
  fetchElections()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.v-list-item {
  min-height: 48px;
  margin-bottom: 8px;
}

.text-caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  font-size: 1rem !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

:deep(.v-card-title) {
  font-size: 1.25rem;
  font-weight: 500;
  padding: 16px;
}

:deep(.v-card-text) {
  padding-top: 16px;
}

:deep(.v-dialog > .v-card > .v-card-text) {
  padding-top: 16px;
}
</style>
