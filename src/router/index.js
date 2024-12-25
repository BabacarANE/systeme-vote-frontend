import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true }
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      // Routes Admin
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      // Gestion territoriale
      {
        path: 'admin/pays',
        name: 'admin-pays',
        component: () => import('@/views/admin/territorial/PaysView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/regions',
        name: 'admin-regions',
        component: () => import('@/views/admin/territorial/RegionsView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/departements',
        name: 'admin-departements',
        component: () => import('@/views/admin/territorial/DepartementsView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/communes',
        name: 'admin-communes',
        component: () => import('@/views/admin/territorial/CommunesView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },

      // Gestion centre et bureaux
      {
        path: 'admin/centres-vote',
        name: 'admin-centres',
        component: () => import('@/views/admin/bureaux/CentresView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/bureaux-vote',
        name: 'admin-bureaux',
        component: () => import('@/views/admin/bureaux/BureauxView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },

      // Gestion électoral
      {
        path: 'admin/elections',
        name: 'admin-elections',
        component: () => import('@/views/admin/electoral/ElectionsView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/candidatures',
        name: 'admin-candidatures',
        component: () => import('@/views/admin/electoral/CandidaturesView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/affectations',
        name: 'admin-affectations',
        component: () => import('@/views/admin/electoral/AffectationsView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },

      // Gestion des personnes
      {
        path: 'admin/candidats',
        name: 'admin-candidats',
        component: () => import('@/views/admin/personnes/CandidatsView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/electeurs',
        name: 'admin-electeurs',
        component: () => import('@/views/admin/personnes/ElecteursView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },
      {
        path: 'admin/utilisateurs',
        name: 'admin-utilisateurs',
        component: () => import('@/views/admin/personnes/UtilisateursView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN_DGE' }
      },

      // Routes Superviseur
      {
        path: 'superviseur',
        name: 'superviseur',
        component: () => import('@/views/superviseur/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },
      {
        path: 'superviseur/contestations',
        name: 'superviseur-contestations',
        component: () => import('@/views/superviseur/ContestationsView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },
      {
        path: 'superviseur/pv',
        name: 'superviseur-pv',
        component: () => import('@/views/superviseur/PVView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },
      {
        path: 'superviseur/resultats',
        name: 'superviseur-resultats',
        component: () => import('@/views/superviseur/ResultatsView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },
      {
        path: 'superviseur/resultats/bureaux',  // Modification du chemin
        name: 'superviseur-resultats-bureaux',
        component: () => import('@/views/superviseur/resultats/BureauxView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },
      {
        path: 'superviseur/resultats/globaux',  // Modification du chemin
        name: 'superviseur-resultats-globaux',
        component: () => import('@/views/superviseur/resultats/GlobalView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },
      {
        path: 'superviseur/journal',
        name: 'superviseur-journal',
        component: () => import('@/views/superviseur/JournalView.vue'),
        meta: { requiresAuth: true, role: 'SUPERVISEUR_CENA' }
      },

      // Routes Personnel BV
      {
        path: 'personnel',
        name: 'personnel',
        component: () => import('@/views/personnel/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'PERSONNEL_BV' }
      },
      {
        path: 'personnel/bureaux/gestion',
        name: 'personnel-bureaux-gestion',
        component: () => import('@/views/personnel/bureaux/GestionView.vue'),
        meta: { requiresAuth: true, role: 'PERSONNEL_BV' }
      },
      {
        path: 'personnel/pv/generer',
        name: 'personnel-pv-generer',
        component: () => import('@/views/personnel/pv/GenererView.vue'),
        meta: { requiresAuth: true, role: 'PERSONNEL_BV' }
      },
      {
        path: 'personnel/resultats',
        name: 'personnel-resultats',
        component: () => import('@/views/personnel/ResultatsView.vue'),
        meta: { requiresAuth: true, role: 'PERSONNEL_BV' }
      },
      {
        path: '/personnel/vote',
        name: 'vote',
        component: () => import('@/views/personnel/VotePage.vue'),
        meta: { requiresAuth: true, role: 'PERSONNEL_BV' } // Correction du rôle
      },

      // Routes Représentant
      {
        path: 'representant',
        name: 'representant',
        component: () => import('@/views/representant/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'REPRESENTANT' }
      },
      {
        path: 'representant/pv',
        name: 'representant-pv',
        component: () => import('@/views/representant/PVView.vue'),
        meta: { requiresAuth: true, role: 'REPRESENTANT' }
      },
      {
        path: 'representant/contestations/creer',
        name: 'representant-contestations-creer',
        component: () => import('@/views/representant/contestations/CreerView.vue'),
        meta: { requiresAuth: true, role: 'REPRESENTANT' }
      },
      {
        path: '/representant/contestations',
        name: 'contestations',
        component: () => import('@/views/representant/ContestationsView.vue'),
        meta: {
          requiresAuth: true,
          role: 'REPRESENTANT'
        }
      },
      {
        path: 'representant/electeur',
        name: 'representant-electeur-verification',
        component: () => import('@/views/representant/ElecteurVerificationView.vue'),
        meta: {
          title: 'Vérification Électeur',
          requiresAuth: true,
          role: 'REPRESENTANT'  // En majuscules pour correspondre au rôle exact
        }
      },
      {
        path: 'representant/contestations/liste',
        name: 'representant-contestations-liste',
        component: () => import('@/views/representant/contestations/ListeView.vue'),
        meta: { requiresAuth: true, role: 'REPRESENTANT' }
      },
      {
        path: 'representant/resultats',
        name: 'representant-resultats',
        component: () => import('@/views/representant/ResultatsView.vue'),
        meta: { requiresAuth: true, role: 'REPRESENTANT' }
      },

      {
        path: '',
        name: 'home',
        redirect: to => {
          const authStore = useAuthStore()
          if (!authStore.isAuthenticated) return { name: 'login' }

          const roleRoutes = {
            'ADMIN_DGE': 'admin',
            'SUPERVISEUR_CENA': 'superviseur',
            'PERSONNEL_BV': 'personnel',
            'REPRESENTANT': 'representant'
          }

          return { name: roleRoutes[authStore.user?.role] || 'login' }
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'login' })
      return
    }

    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      next('/')
      return
    }
  }

  if (to.meta.guest && isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
