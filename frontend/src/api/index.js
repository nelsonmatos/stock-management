import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export default {
  // Dashboard
  getDashboard: () => api.get('/dashboard'),

  // Artigos
  getArtigos: (params) => api.get('/artigos', { params }),
  getArtigo: (id) => api.get(`/artigos/${id}`),
  createArtigo: (data) => api.post('/artigos', data),
  updateArtigo: (id, data) => api.put(`/artigos/${id}`, data),

  // Lotes
  getLotes: (params) => api.get('/lotes', { params }),
  getLote: (id) => api.get(`/lotes/${id}`),
  updateLoteEstado: (id, data) => api.put(`/lotes/${id}/estado`, data),

  // Stock
  getStock: (params) => api.get('/stock', { params }),
  getStockResumo: (params) => api.get('/stock/resumo', { params }),

  // Movimentos
  getMovimentos: (params) => api.get('/movimentos', { params }),
  createMovimento: (data) => api.post('/movimentos', data),
  cancelarMovimento: (id, data) => api.post(`/movimentos/${id}/cancelar`, data),

  // Localizações
  getLocalizacoes: () => api.get('/localizacoes'),

  // Encomendas
  getEncomendas: (params) => api.get('/encomendas', { params }),
  getEncomenda: (id) => api.get(`/encomendas/${id}`),
  createEncomenda: (data) => api.post('/encomendas', data),
  receberEncomenda: (id, data) => api.post(`/encomendas/${id}/recepcao`, data),

  // Alertas
  getAlertas: () => api.get('/alertas')
}
