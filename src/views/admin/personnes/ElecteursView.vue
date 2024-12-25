```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Électeurs</h1>
        <v-btn
          color="primary"
          @click="openCreateDialog"
          prepend-icon="mdi-plus"
        >
          Nouvel Électeur
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
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="electeurs"
        :loading="loading"
        :search="search"
        items-per-page="10"
      >
        <template #item.a_voter="{ item }">
          <v-chip
            :color="item.raw && item.raw.a_voter ? 'success' : 'warning'"
            size="small"
          >
            {{ item.raw && item.raw.a_voter ? 'A voté' : 'N\'a pas voté' }}
          </v-chip>
        </template>

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

    <!-- Dialog Form -->
    <v-dialog
      v-model="dialog"
      persistent
      max-width="800"
    >
      <v-card>
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container>
              <v-row>
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
                    :items="[
                      { title: 'Masculin', value: 'M' },
                      { title: 'Féminin', value: 'F' }
                    ]"
                    label="Sexe"
                    item-title="title"
                    item-value="value"
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
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.numero_electeur"
                    label="Numéro électeur"
                    :rules="[v => !!v || 'Le numéro électeur est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.liste_electorale_id"
                    :items="listesElectorales"
                    label="Liste électorale"
                    item-title="bureau_de_vote.nom"
                    item-value="id"
                    :rules="[v => !!v || 'La liste électorale est requise']"
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

    <!-- Dialog Details -->
    <v-dialog v-model="detailsDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center">
          Détails de l'électeur
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
                <v-icon color="primary">mdi-card-account-details</v-icon>
              </template>
              <v-list-item-title>Numéro électeur</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.numero_electeur }}
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
                <v-icon color="primary">mdi-home</v-icon>
              </template>
              <v-list-item-title>Adresse</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.adresse }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-vote</v-icon>
              </template>
              <v-list-item-title>Statut</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="selectedItem?.a_voter ? 'success' : 'warning'"
                  size="small"
                >
                  {{ selectedItem?.a_voter ? 'A voté' : 'N\'a pas voté' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog Delete -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Confirmation de suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cet électeur ?
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
import { ref, computed, onMounted } from 'vue'
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
const electeurs = ref([])
const listesElectorales = ref([])
const form = ref(null)

// En-têtes du tableau
const headers = [
  { title: 'N° Électeur', key: 'numero_electeur', align: 'start' },
  { title: 'Nom', key: 'nom', sortable: true },
  { title: 'Prénom', key: 'prenom', sortable: true },
  { title: 'Statut', key: 'statut', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

// Item par défaut
const defaultItem = {
  nom: '',
  prenom: '',
  date_naissance: '',
  sexe: '',
  adresse: '',
  numero_electeur: '',
  liste_electorale_id: null
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// Computed
const formTitle = computed(() =>
  editedItem.value.id ? 'Modifier l\'électeur' : 'Nouvel électeur'
)

const filteredElecteurs = computed(() => {
  return electeurs.value.filter(electeur => electeur.role_electeur)
})

// Méthodes
const fetchListesElectorales = async () => {
  try {
    const { data } = await axios.get('/listes-electorales?include=bureau_de_vote')
    listesElectorales.value = data.data
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Erreur lors du chargement des listes électorales'
  }
}

const fetchElecteurs = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/personnes')
    console.log('Données reçues:', data) // Pour déboguer

    if (data.data && Array.isArray(data.data)) {
      electeurs.value = data.data
        .filter(item => item.role_electeur) // Filtre uniquement les personnes qui sont électeurs
        .map(item => ({
          id: item.id,
          nom: item.nom,
          prenom: item.prenom,
          date_naissance: item.date_naissance,
          sexe: item.sexe,
          adresse: item.adresse,
          numero_electeur: item.role_electeur.numero_electeur, // Accès direct à la propriété
          a_voter: item.role_electeur.a_voter || false, // Valeur par défaut si undefined
          statut: item.role_electeur.a_voter ? 'A voté' : 'N\'a pas voté'
        }))
    }
    console.log('Électeurs traités:', electeurs.value) // Pour déboguer
  } catch (err) {
    console.error('Erreur complète:', err)
    error.value = 'Erreur lors du chargement des électeurs'
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
      // Données directes sans nesting
      nom: editedItem.value.nom,
      prenom: editedItem.value.prenom,
      date_naissance: editedItem.value.date_naissance,
      sexe: editedItem.value.sexe,
      adresse: editedItem.value.adresse,
      numero_electeur: editedItem.value.numero_electeur,
      liste_electorale_id: editedItem.value.liste_electorale_id
    }

    loading.value = true

    if (editedItem.value.id) {
      await axios.put(`/electeurs/${editedItem.value.id}`, dataToSend)
      toast.success('Électeur modifié avec succès')
    } else {
      // Endpoint d'enregistrement combiné
      await axios.post('/register/electeur', dataToSend)
      toast.success('Électeur créé avec succès')
    }

    await fetchElecteurs()
    closeDialog()
  } catch (err) {
    console.error('Erreur détaillée:', err.response?.data)
    error.value = err.response?.data?.message ||
      (err.response?.data?.data ? Object.values(err.response.data.data).join(', ') : 'Erreur lors de l\'enregistrement')
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  try {
    await axios.delete(`/personnes/${selectedItem.value.id}`)
    toast.success('Électeur supprimé avec succès')
    await fetchElecteurs()
    deleteDialog.value = false
  } catch (err) {
    error.value = 'Erreur lors de la suppression'
    console.error('Erreur:', err)
    toast.error('Erreur lors de la suppression de l\'électeur')
  }
}
// Initialisation
onMounted(() => {
  fetchElecteurs()
  fetchListesElectorales()
})
</script>

<style scoped>
.v-data-table {
  background: white !important;
}

.gap-2 {
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

:deep(.v-card-title) {
  padding: 16px;
  font-size: 1.25rem;
  font-weight: 500;
}

:deep(.v-card-text) {
  padding-top: 20px;
}

.text-subtitle-1.font-weight-bold {
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.87);
}

/* Style pour les puces de statut */
.v-chip {
  font-weight: 500;
}

/* Style pour les dialogues */
.dialog-card {
  border-radius: 8px;
}

/* Style pour les formulaires */
.v-text-field {
  margin-bottom: 8px;
}
</style>
