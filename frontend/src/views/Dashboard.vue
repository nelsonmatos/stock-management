<template>
  <div>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 style="font-size:1.4rem;font-weight:700;color:#1e3a5f;">Dashboard</h1>
      <span style="color:#718096;font-size:0.85rem;">{{ today }}</span>
    </div>

    <!-- KPI Cards -->
    <div class="grid mb-4" v-if="dashboard">
      <div class="col-12 md:col-6 lg:col-2">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#ebf8f0;">
            <i class="pi pi-euro" style="color:#27ae60;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#27ae60;">{{ formatEuro(dashboard.totalValorStock) }}</div>
            <div class="kpi-label">Valor Total Stock</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-2">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#ebf4ff;">
            <i class="pi pi-list" style="color:#2d5a8e;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#2d5a8e;">{{ dashboard.totalArtigos }}</div>
            <div class="kpi-label">Artigos Ativos</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-2">
        <div class="kpi-card">
          <div class="kpi-icon" :style="{ background: dashboard.artigosAbaixoMinimo.count > 0 ? '#fff5f5' : '#ebf8f0' }">
            <i class="pi pi-exclamation-triangle" :style="{ color: dashboard.artigosAbaixoMinimo.count > 0 ? '#e53e3e' : '#27ae60' }"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" :style="{ color: dashboard.artigosAbaixoMinimo.count > 0 ? '#e53e3e' : '#27ae60' }">
              {{ dashboard.artigosAbaixoMinimo.count }}
            </div>
            <div class="kpi-label">Abaixo do Mínimo</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-2">
        <div class="kpi-card">
          <div class="kpi-icon" :style="{ background: dashboard.lotesAVencer30 > 0 ? '#fffbeb' : '#ebf8f0' }">
            <i class="pi pi-calendar-times" :style="{ color: dashboard.lotesAVencer30 > 0 ? '#d97706' : '#27ae60' }"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" :style="{ color: dashboard.lotesAVencer30 > 0 ? '#d97706' : '#27ae60' }">
              {{ dashboard.lotesAVencer30 }}
            </div>
            <div class="kpi-label">Lotes a Vencer (30d)</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-2">
        <div class="kpi-card">
          <div class="kpi-icon" :style="{ background: dashboard.lotesExpirados > 0 ? '#fff5f5' : '#ebf8f0' }">
            <i class="pi pi-ban" :style="{ color: dashboard.lotesExpirados > 0 ? '#e53e3e' : '#27ae60' }"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" :style="{ color: dashboard.lotesExpirados > 0 ? '#e53e3e' : '#27ae60' }">
              {{ dashboard.lotesExpirados }}
            </div>
            <div class="kpi-label">Lotes Expirados</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-2">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#fef3eb;">
            <i class="pi pi-shopping-cart" style="color:#ed8936;"></i>
          </div>
          <div class="kpi-data">
            <div class="kpi-value" style="color:#ed8936;">{{ dashboard.encomendasPendentes }}</div>
            <div class="kpi-label">Encomendas Pendentes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid mb-4" v-if="dashboard">
      <div class="col-12 lg:col-8">
        <div class="card-box">
          <div class="section-title">Consumo Mensal (últimos 6 meses)</div>
          <canvas ref="barChartRef" height="100"></canvas>
        </div>
      </div>
      <div class="col-12 lg:col-4">
        <div class="card-box">
          <div class="section-title">Stock por Família</div>
          <canvas ref="pieChartRef" height="200"></canvas>
        </div>
      </div>
    </div>

    <!-- Tables -->
    <div class="grid" v-if="dashboard">
      <div class="col-12 lg:col-6">
        <div class="card-box">
          <div class="section-title">Top 5 Artigos por Consumo (30 dias)</div>
          <DataTable :value="dashboard.topArtigosPorConsumo" size="small" stripedRows>
            <Column field="codigo" header="Código" style="width:100px">
              <template #body="{ data }">
                <span style="font-family:monospace;font-size:0.85rem;color:#4a5568;">{{ data.codigo }}</span>
              </template>
            </Column>
            <Column field="descricao" header="Artigo">
              <template #body="{ data }">
                <span style="font-size:0.85rem;">{{ data.descricao }}</span>
              </template>
            </Column>
            <Column field="quantidade" header="Qtd" style="width:80px;text-align:right;">
              <template #body="{ data }">
                <span style="font-weight:600;">{{ data.quantidade }}</span>
              </template>
            </Column>
            <Column field="valor" header="Valor" style="width:110px;text-align:right;">
              <template #body="{ data }">
                <span style="color:#27ae60;font-weight:600;">{{ formatEuro(data.valor) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="col-12 lg:col-6">
        <div class="card-box">
          <div class="section-title" style="color:#e53e3e;">
            <i class="pi pi-exclamation-triangle mr-2"></i>Artigos Abaixo do Mínimo
          </div>
          <DataTable :value="dashboard.artigosAbaixoMinimo.top5" size="small" stripedRows>
            <Column field="descricao" header="Artigo">
              <template #body="{ data }">
                <span style="font-size:0.85rem;">{{ data.descricao }}</span>
              </template>
            </Column>
            <Column header="Stock Atual" style="width:100px;text-align:right;">
              <template #body="{ data }">
                <span style="color:#e53e3e;font-weight:700;">{{ data.stockActual }}</span>
              </template>
            </Column>
            <Column header="Mínimo" style="width:80px;text-align:right;">
              <template #body="{ data }">
                <span style="color:#718096;">{{ data.stockMinimo }}</span>
              </template>
            </Column>
            <Column header="Déficit" style="width:80px;text-align:right;">
              <template #body="{ data }">
                <Tag :value="String(data.deficit)" severity="danger" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-content-center align-items-center" style="height:300px;">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:#2d5a8e;"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { Chart, registerables } from 'chart.js'
import api from '../api/index.js'

Chart.register(...registerables)

const dashboard = ref(null)
const loading = ref(true)
const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChart = null
let pieChart = null

const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

function formatEuro(val) {
  if (val === null || val === undefined) return '€ 0,00'
  return '€ ' + Number(val).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function initCharts() {
  if (!dashboard.value) return

  // Bar chart - consumo mensal
  if (barChart) barChart.destroy()
  const labels = dashboard.value.consumoMensal.map(c => c.mes)
  const values = dashboard.value.consumoMensal.map(c => c.valor)
  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Valor Consumido (€)',
        data: values,
        backgroundColor: 'rgba(45, 90, 142, 0.75)',
        borderColor: '#1e3a5f',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => '€ ' + ctx.parsed.y.toLocaleString('pt-PT', { minimumFractionDigits: 2 })
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: val => '€ ' + Number(val).toLocaleString('pt-PT')
          }
        }
      }
    }
  })

  // Pie chart - stock por família
  if (pieChart) pieChart.destroy()
  const familias = dashboard.value.stockPorFamilia.slice(0, 8)
  const pieColors = ['#1e3a5f','#2d5a8e','#3b82f6','#60a5fa','#93c5fd','#27ae60','#f59e0b','#ef4444']
  pieChart = new Chart(pieChartRef.value, {
    type: 'doughnut',
    data: {
      labels: familias.map(f => f.familia),
      datasets: [{
        data: familias.map(f => f.valor),
        backgroundColor: pieColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ': € ' + ctx.parsed.toLocaleString('pt-PT', { minimumFractionDigits: 2 })
          }
        }
      }
    }
  })
}

onMounted(async () => {
  try {
    const res = await api.getDashboard()
    dashboard.value = res.data
    await nextTick()
    initCharts()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
