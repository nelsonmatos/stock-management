<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Stock</h1>
    </div>

    <!-- Filters -->
    <div class="card-box mb-3">
      <div class="grid">
        <div class="col-12 md:col-4">
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon"><i class="pi pi-search"></i></span>
            <InputText v-model="filters.search" placeholder="Pesquisar artigo..." @input="loadStock" />
          </div>
        </div>
        <div class="col-12 md:col-3">
          <Dropdown
            v-model="filters.localizacaoId"
            :options="localizacoes"
            optionLabel="designacao"
            optionValue="id"
            placeholder="Localização"
            showClear
            class="w-full"
            @change="loadStock"
          />
        </div>
        <div class="col-12 md:col-3">
          <Dropdown
            v-model="filters.familia"
            :options="familias"
            placeholder="Família"
            showClear
            class="w-full"
            @change="loadStock"
          />
        </div>
        <div class="col-12 md:col-2">
          <Button label="Limpar" icon="pi pi-times" class="p-button-outlined w-full" @click="clearFilters" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card-box">
      <DataTable
        :value="stocks"
        :loading="loading"
        paginator
        :rows="20"
        size="small"
        stripedRows
        :rowClass="rowClass"
        @row-click="showDetail"
        style="cursor:pointer;"
      >
        <Column field="artigo.codigo" header="Código" style="width:110px;">
          <template #body="{ data }">
            <span style="font-family:monospace;font-size:0.82rem;color:#4a5568;">{{ data.artigo.codigo }}</span>
          </template>
        </Column>
        <Column field="artigo.descricao" header="Descrição" sortable>
          <template #body="{ data }">
            <span style="font-size:0.87rem;font-weight:500;">{{ data.artigo.descricao }}</span>
            <span v-if="data.artigo.psicotropico" class="ml-1" title="Psicotrópico">
              <Tag value="P" severity="warning" style="font-size:0.65rem;padding:1px 5px;" />
            </span>
          </template>
        </Column>
        <Column field="artigo.familia" header="Família" style="width:140px;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;color:#4a5568;">{{ data.artigo.familia }}</span>
          </template>
        </Column>
        <Column header="Tipo" style="width:140px;">
          <template #body="{ data }">
            <Tag :value="data.artigo.tipo" :severity="tipoSeverity(data.artigo.tipo)" style="font-size:0.72rem;" />
          </template>
        </Column>
        <Column header="Localização" style="width:130px;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;">{{ data.localizacao.codigo }}</span>
          </template>
        </Column>
        <Column header="Quantidade" style="width:110px;text-align:right;">
          <template #body="{ data }">
            <span style="font-weight:700;" :style="{ color: data.quantidade < data.artigo.stockMinimo ? '#e53e3e' : '#2d3748' }">
              {{ data.quantidade }}
            </span>
            <span style="font-size:0.75rem;color:#a0aec0;"> {{ data.artigo.unidadeMedida }}</span>
          </template>
        </Column>
        <Column header="Stock Mín." style="width:90px;text-align:right;">
          <template #body="{ data }">
            <span style="color:#718096;font-size:0.85rem;">{{ data.artigo.stockMinimo }}</span>
          </template>
        </Column>
        <Column header="Estado" style="width:100px;">
          <template #body="{ data }">
            <Tag
              :value="data.estadoStock"
              :severity="estadoSeverity(data.estadoStock)"
              style="font-size:0.72rem;"
            />
          </template>
        </Column>
        <Column header="PMP" style="width:90px;text-align:right;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;">{{ formatEuro(data.artigo.precoMedioPonderado) }}</span>
          </template>
        </Column>
        <Column header="Valor Total" style="width:110px;text-align:right;">
          <template #body="{ data }">
            <span style="color:#27ae60;font-weight:600;font-size:0.85rem;">{{ formatEuro(data.valorTotal) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Detail Dialog -->
    <Dialog v-model:visible="showDialog" :header="selectedArtigo?.artigo?.descricao" :style="{ width: '620px' }" modal>
      <div v-if="selectedArtigo">
        <!-- Meta info grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
          <div style="background:#f7fafc;border-radius:8px;padding:0.85rem 1rem;">
            <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.3rem;">Código</div>
            <div style="font-family:monospace;font-size:0.95rem;font-weight:700;color:#1e3a5f;">{{ selectedArtigo.artigo.codigo }}</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:0.85rem 1rem;">
            <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.3rem;">Família</div>
            <div style="font-size:0.9rem;font-weight:500;">{{ selectedArtigo.artigo.familia }}</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:0.85rem 1rem;">
            <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.3rem;">Tipo</div>
            <Tag :value="selectedArtigo.artigo.tipo" severity="info" style="font-size:0.78rem;" />
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:0.85rem 1rem;">
            <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.3rem;">Unidade</div>
            <div style="font-size:0.9rem;font-weight:500;">{{ selectedArtigo.artigo.unidadeMedida }}</div>
          </div>
          <div style="background:#fff5e6;border-radius:8px;padding:0.85rem 1rem;border:1px solid #fed7aa;">
            <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#c05621;margin-bottom:0.3rem;">Stock Mínimo</div>
            <div style="font-size:1rem;font-weight:700;color:#c05621;">{{ selectedArtigo.artigo.stockMinimo }}</div>
          </div>
          <div style="background:#e6f4ea;border-radius:8px;padding:0.85rem 1rem;border:1px solid #b2dfdb;">
            <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#2e7d32;margin-bottom:0.3rem;">Stock Máximo</div>
            <div style="font-size:1rem;font-weight:700;color:#2e7d32;">{{ selectedArtigo.artigo.stockMaximo }}</div>
          </div>
        </div>

        <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#718096;margin-bottom:0.75rem;">
          Stock por Localização
        </div>
        <DataTable :value="artigoStockDetail" size="small" stripedRows>
          <Column field="localizacao.designacao" header="Localização" />
          <Column field="localizacao.tipo" header="Tipo" style="width:130px;">
            <template #body="{ data }">
              <Tag :value="data.localizacao.tipo" severity="info" style="font-size:0.72rem;" />
            </template>
          </Column>
          <Column field="quantidade" header="Quantidade" style="width:130px;text-align:right;">
            <template #body="{ data }">
              <span style="font-weight:700;font-size:1rem;">{{ data.quantidade }}</span>
              <span style="font-size:0.75rem;color:#a0aec0;margin-left:4px;">{{ selectedArtigo.artigo.unidadeMedida }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import api from '../api/index.js'

const stocks = ref([])
const localizacoes = ref([])
const loading = ref(false)
const filters = ref({ search: '', localizacaoId: null, familia: null })
const showDialog = ref(false)
const selectedArtigo = ref(null)
const artigoStockDetail = ref([])

const familias = ['Antibióticos', 'Analgésicos', 'Anti-inflamatórios', 'Gastrointestinal', 'Antidiabéticos', 'Cardiovascular', 'Anestésicos', 'Anticoagulantes', 'EPI', 'Injetáveis', 'Pensos e Curativos', 'Desinfectantes', 'Soluções IV', 'Reagentes', 'Cateterismo', 'Cirurgia']

function formatEuro(val) {
  return '€ ' + Number(val || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function tipoSeverity(tipo) {
  const map = { MEDICAMENTO: 'info', DISPOSITIVO_MEDICO: 'success', EPI: 'warning', CONSUMIVEL: null, REAGENTE: 'danger', HOTELARIA: null }
  return map[tipo] || null
}

function estadoSeverity(estado) {
  const map = { OK: 'success', ALERTA: 'warning', CRITICO: 'danger', RUPTURA: 'danger' }
  return map[estado] || null
}

function rowClass(data) {
  if (data.quantidade <= 0) return 'row-ruptura'
  if (data.quantidade < data.artigo.stockMinimo) return 'row-critico'
  if (data.quantidade < data.artigo.pontoEncomenda) return 'row-alerta'
  return ''
}

async function loadStock() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.localizacaoId) params.localizacaoId = filters.value.localizacaoId
    if (filters.value.familia) params.familia = filters.value.familia
    const res = await api.getStock(params)
    stocks.value = res.data
  } finally {
    loading.value = false
  }
}

async function showDetail(event) {
  const row = event.data
  selectedArtigo.value = row
  // Load all locations for this artigo
  const res = await api.getStock({ search: row.artigo.codigo })
  artigoStockDetail.value = res.data.filter(s => s.artigoId === row.artigoId)
  showDialog.value = true
}

function clearFilters() {
  filters.value = { search: '', localizacaoId: null, familia: null }
  loadStock()
}

onMounted(async () => {
  const [stockRes, locRes] = await Promise.all([api.getStock(), api.getLocalizacoes()])
  stocks.value = stockRes.data
  localizacoes.value = locRes.data
})
</script>

<style scoped>
:deep(.row-critico td) { background: #fff5f5 !important; }
:deep(.row-ruptura td) { background: #fed7d7 !important; }
:deep(.row-alerta td) { background: #fffbeb !important; }
</style>
