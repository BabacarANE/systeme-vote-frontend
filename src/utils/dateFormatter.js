// src/utils/dateFormatter.js
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDateTime(date) {
  if (!date) return ''
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}
