<template>
  <div class="modal">
    <div class="modal-content">
      <h3 v-if="mode === 'detail'">Detail Member</h3>
      <h3 v-else>Edit Member</h3>

      <div v-if="mode === 'detail'">
        <p><b>Nama:</b> {{ member.nama }}</p>
        <p><b>No KTP:</b> {{ member.no_ktp }}</p>
        <p><b>Tanggal Lahir:</b> {{ formatDate(member.tgl_lahir) }}</p>
        <p><b>Alamat:</b> {{ member.alamat }}</p>
      </div>

      <div v-else>
        <form @submit.prevent="updateMember">
          <div class="mb-2">
            <label>Nama:</label>
            <input v-model="form.nama" class="form-control" required />
          </div>
          <div class="mb-2">
            <label>No KTP:</label>
            <input v-model="form.no_ktp" class="form-control" required />
          </div>
          <div class="mb-2">
            <label>Tanggal Lahir:</label>
            <input v-model="form.tgl_lahir" type="date" class="form-control" required />
          </div>
          <div class="mb-2">
            <label>Alamat:</label>
            <textarea v-model="form.alamat" class="form-control" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </form>
      </div>

      <button class="btn btn-secondary mt-3" @click="$emit('close')">Tutup</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: ['member', 'mode'],
  data() {
    return {
      form: {
        nama: '',
        no_ktp: '',
        tgl_lahir: '',
        alamat: ''
      }
    }
  },
  watch: {
    member: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form.nama = newVal.nama
          this.form.no_ktp = newVal.no_ktp
          this.form.tgl_lahir = newVal.tgl_lahir
          this.form.alamat = newVal.alamat
        }
      }
    }
  },
  methods: {
    async updateMember() {
      try {
        await axios.put(
          `http://45.64.100.26:88/perpus-api/public/api/member/${this.member.id}`,
          this.form,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        this.$emit('refresh')
        this.$emit('close')
      } catch (error) {
        console.error('Gagal update member:', error)
        alert('Gagal menyimpan perubahan.')
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap');

* {
  font-family: 'Ubuntu', sans-serif;
  font-weight: 400;
  box-sizing: border-box;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(30, 30, 60, 0.7);
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #f8f9fc;
  color: #343a40;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #4e73df;
  text-align: center;
}

.modal-content p {
  margin-bottom: 0.8rem;
  line-height: 1.4;
}

label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: block;
  color: #343a40;
}

input,
textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  margin-top: 0.2rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background-color: #fff;
  font-size: 0.95rem;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #4e73df;
  box-shadow: 0 0 0 2px rgba(78, 115, 223, 0.25);
}

button {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #4e73df;
  border: none;
  color: white;
  width: 100%;
  margin-top: 1rem;
}

.btn-primary:hover {
  background-color: #375ab7;
}

.btn-secondary {
  background-color: #e2e6ea;
  border: none;
  color: #333;
  width: 100%;
  margin-top: 1rem;
}

.btn-secondary:hover {
  background-color: #d1d3e2;
}
</style>