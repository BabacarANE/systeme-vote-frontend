// src/composables/useToast.js
export const useToast = () => {
  const showToast = (message, type = 'success') => {
    // Vous pouvez implémenter votre propre logique de toast ici
    console.log(`${type}: ${message}`)
  }

  return {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    warning: (message) => showToast(message, 'warning'),
    info: (message) => showToast(message, 'info')
  }
}
