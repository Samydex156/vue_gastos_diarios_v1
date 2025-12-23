<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO, getDay } from 'date-fns'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const user = JSON.parse(localStorage.getItem('dq_user'))
const totalWeek = ref(0)
const totalMonth = ref(0)
const dailyTotals = ref([0, 0, 0, 0, 0, 0, 0])
const loading = ref(true)

// Configuración de la Gráfica
const chartData = ref({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [{ label: 'Gastos', data: [], backgroundColor: '#2196f3', borderRadius: 4 }]
})
const chartOptions = { responsive: true, maintainAspectRatio: false }

const loadReport = async () => {
  loading.value = true
  const now = new Date()

  // Calcular rangos (Nota: date-fns empieza semana en Domingo por defecto, ajustamos a Lunes)
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  // 1. Datos Semana
  const { data: weekData } = await supabase
    .from('expenses')
    .select('amount, date')
    .eq('user_id', user.id)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  let sumWeek = 0
  const days = [0, 0, 0, 0, 0, 0, 0] // Lunes(0) -> Domingo(6)

  weekData.forEach(item => {
    sumWeek += item.amount
    // Ajustar getDay: Domingo es 0 en JS, lo queremos 6. Lunes es 1, lo queremos 0.
    const jsDay = getDay(parseISO(item.date))
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1
    days[dayIndex] += item.amount
  })

  // 2. Datos Mes
  const { data: monthData } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  const sumMonth = monthData.reduce((acc, val) => acc + val.amount, 0)

  totalWeek.value = sumWeek
  totalMonth.value = sumMonth
  dailyTotals.value = days

  // Actualizar gráfico
  chartData.value = {
    ...chartData.value,
    datasets: [{ ...chartData.value.datasets[0], data: days }]
  }

  loading.value = false
}

defineExpose({ loadReport })

onMounted(loadReport)
</script>

<template>
  <div class="dashboard">
    <h1>Reporte de Gastos</h1>

    <div v-if="loading" class="loader">Calculando...</div>

    <div v-else>
      <div class="cards">
        <div class="card orange">
          <span>Esta Semana</span>
          <h2>Bs. {{ totalWeek.toFixed(2) }}</h2>
        </div>
        <div class="card blue">
          <span>Este Mes</span>
          <h2>Bs. {{ totalMonth.toFixed(2) }}</h2>
        </div>
      </div>

      <div class="chart-container">
        <h3>Gastos por Día</h3>
        <div class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div class="daily-detail">
        <h3>Detalle Diario</h3>
        <ul>
          <li v-for="(amount, idx) in dailyTotals" :key="idx">
            <span>{{ chartData.labels[idx] }}</span>
            <strong>Bs. {{ amount.toFixed(2) }}</strong>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  flex: 1;
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.card.orange h2 {
  color: #f57c00;
  margin: 5px 0 0 0;
}

.card.blue h2 {
  color: #1565c0;
  margin: 5px 0 0 0;
}

.chart-container {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-wrapper {
  height: 250px;
}

.daily-detail ul {
  list-style: none;
  padding: 0;
  background: white;
  border-radius: 12px;
}

.daily-detail li {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.daily-detail li:last-child {
  border-bottom: none;
}
</style>