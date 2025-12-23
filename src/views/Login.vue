<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import SHA256 from 'crypto-js/sha256'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const router = useRouter()

const hashPassword = (pass) => SHA256(pass).toString()

const handleLogin = async () => {
  isLoading.value = true
  try {
    const hash = hashPassword(password.value)
    const { data, error } = await supabase
      .from('usuarios2')
      .select()
      .eq('email', email.value)
      .eq('password', hash)
      .maybeSingle()

    if (data) {
      // Guardamos sesión simple en localStorage para persistencia básica
      localStorage.setItem('dq_user', JSON.stringify(data))
      router.push('/app')
    } else {
      alert('Credenciales incorrectas')
    }
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!email.value || !password.value) return alert('Completa los campos')
  isLoading.value = true
  try {
    const hash = hashPassword(password.value)

    // Verificar si existe
    const { data: existing } = await supabase
      .from('usuarios2')
      .select().eq('email', email.value).maybeSingle()

    if (existing) {
      alert('Correo ya registrado')
    } else {
      const { error } = await supabase.from('usuarios2').insert({
        email: email.value,
        password: hash
      })
      if (!error) alert('Registrado. Por favor inicia sesión.')
    }
  } catch (e) {
    alert('Error registro: ' + e.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-wrap">
      <div class="login-card">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-icon">Q</span>
          </div>
          <h1>Gastos DuQuen</h1>
          <p class="subtitle">Bienvenido, por favor ingresa tus credenciales</p>
        </div>

        <div class="form-content">
          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-wrapper">
              <input id="email" v-model="email" type="email" placeholder="nombre@ejemplo.com"
                @keyup.enter="handleLogin" />
            </div>
          </div>

          <div class="input-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <input id="password" v-model="password" type="password" placeholder="••••••••"
                @keyup.enter="handleLogin" />
            </div>
          </div>

          <div class="actions">
            <button class="primary-btn" @click="handleLogin" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Iniciar Sesión</span>
            </button>

            <div class="divider">
              <span>o continúa con</span>
            </div>

            <button class="secondary-btn" @click="handleRegister" :disabled="isLoading">
              Crear cuenta nueva
            </button>
          </div>
        </div>
      </div>

      <p class="copyright">© 2025 Gastos DuQuen. Todos los derechos reservados.</p>
    </div>
  </div>
</template>

<style scoped>
/* Reset & Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  padding: 1.5rem;
  color: #1e293b;
}

/* Wrapper to center content and hold footer */
.login-wrap {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Section */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-circle {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
}

.logo-icon {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.925rem;
  margin: 0;
  line-height: 1.5;
}

/* Form Styles */
.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  color: #0f172a;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

/* Actions */
.actions {
  margin-top: 1.5rem;
}

.primary-btn {
  width: 100%;
  padding: 0.875rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.primary-btn:hover:not(:disabled) {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(0);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.25rem 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 10px;
}

.secondary-btn {
  width: 100%;
  padding: 0.875rem;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

.copyright {
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: center;
  margin: 0;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-container {
    padding: 0;
    align-items: flex-end;
    /* Sheet style or full screen */
  }

  .login-card {
    border-radius: 1.5rem 1.5rem 0 0;
    padding: 2rem 1.5rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    /* Make it fill easier on tiny screens */
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .login-wrap {
    max-width: none;
    height: 100%;
    justify-content: flex-end;
    gap: 0;
  }

  .copyright {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
}
</style>