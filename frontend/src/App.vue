<template>
  <div class="layout-wrapper">
    <!-- Sidebar -->
    <div class="layout-sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="pi pi-heart-fill" style="color: #fff; font-size: 1.5rem;"></i>
          <span v-if="!sidebarCollapsed" class="sidebar-title">MedStock</span>
        </div>
        <Button
          :icon="sidebarCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
          class="p-button-text p-button-rounded sidebar-toggle"
          @click="sidebarCollapsed = !sidebarCollapsed"
        />
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: $route.path === item.to }"
        >
          <i :class="['pi', item.icon, 'nav-icon']"></i>
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.badge && alertCount > 0" class="nav-badge">{{ alertCount }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Main content -->
    <div class="layout-main" :class="{ 'main-expanded': sidebarCollapsed }">
      <!-- Top bar -->
      <div class="top-bar">
        <div class="top-bar-left">
          <h2 class="hospital-title">Hospital de Demo &mdash; Gestão de Stocks</h2>
        </div>
        <div class="top-bar-right">
          <div class="user-info">
            <i class="pi pi-user" style="font-size: 1.2rem; color: #4a5568;"></i>
            <span class="user-name">Farm. Oliveira</span>
            <Tag value="Farmacêutico" severity="info" />
          </div>
        </div>
      </div>

      <!-- Router view -->
      <div class="layout-content">
        <Toast />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import api from './api/index.js'

const sidebarCollapsed = ref(false)
const alertCount = ref(0)

const menuItems = [
  { to: '/', label: 'Dashboard', icon: 'pi-th-large' },
  { to: '/stock', label: 'Stock', icon: 'pi-box' },
  { to: '/artigos', label: 'Artigos', icon: 'pi-list' },
  { to: '/lotes', label: 'Lotes', icon: 'pi-tag' },
  { to: '/movimentos', label: 'Movimentos', icon: 'pi-arrows-h' },
  { to: '/alertas', label: 'Alertas', icon: 'pi-bell', badge: true },
  { to: '/encomendas', label: 'Encomendas', icon: 'pi-shopping-cart' }
]

onMounted(async () => {
  try {
    const res = await api.getAlertas()
    alertCount.value = res.data.totalAlertas || 0
  } catch (e) {
    // ignore
  }
})
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f0f4f8;
  color: #2d3748;
  font-size: 15px;
}

/* ─── INPUTS & FORM CONTROLS ─────────────────────────────────── */
.p-inputtext {
  padding: 0.65rem 0.9rem !important;
  font-size: 0.925rem !important;
  border-radius: 7px !important;
  border-color: #cbd5e0 !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
}
.p-inputtext:focus {
  border-color: #2d5a8e !important;
  box-shadow: 0 0 0 3px rgba(45,90,142,0.12) !important;
}
.p-inputtext::placeholder { color: #a0aec0 !important; }

.p-dropdown,
.p-multiselect {
  border-radius: 7px !important;
  border-color: #cbd5e0 !important;
}
.p-dropdown:not(.p-disabled):hover,
.p-multiselect:not(.p-disabled):hover {
  border-color: #2d5a8e !important;
}
.p-dropdown.p-focus,
.p-multiselect.p-focus {
  border-color: #2d5a8e !important;
  box-shadow: 0 0 0 3px rgba(45,90,142,0.12) !important;
}
.p-dropdown .p-dropdown-label,
.p-multiselect .p-multiselect-label {
  padding: 0.65rem 0.9rem !important;
  font-size: 0.925rem !important;
}

.p-inputgroup-addon {
  background: #f7fafc !important;
  border-color: #cbd5e0 !important;
  color: #718096 !important;
  padding: 0 0.85rem !important;
  border-radius: 7px 0 0 7px !important;
}
.p-inputgroup .p-inputtext {
  border-radius: 0 7px 7px 0 !important;
}

.p-input-icon-left > i,
.p-input-icon-right > i {
  margin-top: -0.52rem !important;
  color: #a0aec0;
}

/* ─── BUTTONS ─────────────────────────────────────────────────── */
.p-button {
  padding: 0.62rem 1.15rem !important;
  font-size: 0.925rem !important;
  border-radius: 7px !important;
  font-weight: 500 !important;
  transition: all 0.15s !important;
}
.p-button.p-button-sm {
  padding: 0.45rem 0.85rem !important;
  font-size: 0.85rem !important;
}
.p-button.p-button-rounded {
  border-radius: 50% !important;
}
.p-button:not(.p-button-text):not(.p-button-outlined):not(.p-button-rounded) {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
}

/* ─── DIALOG ──────────────────────────────────────────────────── */
.p-dialog {
  border-radius: 14px !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18) !important;
  overflow: hidden;
}
.p-dialog .p-dialog-header {
  padding: 1.25rem 1.5rem 1rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background: #fff !important;
}
.p-dialog .p-dialog-header .p-dialog-title {
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  color: #1e3a5f !important;
}
.p-dialog .p-dialog-content {
  padding: 1.5rem !important;
  background: #fff !important;
}
.p-dialog .p-dialog-footer {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ─── FORM LABELS (inside dialogs) ───────────────────────────── */
.form-label {
  display: block;
  font-size: 0.825rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.4rem;
  letter-spacing: 0.01em;
}
.form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-field:last-child { margin-bottom: 0; }

/* ─── DATATABLE ───────────────────────────────────────────────── */
.p-datatable .p-datatable-thead > tr > th {
  padding: 0.85rem 1rem !important;
  background: #f7fafc !important;
  color: #4a5568 !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  border-bottom: 2px solid #e2e8f0 !important;
}
.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.75rem 1rem !important;
  border-bottom: 1px solid #f0f4f8 !important;
}
.p-datatable.p-datatable-sm .p-datatable-thead > tr > th {
  padding: 0.75rem 1rem !important;
}
.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {
  padding: 0.65rem 1rem !important;
}
.p-datatable .p-datatable-tbody > tr:hover > td {
  background: #f0f7ff !important;
}
.p-datatable .p-datatable-tbody > tr.p-highlight > td {
  background: #ebf4ff !important;
}
/* Paginator */
.p-paginator {
  padding: 0.75rem 1rem !important;
  border-top: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}
.p-paginator .p-paginator-element {
  border-radius: 7px !important;
  min-width: 2.2rem !important;
  height: 2.2rem !important;
}

/* ─── DIVIDER ─────────────────────────────────────────────────── */
.p-divider {
  margin: 1.25rem 0 !important;
}

/* ─── TAG ─────────────────────────────────────────────────────── */
.p-tag {
  border-radius: 5px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
  padding: 0.1rem 0.35rem !important;
}
.p-tag .p-tag-value {
  padding: 0 0.1rem !important;
}

/* ─── TOAST ───────────────────────────────────────────────────── */
.p-toast .p-toast-message {
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}

/* ─── DROPDOWN PANEL ──────────────────────────────────────────── */
.p-dropdown-panel,
.p-multiselect-panel {
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
  border: 1px solid #e2e8f0 !important;
  overflow: hidden;
}
.p-dropdown-panel .p-dropdown-items .p-dropdown-item,
.p-multiselect-panel .p-multiselect-items .p-multiselect-item {
  padding: 0.65rem 1rem !important;
  font-size: 0.925rem !important;
}
.p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover,
.p-multiselect-panel .p-multiselect-items .p-multiselect-item:hover {
  background: #f0f7ff !important;
}

/* ─── DATATABLE — aumentar altura das linhas */

.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-sidebar {
  width: 240px;
  min-height: 100vh;
  background: linear-gradient(180deg, #1e3a5f 0%, #2d5a8e 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.layout-sidebar.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  min-height: 64px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.sidebar-title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-toggle {
  color: rgba(255,255,255,0.8) !important;
  padding: 0.25rem !important;
  width: 28px !important;
  height: 28px !important;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.75rem;
  border-radius: 8px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.nav-item.active {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.nav-label {
  font-size: 0.9rem;
  overflow: hidden;
}

.nav-badge {
  margin-left: auto;
  background: #e74c3c;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.layout-main {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.layout-main.main-expanded {
  margin-left: 64px;
}

.top-bar {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.hospital-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a5f;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.layout-content {
  padding: 1.5rem;
  flex: 1;
}

/* Global utilities */
.kpi-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.kpi-data .kpi-value {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
}

.kpi-data .kpi-label {
  font-size: 0.78rem;
  color: #718096;
  margin-top: 2px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 1rem;
}

.card-box {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
</style>
