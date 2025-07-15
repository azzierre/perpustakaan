<template>
  <div class="container">
    <header class="page-header">
      <h1 class="page-title">Manajemen Peminjaman</h1>
      <div class="header-actions">
        <button
          @click="showForm = true"
          v-if="!showForm"
          class="btn btn-primary"
        >
          <span class="btn-icon">+</span>
          Tambah Data
        </button>
        <button
          @click="exportExcel"
          class="btn btn-secondary"
        >
          <span class="btn-icon">↓</span>
          Export Excel
        </button>
      </div>
    </header>

    <!-- Chart Section -->
    <!-- <section class="chart-section">
      <div class="section-header">
        <h2 class="section-title">Grafik Peminjaman</h2>
        <select 
          v-model="selectedYear" 
          @change="updateChartData"
          class="year-selector"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </section> -->

    <!-- Form Section -->
    <section v-if="showForm" class="form-section">
      <form @submit.prevent="isEditing ? updatePeminjaman() : addPeminjaman()" class="form">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Member</label>
            <select v-model="form.id_member" class="form-input" required>
              <option disabled value="">Pilih Member</option>
              <option v-for="member in members" :key="member.id" :value="member.id">
                {{ member.nama }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Buku</label>
            <select v-model="form.id_buku" class="form-input" required>
              <option disabled value="">Pilih Buku</option>
              <option v-for="buku in books" :key="buku.id" :value="buku.id">
                {{ buku.judul }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal Pinjam</label>
            <input type="date" v-model="form.tgl_pinjam" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal Pengembalian</label>
            <input type="date" v-model="form.tgl_pengembalian" class="form-input" required />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Update' : 'Tambah' }}
          </button>
          <button @click="cancelForm" type="button" class="btn btn-outline">
            Batal
          </button>
        </div>
      </form>
    </section>

    <!-- Table Section -->
    <section class="table-section">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Member</th>
              <th>Buku</th>
              <th>Tgl Pinjam</th>
              <th>Tgl Kembali</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in peminjaman" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ findMemberName(item.id_member) }}</td>
              <td>{{ findBookTitle(item.id_buku) }}</td>
              <td>{{ formatDate(item.tgl_pinjam) }}</td>
              <td>{{ formatDate(item.tgl_pengembalian) }}</td>
              <td>
                <span class="status-badge" :class="item.status_pengembalian == 1 ? 'status-returned' : 'status-pending'">
                  {{ item.status_pengembalian == 1 ? 'Dikembalikan' : 'Belum Dikembalikan' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: "PeminjamanView",
  data() {
    return {
      peminjaman: [],
      members: [],
      books: [],
      isEditing: false,
      showForm: false,
      selectedYear: new Date().getFullYear(),
      availableYears: [],
      chart: null,
      form: {
        id: null,
        id_member: "",
        id_buku: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
        status_pengembalian: 0,
      },
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    exportExcel() {
      const data = this.peminjaman.map((item) => ({
        No: this.peminjaman.indexOf(item) + 1,
        Member: this.findMemberName(item.id_member),
        Buku: this.findBookTitle(item.id_buku),
        'Tgl Pinjam': this.formatDate(item.tgl_pinjam),
        'Tgl Kembali': this.formatDate(item.tgl_pengembalian),
        Status: item.status_pengembalian == 1 ? "Dikembalikan" : "Belum Dikembalikan",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(dataBlob, "data_peminjaman.xlsx");
    },
    async fetchPeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://45.64.100.26:88/perpus-api/public/api/peminjaman",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.peminjaman = res.data.data || res.data;
        this.extractAvailableYears();
        this.prepareChartData();
      } catch (err) {
        console.error("❌ Gagal ambil peminjaman", err);
        alert("Gagal mengambil data peminjaman");
      }
    },
    async fetchMembers() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://45.64.100.26:88/perpus-api/public/api/member",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.members = res.data.data || res.data;
      } catch (err) {
        console.error("❌ Gagal ambil member", err);
      }
    },
    async fetchBooks() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://45.64.100.26:88/perpus-api/public/api/buku",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.books = res.data.data || res.data;
      } catch (err) {
        console.error("❌ Gagal ambil buku", err);
      }
    },
    async addPeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const payload = {
          id_member: this.form.id_member,
          id_buku: this.form.id_buku,
          tgl_pinjam: this.form.tgl_pinjam,
          tgl_pengembalian: this.form.tgl_pengembalian,
          status_pengembalian: 0,
        };
        await axios.post(
          "http://45.64.100.26:88/perpus-api/public/api/peminjaman",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Peminjaman berhasil ditambahkan");
        this.cancelForm();
        this.fetchPeminjaman();
      } catch (err) {
        console.error("❌ Gagal tambah peminjaman", err.response?.data || err);
        alert("Gagal menambahkan peminjaman");
      }
    },
    async updatePeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const payload = {
          id_member: this.form.id_member,
          id_buku: this.form.id_buku,
          tgl_pinjam: this.form.tgl_pinjam,
          tgl_pengembalian: this.form.tgl_pengembalian,
        };
        await axios.put(
          `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${this.form.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Peminjaman berhasil diperbarui");
        this.cancelForm();
        this.fetchPeminjaman();
      } catch (err) {
        console.error("❌ Gagal update peminjaman", err.response?.data || err);
        alert("Gagal memperbarui peminjaman");
      }
    },
    async deletePeminjaman(id) {
      if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
      
      const token = localStorage.getItem("token");
      try {
        await axios.delete(
          `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Peminjaman berhasil dihapus");
        this.fetchPeminjaman();
      } catch (err) {
        console.error("❌ Gagal hapus peminjaman", err.response?.data || err);
        alert("Gagal menghapus peminjaman");
      }
    },
    cancelForm() {
      this.isEditing = false;
      this.showForm = false;
      this.form = {
        id: null,
        id_member: "",
        id_buku: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
        status_pengembalian: 0,
      };
    },
    editPeminjaman(item) {
      this.isEditing = true;
      this.showForm = true;
      this.form = {
        id: item.id,
        id_member: item.id_member?.id || item.id_member,
        id_buku: item.id_buku?.id || item.id_buku,
        tgl_pinjam: item.tgl_pinjam,
        tgl_pengembalian: item.tgl_pengembalian,
        status_pengembalian: item.status_pengembalian || 0,
      };
    },
    findMemberName(id) {
      const member = this.members.find((m) => m.id == id);
      return member?.nama || "Tidak Diketahui";
    },
    findBookTitle(id) {
      const buku = this.books.find((b) => b.id == id);
      return buku?.judul || "Tidak Diketahui";
    },
    extractAvailableYears() {
      const years = new Set();
      this.peminjaman.forEach(item => {
        if (item.tgl_pinjam) {
          const date = new Date(item.tgl_pinjam);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        }
      });
      this.availableYears = Array.from(years).sort((a, b) => b - a);
      if (this.availableYears.length === 0) {
        this.availableYears.push(new Date().getFullYear());
      }
      this.selectedYear = this.availableYears[0];
    },
    prepareChartData() {
      if (!this.$refs.chartCanvas) return;

      if (this.chart) {
        this.chart.destroy();
      }

      const filteredData = this.peminjaman.filter(item => {
        if (!item.tgl_pinjam) return false;
        const year = new Date(item.tgl_pinjam).getFullYear();
        return year === this.selectedYear;
      });

      const monthlyCounts = Array(12).fill(0);
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];

      filteredData.forEach(item => {
        if (item.tgl_pinjam) {
          const month = new Date(item.tgl_pinjam).getMonth();
          monthlyCounts[month]++;
        }
      });

      const ctx = this.$refs.chartCanvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthNames,
          datasets: [{
            label: `Peminjaman ${this.selectedYear}`,
            data: monthlyCounts,
            backgroundColor: '#2563eb',
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f1f5f9'
              },
              ticks: {
                precision: 0,
                color: '#64748b'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b'
              }
            }
          }
        }
      });
    },
    updateChartData() {
      this.prepareChartData();
    },
  },
  mounted() {
    this.fetchPeminjaman();
    this.fetchMembers();
    this.fetchBooks();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
/* Global Styles */
* {
  box-sizing: border-box;
}

/* Container */
.container {
  padding: 2rem;
  background-color: #f7f7f7; /* abu muda sangat terang */
  min-height: 100vh;
  color: #444444; /* abu gelap untuk teks */
}

@media (max-width: 768px) {
  .member-page {
    margin-left: 0;
    padding: 1rem;
  }
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #d1d1d1; /* abu muda garis */
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #555555; /* abu sedang */
  margin: 0;
  letter-spacing: -0.025em;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #b0b0b0; /* abu muda medium */
  color: #222222; /* teks gelap */
}

.btn-primary:hover {
  background: #8c8c8c; /* abu sedikit lebih gelap */
  transform: translateY(-1px);
}

.btn-secondary {
  background: #999999;
  color: #f1f1f1;
}

.btn-secondary:hover {
  background: #7a7a7a;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #777777;
  border: 1px solid #bbb;
}

.btn-outline:hover {
  background: #e5e5e5;
  border-color: #999999;
}

.btn-icon {
  font-size: 1rem;
  font-weight: 600;
}

/* Sections */
section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(170, 170, 170, 0.2); /* shadow abu muda */
  border: 1px solid #dcdcdc;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #555555;
  margin: 0;
}

/* Chart */
.chart-container {
  height: 400px;
  position: relative;
}

.year-selector {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  background: white;
  color: #666666;
  font-size: 0.875rem;
  cursor: pointer;
}

.year-selector:focus {
  outline: none;
  border-color: #999999;
  box-shadow: 0 0 0 3px rgba(170, 170, 170, 0.3);
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: #666666;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: #444444;
}

.form-input:focus {
  outline: none;
  border-color: #999999;
  box-shadow: 0 0 0 3px rgba(170, 170, 170, 0.3);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f1f1;
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #dcdcdc;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f9f9f9;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #666666;
  font-size: 0.875rem;
  border-bottom: 1px solid #dcdcdc;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f1f1;
  color: #555555;
  font-size: 0.875rem;
}

.data-table tr:hover {
  background: #f0f0f0;
}

.data-table tr:last-child td {
  border-bottom: none;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.status-returned {
  background: #d7e5d7; /* abu muda kehijauan */
  color: #3a5a3a;
}

.status-pending {
  background: #f7e8c1; /* abu muda kekuningan */
  color: #7a601a;
}

/* Responsive */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .btn {
    flex: 1;
  }

  .section-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .chart-container {
    height: 300px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
