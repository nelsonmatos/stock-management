<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Lotes</h1>
    </div>

    <!-- Filters -->
    <div class="card-box mb-3">
      <div class="grid">
        <div class="col-12 md:col-3">
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon"><i class="pi pi-search"></i></span>
            <InputText v-model="filters.search" placeholder="Pesquisar artigo ou lote..." @input="loadLotes" />
          </div>
        </div>
        <div class="col-12 md:col-3">
          <Dropdown v-model="filters.estado" :options="estadoOptions" optionLabel="label" optionValue="value" placeholder="Estado" showClear class="w-full" @change="loadLotes" />
        </div>
        <div class="col-12 md:col-3">
          <Dropdown v-model="filters.aVencer" :options="aVencerOptions" optionLabel="label" optionValue="value" placeholder="A vencer em..." showClear class="w-full" @change="loadLotes" />
        </div>
        <div class="col-12 md:col-3">
          <Button label="Limpar" icon="pi pi-times" class="p-button-outlined w-full" @click="clearFilters" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card-box">
      <DataTable :value="lotes" :loading="loading" paginator :rows="20" size="small" stripedRows :rowClass="rowClass">
        <Column field="numeroLote" header="Nº Lote" style="width:140px;">
          <template #body="{ data }">
            <span style="font-family:monospace;font-size:0.82rem;">{{ data.numeroLote }}</span>
          </template>
        </Column>
        <Column header="Artigo" sortable>
          <template #body="{ data }">
            <div>
              <span style="font-size:0.87rem;font-weight:500;">{{ data.artigo.descricao }}</span>
            </div>
            <div style="font-size:0.75rem;color:#718096;">{{ data.artigo.codigo }}</div>
          </template>
        </Column>
        <Column header="Fornecedor" style="width:140px;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;">{{ data.fornecedor?.nome || '—' }}</span>
          </template>
        </Column>
        <Column header="Data Validade" style="width:130px;" sortable>
          <template #body="{ data }">
            <div>
              <span :style="{ fontWeight: 600, color: getValidadeColor(data.diasAteValidade) }">
                {{ formatDate(data.dataValidade) }}
              </span>
            </div>
            <div style="font-size:0.75rem;" :style="{ color: getValidadeColor(data.diasAteValidade) }">
              <span v-if="data.diasAteValidade < 0">Expirado há {{ Math.abs(data.diasAteValidade) }}d</span>
              <span v-else>{{ data.diasAteValidade }}d restantes</span>
            </div>
          </template>
        </Column>
        <Column header="Qtd Inicial" style="width:100px;text-align:right;">
          <template #body="{ data }">
            <span style="font-size:0.85rem;color:#718096;">{{ data.quantidadeInicial }}</span>
          </template>
        </Column>
        <Column header="Qtd Atual" style="width:100px;text-align:right;">
          <template #body="{ data }">
            <span style="font-weight:700;">{{ data.quantidadeActual }}</span>
            <span style="font-size:0.75rem;color:#a0aec0;"> {{ data.artigo.unidadeMedida }}</span>
          </template>
        </Column>
        <Column header="Estado" style="width:110px;">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="estadoSeverity(data.estado)" style="font-size:0.72rem;" />
          </template>
        </Column>
        <Column header="Ações" style="width:130px;">
          <template #body="{ data }">
            <!-- Rastreabilidade -->
            <Button
              icon="pi pi-map"
              class="p-button-rounded p-button-text p-button-info"
              style="width:32px;height:32px;"
              title="Ver rastreabilidade"
              @click="openRastreabilidade(data)"
            />
            <Button
              v-if="data.estado === 'ACTIVO'"
              icon="pi pi-lock"
              class="p-button-rounded p-button-text p-button-warning"
              style="width:32px;height:32px;"
              title="Bloquear lote"
              @click="changeEstado(data, 'BLOQUEADO')"
            />
            <Button
              v-if="data.estado === 'ACTIVO'"
              icon="pi pi-exclamation-circle"
              class="p-button-rounded p-button-text p-button-danger"
              style="width:32px;height:32px;"
              title="Quarentena"
              @click="changeEstado(data, 'QUARENTENA')"
            />
            <Button
              v-if="['BLOQUEADO','QUARENTENA'].includes(data.estado)"
              icon="pi pi-check-circle"
              class="p-button-rounded p-button-text p-button-success"
              style="width:32px;height:32px;"
              title="Reativar"
              @click="changeEstado(data, 'ACTIVO')"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Rastreabilidade Dialog -->
    <Dialog
      :visible="rastreabilidadeVisible"
      @update:visible="rastreabilidadeVisible = $event"
      :header="`Rastreabilidade — Lote ${loteSelecionado?.numeroLote}`"
      :style="{ width: '720px' }"
      modal
    >
      <div v-if="loadingRastreabilidade" style="text-align:center;padding:2rem;">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:#2d5a8e;"></i>
      </div>

      <div v-else-if="rastreabilidade">
        <!-- Cabeçalho do lote -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin-bottom:1.5rem;">
          <div style="background:#f7fafc;border-radius:8px;padding:0.8rem 1rem;">
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.25rem;">Artigo</div>
            <div style="font-size:0.88rem;font-weight:600;color:#1e3a5f;">{{ rastreabilidade.artigo.descricao }}</div>
            <div style="font-size:0.75rem;color:#718096;font-family:monospace;">{{ rastreabilidade.artigo.codigo }}</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:0.8rem 1rem;">
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.25rem;">Fornecedor</div>
            <div style="font-size:0.88rem;font-weight:600;">{{ rastreabilidade.fornecedor?.nome || '—' }}</div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:0.8rem 1rem;">
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.25rem;">Validade</div>
            <div style="font-size:0.88rem;font-weight:600;" :style="{ color: getValidadeColor(rastreabilidade.diasAteValidade) }">
              {{ formatDate(rastreabilidade.dataValidade) }}
            </div>
          </div>
          <div style="background:#f7fafc;border-radius:8px;padding:0.8rem 1rem;">
            <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.25rem;">Qtd Restante</div>
            <div style="font-size:1.1rem;font-weight:700;color:#1e3a5f;">
              {{ rastreabilidade.quantidadeActual }}
              <span style="font-size:0.75rem;color:#a0aec0;">{{ rastreabilidade.artigo.unidadeMedida }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline de movimentos -->
        <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#718096;margin-bottom:1rem;">
          Percurso do lote — {{ rastreabilidade.movimentos.length }} movimento(s)
        </div>

        <div v-if="rastreabilidade.movimentos.length === 0" style="text-align:center;padding:1.5rem;color:#a0aec0;font-size:0.9rem;">
          <i class="pi pi-inbox" style="font-size:1.5rem;display:block;margin-bottom:0.5rem;"></i>
          Sem movimentos registados para este lote
        </div>

        <div v-else class="lote-timeline">
          <div
            v-for="(mov, idx) in rastreabilidade.movimentos"
            :key="mov.id"
            class="timeline-item"
          >
            <!-- Linha vertical -->
            <div class="timeline-line">
              <div class="timeline-dot" :style="{ background: tipoColor(mov.tipo) }">
                <i :class="tipoIcon(mov.tipo)" style="font-size:0.7rem;color:#fff;"></i>
              </div>
              <div v-if="idx < rastreabilidade.movimentos.length - 1" class="timeline-connector"></div>
            </div>

            <!-- Conteúdo -->
            <div class="timeline-content">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;flex-wrap:wrap;">
                <Tag :value="mov.tipo" :severity="tipoSeverity(mov.tipo)" style="font-size:0.72rem;" />

                <!-- Localização: transferência mostra origem → destino -->
                <template v-if="mov.tipo === 'TRANSFERENCIA' && mov.localizacaoDestino">
                  <span style="font-size:0.82rem;font-weight:600;background:#ebf4ff;color:#1e3a5f;padding:2px 7px;border-radius:4px;">
                    {{ mov.localizacao.codigo }}
                  </span>
                  <i class="pi pi-arrow-right" style="color:#3b82f6;font-size:0.75rem;"></i>
                  <span style="font-size:0.82rem;font-weight:600;background:#e6ffed;color:#1e3a5f;padding:2px 7px;border-radius:4px;">
                    {{ mov.localizacaoDestino.codigo }}
                  </span>
                </template>
                <template v-else>
                  <span style="font-size:0.82rem;color:#4a5568;">
                    <i :class="localizacaoIcon(mov.tipo)" style="margin-right:3px;"></i>
                    {{ mov.localizacao.codigo }}
                    <span style="font-size:0.72rem;font-weight:600;" :style="{ color: tipoColor(mov.tipo) }">
                      ({{ localizacaoLabel(mov.tipo) }})
                    </span>
                  </span>
                </template>

                <span style="margin-left:auto;font-size:0.78rem;color:#a0aec0;white-space:nowrap;">
                  {{ formatDateTime(mov.createdAt) }}
                </span>
              </div>

              <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
                <div>
                  <span style="font-size:0.75rem;color:#718096;">Quantidade </span>
                  <span style="font-weight:700;" :style="{ color: ['SAIDA','ABATE'].includes(mov.tipo) ? '#e53e3e' : '#27ae60' }">
                    {{ ['SAIDA','ABATE'].includes(mov.tipo) ? '−' : '+' }}{{ mov.quantidade }}
                    {{ rastreabilidade.artigo.unidadeMedida }}
                  </span>
                </div>
                <div v-if="mov.valorTotal">
                  <span style="font-size:0.75rem;color:#718096;">Valor </span>
                  <span style="font-weight:600;color:#27ae60;">{{ formatEuro(mov.valorTotal) }}</span>
                </div>
                <div v-if="mov.utilizador">
                  <span style="font-size:0.75rem;color:#718096;">Por </span>
                  <span style="font-size:0.82rem;">{{ mov.utilizador }}</span>
                </div>
                <div v-if="mov.referencia">
                  <span style="font-size:0.75rem;color:#718096;">Ref. </span>
                  <span style="font-family:monospace;font-size:0.78rem;color:#4a5568;">{{ mov.referencia }}</span>
                </div>
              </div>

              <div v-if="mov.motivo || mov.observacoes" style="margin-top:0.35rem;font-size:0.78rem;color:#718096;font-style:italic;">
                {{ mov.motivo || mov.observacoes }}
              </div>
            </div>
          </div>
        </div>

        <!-- Resumo final -->
        <div style="margin-top:1.25rem;padding:0.85rem 1rem;background:#f7fafc;border-radius:8px;border:1px solid #e2e8f0;display:flex;gap:2rem;flex-wrap:wrap;">
          <div>
            <span style="font-size:0.75rem;color:#718096;">Total entrado </span>
            <span style="font-weight:700;color:#27ae60;">{{ totalEntrado }} {{ rastreabilidade.artigo.unidadeMedida }}</span>
          </div>
          <div>
            <span style="font-size:0.75rem;color:#718096;">Total saído </span>
            <span style="font-weight:700;color:#e53e3e;">{{ totalSaido }} {{ rastreabilidade.artigo.unidadeMedida }}</span>
          </div>
          <div>
            <span style="font-size:0.75rem;color:#718096;">Saldo actual </span>
            <span style="font-weight:700;color:#1e3a5f;">{{ rastreabilidade.quantidadeActual }} {{ rastreabilidade.artigo.unidadeMedida }}</span>
          </div>
          <div>
            <span style="font-size:0.75rem;color:#718096;">Localizações visitadas </span>
            <span style="font-weight:700;color:#1e3a5f;">{{ localizacoesVisitadas }}</span>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const lotes = ref([])
const loading = ref(false)
const filters = ref({ search: '', estado: null, aVencer: null })

const rastreabilidadeVisible = ref(false)
const loadingRastreabilidade = ref(false)
const rastreabilidade = ref(null)
const loteSelecionado = ref(null)

const estadoOptions = [
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'Bloqueado', value: 'BLOQUEADO' },
  { label: 'Quarentena', value: 'QUARENTENA' },
  { label: 'Expirado', value: 'EXPIRADO' },
  { label: 'Recolhido', value: 'RECOLHIDO' }
]

const aVencerOptions = [
  { label: '30 dias', value: '30' },
  { label: '60 dias', value: '60' },
  { label: '90 dias', value: '90' }
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-PT')
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatEuro(val) {
  return '€ ' + Number(val || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getValidadeColor(dias) {
  if (dias < 0) return '#e53e3e'
  if (dias <= 30) return '#d97706'
  return '#2d3748'
}

function estadoSeverity(estado) {
  const map = { ACTIVO: 'success', BLOQUEADO: 'danger', QUARENTENA: 'warning', EXPIRADO: null, RECOLHIDO: null }
  return map[estado] || null
}

function tipoSeverity(tipo) {
  const map = { ENTRADA: 'success', SAIDA: 'danger', TRANSFERENCIA: 'info', AJUSTE: 'warning', ABATE: null, DEVOLUCAO: null }
  return map[tipo] || null
}

function tipoColor(tipo) {
  const map = { ENTRADA: '#27ae60', SAIDA: '#e53e3e', TRANSFERENCIA: '#3b82f6', AJUSTE: '#d97706', ABATE: '#718096', DEVOLUCAO: '#27ae60' }
  return map[tipo] || '#a0aec0'
}

function tipoIcon(tipo) {
  const map = { ENTRADA: 'pi pi-arrow-down', SAIDA: 'pi pi-arrow-up', TRANSFERENCIA: 'pi pi-arrow-right', AJUSTE: 'pi pi-pencil', ABATE: 'pi pi-trash', DEVOLUCAO: 'pi pi-refresh' }
  return map[tipo] || 'pi pi-circle'
}

function localizacaoLabel(tipo) {
  const map = { ENTRADA: 'Destino', SAIDA: 'Origem', TRANSFERENCIA: 'Origem', DEVOLUCAO: 'Destino', AJUSTE: 'Local', ABATE: 'Local' }
  return map[tipo] || 'Local'
}

function localizacaoIcon(tipo) {
  const map = { ENTRADA: 'pi pi-arrow-down', SAIDA: 'pi pi-arrow-up', TRANSFERENCIA: 'pi pi-arrow-right', DEVOLUCAO: 'pi pi-arrow-down', AJUSTE: 'pi pi-pencil', ABATE: 'pi pi-trash' }
  return map[tipo] || 'pi pi-map-marker'
}

function rowClass(data) {
  if (data.diasAteValidade < 0) return 'row-expirado'
  if (data.diasAteValidade <= 30) return 'row-avencer'
  return ''
}

const totalEntrado = computed(() => {
  if (!rastreabilidade.value) return 0
  return rastreabilidade.value.movimentos
    .filter(m => ['ENTRADA', 'DEVOLUCAO'].includes(m.tipo))
    .reduce((s, m) => s + m.quantidade, 0)
})

const totalSaido = computed(() => {
  if (!rastreabilidade.value) return 0
  return rastreabilidade.value.movimentos
    .filter(m => ['SAIDA', 'ABATE'].includes(m.tipo))
    .reduce((s, m) => s + m.quantidade, 0)
})

const localizacoesVisitadas = computed(() => {
  if (!rastreabilidade.value) return 0
  const locs = new Set()
  rastreabilidade.value.movimentos.forEach(m => {
    locs.add(m.localizacao.codigo)
    if (m.localizacaoDestino) locs.add(m.localizacaoDestino.codigo)
  })
  return locs.size
})

async function loadLotes() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.estado) params.estado = filters.value.estado
    if (filters.value.aVencer) params.aVencer = filters.value.aVencer
    const res = await api.getLotes(params)
    let data = res.data
    if (filters.value.search) {
      const s = filters.value.search.toLowerCase()
      data = data.filter(l =>
        l.artigo.descricao.toLowerCase().includes(s) ||
        l.numeroLote.toLowerCase().includes(s) ||
        l.artigo.codigo.toLowerCase().includes(s)
      )
    }
    lotes.value = data
  } finally {
    loading.value = false
  }
}

async function openRastreabilidade(lote) {
  loteSelecionado.value = lote
  rastreabilidade.value = null
  rastreabilidadeVisible.value = true
  loadingRastreabilidade.value = true
  try {
    const res = await api.getLote(lote.id)
    rastreabilidade.value = res.data
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a rastreabilidade', life: 3000 })
  } finally {
    loadingRastreabilidade.value = false
  }
}

async function changeEstado(lote, novoEstado) {
  try {
    await api.updateLoteEstado(lote.id, { estado: novoEstado })
    toast.add({ severity: 'success', summary: 'Sucesso', detail: `Lote atualizado para ${novoEstado}`, life: 3000 })
    loadLotes()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o lote', life: 3000 })
  }
}

function clearFilters() {
  filters.value = { search: '', estado: null, aVencer: null }
  loadLotes()
}

onMounted(loadLotes)
</script>

<style scoped>
:deep(.row-expirado td) { background: #fff5f5 !important; }
:deep(.row-avencer td) { background: #fffbeb !important; }

.lote-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 28px;
}

.timeline-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.timeline-connector {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: #e2e8f0;
  margin: 4px 0;
}

.timeline-content {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}
</style>
