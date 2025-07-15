<template>
  <div class="container">
    <form v-if="!isLoggedIn" class="card mx-auto my-5 p-4" style="max-width: 400px;" @submit.prevent="handleLogin">
      <!-- Error message -->
      <div v-if="errorMsg" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMsg }}
      </div>

      <!-- Loading message -->
      <div v-if="loading" class="alert alert-info" role="alert">
        <i class="bi bi-hourglass-split"></i> Sedang mengidentifikasi akun anda...
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="inputEmail" class="form-label">Email</label>
        <input type="email" class="form-control" id="inputEmail" v-model="email" placeholder="Masukkan Email" required />
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="inputPassword" class="form-label">Password</label>
        <input type="password" class="form-control" id="inputPassword" v-model="password"
          autocomplete="current-password" placeholder="Masukkan Password" required />
      </div>

      <!-- Submit button -->
      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <i class="bi bi-box-arrow-in-right"></i> Login
      </button>
    </form>

    <!-- Redirect message for logged in users -->
    <div v-if="isLoggedIn" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Mengarahkan ke halaman member...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

// Setup axios interceptor untuk handle unauthorized
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      errorMsg: '',
      loading: false,
      isLoggedIn: false,
    }
  },
  methods: {
    async handleLogin() {
      this.errorMsg = ''
      this.loading = true

      try {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']

        const response = await axios.post(
          'http://45.64.100.26:88/perpus-api/public/api/login',
          {
            email: this.email.trim(),
            password: this.password,
          },
          {
            validateStatus: status => status < 500
          }
        )

        if (response.status === 200 && response.data.token) {
          const token = response.data.token

          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          try {
            await axios.get('http://45.64.100.26:88/perpus-api/public/api/member')
            this.isLoggedIn = true
            this.$router.push('/dashboard')
          } catch (verifyError) {
            console.error('Token verification failed:', verifyError)
            this.errorMsg = 'Gagal memverifikasi sesi. Silakan coba lagi.'
            localStorage.removeItem('token')
          }
        } else {
          if (response.data && response.data.message) {
            this.errorMsg = response.data.message
          } else if (response.status === 401) {
            this.errorMsg = 'Email atau password salah'
          } else if (response.status === 422) {
            this.errorMsg = 'Format email tidak valid'
          } else {
            this.errorMsg = 'Terjadi kesalahan pada server. Silakan coba lagi.'
          }
        }
      } catch (err) {
        console.error('Login error:', err)
        if (err.response) {
          if (err.response.status === 401) {
            this.errorMsg = 'Email atau password salah'
          } else if (err.response.status === 422) {
            this.errorMsg = 'Format email tidak valid'
          } else if (err.response.data && err.response.data.message) {
            this.errorMsg = err.response.data.message
          } else {
            this.errorMsg = `Terjadi kesalahan (${err.response.status})`
          }
        } else if (err.request) {
          this.errorMsg = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        } else {
          this.errorMsg = 'Terjadi kesalahan saat memproses permintaan.'
        }
      } finally {
        this.loading = false
      }
    },

    async verifyToken(token) {
      try {
        await axios.get(
          'http://45.64.100.26:88/perpus-api/public/api/member',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      } catch (err) {
        console.error('Token verification failed:', err)
        throw new Error('Token tidak valid')
      }
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')

    if (token) {
      this.loading = true
      try {
        await this.verifyToken(token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.isLoggedIn = true
        this.$router.push('/members')
      } catch (err) {
        console.error('Mounted token check failed:', err)
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap');

* {
  font-family: 'Ubuntu', sans-serif;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #e4e4e4, #f8f8f8);
  position: relative;
}

/* Wave background decoration */
.container::before {
  content: "";
  position: absolute;
  top: 0;
  left: -50px;
  width: 150%;
  height: 100%;
  background: radial-gradient(circle at 20% 20%, #d3d3d3 10%, transparent 40%),
              radial-gradient(circle at 80% 80%, #c4c4c4 10%, transparent 40%);
  opacity: 0.3;
  z-index: 0;
}

.card {
  position: relative;
  background-color: #ffffff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

h3 {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #444;
}

label {
  font-weight: 600;
  color: #555;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 0.6rem;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.15rem rgba(108, 117, 125, 0.25);
}

.btn-primary {
  background-color: #6c757d;
  border-color: #6c757d;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.6rem;
  transition: background-color 0.3s, transform 0.2s ease-in-out;
}

.btn-primary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.alert {
  border-radius: 8px;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: none;
}

.alert-info {
  background-color: #e2e3e5;
  color: #41464b;
  border: none;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}
</style>

