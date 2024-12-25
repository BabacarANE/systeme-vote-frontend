// src/views/admin/territorial/PaysView.vue
<template>
  <div style="padding-top: 100px; padding-left: 250px;">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestion des Pays</h1>
        <v-btn
          color="green"
          @click="openDialog()"
          prepend-icon="mdi-plus"
        >
          Ajouter un pays
        </v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="error"
      type="error"
      closable
      class="mb-4"
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Table des pays -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="pays"
        :loading="loading"
        :search="search"
      >
        <!-- Search Field -->
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Rechercher"
              single-line
              hide-details
              class="mr-4"
            ></v-text-field>
          </v-toolbar>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="orange"
            class="mr-2"
            @click="openDialog(item)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            color="red"
            @click="deleteItem(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog pour Ajouter/Modifier -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-green text-white">
          {{ formTitle }}
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="editedItem.nom"
                label="Nom du pays"
                :rules="nomRules"
                required
              ></v-text-field>
              <v-text-field
                v-model="editedItem.code"
                label="Code"
                :rules="codeRules"
                required
              ></v-text-field>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeDialog"
          >
            Annuler
          </v-btn>
          <v-btn
            color="green"
            :disabled="!valid"
            @click="save"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmation</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer ce pays?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="dialogDelete = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="red"
            variant="text"
            @click="deleteItemConfirm"
          >
            Confirmer
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()

// États
const loading = ref(false)
const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const valid = ref(true)
const form = ref(null)
const pays = ref([])
const error = ref(null)

const headers = [
  { title: 'Code', key: 'code', align: 'start', sortable: true },
  { title: 'Nom', key: 'nom', align: 'start', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const defaultItem = {
  id: null,
  nom: '',
  code: ''
}

const editedItem = ref({ ...defaultItem })
const editedIndex = ref(-1)

// Règles de validation
const nomRules = [
  v => !!v || 'Le nom est requis',
  v => v.length >= 3 || 'Le nom doit contenir au moins 3 caractères'
]

const codeRules = [
  v => !!v || 'Le code est requis',
  v => v.length >= 2 || 'Le code doit contenir au moins 2 caractères'
]

// Computed
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nouveau Pays' : 'Modifier Pays'
})

// Helper pour les headers
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

import axios from '@/plugins/axios'



// Méthode fetchPays
const fetchPays = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/pays')
    pays.value = response.data.data
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Une erreur est survenue lors du chargement des données.'
    if (err.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const openDialog = (item) => {
  editedIndex.value = item ? pays.value.indexOf(item) : -1
  editedItem.value = item ? Object.assign({}, item) : { ...defaultItem }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem }
  form.value?.reset()
}
// Méthode save
const save = async () => {
  if (!form.value.validate()) return

  try {
    const method = editedIndex.value === -1 ? 'post' : 'put'
    const url = editedIndex.value === -1
      ? '/pays'
      : `/pays/${editedItem.value.id}`

    const response = await axios[method](url, editedItem.value)
    await fetchPays()
    closeDialog()
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err)
    error.value = 'Une erreur est survenue lors de la sauvegarde.'
    if (err.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
  }
}

const deleteItem = (item) => {
  editedIndex.value = pays.value.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

// Méthode deleteItemConfirm
const deleteItemConfirm = async () => {
  try {
    await axios.delete(`/pays/${editedItem.value.id}`)
    await fetchPays()
  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    error.value = 'Une erreur est survenue lors de la suppression.'
    if (err.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
  }
  dialogDelete.value = false
}

// Initialisation
onMounted(() => {
  fetchPays()
})
</script>
<style scoped>
.page-content {
  padding: 200px;
}
</style>
