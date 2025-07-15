<template>
  <div class="buku-page">
    <h1>𝐃𝐚𝐟𝐭𝐚𝐫 𝐁𝐮𝐤𝐮</h1>

    <button @click="openForm()" class="btn-add">+ Tambah Buku</button>

    <!-- Form tambah/edit buku -->
    <div v-if="showForm" class="form-add-buku">
      <h3>{{ isEditMode ? 'Edit Buku' : 'Tambah Buku Baru' }}</h3>
      <form @submit.prevent="submitbuku">
        <div>
          <label>No Rak:</label>
          <input v-model="form.no_rak" required />
        </div>
        <div>
          <label>Judul:</label>
          <input v-model="form.judul" required />
        </div>
        <div>
          <label>Pengarang:</label>
          <input v-model="form.pengarang" required />
        </div>
        <div>
          <label>Penerbit:</label>
          <input v-model="form.penerbit" required />
        </div>
        <div>
          <label>Tahun Terbit:</label>
          <input v-model="form.tahun_terbit" type="number" required />
        </div>
        <div>
          <label>Stok:</label>
          <input v-model="form.stok" type="number" required />
        </div>
        <div>
          <label>Detail:</label>
          <textarea v-model="form.detail" rows="3"></textarea>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan') }}</button>
        <button type="button" @click="cancelForm" :disabled="loading">Batal</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>

    <!-- Tabel buku -->
    <table class="buku-table">
      <thead>
        <tr>
          <th>No Rak</th>
          <th>Judul</th>
          <th>Pengarang</th>
          <th>Penerbit</th>
          <th>Tahun</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="bukus.length === 0">
          <td colspan="7" style="text-align:center; color:#888;">Belum ada data buku</td>
        </tr>
        <tr v-for="buku in bukus" :key="buku.id">
          <td>{{ buku.no_rak }}</td>
          <td>{{ buku.judul }}</td>
          <td>{{ buku.pengarang }}</td>
          <td>{{ buku.penerbit }}</td>
          <td>{{ buku.tahun_terbit }}</td>
          <td>{{ buku.stok }}</td>
          <td class="action-cell">
            <button @click="viewDetail(buku)" class="btn-action detail">Lihat</button>
            <button @click="editbuku(buku)" class="btn-action edit">Edit</button>
            <button @click="deletebuku(buku)" class="btn-action delete">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Detail -->
    <div v-if="selectedbuku" class="modal-overlay" @click.self="selectedbuku = null">
      <div class="modal-content">
        <h3>Detail Buku</h3>
        <p><strong>No Rak:</strong> {{ selectedbuku.no_rak }}</p>
        <p><strong>Judul:</strong> {{ selectedbuku.judul }}</p>
        <p><strong>Pengarang:</strong> {{ selectedbuku.pengarang }}</p>
        <p><strong>Penerbit:</strong> {{ selectedbuku.penerbit }}</p>
        <p><strong>Tahun Terbit:</strong> {{ selectedbuku.tahun_terbit }}</p>
        <p><strong>Stok:</strong> {{ selectedbuku.stok }}</p>
        <p><strong>Detail:</strong> {{ selectedbuku.detail || '-' }}</p>
        <button @click="selectedbuku = null">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "bukuView",
  data() {
    return {
      showForm: false,
      isEditMode: false,
      loading: false,
      errorMessage: "",
      successMessage: "",
      selectedbuku: null,
      form: {
        id: null,
        no_rak: "",
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
      },
      bukus: [],
    };
  },
  mounted() {
    this.fetchbukus();
  },
  methods: {
    openForm() {
      this.showForm = true;
      this.isEditMode = false;
      this.resetForm();
    },
    async fetchbukus() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://45.64.100.26:88/perpus-api/public/api/buku", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.bukus = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        this.errorMessage = "Gagal mengambil data buku.";
      }
    },
    async submitbuku() {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";
      const token = localStorage.getItem("token");

      try {
        const formData = new FormData();
        for (let key in this.form) {
          if (key === "tahun_terbit" || key === "stok") {
            formData.append(key, parseInt(this.form[key]));
          } else {
            formData.append(key, this.form[key]);
          }
        }

        if (this.isEditMode && this.form.id) {
          await axios.post(
            `http://45.64.100.26:88/perpus-api/public/api/buku/${this.form.id}?_method=PUT`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          this.successMessage = "Buku berhasil diperbarui.";
        } else {
          await axios.post(
            "http://45.64.100.26:88/perpus-api/public/api/buku",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          this.successMessage = "Buku berhasil ditambahkan.";
        }

        this.fetchbukus();
        this.cancelForm();
      } catch (err) {
        console.error(err.response?.data || err.message);
        this.errorMessage = "Gagal menyimpan data buku.";
      } finally {
        this.loading = false;
      }
    },
    editbuku(buku) {
      this.form = JSON.parse(JSON.stringify(buku)); // deep copy
      this.isEditMode = true;
      this.showForm = true;
      this.errorMessage = "";
      this.successMessage = "";
    },
    async deletebuku(buku) {
      const konfirmasi = confirm(`Hapus buku "${buku.judul}"?`);
      if (!konfirmasi) return;

      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `http://45.64.100.26:88/perpus-api/public/api/buku/${buku.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.successMessage = "Buku berhasil dihapus.";
        this.fetchbukus();
      } catch (err) {
        this.errorMessage = "Gagal menghapus buku.";
      }
    },
    viewDetail(buku) {
      this.selectedbuku = buku;
    },
    cancelForm() {
      this.resetForm();
      this.showForm = false;
      this.isEditMode = false;
      this.errorMessage = "";
      this.successMessage = "";
    },
    resetForm() {
      this.form = {
        id: null,
        no_rak: "",
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
      };
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.buku-page {
  padding: 2rem;
  background-color: #f5f5f7; /* Light gray background */
  min-height: 100vh;
  color: #4a4a4a;
}

@media (max-width: 768px) {
  .member-page {
    margin-left: 0;
    padding: 1rem;
  }
}

h1 {
  font-size: 2.5rem;
  color: #2f2f2f;
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: -0.02em;
}

.btn-add {
  background: #a0aec0; /* soft gray-blue */
  color: #1a1a1a;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(60, 60, 60, 0.1);
}

.btn-add:hover {
  background: #7b8794; /* darker gray */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(60, 60, 60, 0.15);
}

.form-add-buku {
  background: #fafafa;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #d9d9d9;
}

.form-add-buku h3 {
  margin: 0 0 1.5rem 0;
  color: #3a3a3a;
  font-weight: 500;
  font-size: 1.25rem;
}

.form-add-buku div {
  margin-bottom: 1rem;
}

.form-add-buku label {
  display: block;
  margin-bottom: 0.5rem;
  color: #7a7a7a;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-add-buku input,
.form-add-buku textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f9f9f9;
}

.form-add-buku input:focus,
.form-add-buku textarea:focus {
  outline: none;
  border-color: #a0aec0;
  background: white;
  box-shadow: 0 0 0 3px rgba(160, 174, 192, 0.3);
}

.form-add-buku button {
  background: #606060;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 10px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.form-add-buku button:hover:not(:disabled) {
  background: #4a4a4a;
}

.form-add-buku button[type="button"] {
  background: #8a8a8a;
}

.form-add-buku button[type="button"]:hover:not(:disabled) {
  background: #6e6e6e;
}

.form-add-buku button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buku-table {
  width: 100%;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #d9d9d9;
}

.buku-table th,
.buku-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.buku-table th {
  background: #f2f2f2;
  font-weight: 600;
  color: #3a3a3a;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.buku-table tbody tr {
  transition: background-color 0.15s ease;
}

.buku-table tbody tr:hover {
  background: #e8e8e8;
}

.buku-table tbody tr:last-child td {
  border-bottom: none;
}

.action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  color: white;
}

.btn-action.detail {
  background: #7b7b7b;
}

.btn-action.detail:hover {
  background: #5e5e5e;
}

.btn-action.edit {
  background: #9a9a9a;
}

.btn-action.edit:hover {
  background: #7d7d7d;
}

.btn-action.delete {
  background: #b0b0b0;
}

.btn-action.delete:hover {
  background: #8e8e8e;
}

.error {
  color: #b00020;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 12px;
  background: #f8d7da;
  border-radius: 6px;
  border-left: 4px solid #b00020;
}

.success {
  color: #27632a;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 12px;
  background: #dff0d8;
  border-radius: 6px;
  border-left: 4px solid #27632a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 128, 128, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 12px;
  width: 450px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: modalAppear 0.2s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: #3a3a3a;
  font-weight: 500;
  font-size: 1.25rem;
}

.modal-content p {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: #666666;
}

.modal-content strong {
  color: #3a3a3a;
  font-weight: 600;
}

.modal-content button {
  margin-top: 1.5rem;
  padding: 12px 24px;
  background: #606060;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.modal-content button:hover {
  background: #4a4a4a;
}

@media (max-width: 768px) {
  .buku-page {
    padding: 1rem;
  }
  
  .buku-table {
    font-size: 0.9rem;
  }
  
  .buku-table th,
  .buku-table td {
    padding: 12px 8px;
  }
  
  .action-cell {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-action {
    width: 100%;
    text-align: center;
  }
}
</style>
