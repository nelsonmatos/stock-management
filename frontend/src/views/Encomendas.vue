<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Encomendas</h1>
      <Button label="Nova Encomenda" icon="pi pi-plus" @click="novaEncomendaVisible = true" />
    </div>

    <!-- Filters -->
    <div class="card-box mb-3 flex gap-3 flex-wrap align-items-center">
      <Dropdown
        v-model="filtroEstado"
        :options="estadoOpcoes"
        optionLabel="label"
        optionValue="value"
        placeholder="Todos os estados"
        showClear
        style="width:200px;"
        @change="loadEncomendas"
      />
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText v-model="filtroTexto" placeholder="Fornecedor ou nº encomenda..." style="width:280px;" @input="loadEncomendas" />
      </span>
    </div>

    <!-- Table -->
    <div class="card-box">
      <DataTable
        :value="encomendas"
        :loading="loading"
        stripedRows
        responsiveLayout="scroll"
        :rowHover="true"
        :expandedRows="expandedRows"
        @update:expandedRows="expandedRows = $event"
        dataKey="id"
      >
        <Column expander style="width:3rem" />
        <Column field="numero" header="Nº Encomenda" style="width:160px;">
          <template #body="{ data }">
            <span style="font-family:monospace;font-weight:600;color:#1e3a5f;">{{ data.numero }}</span>
          </template>
        </Column>
        <Column field="fornecedor.nome" header="Fornecedor">
          <template #body="{ data }">
            <span style="font-size:0.9rem;">{{ data.fornecedor?.nome }}</span>
          </template>
        </Column>
        <Column header="Estado" style="width:140px;">
          <template #body="{ data }">
            <Tag :value="estadoLabel(data.estado)" :severity="estadoSeverity(data.estado)" />
          </template>
        </Column>
        <Column header="Data Encomenda" style="width:150px;">
          <template #body="{ data }">
            <span style="font-size:0.85rem;">{{ formatDate(data.dataEncomenda) }}</span>
          </template>
        </Column>
        <Column header="Entrega Prevista" style="width:150px;">
          <template #body="{ data }">
            <span :style="{ fontSize:'0.85rem', color: isAtrasada(data) ? '#e53e3e' : '#4a5568' }">
              {{ data.dataEntregaPrevista ? formatDate(data.dataEntregaPrevista) : '—' }}
              <i v-if="isAtrasada(data)" class="pi pi-exclamation-circle ml-1" style="color:#e53e3e;"></i>
            </span>
          </template>
        </Column>
        <Column header="Linhas" style="width:80px;text-align:center;">
          <template #body="{ data }">
            <Tag :value="String(data.linhas?.length || 0)" severity="info" />
          </template>
        </Column>
        <Column header="Valor Total" style="width:130px;text-align:right;">
          <template #body="{ data }">
            <span style="font-weight:600;color:#27ae60;">{{ formatEuro(calcValorTotal(data)) }}</span>
          </template>
        </Column>
        <Column header="" style="width:140px;text-align:right;">
          <template #body="{ data }">
            <Button
              v-if="['PENDENTE','PARCIAL'].includes(data.estado)"
              label="Dar Entrada"
              icon="pi pi-download"
              class="p-button-sm p-button-success"
              @click.stop="abrirRecepcao(data)"
            />
          </template>
        </Column>

        <!-- Expanded row with lines detail -->
        <template #expansion="{ data }">
          <div style="padding:1rem;background:#f8fafc;">
            <div style="font-weight:600;color:#1e3a5f;margin-bottom:0.75rem;">
              Linhas da Encomenda {{ data.numero }}
            </div>
            <DataTable :value="data.linhas" size="small" stripedRows>
              <Column field="artigo.codigo" header="Código" style="width:120px;">
                <template #body="{ data: l }">
                  <span style="font-family:monospace;font-size:0.82rem;color:#4a5568;">{{ l.artigo?.codigo }}</span>
                </template>
              </Column>
              <Column field="artigo.descricao" header="Artigo">
                <template #body="{ data: l }">
                  <span style="font-size:0.85rem;">{{ l.artigo?.descricao }}</span>
                </template>
              </Column>
              <Column field="quantidadeEncomendada" header="Qtd Enc." style="width:100px;text-align:right;">
                <template #body="{ data: l }">
                  <span style="font-weight:600;">{{ l.quantidadeEncomendada }}</span>
                </template>
              </Column>
              <Column field="quantidadeRecebida" header="Qtd Rec." style="width:100px;text-align:right;">
                <template #body="{ data: l }">
                  <span :style="{ fontWeight:'600', color: l.quantidadeRecebida >= l.quantidadeEncomendada ? '#27ae60' : l.quantidadeRecebida > 0 ? '#d97706' : '#718096' }">
                    {{ l.quantidadeRecebida }}
                  </span>
                </template>
              </Column>
              <Column header="Progresso" style="width:160px;">
                <template #body="{ data: l }">
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <div style="flex:1;background:#e2e8f0;border-radius:4px;height:6px;">
                      <div
                        :style="{
                          width: Math.min(100, (l.quantidadeRecebida / l.quantidadeEncomendada) * 100) + '%',
                          background: l.quantidadeRecebida >= l.quantidadeEncomendada ? '#27ae60' : '#3b82f6',
                          height:'6px',
                          borderRadius:'4px',
                          transition:'width 0.3s'
                        }"
                      ></div>
                    </div>
                    <span style="font-size:0.75rem;color:#718096;width:32px;">
                      {{ Math.round((l.quantidadeRecebida / l.quantidadeEncomendada) * 100) }}%
                    </span>
                  </div>
                </template>
              </Column>
              <Column header="Preço Unit." style="width:110px;text-align:right;">
                <template #body="{ data: l }">
                  <span style="font-size:0.85rem;">{{ formatEuro(l.precoUnitario) }}</span>
                </template>
              </Column>
              <Column header="Total Linha" style="width:120px;text-align:right;">
                <template #body="{ data: l }">
                  <span style="font-weight:600;color:#27ae60;">{{ formatEuro(l.quantidadeEncomendada * l.precoUnitario) }}</span>
                </template>
              </Column>
            </DataTable>

            <div v-if="data.observacoes" style="margin-top:0.75rem;padding:0.75rem;background:#fff;border-radius:6px;border-left:3px solid #3b82f6;">
              <span style="font-size:0.85rem;color:#4a5568;"><b>Obs:</b> {{ data.observacoes }}</span>
            </div>
          </div>
        </template>

        <template #empty>
          <div style="text-align:center;padding:2rem;color:#718096;">
            <i class="pi pi-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
            Nenhuma encomenda encontrada
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Recepção Dialog -->
    <Dialog
      :visible="recepcaoVisible"
      @update:visible="recepcaoVisible = $event"
      :header="`Dar Entrada — ${encomendaRecepcao?.numero}`"
      :style="{ width: '780px' }"
      modal
    >
      <div v-if="encomendaRecepcao">

        <!-- Info encomenda -->
        <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;padding:0.85rem 1rem;background:#f0f7ff;border-radius:8px;border:1px solid #bee3f8;align-items:center;flex-wrap:wrap;">
          <i class="pi pi-truck" style="color:#2d5a8e;font-size:1.2rem;"></i>
          <span style="font-weight:600;color:#1e3a5f;">{{ encomendaRecepcao.fornecedor?.nome }}</span>
          <Tag :value="encomendaRecepcao.estado" :severity="estadoSeverity(encomendaRecepcao.estado)" />
          <span style="margin-left:auto;font-size:0.85rem;color:#718096;">
            Encomendado em {{ formatDate(encomendaRecepcao.dataEncomenda) }}
          </span>
        </div>

        <!-- Localização destino (global) -->
        <div class="form-field" style="margin-bottom:1.25rem;">
          <label class="form-label">Localização de destino (para todas as linhas) <span style="color:#e53e3e;">*</span></label>
          <Dropdown
            v-model="recepcaoLocalizacaoGlobal"
            :options="localizacoes"
            optionLabel="designacao"
            optionValue="id"
            placeholder="Seleccionar armazém de destino"
            style="width:100%;"
            @change="aplicarLocalizacaoGlobal"
          />
        </div>

        <!-- Linhas -->
        <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#718096;margin-bottom:0.75rem;">
          Linhas da encomenda
        </div>

        <div
          v-for="linha in recepcaoLinhas"
          :key="linha.id"
          :style="{
            border: '1px solid',
            borderColor: linha.completa ? '#c6f6d5' : '#e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.75rem',
            background: linha.completa ? '#f0fff4' : '#fff'
          }"
        >
          <div style="display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
            <!-- Info artigo -->
            <div style="flex:1;min-width:200px;">
              <div style="font-weight:600;font-size:0.9rem;color:#1e3a5f;">{{ linha.artigo.descricao }}</div>
              <div style="font-size:0.75rem;color:#718096;font-family:monospace;">{{ linha.artigo.codigo }}</div>
              <div style="margin-top:0.4rem;display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
                <span style="font-size:0.78rem;color:#4a5568;">
                  Enc: <b>{{ linha.quantidadeEncomendada }}</b>
                  &nbsp;·&nbsp;
                  Rec. anterior: <b :style="{ color: linha.quantidadeRecebida > 0 ? '#d97706' : '#a0aec0' }">{{ linha.quantidadeRecebida }}</b>
                  &nbsp;·&nbsp;
                  Pendente: <b style="color:#e53e3e;">{{ Math.max(0, linha.quantidadeEncomendada - linha.quantidadeRecebida) }}</b>
                </span>
              </div>
            </div>

            <!-- Campos de recepção -->
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end;">
              <div class="form-field" style="margin-bottom:0;min-width:130px;">
                <label class="form-label">
                  Qtd a receber
                  <span
                    v-if="linha.artigo.fatorConversao"
                    @click="linha.modoCompra = !linha.modoCompra; linha.qtdEmCompra = null; linha.qtdAReceber = 0; calcularCompleta(linha)"
                    :style="{
                      marginLeft:'0.4rem',
                      fontSize:'0.7rem',
                      fontWeight:600,
                      cursor:'pointer',
                      padding:'1px 6px',
                      borderRadius:'10px',
                      background: linha.modoCompra ? '#ebf8ff' : '#f0f4f8',
                      color: linha.modoCompra ? '#2b6cb0' : '#718096',
                      border: linha.modoCompra ? '1px solid #bee3f8' : '1px solid #e2e8f0',
                      userSelect:'none'
                    }"
                  >{{ linha.modoCompra ? linha.artigo.unidadeMedidaCompra : linha.artigo.unidadeMedida }}</span>
                </label>
                <template v-if="linha.modoCompra && linha.artigo.fatorConversao">
                  <InputText
                    v-model.number="linha.qtdEmCompra"
                    type="number"
                    min="0"
                    style="width:100%;"
                    :placeholder="'Nº ' + linha.artigo.unidadeMedidaCompra"
                    @input="linha.qtdAReceber = linha.qtdEmCompra ? Math.round(linha.qtdEmCompra * linha.artigo.fatorConversao) : 0; calcularCompleta(linha)"
                  />
                  <div v-if="linha.qtdEmCompra" style="font-size:0.72rem;color:#2b6cb0;margin-top:0.2rem;font-weight:500;">
                    = {{ Math.round(linha.qtdEmCompra * linha.artigo.fatorConversao) }} {{ linha.artigo.unidadeMedida }}
                  </div>
                </template>
                <InputText
                  v-else
                  v-model.number="linha.qtdAReceber"
                  type="number"
                  min="0"
                  :max="linha.quantidadeEncomendada - linha.quantidadeRecebida"
                  style="width:100%;"
                  @input="calcularCompleta(linha)"
                />
              </div>

              <div class="form-field" style="margin-bottom:0;width:160px;">
                <label class="form-label">Localização</label>
                <Dropdown
                  v-model="linha.localizacaoId"
                  :options="localizacoes"
                  optionLabel="designacao"
                  optionValue="id"
                  placeholder="Armazém"
                  style="width:100%;"
                />
              </div>

              <!-- Campos de lote (só para artigos que necessitam) -->
              <template v-if="linha.artigo.necessitaLote">
                <div class="form-field" style="margin-bottom:0;width:140px;">
                  <label class="form-label">Nº Lote <span style="color:#e53e3e;">*</span></label>
                  <InputText v-model="linha.numeroLote" placeholder="LOT-2026-001" style="width:100%;" />
                </div>
                <div class="form-field" style="margin-bottom:0;width:140px;">
                  <label class="form-label">Validade <span style="color:#e53e3e;">*</span></label>
                  <InputText v-model="linha.dataValidade" type="date" style="width:100%;" />
                </div>
              </template>
            </div>

            <!-- Indicador de completo -->
            <div style="display:flex;align-items:center;padding-top:0.25rem;">
              <i
                :class="linha.completa ? 'pi pi-check-circle' : 'pi pi-circle'"
                :style="{ color: linha.completa ? '#27ae60' : '#cbd5e0', fontSize:'1.4rem' }"
              ></i>
            </div>
          </div>
        </div>

        <!-- Utilizador -->
        <div class="form-field" style="margin-top:0.5rem;">
          <label class="form-label">Recebido por <span style="color:#e53e3e;">*</span></label>
          <InputText v-model="recepcaoUtilizador" placeholder="Nome do responsável pela recepção" style="width:100%;" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="recepcaoVisible = false" />
        <Button
          label="Confirmar Recepção"
          icon="pi pi-check"
          class="p-button-success"
          @click="confirmarRecepcao"
          :loading="savingRecepcao"
          :disabled="!recepcaoValida"
        />
      </template>
    </Dialog>

    <!-- Nova Encomenda Dialog -->
    <Dialog :visible="novaEncomendaVisible" @update:visible="novaEncomendaVisible = $event" header="Nova Encomenda" :style="{ width: '720px' }" modal>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <!-- Cabeçalho -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="form-field">
            <label class="form-label">Fornecedor <span style="color:#e53e3e;">*</span></label>
            <Dropdown v-model="novaEncomenda.fornecedorId" :options="fornecedores" optionLabel="nome" optionValue="id" placeholder="Seleccionar fornecedor" class="w-full" />
          </div>
          <div class="form-field">
            <label class="form-label">Data de Entrega Prevista</label>
            <InputText v-model="novaEncomenda.dataEntregaPrevista" type="date" class="w-full" />
          </div>
        </div>
        <div class="form-field">
          <label class="form-label">Observações</label>
          <Textarea v-model="novaEncomenda.observacoes" rows="2" class="w-full" autoResize />
        </div>

        <!-- Linhas de artigos -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;">
            <span style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#718096;">Artigos <span style="color:#e53e3e;">*</span></span>
            <Button label="Adicionar artigo" icon="pi pi-plus" class="p-button-text p-button-sm" @click="adicionarLinha" />
          </div>

          <div v-if="novaEncomenda.linhas.length === 0" style="text-align:center;padding:1.25rem;background:#f8fafc;border:1px dashed #cbd5e0;border-radius:8px;color:#a0aec0;font-size:0.875rem;">
            Nenhum artigo adicionado. Clique em "Adicionar artigo" para começar.
          </div>

          <div v-for="(linha, idx) in novaEncomenda.linhas" :key="idx" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:0.75rem;align-items:end;margin-bottom:0.6rem;">
            <div class="form-field" style="margin-bottom:0;">
              <label v-if="idx === 0" class="form-label">Artigo</label>
              <Dropdown
                v-model="linha.artigoId"
                :options="artigosDisponiveis"
                optionLabel="descricao"
                optionValue="id"
                placeholder="Seleccionar artigo"
                filter
                class="w-full"
                @change="onNovaLinhaArtigoChange(linha)"
              />
            </div>
            <div class="form-field" style="margin-bottom:0;">
              <label v-if="idx === 0" class="form-label">Quantidade</label>
              <InputText v-model.number="linha.quantidadeEncomendada" type="number" min="1" class="w-full" placeholder="Qtd" />
            </div>
            <div class="form-field" style="margin-bottom:0;">
              <label v-if="idx === 0" class="form-label">Preço Unit. (€)</label>
              <InputText v-model.number="linha.precoUnitario" type="number" step="0.01" min="0" class="w-full" placeholder="0.00" />
            </div>
            <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" style="margin-bottom:0;" @click="removerLinha(idx)" />
          </div>

          <!-- Totalizador -->
          <div v-if="novaEncomenda.linhas.length > 0" style="text-align:right;padding:0.6rem 0.75rem;background:#f0fff4;border-radius:6px;margin-top:0.25rem;font-size:0.875rem;">
            <span style="color:#718096;">Valor total estimado: </span>
            <span style="font-weight:700;color:#27ae60;">{{ formatEuro(novaEncomenda.linhas.reduce((s,l) => s + (l.quantidadeEncomendada||0)*(l.precoUnitario||0), 0)) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" @click="novaEncomendaVisible = false" />
        <Button label="Criar Encomenda" icon="pi pi-check" @click="criarEncomenda" :loading="saving" :disabled="!novaEncomenda.fornecedorId || novaEncomenda.linhas.length === 0" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import api from '../api/index.js'

const toast = useToast()
const encomendas = ref([])
const fornecedores = ref([])
const localizacoes = ref([])
const loading = ref(true)
const saving = ref(false)
const expandedRows = ref({})
const filtroEstado = ref(null)
const filtroTexto = ref('')
const novaEncomendaVisible = ref(false)
const novaEncomenda = ref({ fornecedorId: null, dataEntregaPrevista: '', observacoes: '', linhas: [] })
const artigosDisponiveis = ref([])

function adicionarLinha() {
  novaEncomenda.value.linhas.push({ artigoId: null, quantidadeEncomendada: 1, precoUnitario: 0 })
}

function removerLinha(idx) {
  novaEncomenda.value.linhas.splice(idx, 1)
}

function onNovaLinhaArtigoChange(linha) {
  const artigo = artigosDisponiveis.value.find(a => a.id === linha.artigoId)
  if (artigo?.precoMedioPonderado) linha.precoUnitario = artigo.precoMedioPonderado
}

// Recepção
const recepcaoVisible = ref(false)
const savingRecepcao = ref(false)
const encomendaRecepcao = ref(null)
const recepcaoLinhas = ref([])
const recepcaoUtilizador = ref('Farm. Oliveira')
const recepcaoLocalizacaoGlobal = ref(null)

const recepcaoValida = computed(() => {
  if (!recepcaoUtilizador.value) return false
  const comQtd = recepcaoLinhas.value.filter(l => l.qtdAReceber > 0)
  if (comQtd.length === 0) return false
  return comQtd.every(l => {
    if (!l.localizacaoId) return false
    if (l.artigo.necessitaLote && (!l.numeroLote || !l.dataValidade)) return false
    return true
  })
})

function calcularCompleta(linha) {
  linha.completa = linha.qtdAReceber >= (linha.quantidadeEncomendada - linha.quantidadeRecebida)
}

function aplicarLocalizacaoGlobal() {
  recepcaoLinhas.value.forEach(l => { l.localizacaoId = recepcaoLocalizacaoGlobal.value })
}

function abrirRecepcao(encomenda) {
  encomendaRecepcao.value = encomenda
  recepcaoLocalizacaoGlobal.value = null
  recepcaoLinhas.value = encomenda.linhas
    .filter(l => l.quantidadeRecebida < l.quantidadeEncomendada)
    .map(l => ({
      ...l,
      qtdAReceber: l.quantidadeEncomendada - l.quantidadeRecebida,
      localizacaoId: null,
      numeroLote: '',
      dataValidade: '',
      completa: false,
      modoCompra: false,
      qtdEmCompra: null
    }))
  recepcaoLinhas.value.forEach(calcularCompleta)
  recepcaoVisible.value = true
}

async function confirmarRecepcao() {
  const linhasComQtd = recepcaoLinhas.value.filter(l => l.qtdAReceber > 0)
  savingRecepcao.value = true
  try {
    await api.receberEncomenda(encomendaRecepcao.value.id, {
      utilizador: recepcaoUtilizador.value,
      linhas: linhasComQtd.map(l => ({
        linhaId:           l.id,
        quantidadeRecebida: l.qtdAReceber,
        localizacaoId:     l.localizacaoId,
        numeroLote:        l.numeroLote || null,
        dataValidade:      l.dataValidade || null
      }))
    })
    toast.add({ severity: 'success', summary: 'Recepção confirmada', detail: `Stock actualizado com sucesso para ${encomendaRecepcao.value.numero}`, life: 4000 })
    recepcaoVisible.value = false
    await loadEncomendas()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: e.response?.data?.error || 'Não foi possível registar a recepção', life: 4000 })
  } finally {
    savingRecepcao.value = false
  }
}

const estadoOpcoes = [
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Parcial', value: 'PARCIAL' },
  { label: 'Completa', value: 'COMPLETA' },
  { label: 'Cancelada', value: 'CANCELADA' }
]

function estadoLabel(e) {
  const map = { PENDENTE: 'Pendente', PARCIAL: 'Parcial', COMPLETA: 'Completa', CANCELADA: 'Cancelada' }
  return map[e] || e
}

function estadoSeverity(e) {
  const map = { PENDENTE: 'warning', PARCIAL: 'info', COMPLETA: 'success', CANCELADA: 'danger' }
  return map[e] || 'info'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT')
}

function formatEuro(val) {
  if (!val && val !== 0) return '—'
  return '€ ' + Number(val).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calcValorTotal(enc) {
  if (!enc.linhas) return 0
  return enc.linhas.reduce((s, l) => s + (l.quantidadeEncomendada * l.precoUnitario), 0)
}

function isAtrasada(enc) {
  if (!enc.dataEntregaPrevista) return false
  if (enc.estado === 'COMPLETA' || enc.estado === 'CANCELADA') return false
  return new Date(enc.dataEntregaPrevista) < new Date()
}

async function loadEncomendas() {
  loading.value = true
  try {
    const params = {}
    if (filtroEstado.value) params.estado = filtroEstado.value
    if (filtroTexto.value) params.q = filtroTexto.value
    const res = await api.getEncomendas(params)
    encomendas.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadFornecedores() {
  try {
    // extract unique fornecedores from already loaded encomendas
    const unique = {}
    encomendas.value.forEach(e => { if (e.fornecedor) unique[e.fornecedor.id] = e.fornecedor })
    fornecedores.value = Object.values(unique)
  } catch (e) {
    console.error(e)
  }
}

async function criarEncomenda() {
  if (!novaEncomenda.value.fornecedorId) {
    toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Seleccione um fornecedor', life: 3000 })
    return
  }
  saving.value = true
  try {
    await api.createEncomenda(novaEncomenda.value)
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Encomenda criada com sucesso', life: 3000 })
    novaEncomendaVisible.value = false
    novaEncomenda.value = { fornecedorId: null, dataEntregaPrevista: '', observacoes: '', linhas: [] }
    await loadEncomendas()
    await loadFornecedores()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a encomenda', life: 4000 })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [, , locRes, artRes] = await Promise.all([
    loadEncomendas(),
    loadFornecedores(),
    api.getLocalizacoes(),
    api.getArtigos()
  ])
  localizacoes.value = locRes.data
  artigosDisponiveis.value = artRes.data
})
</script>
