import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Stock from '../views/Stock.vue'
import Artigos from '../views/Artigos.vue'
import Lotes from '../views/Lotes.vue'
import Movimentos from '../views/Movimentos.vue'
import Alertas from '../views/Alertas.vue'
import Encomendas from '../views/Encomendas.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/stock', component: Stock },
  { path: '/artigos', component: Artigos },
  { path: '/lotes', component: Lotes },
  { path: '/movimentos', component: Movimentos },
  { path: '/alertas', component: Alertas },
  { path: '/encomendas', component: Encomendas }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
