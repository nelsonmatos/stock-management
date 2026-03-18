<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Artigos</h1>
    </div>

    <!-- Dialog conversão -->
    <Dialog :visible="conversaoVisible" @update:visible="conversaoVisible = $event" header="Configurar Conversão de Unidades" :style="{ width: '420px' }" modal>
      <div v-if="artigoConversao" style="display:flex;flex-direction:column;gap:1rem;">
        <div style="padding:0.75rem 1rem;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          <div style="font-weight:600;font-size:0.95rem;color:#1e3a5f;">{{ artigoConversao.descricao }}</div>
          <div style="font-size:0.78rem;color:#718096;font-family:monospace;margin-top:0.2rem;">{{ artigoConversao.codigo }} · Und. base: <b>{{ artigoConversao.unidadeMedida }}</b></div>
        </div>
        <div style="font-size:0.82rem;color:#4a5568;padding:0.6rem 0.85rem;background:#fffbeb;border:1px solid #fbd38d;border-radius:6px;">
          Permite registar entradas em unidades de compra (ex: Caixas) que são automaticamente convertidas para a unidade de stock ({{ artigoConversao.unidadeMedida }}).
        </div>
        <div class="form-field">
          <label class="form-label">Unidade de Compra</label>
          <InputText v-model="editConversao.unidadeMedidaCompra" class="w-full" placeholder="ex: Caixa, Embalagem, Frasco..." />
        </div>
        <div class="form-field">
          <label class="form-label">Fator de Conversão ({{ editConversao.unidadeMedidaCompra || 'Unidade Compra' }} → {{ artigoConversao.unidadeMedida }})</label>
          <InputText v-model.number="editConversao.fatorConversao" type="number" min="1" class="w-full" placeholder="ex: 20" />
          <div v-if="editConversao.unidadeMedidaCompra && editConversao.fatorConversao" style="font-size:0.78rem;color:#2b6cb0;margin-top:0.3rem;font-weight:500;">
            1 {{ editConversao.unidadeMedidaCompra }} = {{ editConversao.fatorConversao }} {{ artigoConversao.unidadeMedida }}
          </div>
        </div>
        <div v-if="editConversao.unidadeMedidaCompra || editConversao.fatorConversao" style="display:flex;justify-content:flex-end;">
          <Button label="Remover conversão" icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="removerConversao" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="conversaoVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="guardarConversao" :loading="savingConversao" />
      </template>
    </Dialog>

    <!-- Filters -->
    <div class="card-box mb-3">
      <div class="grid">
        <div class="col-12 md:col-4">
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon"><i class="pi pi-search"></i></span>
            <InputText v-model="search" placeholder="Pesquisar por nome, código ou DCI..." @input="loadArtigos" />
          </div>
        </div>
        <div class="col-12 md:col-3">
          <Dropdown v-model="filterTipo" :options="tipoOptions" optionLabel="label" optionValue="value" placeholder="Tipo" showClear class="w-full" @change="loadArtigos" />
        </div>
        <div class="col-12 md:col-3">
          <Dropdown v-model="filterAtivo" :options="[{label:'Todos',value:null},{label:'Ativos',value:'true'},{label:'Inativos',value:'false'}]" optionLabel="label" optionValue="value" placeholder="Estado" class="w-full" @change="loadArtigos" />
        </div>
        <div class="col-12 md:col-2">
          <Button label="Limpar" icon="pi pi-times" class="p-button-outlined w-full" @click="clearFilters" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card-box">
      <DataTable :value="artigos" :loading="loading" paginator :rows="20" size="small" stripedRows>
        <Column field="codigo" header="Código" style="width:110px;" sortable>
          <template #body="{ data }">
            <span style="font-family:monospace;font-size:0.82rem;color:#4a5568;">{{ data.codigo }}</span>
          </template>
        </Column>
        <Column field="descricao" header="Descrição" sortable>
          <template #body="{ data }">
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <span style="font-size:0.87rem;font-weight:500;">{{ data.descricao }}</span>
              <Tag v-if="data.psicotropico" value="PSI" severity="warning" style="font-size:0.65rem;padding:1px 4px;" title="Psicotrópico" />
              <Tag v-if="data.requerPrescricao" value="RX" severity="danger" style="font-size:0.65rem;padding:1px 4px;" title="Requer Prescrição" />
            </div>
            <div v-if="data.dci" style="font-size:0.75rem;color:#718096;">{{ data.dci }}</div>
          </template>
        </Column>
        <Column field="familia" header="Família" style="width:150px;" sortable>
          <template #body="{ data }">
            <span style="font-size:0.82rem;">{{ data.familia }}</span>
          </template>
        </Column>
        <Column header="Tipo" style="width:150px;">
          <template #body="{ data }">
            <Tag :value="tipoLabel(data.tipo)" :severity="tipoSeverity(data.tipo)" style="font-size:0.72rem;" />
          </template>
        </Column>
        <Column field="unidadeMedida" header="Und." style="width:80px;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;color:#4a5568;">{{ data.unidadeMedida }}</span>
          </template>
        </Column>
        <Column header="Stock Total" style="width:100px;text-align:right;">
          <template #body="{ data }">
            <span style="font-weight:700;" :style="{ color: data.stockTotal < data.stockMinimo ? '#e53e3e' : '#2d3748' }">
              {{ data.stockTotal || 0 }}
            </span>
          </template>
        </Column>
        <Column field="stockMinimo" header="Mín." style="width:70px;text-align:right;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;color:#718096;">{{ data.stockMinimo }}</span>
          </template>
        </Column>
        <Column field="stockMaximo" header="Máx." style="width:70px;text-align:right;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;color:#718096;">{{ data.stockMaximo }}</span>
          </template>
        </Column>
        <Column field="precoMedioPonderado" header="PMP" style="width:90px;text-align:right;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;">{{ formatEuro(data.precoMedioPonderado) }}</span>
          </template>
        </Column>
        <Column header="Ativo" style="width:70px;">
          <template #body="{ data }">
            <Tag :value="data.ativo ? 'Sim' : 'Não'" :severity="data.ativo ? 'success' : 'danger'" style="font-size:0.72rem;" />
          </template>
        </Column>
        <Column header="Temp." style="width:80px;">
          <template #body="{ data }">
            <Tag v-if="data.temperaturaArmazenamento !== 'AMBIENTE'" value="FRIO" severity="info" style="font-size:0.7rem;" />
            <span v-else style="font-size:0.78rem;color:#a0aec0;">—</span>
          </template>
        </Column>
        <Column header="Conversão" style="width:120px;">
          <template #body="{ data }">
            <div v-if="data.fatorConversao" style="font-size:0.78rem;color:#2b6cb0;line-height:1.3;">
              1 {{ data.unidadeMedidaCompra }}<br>= {{ data.fatorConversao }} {{ data.unidadeMedida }}
            </div>
            <span v-else style="font-size:0.78rem;color:#a0aec0;">—</span>
          </template>
        </Column>
        <Column header="" style="width:45px;text-align:center;">
          <template #body="{ data }">
            <Button
              icon="pi pi-arrow-right-arrow-left"
              class="p-button-rounded p-button-text p-button-secondary"
              style="width:30px;height:30px;"
              title="Configurar conversão de unidades"
              @click="abrirConversao(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import api from '../api/index.js'

const toast = useToast()

const artigos = ref([])
const loading = ref(false)
const search = ref('')
const filterTipo = ref(null)
const filterAtivo = ref(null)

const tipoOptions = [
  { label: 'Medicamento', value: 'MEDICAMENTO' },
  { label: 'Dispositivo Médico', value: 'DISPOSITIVO_MEDICO' },
  { label: 'EPI', value: 'EPI' },
  { label: 'Consumível', value: 'CONSUMIVEL' },
  { label: 'Reagente', value: 'REAGENTE' }
]

function formatEuro(val) {
  return '€ ' + Number(val || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function tipoLabel(tipo) {
  const map = { MEDICAMENTO: 'Medicamento', DISPOSITIVO_MEDICO: 'Dispositivo', EPI: 'EPI', CONSUMIVEL: 'Consumível', REAGENTE: 'Reagente' }
  return map[tipo] || tipo
}

function tipoSeverity(tipo) {
  const map = { MEDICAMENTO: 'info', DISPOSITIVO_MEDICO: 'success', EPI: 'warning', CONSUMIVEL: null, REAGENTE: 'danger' }
  return map[tipo] || null
}

async function loadArtigos() {
  loading.value = true
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (filterTipo.value) params.tipo = filterTipo.value
    if (filterAtivo.value !== null) params.ativo = filterAtivo.value
    const res = await api.getArtigos(params)
    artigos.value = res.data
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  search.value = ''
  filterTipo.value = null
  filterAtivo.value = null
  loadArtigos()
}

// Conversão
const conversaoVisible = ref(false)
const savingConversao = ref(false)
const artigoConversao = ref(null)
const editConversao = ref({ unidadeMedidaCompra: '', fatorConversao: null })

function abrirConversao(artigo) {
  artigoConversao.value = artigo
  editConversao.value = {
    unidadeMedidaCompra: artigo.unidadeMedidaCompra || '',
    fatorConversao: artigo.fatorConversao || null
  }
  conversaoVisible.value = true
}

function removerConversao() {
  editConversao.value = { unidadeMedidaCompra: '', fatorConversao: null }
}

async function guardarConversao() {
  savingConversao.value = true
  try {
    await api.updateArtigo(artigoConversao.value.id, {
      unidadeMedidaCompra: editConversao.value.unidadeMedidaCompra || null,
      fatorConversao: editConversao.value.fatorConversao || null
    })
    toast.add({ severity: 'success', summary: 'Conversão actualizada', life: 3000 })
    conversaoVisible.value = false
    loadArtigos()
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao guardar', life: 3000 })
  } finally {
    savingConversao.value = false
  }
}

onMounted(loadArtigos)
</script>
