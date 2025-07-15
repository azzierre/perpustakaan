<template>
  <div class="return-page">
    <div class="page-header">
      <h1>𝐃𝐚𝐟𝐭𝐚𝐫 𝐏𝐞𝐧𝐠𝐞𝐦𝐛𝐚𝐥𝐢𝐚𝐧 𝐁𝐮𝐤𝐮</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-secondary">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="row">
        <div class="col-md-4">
          <label class="form-label">Filter Status</label>
          <select v-model="statusFilter" class="form-select">
            <option value="">Semua Status</option>
            <option value="belum">Belum Dikembalikan</option>
            <option value="sudah">Sudah Dikembalikan</option>
            <option value="terlambat">Terlambat</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Cari Buku/Member</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Masukkan judul buku atau nama member"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label">Rentang Tanggal</label>
          <input v-model="dateFilter" type="date" class="form-control" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data pengembalian...</p>
    </div>

    <!-- Table Section -->
    <div v-if="!isLoading" class="table-section">
      <div class="table-header">
        <h3>Data Pengembalian</h3>
        <div class="table-actions">
          <button @click="exportData" class="btn btn-outline-primary btn-sm">
            <i class="fas fa-download"></i> Export
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="return-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul Buku</th>
              <th>Nama Member</th>
              <th>Tanggal Pinjam</th>
              <th>Tanggal Jatuh Tempo</th>
              <th>Tanggal Kembali</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-if="filteredReturns.length === 0">
              <td colspan="8" class="no-data">
                <div class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <p>Belum ada data pengembalian</p>
                </div>
              </td>
            </tr>
            <tr
              v-for="(item, index) in paginatedReturns"
              :key="item.id"
              :class="getRowClass(item)"
            >
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>
                <div class="book-info">
                  <strong>{{ item.book_title }}</strong>
                  <small class="text-muted d-block"
                    >ID: {{ item.id_buku }}</small
                  >
                </div>
              </td>
              <td>
                <div class="member-info">
                  <strong>{{ item.member_name }}</strong>
                  <small class="text-muted d-block"
                    >ID: {{ item.id_member }}</small
                  >
                </div>
              </td>
              <td>{{ formatDate(item.tgl_pinjam) }}</td>
              <td :class="{ 'text-danger': isOverdue(item.tgl_jatuh_tempo) }">
                {{ formatDate(item.tgl_jatuh_tempo) || "-" }}
                <span
                  v-if="
                    isOverdue(item.tgl_jatuh_tempo) &&
                    !item.status_pengembalian
                  "
                  class="badge bg-danger ms-2"
                >
                  {{ calculateDaysLate(item.tgl_jatuh_tempo) }} hari
                </span>
              </td>
              <td>
                {{
                  item.tgl_pengembalian
                    ? formatDate(item.tgl_pengembalian)
                    : "-"
                }}
              </td>
              <td>
                <span
                  v-if="item.status_pengembalian"
                  class="badge bg-success"
                >
                  Sudah Dikembalikan
                </span>
                <span
                  v-else-if="isOverdue(item.tgl_jatuh_tempo)"
                  class="badge bg-danger"
                >
                  Terlambat
                </span>
                <span v-else class="badge bg-warning">
                  Belum Dikembalikan
                </span>
              </td>
              <td>
                <div class="actions">
                  <button
                    @click="showReturnModal(item)"
                    class="btn btn-info btn-sm"
                    title="Lihat Detail"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    v-if="!item.status_pengembalian"
                    @click="processReturn(item)"
                    class="btn btn-primary btn-sm"
                    title="Proses Pengembalian"
                    :disabled="item.processing"
                  >
                    <i class="fas fa-spinner fa-spin" v-if="item.processing"></i>
                    <i class="fas fa-undo" v-else></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-section" v-if="totalPages > 1">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="goToPage(page)">
                {{ page }}
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button
                class="page-link"
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
          {{
            Math.min(currentPage * itemsPerPage, filteredReturns.length)
          }}
          of {{ filteredReturns.length }} entries
        </div>
      </div>
    </div>

    <!-- Return Process Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modalType === 'detail' ? 'Detail Peminjaman' : 'Proses Pengembalian' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="selectedItem">
              <div class="info-section">
                <h6>Informasi Buku</h6>
                <p><strong>Judul:</strong> {{ selectedItem.book_title }}</p>
                <p><strong>ID Buku:</strong> {{ selectedItem.id_buku }}</p>
              </div>
              
              <div class="info-section">
                <h6>Informasi Member</h6>
                <p><strong>Nama:</strong> {{ selectedItem.member_name }}</p>
                <p><strong>ID Member:</strong> {{ selectedItem.id_member }}</p>
              </div>
              
              <div class="info-section">
                <h6>Informasi Peminjaman</h6>
                <p><strong>Tanggal Pinjam:</strong> {{ formatDate(selectedItem.tgl_pinjam) }}</p>
                <p><strong>Tanggal Jatuh Tempo:</strong> {{ formatDate(selectedItem.tgl_jatuh_tempo) }}</p>
                <p v-if="selectedItem.tgl_pengembalian">
                  <strong>Tanggal Pengembalian:</strong> {{ formatDate(selectedItem.tgl_pengembalian) }}
                </p>
                <p v-if="isOverdue(selectedItem.tgl_jatuh_tempo) && !selectedItem.status_pengembalian">
                  <strong class="text-danger">Terlambat:</strong> 
                  <span class="badge bg-danger">{{ calculateDaysLate(selectedItem.tgl_jatuh_tempo) }} hari</span>
                </p>
              </div>

              <!-- Return Form -->
              <div v-if="modalType === 'return' && !selectedItem.status_pengembalian" class="return-form">
                <hr>
                <h6>Form Pengembalian</h6>
                <div class="form-group">
                  <label class="form-label">Tanggal Pengembalian</label>
                  <input 
                    v-model="returnForm.tgl_pengembalian" 
                    type="date" 
                    class="form-control"
                    :max="getCurrentDate()"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">Kondisi Buku</label>
                  <select v-model="returnForm.kondisi_buku" class="form-select">
                    <option value="">Pilih Kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                    <option value="hilang">Hilang</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Catatan (Opsional)</label>
                  <textarea 
                    v-model="returnForm.catatan" 
                    class="form-control" 
                    rows="3"
                    placeholder="Masukkan catatan jika diperlukan"
                  ></textarea>
                </div>
                <div v-if="calculateFine(selectedItem) > 0" class="fine-info">
                  <div class="alert alert-warning">
                    <strong>Denda Keterlambatan:</strong> 
                    Rp {{ formatCurrency(calculateFine(selectedItem)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Tutup
            </button>
            <button 
              v-if="modalType === 'return' && !selectedItem.status_pengembalian"
              type="button" 
              class="btn btn-primary" 
              @click="confirmReturn"
              :disabled="!isReturnFormValid || isProcessing"
            >
              <i class="fas fa-spinner fa-spin" v-if="isProcessing"></i>
              <i class="fas fa-check" v-else></i>
              Konfirmasi Pengembalian
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages">
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PengembalianListView",
  data() {
    return {
      returns: [],
      books: [],
      members: [],
      errorMessage: "",
      successMessage: "",
      isLoading: true,
      isProcessing: false,
      statusFilter: "",
      searchQuery: "",
      dateFilter: "",
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      modalType: 'detail', // 'detail' or 'return'
      selectedItem: null,
      returnForm: {
        tgl_pengembalian: '',
        kondisi_buku: '',
        catatan: ''
      },
      finePerDay: 1000 // Denda per hari dalam rupiah
    };
  },
  computed: {
    filteredReturns() {
      let filtered = this.returns.map(item => {
        const book = this.books.find(b => b.id == item.id_buku);
        const member = this.members.find(m => m.id == item.id_member);

        return {
          ...item,
          book_title: book?.judul || 'Buku tidak ditemukan',
          member_name: member?.nama || 'Member tidak ditemukan',
          tgl_jatuh_tempo: item.tgl_jatuh_tempo || this.calculateDueDate(item.tgl_pinjam),
          processing: false
        };
      });

      // Filter by status
      if (this.statusFilter) {
        filtered = filtered.filter(item => {
          switch (this.statusFilter) {
            case 'sudah':
              return item.status_pengembalian;
            case 'belum':
              return !item.status_pengembalian && !this.isOverdue(item.tgl_jatuh_tempo);
            case 'terlambat':
              return !item.status_pengembalian && this.isOverdue(item.tgl_jatuh_tempo);
            default:
              return true;
          }
        });
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          item.book_title.toLowerCase().includes(query) ||
          item.member_name.toLowerCase().includes(query)
        );
      }

      // Filter by date
      if (this.dateFilter) {
        filtered = filtered.filter(item =>
          item.tgl_pinjam && item.tgl_pinjam.startsWith(this.dateFilter)
        );
      }

      return filtered;
    },
    paginatedReturns() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredReturns.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredReturns.length / this.itemsPerPage);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    totalBooksLent() {
      return this.returns.length;
    },
    totalReturned() {
      return this.returns.filter(item => item.status_pengembalian).length;
    },
    totalPending() {
      return this.returns.filter(item => !item.status_pengembalian && !this.isOverdue(item.tgl_jatuh_tempo || this.calculateDueDate(item.tgl_pinjam))).length;
    },
    totalOverdue() {
      return this.returns.filter(item => !item.status_pengembalian && this.isOverdue(item.tgl_jatuh_tempo || this.calculateDueDate(item.tgl_pinjam))).length;
    },
    isReturnFormValid() {
      return this.returnForm.tgl_pengembalian && this.returnForm.kondisi_buku;
    }
  },
  mounted() {
    this.fetchAllData();
    // Set default return date to today
    this.returnForm.tgl_pengembalian = this.getCurrentDate();
  },
  methods: {
    async fetchAllData() {
      this.isLoading = true;
      try {
        const token = this.getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [peminjamanRes, booksRes, membersRes] = await Promise.all([
          axios.get("http://45.64.100.26:88/perpus-api/public/api/peminjaman", { headers }),
          axios.get("http://45.64.100.26:88/perpus-api/public/api/buku", { headers }),
          axios.get("http://45.64.100.26:88/perpus-api/public/api/member", { headers })
        ]);

        this.returns = peminjamanRes.data.data || peminjamanRes.data || [];
        this.books = booksRes.data.data || booksRes.data || [];
        this.members = membersRes.data.data || membersRes.data || [];

      } catch (err) {
        console.error("Error fetching data:", err);
        this.showMessage("Gagal mengambil data dari server.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    
    getToken() {
      // Try to get token from localStorage, sessionStorage, or return a default
      return typeof localStorage !== 'undefined' 
        ? localStorage.getItem("token") 
        : "your-auth-token-here";
    },

    showReturnModal(item) {
      this.selectedItem = { ...item };
      this.modalType = 'detail';
      this.showModal = true;
    },

    processReturn(item) {
      this.selectedItem = { ...item };
      this.modalType = 'return';
      this.showModal = true;
      
      // Reset form
      this.returnForm = {
        tgl_pengembalian: this.getCurrentDate(),
        kondisi_buku: 'baik',
        catatan: ''
      };
    },

    async confirmReturn() {
      if (!this.isReturnFormValid) {
        this.showMessage("Mohon lengkapi form pengembalian", "error");
        return;
      }

      this.isProcessing = true;
      
      try {
        const token = this.getToken();
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const returnData = {
          id_peminjaman: this.selectedItem.id,
          tgl_pengembalian: this.returnForm.tgl_pengembalian,
          kondisi_buku: this.returnForm.kondisi_buku,
          catatan: this.returnForm.catatan,
          denda: this.calculateFine(this.selectedItem)
        };

        // Update peminjaman status
        await axios.put(
          `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${this.selectedItem.id}`,
          {
            ...this.selectedItem,
            status_pengembalian: true,
            tgl_pengembalian: this.returnForm.tgl_pengembalian
          },
          { headers }
        );

        // Update local data
        const index = this.returns.findIndex(r => r.id === this.selectedItem.id);
        if (index !== -1) {
          this.returns[index] = {
            ...this.returns[index],
            status_pengembalian: true,
            tgl_pengembalian: this.returnForm.tgl_pengembalian
          };
        }

        this.showMessage("Pengembalian berhasil diproses!", "success");
        this.closeModal();

      } catch (err) {
        console.error("Error processing return:", err);
        this.showMessage("Gagal memproses pengembalian. Silakan coba lagi.", "error");
      } finally {
        this.isProcessing = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.selectedItem = null;
      this.modalType = 'detail';
      this.returnForm = {
        tgl_pengembalian: this.getCurrentDate(),
        kondisi_buku: '',
        catatan: ''
      };
    },

    calculateDueDate(pinjamDate) {
      if (!pinjamDate) return null;
      const date = new Date(pinjamDate);
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    },

    getCurrentDate() {
      return new Date().toISOString().split('T')[0];
    },

    calculateFine(item) {
      if (!item || item.status_pengembalian || !this.isOverdue(item.tgl_jatuh_tempo)) {
        return 0;
      }
      
      const daysLate = this.calculateDaysLate(item.tgl_jatuh_tempo);
      return daysLate * this.finePerDay;
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount);
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("id-ID");
    },

    isOverdue(dueDate) {
      if (!dueDate) return false;
      return new Date() > new Date(dueDate);
    },

    calculateDaysLate(dueDate) {
      if (!this.isOverdue(dueDate)) return 0;
      const today = new Date();
      const due = new Date(dueDate);
      return Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    },

    getRowClass(item) {
      if (item.status_pengembalian) return 'row-returned';
      if (this.isOverdue(item.tgl_jatuh_tempo)) return 'row-overdue';
      return '';
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    refreshData() {
      this.fetchAllData();
    },

    exportData() {
      // Implementation for data export
      const csvContent = this.generateCSV();
      this.downloadCSV(csvContent, 'data-pengembalian.csv');
    },

    generateCSV() {
      const headers = ['No', 'Judul Buku', 'Nama Member', 'Tanggal Pinjam', 'Tanggal Jatuh Tempo', 'Tanggal Kembali', 'Status'];
      let csv = headers.join(',') + '\n';
      
      this.filteredReturns.forEach((item, index) => {
        const row = [
          index + 1,
          `"${item.book_title}"`,
          `"${item.member_name}"`,
          this.formatDate(item.tgl_pinjam),
          this.formatDate(item.tgl_jatuh_tempo),
          item.tgl_pengembalian ? this.formatDate(item.tgl_pengembalian) : '-',
          item.status_pengembalian ? 'Sudah Dikembalikan' : (this.isOverdue(item.tgl_jatuh_tempo) ? 'Terlambat' : 'Belum Dikembalikan')
        ];
        csv += row.join(',') + '\n';
      });
      
      return csv;
    },

    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    showMessage(msg, type = "error") {
      if (type === "error") {
        this.errorMessage = msg;
        this.successMessage = "";
      } else {
        this.successMessage = msg;
        this.errorMessage = "";
      }
      setTimeout(() => {
        this.successMessage = "";
        this.errorMessage = "";
      }, 5000);
    }
  }
};
</script>

<style scoped>
.return-page {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  width: 100%;
  margin: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.row {
  display: flex;
  gap: 1rem;
}

.col-md-4 {
  flex: 1;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.stats-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stats-card h3 {
  font-size: 2.5rem;
  margin: 0;
  color: #333;
}

.stats-card p {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 1rem;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.bg-primary { background-color: #007bff; }
.bg-success { background-color: #28a745; }
.bg-warning { background-color: #ffc107; }
.bg-danger { background-color: #dc3545; }

.stats-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.stats-content p {
  margin: 0;
  color: #6c757d;
}

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-responsive {
  overflow-x : auto;
}

.return-table {
  width: 100%;
  border-collapse: collapse;
}

.return-table th,
.return-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.return-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.return-table tbody tr:hover {
  background-color: #f8f9fa;
}

.row-returned {
  background-color: #e8f5e9;
}

.row-overdue {
  background-color: #ffebee;
}

.no-data {
  text-align: center;
  padding: 3rem;
}

.empty-state {
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
  border: none;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-outline-primary {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
}

.badge {
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.bg-success {
  background-color: #28a745;
}

.bg-warning {
  background-color: #ffc107;
}

.bg-danger {
  background-color: #dc3545;
}

.text-danger {
  color: #dc3545;
}

.text-muted {
  color: #6c757d;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
}

.pagination {
  display: flex;
  gap: 0.5rem;
}

.page-item {
  list-style: none;
}

.page-link {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #007bff;
  cursor: pointer;
  border-radius: 4px;
}

.page-link:hover {
  background-color: #e9ecef;
}

.page-item.active .page-link {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: white;
  border-color: #dee2e6;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid rgba(0, 123, 255, 0.2);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  width: 90%;
  max-width: 600px;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h6 {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-control,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

textarea.form-control {
  min-height: 100px;
}

.fine-info {
  margin-top: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.messages {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
  max-width: 400px;
}

@media (max-width: 768px) {
  .return-page {
    margin-left: 0;
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .row {
    flex-direction: column;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .modal-dialog {
    width: 95%;
  }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(20px);
}

/* Utility classes */
.d-block {
  display: block;
}

.ms-2 {
  margin-left: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.text-center {
  text-align: center;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>