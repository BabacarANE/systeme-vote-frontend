<template>
  <v-container class="pa-0 ma-0" fluid style="height: 100vh; overflow: hidden;">
    <!-- Background animations -->
    <div class="bg"></div>
    <div class="bg bg2"></div>
    <div class="bg bg3"></div>

    <!-- Content -->
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <div class="content">
          <img
            src="@/assets/LOGO.jpg"
            alt="Logo de la Direction générale des Elections"
            class="logo"
          />

          <div class="senegal-text">République du Sénégal</div>

          <v-form @submit.prevent="handleLogin" v-model="formValid" class="login-form">
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="error = ''"
            >
              {{ error }}
            </v-alert>

            <label for="email">Login:</label>
            <v-text-field
              v-model="form.email"
              id="email"
              type="email"
              :rules="emailRules"
              required
              variant="outlined"
              :disabled="loading"
              autocomplete="email"
              class="custom-input"
              bg-color="white"
            />

            <label for="password">Password:</label>
            <v-text-field
              v-model="form.password"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="passwordRules"
              required
              variant="outlined"
              :disabled="loading"
              autocomplete="current-password"
              @click:append-inner="showPassword = !showPassword"
              class="custom-input"
              bg-color="white"
            />

            <v-btn
              type="submit"
              :loading="loading"
              :disabled="!formValid"
              class="submit-btn"
            >
              Se connecter
            </v-btn>
          </v-form>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'

const router = useRouter()
const authStore = useAuthStore()

const formValid = ref(false)
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const emailRules = [
  v => !!v || 'L\'email est requis',
  v => /.+@.+\..+/.test(v) || 'Email invalide'
]

const passwordRules = [
  v => !!v || 'Le mot de passe est requis',
  v => v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères'
]

async function handleLogin() {
  if (!formValid.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await authService.login(form.email, form.password)

    // L'API retourne maintenant directement le rôle
    const userWithRole = response.user
    const userRole = userWithRole.role

    // Stocker l'utilisateur avec son rôle
    authStore.setToken(response.token)
    authStore.setUser(userWithRole)

    if (!userRole) {
      error.value = 'Rôle non reconnu'
      return
    }

    // Redirection basée sur le rôle
    switch (userRole) {
      case 'ADMIN_DGE':
        await router.push({ name: 'admin' })
        break
      case 'SUPERVISEUR_CENA':
        await router.push({ name: 'superviseur' })
        break
      case 'PERSONNEL_BV':
        await router.push({ name: 'personnel' })
        break
      case 'REPRESENTANT':
        await router.push({ name: 'representant' })
        break
      default:
        error.value = 'Rôle non reconnu'
        authStore.logout()
        break
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de connexion'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Les animations de background doivent être en dehors de scoped */
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
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo {
  width: 120px;
  height: auto;
  margin-bottom: 20px;
}

.senegal-text {
  font-size: 1.8rem;
  font-weight: bold;
  background: linear-gradient(to right, #008000, #ffea00, #ff0000);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

label {
  color: #008000;
  display: block;
  font-size: 1rem;
  margin-bottom: 8px;
  text-align: left;
}

.custom-input {
  margin-bottom: 20px;
}

.submit-btn {
  background-color: #008000 !important;
  color: white !important;
  width: 100%;
  margin-top: 20px;
  padding: 12px !important;
  font-size: 1.1rem !important;
}

@keyframes slide {
  0% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(25%);
  }
}

/* Responsive styles */
@media (max-width: 600px) {
  .content {
    padding: 20px;
  }

  .logo {
    width: 80px;
  }

  .senegal-text {
    font-size: 1.4rem;
  }
}
</style>
