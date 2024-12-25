<!-- src/views/superviseur/ContestationView.vue -->
<template>
  <div class="contestations-view">
    <!-- Titre et Statistiques -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <h2>Gestion des Contestations</h2>
            <v-spacer />
            <v-btn
              color="info"
              prepend-icon="mdi-chart-bar"
              @click="showStatistiques"
            >
              Statistiques
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtres -->
    <v-row class="mt-2">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.centre_de_vote_id"
                  :items="centres"
                  item-title="nom"
                  item-value="id"
                  label="Centre de Vote"
                  clearable
                  @update:model-value="fetchBureaux"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.bureau_de_vote_id"
                  :items="bureaux"
                  item-title="nom"
                  item-value="id"
                  label="Bureau de Vote"
                  :disabled="!filters.centre_de_vote_id"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.statut"
                  :items="statutOptions"
                  label="Statut"
                  clearable
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filters.date_debut"
                  type="date"
                  label="Date de début"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filters.date_fin"
                  type="date"
                  label="Date de fin"
                  clearable
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Liste des Contestations -->
    <v-row class="mt-2">
      <v-col cols="12">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="contestations"
            :loading="loading"
            @click:row="showContestationDetails"
          >
            <!-- Colonnes personnalisées -->
            <template #item.centre="{ item }">
              {{ item.resultat_bureau_vote.bureau_de_vote.centre_de_vote.nom }}
            </template>

            <template #item.bureau="{ item }">
              {{ item.resultat_bureau_vote.bureau_de_vote.nom }}
            </template>

            <template #item.representant="{ item }">
              {{ item.role_representant.role_utilisateur.personne.nom }}
              {{ item.role_representant.role_utilisateur.personne.prenom }}
            </template>

            <template #item.candidat="{ item }">
              {{ item.role_candidat.personne.nom }}
              {{ item.role_candidat.personne.prenom }}
            </template>

            <template #item.statut="{ item }">
              <v-chip
                :color="getStatutColor(item.statut)"
                small
              >
                {{ getStatutLibelle(item.statut) }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                v-if="item.statut === 'EN_ATTENTE'"
                icon
                color="primary"
                @click.stop="traiterContestation(item)"
              >
                <v-icon>mdi-gavel</v-icon>
              </v-btn>
              <v-btn
                icon
                color="info"
                @click.stop="showDetailsContestation(item)"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Traitement Contestation -->
    <v-dialog v-model="traitementDialog" max-width="600">
      <v-card>
        <v-card-title>Traitement de la Contestation</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <h3>Détails de la Contestation</h3>
              <p><strong>Motif :</strong> {{ currentContestation?.motif }}</p>
              <p><strong>Description :</strong> {{ currentContestation?.description }}</p>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="decision"
                :items="decisionOptions"
                label="Décision"
                required
              />
              <v-textarea
                v-model="commentaire"
                label="Commentaire de décision"
                rows="3"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            @click="traitementDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!decision || !commentaire"
            @click="confirmerTraitement"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Statistiques -->
    <v-dialog v-model="statistiquesDialog" max-width="800">
      <v-card>
        <v-card-title>Statistiques des Contestations</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-card>
                <v-card-title>Total Contestations</v-card-title>
                <v-card-text class="text-center">
                  <h2>{{ statistiques.total }}</h2>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="8">
              <v-card>
                <v-card-title>Répartition par Statut</v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item>
                      <v-list-item-title>En Attente</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ statistiques.par_statut.en_attente }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Acceptées</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ statistiques.par_statut.acceptees }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Rejetées</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ statistiques.par_statut.rejetees }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog Détails Contestation -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card>
        <v-card-title>Détails de la Contestation</v-card-title>
        <v-card-text v-if="currentContestation">
          <v-row>
            <v-col cols="12" md="6">
              <h3>Informations Générales</h3>
              <v-list>
                <v-list-item>
                  <v-list-item-title>Bureau de Vote</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ currentContestation.resultat_bureau_vote.bureau_de_vote.nom }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Centre de Vote</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ currentContestation.resultat_bureau_vote.bureau_de_vote.centre_de_vote.nom }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Date de Soumission</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(currentContestation.date_soumission) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <h3>Représentant</h3>
              <v-list>
                <v-list-item>
                  <v-list-item-title>Nom</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ currentContestation.role_representant.role_utilisateur.personne.nom }}
                    {{ currentContestation.role_representant.role_utilisateur.personne.prenom }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12">
              <h3>Détails de la Contestation</h3>
              <p><strong>Motif :</strong> {{ currentContestation.motif }}</p>
              <p><strong>Description :</strong> {{ currentContestation.description }}</p>
            </v-col>
            <v-col cols="12" v-if="currentContestation.pieces_jointes">
              <h3>Pièces Jointes</h3>
              <v-list>
                <v-list-item
                  v-for="(piece, index) in currentContestation.pieces_jointes"
                  :key="index"
                >
                  <v-btn
                    color="primary"
                    @click="telechargerPieceJointe(currentContestation.id, index)"
                  >
                    Télécharger Pièce Jointe {{ index + 1 }}
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'

const toast = useToast()

// États
const contestations = ref([])
const centres = ref([])
const bureaux = ref([])
const loading = ref(false)
const traitementDialog = ref(false)
const statistiquesDialog = ref(false)
const detailsDialog = ref(false)
const currentContestation = ref(null)
const statistiques = ref({
  total: 0,
  par_statut: {
    en_attente: 0,
    acceptees: 0,
    rejetees: 0
  }
})

// Formulaires
const decision = ref(null)
const commentaire = ref('')

// Configuration des filtres
const filters = ref({
  centre_de_vote_id: null,
  bureau_de_vote_id: null,
  statut: null,
  date_debut: null,
  date_fin: null
})

// Options de configuration
const headers = [
  { title: 'Centre', key: 'centre', sortable: true },
  { title: 'Bureau', key: 'bureau', sortable: true },
  { title: 'Représentant', key: 'representant', sortable: true },
  { title: 'Candidat', key: 'candidat', sortable: true },
  { title: 'Motif', key: 'motif' },
  { title: 'Statut', key: 'statut' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const statutOptions = [
  { title: 'En Attente', value: 'EN_ATTENTE' },
  { title: 'Acceptée', value: 'ACCEPTEE' },
  { title: 'Rejetée', value: 'REJETEE' }
]

const decisionOptions = [
  { title: 'Accepter', value: 'ACCEPTEE' },
  { title: 'Rejeter', value: 'REJETEE' }
]

// Méthodes utilitaires
const getStatutColor = (statut) => {
  switch (statut) {
    case 'EN_ATTENTE': return 'warning'
    case 'ACCEPTEE': return 'success'
    case 'REJETEE': return 'error'
    default: return 'default'
  }
}

const getStatutLibelle = (statut) => {
  switch (statut) {
    case 'EN_ATTENTE': return 'En Attente'
    case 'ACCEPTEE': return 'Acceptée'
    case 'REJETEE': return 'Rejetée'
    default: return statut
  }
}

const formatDate = (date) => {
  return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : ''
}

// Méthodes de chargement
const fetchCentres = async () => {
  try {
    const response = await axios.get('/centres-de-vote')
    centres.value = response.data.data
  } catch (error) {
    toast.error('Erreur lors du chargement des centres de vote')
  }
}

const fetchBureaux = async () => {
  if (!filters.value.centre_de_vote_id) {
    bureaux.value = []
    return
  }
  try {
    const response = await axios.get(`/centres-de-vote/${filters.value.centre_de_vote_id}/bureaux-vote`)
    bureaux.value = response.data.data
  } catch (error) {
    toast.error('Erreur lors du chargement des bureaux de vote')
  }
}

const fetchContestations = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.centre_de_vote_id) params.centre_id = filters.value.centre_de_vote_id
    if (filters.value.bureau_de_vote_id) params.bureau_id = filters.value.bureau_de_vote_id
    if (filters.value.statut) params.statut = filters.value.statut
    if (filters.value.date_debut) params.date_debut = filters.value.date_debut
    if (filters.value.date_fin) params.date_fin = filters.value.date_fin

    const response = await axios.get('/contestations/all', { params })
    contestations.value = response.data.data
  } catch (error) {
    toast.error('Erreur lors du chargement des contestations')
  } finally {
    loading.value = false
  }
}

const fetchStatistiques = async () => {
  try {
    const response = await axios.get('/contestations/statistiques')
    statistiques.value = response.data.data
    statistiquesDialog.value = true
  } catch (error) {
    toast.error('Erreur lors du chargement des statistiques')
  }
}

// Méthodes d'interaction
const traiterContestation = (contestation) => {
  currentContestation.value = contestation
  traitementDialog.value = true
  decision.value = null
  commentaire.value = ''
}

const confirmerTraitement = async () => {
  try {
    await axios.post(`/contestations/${currentContestation.value.id}/traiter`, {
      decision: decision.value,
      commentaire: commentaire.value
    })

    toast.success('Contestation traitée avec succès')
    traitementDialog.value = false
    fetchContestations()
    fetchStatistiques()
  } catch (error) {
    toast.error('Erreur lors du traitement de la contestation')
  }
}

const showDetailsContestation = (contestation) => {
  currentContestation.value = contestation
  detailsDialog.value = true
}

const telechargerPieceJointe = async (contestationId, index) => {
  try {
    const response = await axios.get(`/contestations/${contestationId}/piece-jointe/${index}`, {
      responseType: 'blob'
    })

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `piece_jointe_${index + 1}.pdf`)
    document.body.appendChild(link)
    link.click()

    // Nettoyer
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    toast.error('Erreur lors du téléchargement')
  }
}

const showStatistiques = () => {
  fetchStatistiques()
}

// Initialisation et observateurs
onMounted(() => {
  fetchCentres()
  fetchContestations()
  fetchStatistiques()
})

// Observateurs de filtres
watch(filters, () => {
  fetchContestations()
}, { deep: true })
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}

.v-list-item {
  padding: 8px 0;
}
</style>
