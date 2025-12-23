<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import Expenses from './Expenses.vue'
import Dashboard from './Dashboard.vue'

const router = useRouter()
const userEmail = ref('')
const dashboardRef = ref(null)

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('dq_user'))
  if (user) userEmail.value = user.email
})

const logout = () => {
  localStorage.removeItem('dq_user')
  router.push('/login')
}

const handleExpenseChange = () => {
  // Cuando cambia un gasto, recargamos el reporte
  if (dashboardRef.value) {
    dashboardRef.value.loadReport()
  }
}
</script>

<template>
  <div class="layout">
    <header>
      <div class="brand">
        <h2>Gastos DuQuen</h2>
        <span class="email">{{ userEmail }}</span>
      </div>
      <nav>
        <!-- Ya no necesitamos navegación entre vistas -->
        <button @click="logout" class="logout-btn">Salir</button>
      </nav>
    </header>

    <main>
      <div class="grid-container">
        <div>
          <Expenses @expense-changed="handleExpenseChange" />
        </div>
        <div>
          <Dashboard ref="dashboardRef" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
header {
  background: #2196f3;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand h2 {
  margin: 0;
  font-size: 1.2rem;
}

.email {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-left: 10px;
}

.logout-btn {
  background: none;
  border: 1px solid white;
  color: white;
  margin-left: 1rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
}

main {
  padding: 1rem;
  max-width: 1200px;
  /* Aumentamos ancho para caber todo */
  margin: 0 auto;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .grid-container {
    grid-template-columns: 4fr 5fr;
    /* Expenses un poco mas chico, Dashboard mas grande */
    align-items: start;
  }
}
</style>