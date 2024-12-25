<template>
  <div class="verification-container">
    <!-- En-tête -->
    <v-card class="header-card mb-6">
      <v-card-title class="text-h4 py-4 text-center position-relative">
        <div class="stripe-container">
          <div class="stripe green"></div>
          <div class="stripe yellow"></div>
          <div class="stripe red"></div>
        </div>
        <v-icon size="36" color="green" class="mr-2">mdi-account-search</v-icon>
        Vérification d'électeur
      </v-card-title>
    </v-card>

    <!-- Formulaire de recherche -->
    <v-card class="search-card mb-6" elevation="3">
      <v-card-text class="pa-6">
        <v-form @submit.prevent="verifierElecteur" ref="form">
          <v-row align="center" justify="center">
            <v-col cols="12" md="8">
              <v-text-field
                v-model="numeroElecteur"
                label="Numéro d'électeur"
                :rules="numeroElecteurRules"
                required
                :loading="loading"
                clearable
                @keyup.enter="verifierElecteur"
                variant="outlined"
                color="green"
                class="search-input"
                hide-details="auto"
              >
                <template v-slot:prepend-inner>
                  <v-icon color="green">mdi-card-account-details</v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn
                color="green"
                type="submit"
                :loading="loading"
                :disabled="!numeroElecteur"
                block
                height="56"
                class="text-none text-h6"
              >
                <v-icon left class="mr-2">mdi-magnify</v-icon>
                Vérifier
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Résultat de la vérification -->
    <v-slide-y-transition>
      <v-card v-if="electeurInfo" elevation="3" class="result-card">
        <v-card-title class="d-flex align-center py-4 px-6 bg-green text-white">
          <v-icon size="32" class="mr-2">mdi-account-details</v-icon>
          Informations de l'électeur
          <v-chip
            :color="electeurInfo.statut_vote ? 'error' : 'success'"
            class="ml-4"
            size="large"
          >
            <v-icon start>{{ electeurInfo.statut_vote ? 'mdi-close-circle' : 'mdi-check-circle' }}</v-icon>
            {{ electeurInfo.statut_vote ? 'A déjà voté' : 'N\'a pas encore voté' }}
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <!-- Informations de l'électeur -->
            <v-col cols="12" md="6">
              <v-card flat class="info-card" color="green-lighten-5">
                <v-card-title class="text-h6">
                  <v-icon color="green" class="mr-2">mdi-card-account-details</v-icon>
                  Identité
                </v-card-title>
                <v-card-text>
                  <div class="d-flex flex-column gap-3">
                    <div class="info-item">
                      <strong>Numéro:</strong>
                      <span class="text-green">{{ electeurInfo.electeur.numero }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Nom:</strong>
                      <span>{{ electeurInfo.electeur.nom }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Prénom:</strong>
                      <span>{{ electeurInfo.electeur.prenom }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Date de naissance:</strong>
                      <span>{{ formatDate(electeurInfo.electeur.date_naissance) }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Lieu de vote -->
            <v-col cols="12" md="6" v-if="electeurInfo.lieu_vote">
              <v-card flat class="info-card" color="yellow-lighten-5">
                <v-card-title class="text-h6">
                  <v-icon color="yellow-darken-3" class="mr-2">mdi-map-marker</v-icon>
                  Lieu de vote
                </v-card-title>
                <v-card-text>
                  <div class="d-flex flex-column gap-3">
                    <div class="info-item">
                      <strong>Bureau:</strong>
                      <span>{{ electeurInfo.lieu_vote.bureau_vote.nom }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Centre:</strong>
                      <span>{{ electeurInfo.lieu_vote.centre_vote.nom }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Adresse:</strong>
                      <span>{{ electeurInfo.lieu_vote.centre_vote.adresse }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Commune:</strong>
                      <span>{{ electeurInfo.lieu_vote.commune.nom }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <!-- Message d'erreur -->
    <v-scale-transition>
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="mt-6"
        border="start"
      >
        <template v-slot:prepend>
          <v-icon>mdi-alert-circle</v-icon>
        </template>
        {{ error }}
      </v-alert>
    </v-scale-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const toast = useToast()
const form = ref(null)
const loading = ref(false)
const numeroElecteur = ref('')
const electeurInfo = ref(null)
const error = ref(null)

const numeroElecteurRules = [
  v => !!v || 'Le numéro d\'électeur est requis',
  v => /^[A-Za-z0-9]+$/.test(v) || 'Format invalide'
]

const verifierElecteur = async () => {
  if (!form.value?.validate()) return

  loading.value = true
  error.value = null
  electeurInfo.value = null

  try {
    const { data } = await axios.get(`/electeur/${numeroElecteur.value}`)
    electeurInfo.value = data.data

    // Message basé sur le statut de vote
    const message = electeurInfo.value.statut_vote
      ? 'Attention: Cet électeur a déjà voté'
      : 'Électeur vérifié avec succès'

    toast.info(message)
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la vérification de l\'électeur'
    toast.error(error.value)
    electeurInfo.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}
</script>

<style scoped>
.verification-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  background: white;
  position: relative;
  overflow: hidden;
}

.stripe-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  display: flex;
}

.stripe {
  height: 100%;
  flex: 1;
}

.green { background-color: #008000; }
.yellow { background-color: #FFD700; }
.red { background-color: #FF0000; }

.search-card {
  border-radius: 12px;
}

.search-input {
  border-radius: 8px;
}

.info-card {
  border-radius: 8px;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.12);
}

.info-item strong {
  min-width: 140px;
  color: rgba(0, 0, 0, 0.7);
}

.info-item span {
  flex: 1;
}

.result-card {
  border-radius: 12px;
  overflow: hidden;
}

.gap-3 {
  gap: 0.75rem;
}
</style>
