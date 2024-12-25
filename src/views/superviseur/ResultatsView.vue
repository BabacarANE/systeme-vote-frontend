<!-- src/views/superviseur/ResultatsBureauVoteView.vue -->
<template>
  <div class="resultats-bureau-vote-view">
    <!-- Titre et actions principales -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <h2 class="mr-4">Gestion des Résultats</h2>
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-check-all"
          @click="showFinalizedResults"
        >
          Résultats Finalisés
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Filtres avancés -->
    <v-card class="mb-4 pa-4">
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
    </v-card>

    <!-- Liste des résultats -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="resultats"
        :loading="loading"
        @click:row="showResultatDetails"
      >
        <!-- Colonnes personnalisées -->
        <template #item.centre="{ item }">
          {{ item.bureau_de_vote.centre_de_vote.nom }}
        </template>

        <template #item.bureau="{ item }">
          {{ item.bureau_de_vote.nom }}
        </template>

        <template #item.validite="{ item }">
          <v-chip
            :color="item.validite ? 'success' : 'warning'"
            small
          >
            {{ item.validite ? 'Validé' : 'En attente' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="!item.validite"
            icon
            color="primary"
            @click.stop="validerResultat(item)"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            icon
            color="info"
            @click.stop="voirDetails(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de validation -->
    <v-dialog v-model="validationDialog" max-width="500">
      <v-card>
        <v-card-title>Validation de Résultat</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="commentaireValidation"
            label="Commentaire (optionnel)"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            @click="validationDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmerValidation"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Résultats Finalisés -->
    <v-dialog v-model="finalizedResultsDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-toolbar-title>Résultats Finalisés</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="finalizedResultsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <h3>Statistiques Globales</h3>
              <v-list>
                <v-list-item>
                  <v-list-item-title>Total Inscrits</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ resultatsGlobaux.participation?.inscrits }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Total Votants</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ resultatsGlobaux.participation?.votants }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12">
              <h3>Résultats par Candidat</h3>
              <v-data-table
                :headers="candidatHeaders"
                :items="resultatsParCandidat"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// États
const resultats = ref([])
const centres = ref([])
const bureaux = ref([])
const loading = ref(false)
const validationDialog = ref(false)
const finalizedResultsDialog = ref(false)
const resultatsGlobaux = ref({})
const currentResultat = ref(null)
const commentaireValidation = ref('')

// Filtres
const filters = ref({
  centre_de_vote_id: null,
  bureau_de_vote_id: null,
  statut: null
})

// Configuration de la table
const headers = [
  { title: 'Centre', key: 'centre', sortable: true },
  { title: 'Bureau', key: 'bureau', sortable: true },
  { title: 'Votants', key: 'nombre_votants' },
  { title: 'Bulletins Nuls', key: 'bulletins_nuls' },
  { title: 'Suffrages Exprimés', key: 'suffrages_exprimes' },
  { title: 'Statut', key: 'validite' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const candidatHeaders = [
  { title: 'Candidat', key: 'candidat' },
  { title: 'Parti', key: 'parti' },
  { title: 'Total Voix', key: 'total_voix' }
]

const statutOptions = [
  { title: 'Validé', value: true },
  { title: 'En attente', value: false }
]

const resultatsParCandidat = computed(() => {
  return resultatsGlobaux.value.resultats_par_candidat
    ? Object.values(resultatsGlobaux.value.resultats_par_candidat)
    : []
})

// Méthodes
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

const fetchResultats = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.centre_de_vote_id) params.centre_id = filters.value.centre_de_vote_id
    if (filters.value.bureau_de_vote_id) params.bureau_id = filters.value.bureau_de_vote_id
    if (filters.value.statut !== null) params.validite = filters.value.statut

    const response = await axios.get('/resultats-bureau-vote', { params })
    resultats.value = response.data.data
  } catch (error) {
    toast.error('Erreur lors du chargement des résultats')
  } finally {
    loading.value = false
  }
}

const validerResultat = (resultat) => {
  currentResultat.value = resultat
  validationDialog.value = true
}

const confirmerValidation = async () => {
  try {
    await axios.post(`/resultats/${currentResultat.value.id}/valider`, {
      commentaire: commentaireValidation.value
    })
    toast.success('Résultat validé avec succès')
    validationDialog.value = false
    commentaireValidation.value = ''
    fetchResultats()
  } catch (error) {
    toast.error('Erreur lors de la validation')
  }
}

const showResultatDetails = (event, { item }) => {
  // TODO: Implémenter l'affichage des détails du résultat
  console.log('Détails du résultat', item)
}

const showFinalizedResults = async () => {
  try {
    const response = await axios.get('/resultats/finalises')
    resultatsGlobaux.value = response.data.data
    finalizedResultsDialog.value = true
  } catch (error) {
    toast.error('Erreur lors du chargement des résultats finalisés')
  }
}

const voirDetails = (resultat) => {
  // TODO: Implémenter l'affichage des détails du résultat
  console.log('Voir détails du résultat', resultat)
}

// Initialisation
onMounted(() => {
  fetchCentres()
  fetchResultats()
})

// Observateurs de filtres
watch(filters, () => {
  fetchResultats()
}, { deep: true })
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}
</style>
