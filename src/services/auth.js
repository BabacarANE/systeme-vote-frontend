// src/services/auth.js
import axios from 'axios'

// Définir l'URL de base de l'API
const API_URL = 'http://localhost:8000' // Ajustez selon votre configuration

export const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password
      })

      if (response.data) {
        // Stocker le token dans localStorage
        localStorage.setItem('token', response.data.token)
        return response.data
      }

      return null
    } catch (error) {
      if (error.response) {
        // Erreur avec réponse du serveur
        throw new Error(error.response.data.message || 'Identifiants incorrects')
      } else if (error.request) {
        // Erreur sans réponse du serveur
        throw new Error('Impossible de contacter le serveur')
      } else {
        // Autre type d'erreur
        throw new Error('Une erreur est survenue')
      }
    }
  },

  logout() {
    localStorage.removeItem('token')
  },

  getToken() {
    return localStorage.getItem('token')
  }
}
