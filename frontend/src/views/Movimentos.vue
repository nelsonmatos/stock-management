<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Movimentos</h1>
      <Button label="Registar Movimento" icon="pi pi-plus" @click="openDialog" />
    </div>

    <!-- Filters -->
    <div class="card-box mb-3">
      <div class="grid">
        <div class="col-12 md:col-3">
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon"><i class="pi pi-search"></i></span>
            <InputText v-model="filters.search" placeholder="Pesquisar artigo..." @input="applyFilters" />
          </div>
        </div>
        <div class="col-12 md:col-2">
          <Dropdown v-model="filters.tipo" :options="tipoOptions" optionLabel="label" optionValue="value" placeholder="Tipo" showClear class="w-full" @change="loadMovimentos" />
        </div>
        <div class="col-12 md:col-2">
          <Dropdown v-model="filters.localizacaoId" :options="localizacoes" optionLabel="designacao" optionValue="id" placeholder="Localização" showClear class="w-full" @change="loadMovimentos" />
        </div>
        <div class="col-12 md:col-2">
          <InputText v-model="filters.dataInicio" type="date" class="w-full" @change="loadMovimentos" />
        </div>
        <div class="col-12 md:col-2">
          <InputText v-model="filters.dataFim" type="date" class="w-full" @change="loadMovimentos" />
        </div>
        <div class="col-12 md:col-1">
          <Button icon="pi pi-times" class="p-button-outlined w-full" @click="clearFilters" title="Limpar" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card-box">
      <DataTable :value="filteredMovimentos" :loading="loading" paginator :rows="25" size="small" stripedRows :rowClass="rowClass">
        <Column header="Data/Hora" style="width:140px;" sortable>
          <template #body="{ data }">
            <div style="font-size:0.82rem;">{{ formatDateTime(data.createdAt) }}</div>
          </template>
        </Column>
        <Column header="Tipo" style="width:120px;">
          <template #body="{ data }">
            <Tag :value="data.tipo" :severity="tipoSeverity(data.tipo)" style="font-size:0.72rem;" />
          </template>
        </Column>
        <Column header="Artigo" sortable>
          <template #body="{ data }">
            <div style="font-size:0.87rem;font-weight:500;">{{ data.artigo.descricao }}</div>
            <div style="font-size:0.75rem;color:#718096;">{{ data.artigo.codigo }}</div>
          </template>
        </Column>
        <Column header="Lote" style="width:130px;">
          <template #body="{ data }">
            <span style="font-family:monospace;font-size:0.8rem;color:#4a5568;">{{ data.lote?.numeroLote || '—' }}</span>
          </template>
        </Column>
        <Column header="Localização" style="width:210px;">
          <template #body="{ data }">
            <!-- Transferência: mostra origem → destino -->
            <template v-if="data.tipo === 'TRANSFERENCIA' && data.localizacaoDestino">
              <div style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;">
                <span style="font-size:0.82rem;font-weight:600;color:#1e3a5f;background:#ebf4ff;padding:2px 7px;border-radius:4px;">
                  {{ data.localizacao.codigo }}
                </span>
                <i class="pi pi-arrow-right" style="color:#3b82f6;font-size:0.75rem;"></i>
                <span style="font-size:0.82rem;font-weight:600;color:#1e3a5f;background:#e6ffed;padding:2px 7px;border-radius:4px;">
                  {{ data.localizacaoDestino.codigo }}
                </span>
              </div>
              <div style="font-size:0.7rem;font-weight:600;color:#3b82f6;margin-top:2px;letter-spacing:0.03em;">TRANSFERÊNCIA</div>
            </template>
            <!-- Outros tipos: mostra localização com label de contexto -->
            <template v-else>
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <i :class="localizacaoIcon(data.tipo)" :style="{ color: localizacaoColor(data.tipo), fontSize:'0.85rem', flexShrink:0 }"></i>
                <div>
                  <div style="font-size:0.82rem;font-weight:500;">{{ data.localizacao.codigo }}</div>
                  <div :style="{ fontSize:'0.72rem', fontWeight:600, color: localizacaoColor(data.tipo) }">{{ localizacaoLabel(data.tipo) }}</div>
                </div>
              </div>
            </template>
          </template>
        </Column>
        <Column header="Quantidade" style="width:100px;text-align:right;">
          <template #body="{ data }">
            <span style="font-weight:700;" :style="{ color: ['SAIDA','ABATE'].includes(data.tipo) ? '#e53e3e' : '#27ae60' }">
              {{ ['SAIDA','ABATE'].includes(data.tipo) ? '-' : '+' }}{{ data.quantidade }}
            </span>
          </template>
        </Column>
        <Column header="Valor Total" style="width:110px;text-align:right;">
          <template #body="{ data }">
            <span style="font-size:0.85rem;font-weight:600;">{{ formatEuro(data.valorTotal) }}</span>
          </template>
        </Column>
        <Column header="Utilizador" style="width:130px;">
          <template #body="{ data }">
            <span style="font-size:0.82rem;color:#4a5568;">{{ data.utilizador }}</span>
          </template>
        </Column>
        <Column header="Referência" style="width:110px;">
          <template #body="{ data }">
            <span v-if="data.referencia" style="font-family:monospace;font-size:0.78rem;" :style="{ color: /^ENC-/.test(data.referencia) ? '#2d5a8e' : '#718096' }">
              {{ data.referencia }}
            </span>
            <span v-else style="color:#a0aec0;">—</span>
          </template>
        </Column>
        <Column header="" style="width:50px;text-align:center;">
          <template #body="{ data }">
            <Button
              v-if="!data.cancelado && data.tipo !== 'ANULACAO'"
              icon="pi pi-times-circle"
              class="p-button-rounded p-button-text p-button-danger"
              style="width:30px;height:30px;"
              title="Cancelar movimento"
              @click="abrirCancelar(data)"
            />
            <span v-else-if="data.cancelado" title="Movimento cancelado">
              <i class="pi pi-ban" style="color:#a0aec0;font-size:1rem;"></i>
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog cancelar movimento -->
    <Dialog :visible="cancelarVisible" @update:visible="cancelarVisible = $event" header="Cancelar Movimento" :style="{ width: '500px' }" modal>
      <div v-if="movimentoACancelar" style="display:flex;flex-direction:column;gap:1rem;">

        <!-- Resumo do movimento -->
        <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:1rem;">
          <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#e53e3e;margin-bottom:0.6rem;">Movimento a cancelar</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.875rem;">
            <div><span style="color:#718096;">Tipo: </span><Tag :value="movimentoACancelar.tipo" :severity="tipoSeverity(movimentoACancelar.tipo)" style="font-size:0.72rem;" /></div>
            <div><span style="color:#718096;">Artigo: </span><b>{{ movimentoACancelar.artigo.descricao }}</b></div>
            <div><span style="color:#718096;">Quantidade: </span><b>{{ movimentoACancelar.quantidade }} {{ movimentoACancelar.artigo.unidadeMedida }}</b></div>
            <div><span style="color:#718096;">Valor: </span><b>{{ formatEuro(movimentoACancelar.valorTotal) }}</b></div>
            <div><span style="color:#718096;">Data: </span>{{ formatDateTime(movimentoACancelar.createdAt) }}</div>
            <div v-if="movimentoACancelar.referencia">
              <span style="color:#718096;">Referência: </span>
              <span style="font-family:monospace;font-size:0.82rem;" :style="{ color: /^ENC-/.test(movimentoACancelar.referencia) ? '#2d5a8e' : '#4a5568' }">
                {{ movimentoACancelar.referencia }}
              </span>
            </div>
          </div>
        </div>

        <!-- Aviso se ligado a encomenda -->
        <div v-if="movimentoACancelar.referencia && /^ENC-/.test(movimentoACancelar.referencia)"
             style="background:#fffbeb;border:1px solid #fbd38d;border-radius:8px;padding:0.85rem 1rem;display:flex;gap:0.6rem;align-items:flex-start;">
          <i class="pi pi-exclamation-triangle" style="color:#d97706;font-size:1.1rem;margin-top:1px;flex-shrink:0;"></i>
          <div style="font-size:0.85rem;color:#744210;">
            Este movimento está associado à encomenda <b>{{ movimentoACancelar.referencia }}</b>.
            O cancelamento irá <b>reverter a quantidade recebida</b> nessa encomenda e recalcular o seu estado automaticamente.
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">Motivo do cancelamento <span style="color:#e53e3e;">*</span></label>
          <InputText v-model="motivoCancelamento" class="w-full" placeholder="Descreva o motivo..." />
        </div>
      </div>
      <template #footer>
        <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-text p-button-secondary" @click="cancelarVisible = false" />
        <Button
          label="Confirmar Cancelamento"
          icon="pi pi-ban"
          class="p-button-danger"
          :loading="cancelando"
          :disabled="!motivoCancelamento"
          @click="confirmarCancelamento"
        />
      </template>
    </Dialog>

    <!-- Dialog to create movement -->
    <Dialog :visible="showDialog" @update:visible="showDialog = $event" header="Registar Novo Movimento" :style="{ width: '580px' }" modal>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="form-field">
            <label class="form-label">Tipo <span style="color:#e53e3e;">*</span></label>
            <Dropdown v-model="newMov.tipo" :options="tipoOptions" optionLabel="label" optionValue="value" class="w-full" placeholder="Selecionar tipo" />
          </div>
          <div class="form-field">
            <label class="form-label">Artigo <span style="color:#e53e3e;">*</span></label>
            <Dropdown v-model="newMov.artigoId" :options="artigosOptions" optionLabel="descricao" optionValue="id" class="w-full" placeholder="Selecionar artigo" filter @change="onArtigoChange" />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="form-field">
            <label class="form-label">Localização <span style="color:#e53e3e;">*</span></label>
            <Dropdown v-model="newMov.localizacaoId" :options="localizacoes" optionLabel="designacao" optionValue="id" class="w-full" placeholder="Selecionar localização" />
          </div>
          <div class="form-field">
            <label class="form-label">Lote</label>
            <Dropdown v-model="newMov.loteId" :options="lotesOptions" optionLabel="numeroLote" optionValue="id" class="w-full" placeholder="Lote (opcional)" showClear />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
          <div class="form-field">
            <label class="form-label">
              Quantidade <span style="color:#e53e3e;">*</span>
              <span
                v-if="podeUsarModoCompra"
                @click="modoCompra = !modoCompra"
                :style="{
                  marginLeft:'0.5rem',
                  fontSize:'0.72rem',
                  fontWeight:600,
                  cursor:'pointer',
                  padding:'1px 7px',
                  borderRadius:'10px',
                  background: modoCompra ? '#ebf8ff' : '#f0f4f8',
                  color: modoCompra ? '#2b6cb0' : '#718096',
                  border: modoCompra ? '1px solid #bee3f8' : '1px solid #e2e8f0',
                  userSelect:'none'
                }"
                title="Clique para alternar modo de entrada"
              >{{ modoCompra ? selectedArtigo.unidadeMedidaCompra : selectedArtigo.unidadeMedida }}</span>
            </label>
            <template v-if="modoCompra && selectedArtigo">
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <InputText v-model.number="qtdEmCompra" type="number" min="0" class="w-full" :placeholder="'Nº de ' + selectedArtigo.unidadeMedidaCompra" />
              </div>
              <div v-if="qtdEmCompra" style="font-size:0.78rem;color:#2b6cb0;margin-top:0.3rem;font-weight:500;">
                = {{ Math.round(qtdEmCompra * selectedArtigo.fatorConversao) }} {{ selectedArtigo.unidadeMedida }}
              </div>
              <div style="font-size:0.72rem;color:#a0aec0;margin-top:0.15rem;">
                1 {{ selectedArtigo.unidadeMedidaCompra }} = {{ selectedArtigo.fatorConversao }} {{ selectedArtigo.unidadeMedida }}
              </div>
            </template>
            <InputText v-else v-model.number="newMov.quantidade" type="number" class="w-full" placeholder="0" />
          </div>
          <div class="form-field">
            <label class="form-label">Preço Unitário (€)</label>
            <InputText v-model.number="newMov.precoUnitario" type="number" step="0.01" class="w-full" placeholder="0.00" />
          </div>
          <div class="form-field">
            <label class="form-label">Referência</label>
            <InputText v-model="newMov.referencia" class="w-full" placeholder="GR/SD/TR-..." />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="form-field">
            <label class="form-label">Utilizador</label>
            <div style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 0.9rem;background:#f7fafc;border:1px solid #e2e8f0;border-radius:7px;">
              <i class="pi pi-user" style="color:#718096;font-size:0.9rem;"></i>
              <span style="font-size:0.925rem;font-weight:500;color:#2d3748;">{{ CURRENT_USER }}</span>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">Motivo</label>
            <InputText v-model="newMov.motivo" class="w-full" placeholder="Motivo do movimento" />
          </div>
        </div>
        <div class="form-field">
          <label class="form-label">Observações</label>
          <InputText v-model="newMov.observacoes" class="w-full" placeholder="Observações adicionais" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="showDialog = false" />
        <Button label="Registar Movimento" icon="pi pi-check" @click="submitMovimento" :loading="submitting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
const movimentos = ref([])
const loading = ref(false)
const localizacoes = ref([])
const artigosOptions = ref([])
const lotesOptions = ref([])
const showDialog = ref(false)
const submitting = ref(false)
const filters = ref({ search: '', tipo: null, localizacaoId: null, dataInicio: '', dataFim: '' })

// Cancelamento
const cancelarVisible = ref(false)
const cancelando = ref(false)
const movimentoACancelar = ref(null)
const motivoCancelamento = ref('')

function abrirCancelar(mov) {
  movimentoACancelar.value = mov
  motivoCancelamento.value = ''
  cancelarVisible.value = true
}

async function confirmarCancelamento() {
  cancelando.value = true
  try {
    await api.cancelarMovimento(movimentoACancelar.value.id, {
      motivoCancelamento: motivoCancelamento.value,
      utilizador: CURRENT_USER
    })
    const temEncomenda = /^ENC-/.test(movimentoACancelar.value.referencia)
    toast.add({
      severity: 'success',
      summary: 'Movimento cancelado',
      detail: temEncomenda
        ? `Stock revertido e encomenda ${movimentoACancelar.value.referencia} actualizada`
        : 'Stock revertido com sucesso',
      life: 4000
    })
    cancelarVisible.value = false
    loadMovimentos()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: e.response?.data?.error || 'Não foi possível cancelar', life: 4000 })
  } finally {
    cancelando.value = false
  }
}

const CURRENT_USER = 'Farm. Oliveira' // substituir por utilizador autenticado quando auth for implementada

const newMov = ref({ tipo: 'ENTRADA', artigoId: null, loteId: null, localizacaoId: null, quantidade: null, precoUnitario: 0, referencia: '', utilizador: CURRENT_USER, motivo: '', observacoes: '' })

// Conversão de unidades
const selectedArtigo = ref(null)
const modoCompra = ref(false)
const qtdEmCompra = ref(null)

const podeUsarModoCompra = computed(() =>
  ['ENTRADA', 'DEVOLUCAO'].includes(newMov.value.tipo) && !!selectedArtigo.value?.fatorConversao
)

watch(qtdEmCompra, (val) => {
  if (modoCompra.value && selectedArtigo.value?.fatorConversao) {
    newMov.value.quantidade = val ? Math.round(val * selectedArtigo.value.fatorConversao) : null
  }
})

watch(modoCompra, (val) => {
  if (!val) {
    qtdEmCompra.value = null
    newMov.value.quantidade = null
  }
})

function onArtigoChange(e) {
  const artigo = artigosOptions.value.find(a => a.id === e.value)
  selectedArtigo.value = artigo || null
  modoCompra.value = false
  qtdEmCompra.value = null
  newMov.value.quantidade = null
  if (artigo?.precoMedioPonderado) {
    newMov.value.precoUnitario = artigo.precoMedioPonderado
  }
}

const tipoOptions = [
  { label: 'Entrada', value: 'ENTRADA' },
  { label: 'Saída', value: 'SAIDA' },
  { label: 'Transferência', value: 'TRANSFERENCIA' },
  { label: 'Ajuste', value: 'AJUSTE' },
  { label: 'Abate', value: 'ABATE' },
  { label: 'Devolução', value: 'DEVOLUCAO' }
]

function localizacaoLabel(tipo) {
  const map = {
    ENTRADA:       'Destino',
    SAIDA:         'Origem',
    TRANSFERENCIA: 'Origem',
    DEVOLUCAO:     'Destino',
    AJUSTE:        'Localização',
    ABATE:         'Localização'
  }
  return map[tipo] || 'Localização'
}

function localizacaoIcon(tipo) {
  const map = {
    ENTRADA:       'pi pi-arrow-down',
    SAIDA:         'pi pi-arrow-up',
    TRANSFERENCIA: 'pi pi-arrow-right',
    DEVOLUCAO:     'pi pi-arrow-down',
    AJUSTE:        'pi pi-pencil',
    ABATE:         'pi pi-trash'
  }
  return map[tipo] || 'pi pi-map-marker'
}

function localizacaoColor(tipo) {
  const map = {
    ENTRADA:       '#27ae60',
    SAIDA:         '#e53e3e',
    TRANSFERENCIA: '#3b82f6',
    DEVOLUCAO:     '#27ae60',
    AJUSTE:        '#d97706',
    ABATE:         '#718096'
  }
  return map[tipo] || '#4a5568'
}

function tipoSeverity(tipo) {
  const map = { ENTRADA: 'success', SAIDA: 'danger', TRANSFERENCIA: 'info', AJUSTE: 'warning', ABATE: null, DEVOLUCAO: null, ANULACAO: 'danger' }
  return map[tipo] || null
}

function rowClass(data) {
  if (data.cancelado)        return 'row-cancelado'
  if (data.tipo === 'ANULACAO') return 'row-anulacao'
  return ''
}

function formatEuro(val) {
  return '€ ' + Number(val || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const filteredMovimentos = computed(() => {
  let data = movimentos.value
  if (filters.value.search) {
    const s = filters.value.search.toLowerCase()
    data = data.filter(m =>
      m.artigo.descricao.toLowerCase().includes(s) ||
      m.artigo.codigo.toLowerCase().includes(s)
    )
  }
  return data
})

function applyFilters() {
  // search is client-side, others reload
}

async function loadMovimentos() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.tipo) params.tipo = filters.value.tipo
    if (filters.value.localizacaoId) params.localizacaoId = filters.value.localizacaoId
    if (filters.value.dataInicio) params.dataInicio = filters.value.dataInicio
    if (filters.value.dataFim) params.dataFim = filters.value.dataFim
    const res = await api.getMovimentos(params)
    movimentos.value = res.data
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.value = { search: '', tipo: null, localizacaoId: null, dataInicio: '', dataFim: '' }
  loadMovimentos()
}

function openDialog() {
  newMov.value = { tipo: 'ENTRADA', artigoId: null, loteId: null, localizacaoId: null, quantidade: null, precoUnitario: 0, referencia: '', utilizador: CURRENT_USER, motivo: '', observacoes: '' }
  selectedArtigo.value = null
  modoCompra.value = false
  qtdEmCompra.value = null
  showDialog.value = true
}

async function submitMovimento() {
  if (!newMov.value.tipo || !newMov.value.artigoId || !newMov.value.localizacaoId || !newMov.value.quantidade || !newMov.value.utilizador) {
    toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos obrigatórios', life: 3000 })
    return
  }
  submitting.value = true
  try {
    await api.createMovimento(newMov.value)
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Movimento registado', life: 3000 })
    showDialog.value = false
    loadMovimentos()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: e.response?.data?.error || 'Erro ao registar movimento', life: 4000 })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const [movRes, locRes, artRes, lotesRes] = await Promise.all([
    api.getMovimentos(),
    api.getLocalizacoes(),
    api.getArtigos(),
    api.getLotes()
  ])
  movimentos.value = movRes.data
  localizacoes.value = locRes.data
  artigosOptions.value = artRes.data
  lotesOptions.value = lotesRes.data.filter(l => l.estado === 'ACTIVO')
})
</script>

<style scoped>
:deep(.row-cancelado td) {
  opacity: 0.45;
  text-decoration: line-through;
  background: #f8f8f8 !important;
}
:deep(.row-anulacao td) {
  background: #fff5f5 !important;
  color: #e53e3e;
}
</style>
