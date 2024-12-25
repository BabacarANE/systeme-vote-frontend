<template >
  <v-container style="padding-top: 100px; padding-left: 250px;">
    <!-- Titre -->
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion du Bureau de Vote</h1>
        <div>

          <v-btn
            color="success"
            @click="ouvrirBureau"
            prepend-icon="mdi-door-open"
            :disabled="bureauDeVote?.statut === 'OUVERT'"
            class="mr-2"
          >
            Ouvrir le Bureau
          </v-btn>

          <!-- Bouton Interface de Vote -->
          <v-btn
            v-if="bureauDeVote?.statut === 'OUVERT'"
            color="primary"
            @click="chargerInterfaceVote"
            prepend-icon="mdi-vote"
          >
            Interface de Vote
          </v-btn>


          <v-btn
            color="danger"
            @click="showFermetureBureauDialog = true"
            prepend-icon="mdi-power"
            :disabled="bureauDeVote?.statut === 'FERME'"

            class="mr-2"
          >
            Fermer le Bureau
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Erreurs -->
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

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center">
        <v-progress-circular indeterminate />
      </v-col>
    </v-row>

    <template v-else-if="bureauDeVote">
      <!-- Informations bureau -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="bg-primary text-white">
              Informations du Bureau
            </v-card-title>
            <v-card-text class="pt-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-office-building</v-icon>
                      </template>
                      <v-list-item-title>Centre de Vote</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ bureauDeVote.centre_de_vote?.nom || 'Non défini' }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>Adresse</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ bureauDeVote.centre_de_vote?.adresse || 'Non défini' }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title>Numéro du Bureau</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ bureauDeVote.nom || 'Non défini' }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>

                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-account-group</v-icon>
                      </template>
                      <v-list-item-title>Nombre d'inscrits</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ bureauDeVote.nombre_inscrits || '0' }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-clock</v-icon>
                      </template>
                      <v-list-item-title>Statut</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          :color="bureauDeVote.statut === 'OUVERT' ? 'success' : 'warning'"
                          text-color="white"
                          small
                        >
                          {{ bureauDeVote.statut || 'FERMÉ' }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="bureauDeVote.heure_ouverture">
                      <template #prepend>
                        <v-icon color="primary">mdi-clock-start</v-icon>
                      </template>
                      <v-list-item-title>Heure d'ouverture</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ new Date(bureauDeVote.heure_ouverture).toLocaleTimeString() }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Liste des électeurs -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              Liste des Électeurs
              <v-chip>
                {{ bureauDeVote.liste_electorale?.electeurs?.length || 0 }} électeurs
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Rechercher un électeur"
                density="comfortable"
                variant="outlined"
                class="mb-4"
                hide-details
                clearable
              />

              <v-data-table
                :headers="electeursHeaders"
                :items="bureauDeVote.liste_electorale?.electeurs || []"
                :search="search"
                :loading="loading"
              >
                <template v-slot:item.a_voter="{ item }">
                  <v-chip
                    :color="item?.a_voter ? 'success' : 'warning'"
                    text-color="white"
                    small
                  >
                    {{ item?.a_voter ? 'A voté' : 'N\'a pas voté' }}
                  </v-chip>
                </template>

                <template v-slot:item.personne.nom="{ item }">
                  {{ item?.personne?.nom || '-' }}
                </template>

                <template v-slot:item.personne.prenom="{ item }">
                  {{ item?.personne?.prenom || '-' }}
                </template>

                <template v-slot:item.numero_electeur="{ item }">
                  {{ item?.numero_electeur || '-' }}
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <!-- Dialog de confirmation avec authentification -->
    <v-dialog v-model="showFermetureBureauDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          Fermeture du Bureau de Vote
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-4">
            Cette action est définitive. Veuillez vous authentifier pour continuer.
          </p>

          <v-form ref="authForm" v-model="fermetureFormValid" @submit.prevent="verifierAuthentification">
            <v-text-field
              v-model="fermetureData.email"
              label="Email"
              type="email"
              required
              :rules="emailRules"
              variant="outlined"
              class="mb-4"
            />

            <v-text-field
              v-model="fermetureData.code"
              label="Code personnel"
              required
              :rules="codeRules"
              variant="outlined"
              class="mb-4"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showFermetureBureauDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            :loading="loadingFermeture"
            :disabled="!fermetureFormValid"
            @click="verifierAuthentification"
          >
            Fermer le bureau
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Dialog d'affichage des résultats -->
    <v-dialog v-model="showResultatsDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-success text-white">
          Fermeture réussie
        </v-card-title>

        <v-card-text class="pt-4">
          <!-- Résultats du bureau -->
          <div v-if="resultatsData?.resultat" class="mb-4">
            <h3 class="text-h6 mb-2">Résultats du bureau</h3>
            <v-list>
              <v-list-item>
                <v-list-item-title>Nombre de votants:</v-list-item-title>
                <v-list-item-subtitle>{{ resultatsData.resultat.nombre_votants }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Bulletins nuls:</v-list-item-title>
                <v-list-item-subtitle>{{ resultatsData.resultat.bulletins_nuls }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Bulletins blancs:</v-list-item-title>
                <v-list-item-subtitle>{{ resultatsData.resultat.bulletins_blancs }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Suffrages exprimés:</v-list-item-title>
                <v-list-item-subtitle>{{ resultatsData.resultat.suffrages_exprimes }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <!-- Téléchargement PV -->
          <div v-if="resultatsData?.resultat?.pv" class="text-center">
            <v-btn
              color="primary"
              prepend-icon="mdi-download"
              @click="downloadPV"
            >
              Télécharger le PV
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            @click="terminerFermeture"
          >
            Terminer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'

// États
const showResultatsDialog = ref(false)
const loading = ref(true)
const error = ref(null)
const bureauDeVote = ref(null)
const search = ref('')
const bureauData = ref(null)
const showFermetureBureauDialog = ref(false)

const loadingFermeture = ref(false)
const fermetureFormValid = ref(false)




const router = useRouter()
const toast = useToast()

// En-têtes pour la table des électeurs
const electeursHeaders = [
  {
    title: 'N° Électeur',
    key: 'numero_electeur',
    align: 'start',
    sortable: true
  },
  {
    title: 'Nom',
    key: 'personne.nom',
    align: 'start',
    sortable: true
  },
  {
    title: 'Prénom',
    key: 'personne.prenom',
    align: 'start',
    sortable: true
  },
  {
    title: 'Statut',
    key: 'a_voter',
    align: 'center',
    sortable: true
  }
]

// Récupérer les informations du bureau
const fetchBureauInfo = async () => {
  try {
    loading.value = true
    const response = await axios.get('/personnel/monbureau')

    if (response.data.success) {
      // S'assurer que toutes les propriétés requises sont présentes
      bureauDeVote.value = {
        ...response.data.data,
        liste_electorale: response.data.data.liste_electorale || {
          electeurs: []
        }
      }
    } else {
      throw new Error(response.data.message || 'Erreur lors du chargement')
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = err.response?.data?.message || 'Erreur lors du chargement des informations'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

// Ouvrir le bureau
const ouvrirBureau = async () => {
  try {
    const response = await axios.post('/personnel/bureau/ouvrir')
    if (response.data.success) {
      toast.success('Bureau ouvert avec succès')
      // Stockage des données retournées par l'API
      bureauData.value = response.data.data
      // Mise à jour des informations du bureau
      await fetchBureauInfo()
    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'ouverture')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'ouverture du bureau'
    toast.error(error.value)
  }
}

// Charger l'interface de vote
const chargerInterfaceVote = async () => {
  try {
    const response = await axios.get('/personnel/vote/interface')
    if (response.data.success) {
      // Utiliser state au lieu des params
      router.push({
        name: 'vote',
        state: { bureauData: response.data.data }  // Utiliser state au lieu de params
      })
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement de l\'interface'
    toast.error(error.value)
  }
}

const fermetureData = ref({
  email: '',
  code: ''
})

const resultatsData = ref({
  nombre_votants: 0,
  bulletins_nuls: 0,
  bulletins_blancs: 0,
  observations: ''
})

// Règles de validation
const emailRules = [
  v => !!v || 'Email requis',
  v => /.+@.+\..+/.test(v) || 'Email invalide'
]

const codeRules = [
  v => !!v || 'Code requis',
  v => v.length >= 4 || 'Code invalide'
]

const votantsRules = [
  v => !!v || 'Nombre de votants requis',
  v => v >= 0 || 'Le nombre doit être positif',
  v => v <= bureauData.value?.nombre_inscrits || 'Ne peut pas dépasser le nombre d\'inscrits'
]

const bulletinsRules = [
  v => !!v || 'Nombre requis',
  v => v >= 0 || 'Le nombre doit être positif'
]

// Méthodes
const verifierAuthentification = async () => {
  try {
    loadingFermeture.value = true

    // Vérifier les identifiants
    const authResponse = await axios.post('/personnel/bureau/verifier-auth', fermetureData.value)

    if (authResponse.data.success) {
      // Enchaîner directement avec la fermeture du bureau
      await fermerBureau()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erreur d\'authentification')
  } finally {
    loadingFermeture.value = false
  }
}

// Fonction de fermeture du bureau
const downloadPV = async () => {
  try {
    if (!resultatsData.value?.resultat?.pv) {
      toast.error('PV non disponible')
      return
    }

    // Construire l'URL avec le chemin du PV depuis le resultat
    const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8000'
    const pvPath = resultatsData.value.resultat.pv
    const fullUrl = `${baseUrl}/storage/${pvPath}`

    // Ouvrir dans un nouvel onglet
    window.open(fullUrl, '_blank')

    toast.success('PV ouvert avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du PV:', error)
    toast.error('Erreur lors de l\'ouverture du PV')
  }
}

// Mettre à jour également dans fermerBureau
const fermerBureau = async () => {
  try {
    if (!bureauDeVote.value?.id) {
      throw new Error('ID du bureau non trouvé')
    }

    const response = await axios.post(`/personnel/bureau/fermer/${bureauDeVote.value.id}`)

    if (response.data.success) {
      resultatsData.value = {
        resultat: response.data.data.resultat,  // Inclut le chemin du PV
        bureau: response.data.data.bureau
      }

      showFermetureBureauDialog.value = false
      showResultatsDialog.value = true
      await fetchBureauInfo()
      toast.success('Bureau fermé avec succès')
    }
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de la fermeture du bureau')
  }
}

// Méthode pour terminer et rediriger
const terminerFermeture = () => {
  showResultatsDialog.value = false;
  router.push({ name: 'personnel-bureaux-gestion' });
}
// Initialisation
onMounted(() => {
  fetchBureauInfo()
})
</script>

<style scoped>
.v-data-table {
  background: white !important;
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

.v-card-title {
  padding: 16px;
  font-size: 1.25rem;
  font-weight: 500;
}

.v-card-text {
  padding-top: 20px;
}

.bg-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.gap-2 {
  gap: 8px;
}
.close-bureau-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}
</style>
