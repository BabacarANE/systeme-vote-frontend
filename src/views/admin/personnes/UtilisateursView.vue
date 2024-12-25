<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Utilisateurs</h1>
        <v-btn
          color="primary"
          @click="openCreateDialog"
          prepend-icon="mdi-plus"
        >
          Nouvel Utilisateur
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
          v-model="roleFilter"
          :items="roles"
          label="Filtre par rôle"
          density="comfortable"
          variant="outlined"
          hide-details
          clearable
          @update:model-value="fetchUtilisateurs"
        />
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="utilisateurs"
        :loading="loading"
        :search="search"
        items-per-page="10"
      >
        <template #item.role="{ item }">
          <div v-if="item.superviseur_c_e_n_a">
            <v-chip color="info">Superviseur CENA</v-chip>
            <div>{{ item.superviseur_c_e_n_a.code }}</div>
          </div>
          <div v-else-if="item.personnel_b_v">
            <v-chip color="success">Personnel BV</v-chip>
            <div>{{ item.personnel_b_v.code }}</div>
          </div>
          <div v-else-if="item.representant">
            <v-chip color="warning">Représentant</v-chip>
            <div>{{ item.representant.code }}</div>
          </div>
          <div v-else-if="item.admin_d_g_e">
            <v-chip color="error">Admin DGE</v-chip>
            <div>{{ item.admin_d_g_e.code }}</div>
          </div>
          <div v-else>
            <v-chip>Électeur</v-chip>
          </div>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              @click="showDetails(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="warning"
              @click="editItem(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              @click="confirmDelete(item)"
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

              <!-- Informations utilisateur -->
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 font-weight-bold mb-2">
                    Informations utilisateur
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email"
                    type="email"
                    :rules="[v => !!v || 'L\'email est requis', v => /.+@.+\..+/.test(v) || 'Email invalide']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.mot_de_passe"
                    label="Mot de passe"
                    type="password"
                    :rules="[v => !!v || 'Le mot de passe est requis', v => v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.role"
                    :items="roles"
                    label="Rôle"
                    :rules="[v => !!v || 'Le rôle est requis']"
                    required
                  />
                </v-col>
                <!-- Ajoutez cette section après le select du rôle -->
                <v-col
                  v-if="editedItem.role === 'Représentant'"
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="selectedElection"
                    :items="elections"
                    label="Élection"
                    item-title="titre"
                    item-value="id"
                    :rules="[v => !!v || 'L\'élection est requise']"
                    required
                  />
                </v-col>

                <v-col
                  v-if="editedItem.role === 'Représentant' && selectedElection"
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="editedItem.candidature_id"
                    :items="candidaturesFormatted"
                    label="Candidature"
                    item-title="display"
                    item-value="id"
                    :rules="[v => !!v || 'La candidature est requise']"
                    required
                    :loading="loadingCandidatures"
                    :disabled="loadingCandidatures"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="editedItem.est_actif"
                    label="Compte actif"
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
          Détails de l'utilisateur
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
                <v-icon color="primary">mdi-email</v-icon>
              </template>
              <v-list-item-title>Email</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.email }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-account-tie</v-icon>
              </template>
              <v-list-item-title>Rôle</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.role }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon :color="selectedItem?.est_actif ? 'success' : 'error'">
                  {{ selectedItem?.est_actif ? 'mdi-check-circle' : 'mdi-cancel' }}
                </v-icon>
              </template>
              <v-list-item-title>Compte Actif</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.est_actif ? 'Oui' : 'Non' }}
              </v-list-item-subtitle>
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
          Êtes-vous sûr de vouloir supprimer cet utilisateur ?
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
const form = ref(null);

// Données
const utilisateurs = ref([])
const roles = ref([ 'Superviseur CENA', 'Personnel BV', 'Représentant', 'Admin DGE'])
const roleFilter = ref(null)
const elections = ref([])
const candidatures = ref([])
const selectedElection = ref(null)
const loadingCandidatures = ref(false)
// En-têtes du tableau
const headers = [
  { title: 'Nom', key: 'personne.nom', sortable: true },
  { title: 'Prénom', key: 'personne.prenom', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Rôle', key: 'role', sortable: true },
  { title: 'Compte Actif', key: 'est_actif', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

// Item par défaut
const defaultItem = {
  nom: '',
  prenom: '',
  date_naissance: '',
  sexe: '',
  adresse: '',
  email: '',
  mot_de_passe: '',
  role: null,
  est_actif: true
}

const editedItem = ref({ ...defaultItem })
const selectedItem = ref(null)

// Computed
const formTitle = computed(() =>
  editedItem.value.id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'
)

// Méthodes
const fetchUtilisateurs = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/utilisateurs?include=personne,superviseur_c_e_n_a,personnel_b_v,representant,admin_d_g_e')
    utilisateurs.value = data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des utilisateurs'
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
      email: editedItem.value.email,
      mot_de_passe: editedItem.value.mot_de_passe,
    }

    let endpoint = ''

    // Déterminer l'endpoint selon le rôle
    switch (editedItem.value.role) {
      case 'Superviseur CENA':
        endpoint = '/register/superviseur-cena'
        break

      case 'Personnel BV':
        endpoint = '/register/personnel-bv'
        break

      case 'Représentant':
        endpoint = '/register/representant'
        // Ajouter les informations de candidature
        if (!editedItem.value.candidature_id) {
          throw new Error('Veuillez sélectionner une candidature')
        }
        dataToSend.candidature_id = editedItem.value.candidature_id
        break

      case 'Admin DGE':
        endpoint = '/register/admin-dge'
        dataToSend.niveau_acces = 'ADMIN'
        break

      default:
        throw new Error('Type d\'utilisateur non valide')
    }

    if (!endpoint) {
      throw new Error('Type d\'utilisateur non pris en charge')
    }

    // Ajouter l'état actif
    dataToSend.est_actif = editedItem.value.est_actif

    console.log('Données envoyées:', dataToSend) // Pour le débogage

    const response = await axios.post(endpoint, dataToSend)
    toast.success('Utilisateur créé avec succès')
    await fetchUtilisateurs()
    closeDialog()

  } catch (err) {
    console.error('Erreur détaillée:', err.response?.data) // Afficher les détails de l'erreur
    error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement'
    toast.error(error.value)
  }
}

const fetchElections = async () => {
  try {
    const { data } = await axios.get('/elections')
    elections.value = data.data
  } catch (err) {
    console.error('Erreur lors du chargement des élections:', err)
    toast.error('Erreur lors du chargement des élections')
  }
}

const fetchCandidatures = async (electionId) => {
  if (!electionId) {
    candidatures.value = []
    return
  }
  loadingCandidatures.value = true
  try {
    const { data } = await axios.get(`/elections/${electionId}/candidatures`)
    candidatures.value = data.data
    console.log('Candidatures chargées:', data.data)
  } catch (err) {
    console.error('Erreur lors du chargement des candidatures:', err)
    toast.error('Erreur lors du chargement des candidatures')
    candidatures.value = []
  } finally {
    loadingCandidatures.value = false
  }
}

const getCandidatDisplay = (candidature) => {
  if (!candidature?.role_candidat?.personne) return ''
  const personne = candidature.role_candidat.personne
  const parti = candidature.role_candidat.parti
  return `${personne.nom} ${personne.prenom} - ${parti}`
}
const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  try {
    await axios.delete(`/utilisateurs/${selectedItem.value.id}`)
    toast.success('Utilisateur supprimé avec succès')
    await fetchUtilisateurs()
    deleteDialog.value = false
  } catch (err) {
    error.value = 'Erreur lors de la suppression'
    console.error('Erreur:', err)
    toast.error('Erreur lors de la suppression de l\'utilisateur')
  }
}
watch(selectedElection, async (newValue) => {
  if (newValue) {
    await fetchCandidatures(newValue)
  } else {
    candidatures.value = []
  }
})
const candidaturesFormatted = computed(() => {
  if (!candidatures.value?.length) return []

  return candidatures.value
    .filter(c => c.role_candidat && c.role_candidat.personne)
    .map(c => ({
      id: c.id,
      display: `${c.role_candidat.personne.nom} ${c.role_candidat.personne.prenom} - ${c.role_candidat.parti}`,
      ...c
    }))
})

// Ajouter ce watcher pour réinitialiser les champs spécifiques au rôle
watch(() => editedItem.value.role, (newRole) => {
  if (newRole !== 'Représentant') {
    editedItem.value.candidature_id = null
    selectedElection.value = null
  }
})
// Watchers
watch(roleFilter, async (newValue) => {
  if (newValue) {
    loading.value = true
    try {
      const { data } = await axios.get(`/utilisateurs?include=personne&role=${newValue}`)
      utilisateurs.value = data.data
    } catch (err) {
      error.value = 'Erreur lors du filtrage par rôle'
      console.error('Erreur:', err)
    } finally {
      loading.value = false
    }
  } else {
    fetchUtilisateurs()
  }
})

// Initialisation
onMounted(() => {
  fetchUtilisateurs()
  fetchElections()
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
