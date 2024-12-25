<template>
  <v-container class="pa-0 ma-0" fluid style="height: 100vh; overflow: hidden;">
    <!-- Background animations -->
    <div class="bg"></div>
    <div class="bg bg2"></div>
    <div class="bg bg3"></div>

    <!-- Content -->
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <div class="content">
          <div class="title-text">Système de Vote Électronique</div>

          <form @submit.prevent="confirmerVote" class="vote-form">
            <!-- Zone entrée numéro électeur -->
            <v-text-field
              v-model="numeroElecteur"
              label="Numéro Électeur"
              type="text"
              required
              variant="outlined"
              :disabled="loading"
              class="custom-input"
              bg-color="white"
            />

            <!-- Options de vote -->
            <div class="ballot-options">
              <div
                v-for="candidat in bureauData?.candidatures"
                :key="candidat.id"
                class="ballot-option"
              >
                <input
                  type="radio"
                  :id="'candidat-' + candidat.id"
                  name="vote"
                  :value="candidat.id"
                  v-model="selectedCandidat"
                >
                <label :for="'candidat-' + candidat.id">
                  <img
                    :src="candidat.bulletin_url"
                    :alt="'Bulletin de ' + candidat.nom"
                    class="bulletin-image"
                  >
                  <div class="candidat-info">
                    <p class="candidat-nom">{{ candidat.prenom }} {{ candidat.nom }}</p>
                    <p class="candidat-parti">{{ candidat.parti }}</p>
                  </div>
                </label>
              </div>

              <!-- Vote blanc -->
              <div class="ballot-option">
                <input
                  type="radio"
                  id="vote-blanc"
                  name="vote"
                  value="blanc"
                  v-model="selectedCandidat"
                >
                <label for="vote-blanc">
                  <div class="bulletin-blanc">
                    <v-icon size="150" color="grey">mdi-cancel</v-icon>
                  </div>
                  <div class="candidat-info">
                    <p class="candidat-nom">Vote Blanc</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Bouton de soumission -->
            <v-btn
              type="submit"
              :loading="loading"
              :disabled="!selectedCandidat || !numeroElecteur"
              class="submit-btn"
              size="large"
              block
            >
              Soumettre le vote
            </v-btn>
          </form>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog de confirmation -->
    <v-dialog v-model="showConfirmation" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">Confirmation du Vote</v-card-title>
        <v-card-text>
          <p v-if="selectedCandidat === 'blanc'">
            Vous allez effectuer un vote blanc. Cette action est définitive.
          </p>
          <p v-else>
            Vous allez voter pour {{ getCandidatName }}. Cette action est définitive.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="text"
            @click="showConfirmation = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            @click="soumettreVote"
            :loading="loading"
          >
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>

  <!-- Dialog du reçu de vote -->
  <v-dialog v-model="showRecu" max-width="600" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-success text-white">
        Vote enregistré avec succès
      </v-card-title>

      <v-card-text class="pa-4">
        <template v-if="recuData">
          <!-- Informations de l'électeur -->
          <div class="mb-4">
            <h3 class="text-h6 mb-2">Informations de l'électeur</h3>
            <v-row dense>
              <v-col cols="6">
                <strong>Numéro électeur :</strong> {{ recuData.electeur.numero }}
              </v-col>
              <v-col cols="6">
                <strong>Nom :</strong> {{ recuData.electeur.nom }}
              </v-col>
              <v-col cols="6">
                <strong>Prénom :</strong> {{ recuData.electeur.prenom }}
              </v-col>
              <v-col cols="6">
                <strong>Date de naissance :</strong>
                {{ new Date(recuData.electeur.date_naissance).toLocaleDateString() }}
              </v-col>
            </v-row>
          </div>

          <!-- Informations du vote -->
          <div class="mb-4">
            <h3 class="text-h6 mb-2">Informations du vote</h3>
            <v-row dense>
              <v-col cols="12">
                <strong>Bureau de vote :</strong> {{ recuData.lieu_vote.bureau_vote.nom }}
              </v-col>
              <v-col cols="12">
                <strong>Centre de vote :</strong> {{ recuData.lieu_vote.centre_vote.nom }}
              </v-col>
              <v-col cols="12">
                <strong>Adresse :</strong> {{ recuData.lieu_vote.centre_vote.adresse }}
              </v-col>
              <v-col cols="12">
                <strong>Commune :</strong> {{ recuData.lieu_vote.commune.nom }}
              </v-col>
              <v-col cols="12">
                <strong>Date et heure :</strong> {{ new Date().toLocaleString() }}
              </v-col>
              <v-col cols="12">
                <strong>Type de vote :</strong>
                {{ selectedCandidat === 'blanc' ? 'Vote blanc' : 'Vote pour un candidat' }}
              </v-col>
            </v-row>
          </div>
        </template>

        <div class="text-center mt-4">
          <v-icon color="success" size="48" class="mb-2">mdi-check-circle</v-icon>
          <p class="text-h6 success--text">Vote enregistré et validé</p>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="terminerVote"
        >
          Terminer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const showRecu = ref(false)
const recuData = ref(null)

// États
const loading = ref(false)
const numeroElecteur = ref('')
const selectedCandidat = ref(null)
const showConfirmation = ref(false)
const bureauData = ref(null)

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

// Computed
const getCandidatName = computed(() => {
  if (selectedCandidat.value === 'blanc') return 'Vote Blanc'
  const candidat = bureauData.value?.candidatures?.find(c => c.id === selectedCandidat.value)
  return candidat ? `${candidat.prenom} ${candidat.nom}` : ''
})

// Méthodes
const showNotification = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout: color === 'error' ? 6000 : 3000
  }
}

const confirmerVote = () => {
  if (!selectedCandidat.value || !numeroElecteur.value) return
  showConfirmation.value = true
}

// Modifiez la fonction soumettreVote
// Dans VotePage.vue, modifiez la fonction soumettreVote :
// Dans VotePage.vue, modifiez la fonction soumettreVote
// Modifier soumettreVote pour inclure l'affichage du reçu
const soumettreVote = async () => {
  try {
    loading.value = true

    if (!bureauData.value?.bureau?.id) {
      throw new Error('Données du bureau non disponibles')
    }

    // Pour un vote blanc...
    if (selectedCandidat.value === 'blanc') {
      const voteBlancData = {
        numero_electeur: numeroElecteur.value,
        bureau_vote_id: bureauData.value.bureau.id
      }

      const response = await axios.post('/personnel/vote/blanc', voteBlancData)

      if (response.data.success) {
        // Récupérer les informations de l'électeur
        const infoElecteur = await axios.get(`/personnel/electeur/${numeroElecteur.value}`)
        recuData.value = infoElecteur.data.data
        showRecu.value = true
      }
    } else {
      // Vote normal
      const voteData = {
        numero_electeur: numeroElecteur.value,
        bureau_vote_id: bureauData.value.bureau.id,
        candidature_id: selectedCandidat.value
      }

      const response = await axios.post('/personnel/vote', voteData)

      if (response.data.success) {
        // Récupérer les informations de l'électeur
        const infoElecteur = await axios.get(`/personnel/electeur/${numeroElecteur.value}`)
        recuData.value = infoElecteur.data.data
        showRecu.value = true
      }
    }
  } catch (error) {
    // ... gestion des erreurs existante ...
  } finally {
    loading.value = false
    showConfirmation.value = false
  }
}

// Ajouter cette fonction pour terminer le processus
const terminerVote = () => {
  showRecu.value = false
  resetForm()
}

// Modifier resetForm pour réinitialiser aussi les données du reçu
const resetForm = () => {
  numeroElecteur.value = ''
  selectedCandidat.value = null
  recuData.value = null
}



// Initialisation

onMounted(async () => {
  try {
    if (router.currentRoute.value.state?.bureauData) {
      bureauData.value = router.currentRoute.value.state.bureauData
      console.log('Données récupérées du state:', bureauData.value)
    } else {
      console.log('Récupération des données via API...')
      // Corriger également l'URL ici
      const response = await axios.get('/personnel/vote/interface')
      // OU si votre baseURL inclut déjà /api
      // const response = await axios.get('/personnel/vote/interface')

      if (response.data.success) {
        bureauData.value = response.data.data
      } else {
        throw new Error('Données non disponibles')
      }
    }

    // Vérification des données
    if (!bureauData.value?.bureau?.id) {
      throw new Error('Structure des données invalide')
    }

  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    showNotification(
      'Erreur lors du chargement des données. Redirection...',
      'error'
    )
    setTimeout(() => {
      router.push({ name: 'personnel-bureaux-gestion' })
    }, 2000)
  }
})
</script>

<style scoped>
.bg {
  animation: slide 3s ease-in-out infinite alternate;
  background-image: linear-gradient(-60deg, #ff0000 33%, #ffea00 66%, #008000 100%);
  bottom: 0;
  left: -50%;
  opacity: 0.5;
  position: fixed;
  right: -50%;
  top: 0;
  z-index: 0;
}

.bg2 {
  animation-direction: alternate-reverse;
  animation-duration: 4s;
}

.bg3 {
  animation-duration: 5s;
}

.content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  position: relative;
  z-index: 1;
}

.title-text {
  font-size: 2rem;
  font-weight: bold;
  color: #008000;
  margin-bottom: 30px;
  text-align: center;
}

.vote-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.custom-input {
  margin-bottom: 20px;
}

.ballot-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.ballot-option {
  text-align: center;
}

.ballot-option input[type="radio"] {
  display: none;
}

.ballot-option label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.ballot-option input[type="radio"]:checked + label {
  background-color: rgba(0, 128, 0, 0.1);
  transform: scale(1.05);
}

.bulletin-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.bulletin-blanc {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 10px;
}

.candidat-info {
  text-align: center;
}

.candidat-nom {
  font-weight: 500;
  color: #008000;
  margin: 5px 0;
}

.candidat-parti {
  font-size: 0.9em;
  color: #666;
}

.submit-btn {
  background-color: #008000 !important;
  color: white !important;
  padding: 12px !important;
  font-size: 1.1rem !important;
  margin-top: 20px;
}

@keyframes slide {
  0% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(25%);
  }
}

@media (max-width: 600px) {
  .content {
    padding: 20px;
  }

  .ballot-option {
    margin: 10px 0;
  }

  .bulletin-image,
  .bulletin-blanc {
    width: 150px;
    height: 150px;
  }
}
.bg-success {
  background-color: #4CAF50 !important;
}

.success--text {
  color: #4CAF50 !important;
}
</style>
