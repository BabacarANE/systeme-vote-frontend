<template>
  <v-container style="padding-top: 60px; padding-left: 75px;">
    <!-- En-tête -->
    <header class="mb-6">
      <div class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Affectations</h1>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nouvelle Affectation
        </v-btn>
      </div>
    </header>

    <!-- Alertes -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
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
          variant="outlined"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.election"
          :items="elections"
          item-title="titre"
          item-value="id"
          label="Filtre par élection"
          variant="outlined"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.statut"
          :items="[
            { title: 'Actives', value: true },
            { title: 'Terminées', value: false }
          ]"
          item-title="title"
          item-value="value"
          label="Statut"
          variant="outlined"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <!-- Table des affectations -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredAffectations"
        :loading="loading"
        :search="search"
      >
        <!-- Nom du Personnel -->
        <template #[`item.personnel`]="{ item }">
          {{ formatNomComplet(item.role_personnel_b_v?.role_utilisateur?.personne) }}
        </template>

        <!-- Bureau de vote -->
        <template #[`item.bureau`]="{ item }">
          {{ item.bureau_de_vote?.nom }}
          <div class="text-caption">
            {{ item.bureau_de_vote?.centre_de_vote?.nom }}
          </div>
        </template>

        <!-- Statut -->
        <template #[`item.statut`]="{ item }">
          <v-chip
            :color="item.statut ? 'success' : 'error'"
            size="small"
          >
            {{ item.statut ? 'Active' : 'Terminée' }}
          </v-chip>
        </template>

        <!-- Période -->
        <template #[`item.periode`]="{ item }">
          Du {{ formatDate(item.date_debut) }}<br>
          Au {{ formatDate(item.date_fin) }}
        </template>

        <!-- Actions -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              @click="showDetails(item)"
              variant="text"
            />
            <template v-if="item.statut">
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="warning"
                @click="editItem(item)"
                variant="text"
              />
              <v-btn
                icon="mdi-close-circle"
                size="small"
                color="error"
                @click="terminerAffectation(item)"
                variant="text"
              />
            </template>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog formulaire -->
    <v-dialog v-model="dialogs.form" persistent max-width="800">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Modifier l\'affectation' : 'Nouvelle affectation' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.election_id"
                    :items="elections"
                    item-title="titre"
                    item-value="id"
                    label="Élection"
                    :rules="[v => !!v || 'L\'élection est requise']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.role_personnel_bv_id"
                    :items="personnels"
                    item-title="nom_complet"
                    item-value="id"
                    label="Personnel"
                    :rules="[v => !!v || 'Le personnel est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.bureau_de_vote_id"
                    :items="bureauxDeVote"
                    item-title="nom"
                    item-value="id"
                    label="Bureau de vote"
                    :rules="[v => !!v || 'Le bureau de vote est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.code_role"
                    :items="[
                      { text: 'Président', value: 'PRESIDENT' },
                      { text: 'Secrétaire', value: 'SECRETAIRE' },
                      { text: 'Assesseur', value: 'ASSESSEUR' }
                    ]"
                    item-title="text"
                    item-value="value"
                    label="Rôle"
                    :rules="[v => !!v || 'Le rôle est requis']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.date_debut"
                    label="Date de début"
                    type="date"
                    :rules="[v => !!v || 'La date de début est requise']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.date_fin"
                    label="Date de fin"
                    type="date"
                    :rules="[
                      v => !!v || 'La date de fin est requise',
                      v => !formData.date_debut || v > formData.date_debut || 'La date de fin doit être après la date de début'
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
            color="error"
            variant="text"
            @click="dialogs.form = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!formValid"
            @click="saveAffectation"
          >
            {{ isEditing ? 'Modifier' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog détails -->
    <v-dialog v-model="dialogs.details" max-width="800">
      <v-card>
        <v-card-title class="bg-primary text-white">
          Détails de l'affectation
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogs.details = false"
          />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Personnel</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatNomComplet(selectedItem?.role_personnel_bv?.role_utilisateur?.personne) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-office-building</v-icon>
                  </template>
                  <v-list-item-title>Bureau de vote</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.bureau_de_vote?.nom }}
                    <div class="text-caption">
                      {{ selectedItem?.bureau_de_vote?.centre_de_vote?.nom }}
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-account-tie</v-icon>
                  </template>
                  <v-list-item-title>Rôle</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.code_role }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Période</v-list-item-title>
                  <v-list-item-subtitle>
                    Du {{ formatDate(selectedItem?.date_debut) }}<br>
                    Au {{ formatDate(selectedItem?.date_fin) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-ballot</v-icon>
                  </template>
                  <v-list-item-title>Élection</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.election?.titre }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon :color="selectedItem?.statut ? 'success' : 'error'">
                      mdi-{{ selectedItem?.statut ? 'check' : 'close' }}-circle
                    </v-icon>
                  </template>
                  <v-list-item-title>Statut</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem?.statut ? 'Active' : 'Terminée' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog confirmation de fin d'affectation -->
    <v-dialog v-model="dialogs.terminer" max-width="500">
      <v-card>
        <v-card-title>Terminer l'affectation</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir terminer cette affectation ? Cette action est irréversible.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="dialogs.terminer = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            :loading="loading"
            @click="confirmTerminer"
          >
            Terminer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'

const toast = useToast()

// États
const loading = ref(false)
const error = ref(null)
const search = ref('')
const formValid = ref(true)
const form = ref(null)

// Données
const affectations = ref([])
const elections = ref([])
const personnels = ref([])
const bureauxDeVote = ref([])
const selectedItem = ref(null)

// Filtres
const filters = ref({
  election: null,
  statut: null
})

// États des dialogues
const dialogs = ref({
  form: false,
  details: false,
  terminer: false
})

// Données du formulaire
const defaultFormData = {
  election_id: null,
  role_personnel_bv_id: null, // Notez le changement ici: plus de underscore après bv
  bureau_de_vote_id: null,
  code_role: null,
  date_debut: null,
  date_fin: null
}

const formData = ref({ ...defaultFormData })

// En-têtes du tableau
const headers = [
  { title: 'Personnel', key: 'personnel', sortable: true },
  { title: 'Bureau de vote', key: 'bureau', sortable: true },
  { title: 'Rôle', key: 'code_role', sortable: true },
  { title: 'Période', key: 'periode', sortable: false },
  { title: 'Statut', key: 'statut', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

// Computed
const isEditing = computed(() => !!formData.value.id)

// Modification des références dans le code JavaScript
const filteredAffectations = computed(() => {
  let filtered = [...affectations.value]

  if (filters.value.election) {
    filtered = filtered.filter(a => a.election_id === filters.value.election)
  }

  if (filters.value.statut !== null) {
    filtered = filtered.filter(a => a.statut === filters.value.statut)
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.role_personnel_b_v?.role_utilisateur?.personne?.nom?.toLowerCase().includes(searchLower) ||
      a.role_personnel_b_v?.role_utilisateur?.personne?.prenom?.toLowerCase().includes(searchLower) ||
      a.bureau_de_vote?.nom?.toLowerCase().includes(searchLower) ||
      a.code_role?.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

// Méthodes
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const [affectationsRes, electionsRes, personnelsRes, bureauxRes] = await Promise.all([
      axios.get('/affectations?include=bureau_de_vote.centre_de_vote,role_personnel_b_v.role_utilisateur.personne,election'),
      axios.get('/elections'),
      axios.get('/role_personnel_bvs?include=role_utilisateur.personne'),
      axios.get('/bureaux-de-vote?include=centre_de_vote')
    ])

    affectations.value = affectationsRes.data.data
    elections.value = electionsRes.data.data

    // Ajout d'un log pour déboguer
    console.log('Personnel data:', personnelsRes.data)

    // Formatage des données du personnel avec gestion des cas null
    // Formatage des données du personnel
    // Update this section in the fetchData method
    // Dans fetchData() :
    personnels.value = personnelsRes.data.data?.map(p => ({
      id: p.id, // Ceci devrait correspondre au role_personnel_b_v_id
      nom_complet: formatNomComplet(p.role_utilisateur?.personne),
      // Ne plus ajouter role_personnel_b_v_id ici car id est déjà le bon identifiant
    })) || []

    bureauxDeVote.value = bureauxRes.data.data

  } catch (err) {
    console.error('Erreur complète:', err)
    console.error('Réponse API:', err.response)
    error.value = 'Erreur lors du chargement des données'
    if (err.response) {
      error.value += `: ${err.response.data.message || err.response.statusText}`
    }
  } finally {
    loading.value = false
  }
}

// Amélioration de la gestion des noms nuls
const formatNomComplet = (personne) => {
  if (!personne) return 'N/A'
  const nom = personne.nom || ''
  const prenom = personne.prenom || ''
  return `${nom} ${prenom}`.trim() || 'N/A'
}



const openCreateDialog = () => {
  formData.value = { ...defaultFormData }
  dialogs.value.form = true
}

const editItem = (item) => {
  formData.value = { ...item }
  dialogs.value.form = true
}

const showDetails = (item) => {
  selectedItem.value = item
  dialogs.value.details = true
}

const saveAffectation = async () => {
  if (!form.value?.validate()) return

  loading.value = true
  try {
    const dataToSend = {
      bureau_de_vote_id: formData.value.bureau_de_vote_id,
      role_personnel_bv_id: formData.value.role_personnel_bv_id, // Notez le changement ici
      election_id: formData.value.election_id,
      code_role: formData.value.code_role,
      date_debut: formData.value.date_debut,
      date_fin: formData.value.date_fin,
      statut: true
    }

    console.log('FormData avant envoi:', formData.value)
    console.log('Données à envoyer:', dataToSend)

    if (isEditing.value) {
      await axios.put(`/affectations/${formData.value.id}`, dataToSend)
      toast.success('Affectation modifiée avec succès')
    } else {
      await axios.post('/affectations', dataToSend)
      toast.success('Affectation créée avec succès')
    }

    await fetchData()
    dialogs.value.form = false
  } catch (err) {
    console.error('Erreur complète:', err.response?.data)
    toast.error(err.response?.data?.message || 'Une erreur est survenue')
  } finally {
    loading.value = false
  }
}
const terminerAffectation = (item) => {
  selectedItem.value = item
  dialogs.value.terminer = true
}

const confirmTerminer = async () => {
  loading.value = true
  try {
    await axios.get(`/affectations/${selectedItem.value.id}/terminer`)
  toast.success('Affectation terminée avec succès')
  await fetchData()
  dialogs.value.terminer = false
} catch (err) {
  toast.error(err.response?.data?.message || 'Une erreur est survenue')
} finally {
  loading.value = false
}
}

// Méthodes utilitaires


const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// Initialisation
onMounted(() => {
  fetchData()
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

.v-list-item-title {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  font-size: 1rem !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.text-caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>

