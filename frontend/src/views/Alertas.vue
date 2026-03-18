<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Alertas</h1>
      <Button icon="pi pi-refresh" label="Atualizar" class="p-button-outlined" @click="loadAlertas" />
    </div>

    <!-- Summary row -->
    <div class="grid mb-4" v-if="alertas">
      <div class="col-6 md:col-3">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff5f5;">
            <i class="pi pi-exclamation-triangle" style="color:#e53e3e;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#e53e3e;">{{ alertas.stockMinimo.length }}</div>
            <div class="kpi-label">Stock Abaixo Mínimo</div>
          </div>
        </div>
      </div>
      <div class="col-6 md:col-3">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fffbeb;">
            <i class="pi pi-calendar-times" style="color:#d97706;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#d97706;">{{ alertas.aVencer.length }}</div>
            <div class="kpi-label">Lotes a Vencer (30d)</div>
          </div>
        </div>
      </div>
      <div class="col-6 md:col-3">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fff5f5;">
            <i class="pi pi-ban" style="color:#e53e3e;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#e53e3e;">{{ alertas.expirados.length }}</div>
            <div class="kpi-label">Lotes Expirados</div>
          </div>
        </div>
      </div>
      <div class="col-6 md:col-3">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fffbeb;">
            <i class="pi pi-clock" style="color:#d97706;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#d97706;">{{ alertas.encomendasAtraso.length }}</div>
            <div class="kpi-label">Encomendas em Atraso</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center" style="height:200px;align-items:center;">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:#2d5a8e;"></i>
    </div>

    <template v-if="alertas && !loading">
      <!-- Stock Abaixo do Mínimo -->
      <div class="card-box mb-3">
        <div class="flex align-items-center mb-3 gap-2">
          <div style="width:4px;height:24px;background:#e53e3e;border-radius:2px;"></div>
          <span style="font-size:1rem;font-weight:700;color:#e53e3e;">
            <i class="pi pi-exclamation-triangle mr-2"></i>Stock Abaixo do Mínimo
          </span>
          <Tag :value="String(alertas.stockMinimo.length)" severity="danger" class="ml-2" />
        </div>
        <DataTable :value="alertas.stockMinimo" size="small" stripedRows emptyMessage="Nenhum artigo abaixo do mínimo">
          <Column field="codigo" header="Código" style="width:110px;">
            <template #body="{ data }">
              <span style="font-family:monospace;font-size:0.82rem;color:#4a5568;">{{ data.codigo }}</span>
            </template>
          </Column>
          <Column field="descricao" header="Artigo" sortable>
            <template #body="{ data }">
              <span style="font-size:0.87rem;font-weight:500;">{{ data.descricao }}</span>
              <div style="font-size:0.75rem;color:#718096;">{{ data.familia }}</div>
            </template>
          </Column>
          <Column field="tipo" header="Tipo" style="width:130px;">
            <template #body="{ data }">
              <Tag :value="data.tipo" :severity="tipoSeverity(data.tipo)" style="font-size:0.72rem;" />
            </template>
          </Column>
          <Column header="Stock Atual" style="width:110px;text-align:right;">
            <template #body="{ data }">
              <span style="color:#e53e3e;font-weight:700;font-size:1rem;">{{ data.stockActual }}</span>
              <span style="font-size:0.75rem;color:#a0aec0;"> {{ data.unidadeMedida }}</span>
            </template>
          </Column>
          <Column header="Mínimo" style="width:100px;text-align:right;">
            <template #body="{ data }">
              <span style="color:#718096;">{{ data.stockMinimo }}</span>
            </template>
          </Column>
          <Column header="Déficit" style="width:100px;text-align:right;">
            <template #body="{ data }">
              <Tag :value="'+' + data.deficit + ' ' + data.unidadeMedida" severity="danger" style="font-size:0.75rem;" />
            </template>
          </Column>
          <Column header="Ponto Enc." style="width:110px;text-align:right;">
            <template #body="{ data }">
              <span style="font-size:0.82rem;color:#718096;">{{ data.pontoEncomenda }}</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Lotes a Vencer -->
      <div class="card-box mb-3">
        <div class="flex align-items-center mb-3 gap-2">
          <div style="width:4px;height:24px;background:#d97706;border-radius:2px;"></div>
          <span style="font-size:1rem;font-weight:700;color:#d97706;">
            <i class="pi pi-calendar-times mr-2"></i>Lotes a Vencer (próximos 30 dias)
          </span>
          <Tag :value="String(alertas.aVencer.length)" severity="warning" class="ml-2" />
        </div>
        <DataTable :value="alertas.aVencer" size="small" stripedRows emptyMessage="Nenhum lote a vencer nos próximos 30 dias">
          <Column field="numeroLote" header="Nº Lote" style="width:140px;">
            <template #body="{ data }">
              <span style="font-family:monospace;font-size:0.82rem;">{{ data.numeroLote }}</span>
            </template>
          </Column>
          <Column header="Artigo" sortable>
            <template #body="{ data }">
              <span style="font-size:0.87rem;font-weight:500;">{{ data.artigo.descricao }}</span>
            </template>
          </Column>
          <Column header="Fornecedor" style="width:130px;">
            <template #body="{ data }">
              <span style="font-size:0.82rem;">{{ data.fornecedor?.nome || '—' }}</span>
            </template>
          </Column>
          <Column header="Data Validade" style="width:130px;">
            <template #body="{ data }">
              <span style="font-weight:600;color:#d97706;">{{ formatDate(data.dataValidade) }}</span>
            </template>
          </Column>
          <Column header="Dias Rest." style="width:100px;text-align:center;">
            <template #body="{ data }">
              <Tag
                :value="data.diasAteValidade + 'd'"
                :severity="data.diasAteValidade <= 7 ? 'danger' : 'warning'"
                style="font-size:0.8rem;"
              />
            </template>
          </Column>
          <Column header="Quantidade" style="width:100px;text-align:right;">
            <template #body="{ data }">
              <span style="font-weight:600;">{{ data.quantidadeActual }}</span>
              <span style="font-size:0.75rem;color:#a0aec0;"> {{ data.artigo.unidadeMedida }}</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Lotes Expirados -->
      <div class="card-box mb-3">
        <div class="flex align-items-center mb-3 gap-2">
          <div style="width:4px;height:24px;background:#e53e3e;border-radius:2px;"></div>
          <span style="font-size:1rem;font-weight:700;color:#e53e3e;">
            <i class="pi pi-ban mr-2"></i>Lotes Expirados
          </span>
          <Tag :value="String(alertas.expirados.length)" severity="danger" class="ml-2" />
        </div>
        <DataTable :value="alertas.expirados" size="small" stripedRows emptyMessage="Nenhum lote expirado">
          <Column field="numeroLote" header="Nº Lote" style="width:140px;">
            <template #body="{ data }">
              <span style="font-family:monospace;font-size:0.82rem;">{{ data.numeroLote }}</span>
            </template>
          </Column>
          <Column header="Artigo" sortable>
            <template #body="{ data }">
              <span style="font-size:0.87rem;font-weight:500;">{{ data.artigo.descricao }}</span>
            </template>
          </Column>
          <Column header="Data Validade" style="width:130px;">
            <template #body="{ data }">
              <span style="color:#e53e3e;font-weight:600;">{{ formatDate(data.dataValidade) }}</span>
            </template>
          </Column>
          <Column header="Dias Expirado" style="width:120px;text-align:center;">
            <template #body="{ data }">
              <Tag :value="data.diasExpirado + 'd'" severity="danger" style="font-size:0.8rem;" />
            </template>
          </Column>
          <Column header="Qtd Atual" style="width:100px;text-align:right;">
            <template #body="{ data }">
              <span style="font-weight:700;color:#e53e3e;">{{ data.quantidadeActual }}</span>
            </template>
          </Column>
          <Column header="Ação" style="width:130px;">
            <template #body="{ data }">
              <Button
                label="Marcar Expirado"
                icon="pi pi-ban"
                class="p-button-danger p-button-sm p-button-outlined"
                @click="marcarExpirado(data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Encomendas em Atraso -->
      <div class="card-box">
        <div class="flex align-items-center mb-3 gap-2">
          <div style="width:4px;height:24px;background:#d97706;border-radius:2px;"></div>
          <span style="font-size:1rem;font-weight:700;color:#d97706;">
            <i class="pi pi-clock mr-2"></i>Encomendas em Atraso
          </span>
          <Tag :value="String(alertas.encomendasAtraso.length)" severity="warning" class="ml-2" />
        </div>
        <DataTable :value="alertas.encomendasAtraso" size="small" stripedRows emptyMessage="Nenhuma encomenda em atraso">
          <Column field="numero" header="Número" style="width:130px;">
            <template #body="{ data }">
              <span style="font-family:monospace;font-size:0.85rem;font-weight:600;">{{ data.numero }}</span>
            </template>
          </Column>
          <Column header="Fornecedor" style="width:150px;">
            <template #body="{ data }">
              <span style="font-size:0.85rem;">{{ data.fornecedor.nome }}</span>
            </template>
          </Column>
          <Column header="Estado" style="width:110px;">
            <template #body="{ data }">
              <Tag :value="data.estado" severity="warning" style="font-size:0.72rem;" />
            </template>
          </Column>
          <Column header="Data Prevista" style="width:130px;">
            <template #body="{ data }">
              <span style="color:#d97706;font-weight:600;">{{ formatDate(data.dataEntregaPrevista) }}</span>
            </template>
          </Column>
          <Column header="Dias Atraso" style="width:110px;text-align:center;">
            <template #body="{ data }">
              <Tag :value="data.diasAtraso + 'd'" severity="warning" style="font-size:0.8rem;" />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '../api/index.js'

const toast = useToast()
const alertas = ref(null)
const loading = ref(false)

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-PT')
}

function tipoSeverity(tipo) {
  const map = { MEDICAMENTO: 'info', DISPOSITIVO_MEDICO: 'success', EPI: 'warning', CONSUMIVEL: null, REAGENTE: 'danger' }
  return map[tipo] || null
}

async function loadAlertas() {
  loading.value = true
  try {
    const res = await api.getAlertas()
    alertas.value = res.data
  } finally {
    loading.value = false
  }
}

async function marcarExpirado(lote) {
  try {
    await api.updateLoteEstado(lote.id, { estado: 'EXPIRADO' })
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Lote marcado como expirado', life: 3000 })
    loadAlertas()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o lote', life: 3000 })
  }
}

onMounted(loadAlertas)
</script>
