<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import SHA256 from 'crypto-js/sha256'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const router = useRouter()

const hashPassword = (pass) => SHA256(pass).toString()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, completa todos los campos'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const hash = hashPassword(password.value)
    const { data, error } = await supabase
      .from('usuarios2')
      .select()
      .eq('email', email.value)
      .eq('password', hash)
      .maybeSingle()

    if (data) {
      localStorage.setItem('dq_user', JSON.stringify(data))
      router.push('/app')
    } else {
      errorMessage.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    }
  } catch (e) {
    errorMessage.value = 'Ocurrió un error inesperado. Inténtalo de nuevo.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Completa los campos para registrarte'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const hash = hashPassword(password.value)

    const { data: existing } = await supabase
      .from('usuarios2')
      .select().eq('email', email.value).maybeSingle()

    if (existing) {
      errorMessage.value = 'Este correo ya se encuentra registrado'
    } else {
      const { error } = await supabase.from('usuarios2').insert({
        email: email.value,
        password: hash
      })
      if (!error) {
        errorMessage.value = '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.'
      } else {
        errorMessage.value = 'No se pudo crear la cuenta. Inténtalo más tarde.'
      }
    }
  } catch (e) {
    errorMessage.value = 'Error en el registro: ' + e.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Animated background elements -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <div class="login-container">
      <div class="login-card">
        <header class="card-header">
          <div class="logo-area">
            <div class="logo-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                stroke-linejoin="round" class="logo-svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1>DuQuen</h1>
          </div>
          <p class="tagline">Gestión inteligente de tus finanzas</p>
        </header>

        <main class="form-body">
          <div v-if="errorMessage" class="alert" :class="{ 'alert-success': errorMessage.includes('éxito') }">
            {{ errorMessage }}
          </div>

          <div class="input-root">
            <label for="email">Email</label>
            <div class="input-container">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input id="email" v-model="email" type="email" placeholder="tu@correo.com" @keyup.enter="handleLogin"
                autocomplete="email" />
            </div>
          </div>

          <div class="input-root">
            <label for="password">Contraseña</label>
            <div class="input-container">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                @keyup.enter="handleLogin" autocomplete="current-password" />
              <button class="toggle-password" @click="showPassword = !showPassword" type="button">
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn-primary" @click="handleLogin" :disabled="isLoading">
              <span v-if="isLoading" class="loader"></span>
              <span v-else>Entrar</span>
            </button>

            <button class="btn-ghost" @click="handleRegister" :disabled="isLoading">
              Crear cuenta
            </button>
          </div>
        </main>

        <footer class="card-footer">
          <p>&copy; 2025 Gastos DuQuen &bull; v1.0</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.login-page {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-page: #f9fafb;
  --text-main: #111827;
  --text-muted: #6b7280;
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --border: #e5e7eb;
  --error: #ef4444;
  --success: #10b981;

  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-page);
  font-family: 'Plus Jakarta Sans', sans-serif;
  position: relative;
  overflow: hidden;
  color: var(--text-main);
}

/* Subtle background decoration */
.bg-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.4;
}

.bg-glow-1 {
  background: #e0e7ff;
  top: -100px;
  right: -50px;
}

.bg-glow-2 {
  background: #fdf2f8;
  bottom: -100px;
  left: -50px;
}

.login-container {
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: 1rem;
}

.login-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  padding: 2rem 2.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.logo-box {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-svg {
  width: 18px;
  height: 18px;
  color: white;
}

.card-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}

.tagline {
  color: var(--text-muted);
  font-size: 0.825rem;
  font-weight: 400;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  padding: 0.65rem 0.85rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
  font-size: 0.775rem;
  line-height: 1.4;
}

.alert-success {
  background: #f0fdf4;
  border-color: #dcfce7;
  color: #166534;
}

.input-root {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-root label {
  font-size: 0.775rem;
  font-weight: 600;
  color: #374151;
  margin-left: 0.15rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.2s ease;
}

.input-container input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.75rem;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 0.85rem;
  color: var(--text-main);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input-container input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-container input:focus+.input-icon {
  color: var(--primary);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}

.toggle-password:hover {
  color: #6b7280;
}

.toggle-password svg {
  width: 16px;
  height: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.85rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 0.85rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover:not(:disabled) {
  background: #f9fafb;
  color: var(--text-main);
}

.card-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.card-footer p {
  font-size: 0.725rem;
  color: var(--text-muted);
  margin: 0;
}

/* Loader */
.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile Adjustments */
@media (max-width: 480px) {
  .login-card {
    padding: 1.75rem 1.5rem;
    border-radius: 1.25rem;
  }
}
</style>