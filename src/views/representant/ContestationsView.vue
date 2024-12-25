<template>
  <div class="pa-4">
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h4">Mes Contestations</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showFormDialog = true">
          Nouvelle Contestation
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table :headers="headers" :items="contestations" :loading="loading">
        <template #item.date_soumission="{ item }">
          {{ formatDate(item.date_soumission) }}
        </template>

        <template #item.bureau_de_vote="{ item }">
          {{ item.resultatBureauVote?.bureauDeVote?.nom }}
        </template>

        <template #item.statut="{ item }">
          <v-chip color="warning" text-color="white">
            EN ATTENTE
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showFormDialog" persistent max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Nouvelle Contestation</span>
          <v-btn icon @click="closeFormDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.centre_de_vote_id"
                  :items="centresDeVote"
                  label="Centre de vote*"
                  item-title="nom"
                  item-value="id"
                  :rules="requiredRules"
                  required
                  @update:modelValue="onCentreDeVoteChange"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.bureau_de_vote_id"
                  :items="bureauxDeVote"
                  label="Bureau de vote*"
                  item-title="nom"
                  item-value="id"
                  :rules="requiredRules"
                  required
                  :disabled="!formData.centre_de_vote_id"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.motif"
                  label="Motif de la contestation*"
                  :rules="requiredRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description détaillée*"
                  :rules="requiredRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-file-input
                  v-model="formData.pieces_jointes"
                  label="Pièces jointes"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  :rules="pieceJointeRules"
                  prepend-icon="mdi-paperclip"
                  show-size
                  counter
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            :disabled="loading"
            @click="closeFormDialog"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!formValid"
            @click="submitForm"
          >
            Soumettre
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const auth = useAuthStore()

const form = ref(null)
const formValid = ref(false)
const loading = ref(false)
const showFormDialog = ref(false)
const contestations = ref([])
const centresDeVote = ref([])
const bureauxDeVote = ref([])


const formData = ref({
  bureau_de_vote_id: null,
  centre_de_vote_id: null,
  role_representant_id: auth.user.representant.id,
  role_candidat_id: 1, // ID fixe pour le candidat
  motif: '',
  description: '',
  pieces_jointes: []
})

const headers = [
  { title: 'Date', key: 'date_soumission', sortable: true },
  { title: 'Bureau', key: 'bureau_de_vote', sortable: true },
  { title: 'Motif', key: 'motif', sortable: true },
  { title: 'Statut', key: 'statut', sortable: false }
]

const requiredRules = [v => !!v || 'Ce champ est requis']
const pieceJointeRules = [
  files => !files || files.length <= 5 || 'Maximum 5 fichiers autorisés',
  files => !files || !files.some(f => f.size > 5000000) || 'Chaque fichier doit faire moins de 5MB'
]

const toast = useToast()

const fetchMesContestations = async () => {
  loading.value = true
  try {
    const response = await axios.get('/contestations/mes-contestations')
    contestations.value = response.data.data
  } catch (error) {
    toast.error("Erreur lors du chargement des contestations")
  } finally {
    loading.value = false
  }
}

const fetchCentresDeVote = async () => {
  try {
    const response = await axios.get('/contestations/centres-de-vote')
    centresDeVote.value = response.data.data
  } catch (error) {
    toast.error("Erreur lors du chargement des centres de vote")
  }
}

const onCentreDeVoteChange = async () => {
  if (!formData.value.centre_de_vote_id) {
    bureauxDeVote.value = []
    formData.value.resultat_bureau_vote_id = null
    return
  }

  try {
    const response = await axios.get(`/contestations/centres-de-vote/${formData.value.centre_de_vote_id}/bureaux`)
    bureauxDeVote.value = response.data.data
  } catch (error) {
    toast.error("Erreur lors du chargement des bureaux de vote")
  }
}

const submitForm = async () => {
  if (!formValid.value || !formData.value.bureau_de_vote_id) return
  loading.value = true

  try {
    const formPayload = new FormData()
    formPayload.append('bureau_de_vote_id', formData.value.bureau_de_vote_id.toString())
    formPayload.append('role_representant_id', formData.value.role_representant_id)
    formPayload.append('role_candidat_id', formData.value.role_candidat_id)
    formPayload.append('motif', formData.value.motif)
    formPayload.append('description', formData.value.description)

    if (formData.value.pieces_jointes?.length) {
      formData.value.pieces_jointes.forEach(file => {
        formPayload.append('pieces_jointes[]', file)
      })
    }

    const response = await axios.post('/contestations', formPayload)
    if (response.data.success) {
      toast.success('Contestation soumise avec succès')
      await fetchMesContestations()
      closeFormDialog()
    }
  } catch (error) {
    console.error('Erreur:', error)
    toast.error(error.response?.data?.message || "Erreur lors de la soumission")
  } finally {
    loading.value = false
  }
}

const closeFormDialog = () => {
  showFormDialog.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    centre_de_vote_id: null,
    resultat_bureau_vote_id: null,
    role_representant_id: auth.user.representant.id,
    role_candidat_id: auth.user.representant.candidature_id,
    motif: '',
    description: '',
    pieces_jointes: []
  }
  if (form.value) {
    form.value.reset()
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([
    fetchMesContestations(),
    fetchCentresDeVote()
  ])
})
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-card-title {
  font-size: 1.25rem;
  font-weight: 500;
}
</style>
