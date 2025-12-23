<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
import { format } from 'date-fns'

const emit = defineEmits(['expense-changed'])

const date = ref(format(new Date(), 'yyyy-MM-dd'))
const description = ref('')
const amount = ref('')
const expenses = ref([])
const loading = ref(false)
const user = JSON.parse(localStorage.getItem('dq_user'))

// Formato visual de fecha
const displayDate = computed(() => date.value.split('-').reverse().join('/'))
const totalDay = computed(() => expenses.value.reduce((acc, item) => acc + item.amount, 0))

const loadExpenses = async () => {
  loading.value = true
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date.value)
    .order('id', { ascending: false })

  if (data) expenses.value = data
  loading.value = false
}

const addExpense = async () => {
  if (!description.value || !amount.value) return

  await supabase.from('expenses').insert({
    description: description.value,
    amount: parseFloat(amount.value),
    date: date.value,
    user_id: user.id
  })

  description.value = ''
  amount.value = ''
  loadExpenses()
  emit('expense-changed')
}

const deleteExpense = async (id) => {
  if (!confirm('¿Eliminar gasto?')) return
  await supabase.from('expenses').delete().eq('id', id)
  loadExpenses()
  emit('expense-changed')
}

// Cargar al inicio y cuando cambie la fecha
onMounted(loadExpenses)
watch(date, loadExpenses)
</script>

<template>
  <div class="expenses-view">
    <div class="date-header">
      <div>
        <small>Fecha:</small>
        <h3>{{ displayDate }}</h3>
      </div>
      <input type="date" v-model="date" class="date-picker">
    </div>

    <div class="add-form">
      <input v-model="description" placeholder="Descripción" class="desc-input" />
      <input v-model="amount" type="number" placeholder="Monto (Bs)" class="amount-input" />
      <button @click="addExpense" class="add-btn">+</button>
    </div>

    <div class="list-container">
      <p v-if="loading">Cargando...</p>
      <p v-else-if="expenses.length === 0" class="empty">Sin gastos en esta fecha</p>

      <ul v-else class="expense-list">
        <li v-for="item in expenses" :key="item.id">
          <div class="expense-info">
            <span class="desc">{{ item.description }}</span>
            <span class="amt">Bs. {{ item.amount.toFixed(2) }}</span>
          </div>
          <button @click="deleteExpense(item.id)" class="del-btn">🗑️</button>
        </li>
      </ul>
    </div>

    <div class="total-footer">
      <span>ACUMULADO DEL DÍA:</span>
      <span class="total-amount">Bs. {{ totalDay.toFixed(2) }}</span>
    </div>
  </div>
</template>

<style scoped>
.date-header {
  background: #e3f2fd;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.date-header h3 {
  margin: 0;
  color: #1565c0;
}

.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.desc-input {
  flex: 2;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.amount-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-btn {
  background: #2196f3;
  color: white;
  border: none;
  width: 40px;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
}

.expense-list {
  list-style: none;
  padding: 0;
}

.expense-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.expense-info {
  display: flex;
  flex-direction: column;
}

.desc {
  color: #555;
}

.amt {
  font-weight: bold;
  font-size: 1.1rem;
}

.del-btn {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
}

.total-footer {
  background: #0d47a1;
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>