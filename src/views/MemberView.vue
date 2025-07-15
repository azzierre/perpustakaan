<template>
  <div class="member-page">
    <h1 class="uyy">𝐃𝐚𝐟𝐭𝐚𝐫 𝐌𝐞𝐦𝐛𝐞𝐫</h1>

    <div class="button-group">
      <button @click="openForm()" class="btn-add">+ Tambah Member</button>
      <button @click="openRiwayatModal()" class="btn-add btn-history">Riwayat Peminjaman</button>
    </div>
    <!-- <div class="search-container">
      <input 
        v-model="searchQuery" 
        @input="filterMembers" 
        placeholder="Cari member..." 
        class="search-input"
      >
    </div> -->
    <!-- Form tambah/edit member -->
    <div v-if="showForm" class="form-add-member">
      <h3>{{ isEditMode ? 'Edit Member' : 'Tambah Member Baru' }}</h3>
      <form @submit.prevent="submitMember">
        <div>
          <label>Nama:</label>
          <input v-model="form.nama" required />
        </div>
        <div>
          <label>No. KTP:</label>
          <input v-model="form.no_ktp" required minlength="16" maxlength="16"/>
        </div>  
        <div>
          <label>Alamat:</label>
          <input v-model="form.alamat" required />
        </div>
        <div>
          <label>Tanggal Lahir:</label>
          <input v-model="form.tgl_lahir" type="date" required />
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan')
          }}</button>
        <button type="button" @click="cancelForm" :disabled="loading">Batal</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>

    <!-- Tabel member -->
    <table class="member-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>No. KTP</th>
          <th>Alamat</th>
          <th>Tanggal Lahir</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredMembers.length === 0">
          <td colspan="5" style="text-align:center; color:#888;">
            {{ searchQuery ? 'Tidak ditemukan member yang sesuai' : 'Belum ada data member' }}
          </td>
        </tr>
        <tr v-for="member in filteredMembers" :key="member.id" class="udin">
          <td>{{ member.nama }}</td>
          <td>{{ member.no_ktp }}</td>
          <td>{{ member.alamat }}</td>
          <td>{{ formatDate(member.tgl_lahir) }}</td>
          <td class="action-cell">
            <button @click="viewDetail(member)" class="btn-action detail">Lihat</button>
            <button @click="editMember(member)" class="btn-action edit">Edit</button>
            <button @click="deleteMember(member)" class="btn-action delete">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Detail Member -->
    <div v-if="selectedMember" class="modal-overlay" @click.self="selectedMember = null">
      <div class="modal-content">
        <h3>Detail Member</h3>
        <p><strong>Nama:</strong> {{ selectedMember.nama }}</p>
        <p><strong>No. KTP:</strong> {{ selectedMember.no_ktp }}</p>
        <p><strong>Alamat:</strong> {{ selectedMember.alamat }}</p>
        <p><strong>Tanggal Lahir:</strong> {{ formatDate(selectedMember.tgl_lahir) }}</p>
        <button @click="selectedMember = null">Tutup</button>
      </div>
    </div>

    <!-- Modal Riwayat Peminjaman -->
    <div v-if="showRiwayatModal" class="modal-overlay" @click.self="closeRiwayatModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>Riwayat Peminjaman</h3>
          <button @click="closeRiwayatModal" class="btn-close">Tutup</button>
        </div>

        <div class="member-selection">
          <label>Pilih Member:</label>
          <select v-model="selectedMemberId" @change="fetchRiwayatPeminjaman">
            <option value="">-- Pilih Member --</option>
            <option v-for="member in members" :key="member.id" :value="member.id">
              {{ member.nama }} ({{ member.no_ktp }})
            </option>
          </select>
        </div>

        <div v-if="loadingRiwayat" class="loading">Memuat data...</div>
        <div v-else-if="riwayatError" class="error">{{ riwayatError }}</div>

        <div v-if="selectedMemberForRiwayat">
          <div class="modal-actions">
            <button @click="exportToPDF" class="btn-export" :disabled="riwayatPeminjaman.length === 0">
              Export PDF
            </button>
          </div>
          
          <h4>Riwayat {{ selectedMemberForRiwayat.nama }}</h4>
          
          <table v-if="riwayatPeminjaman.length > 0" class="riwayat-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Judul Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Tanggal Kembali</th>
                <th>Status</th>
                <th>Denda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(peminjaman, index) in riwayatPeminjaman" :key="peminjaman.id">
                <td>{{ index + 1 }}</td>
                <td>{{ peminjaman.buku?.judul || peminjaman.judul_buku || 'Buku tidak ditemukan' }}</td>
                <td>{{ formatDate(peminjaman.tgl_pinjam) }}</td>
                <td>{{ formatDate(peminjaman.tgl_kembali) }}</td>
                <td :class="'status-' + peminjaman.status.toLowerCase()">
                  {{ getStatusText(peminjaman.status) }}
                </td>
                <td>{{ formatCurrency(peminjaman.denda || 0) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            Tidak ada riwayat peminjaman untuk member ini
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  name: "memberView",
  data() {
    return {
      showForm: false,
      isEditMode: false,
      loading: false,
      errorMessage: "",
      successMessage: "",
      selectedMember: null,
      showRiwayatModal: false,
      loadingRiwayat: false,
      riwayatError: "",
      riwayatPeminjaman: [],
      selectedMemberId: "",
      selectedMemberForRiwayat: null,
      searchQuery: "",
      filteredMembers: [],
      form: {
        id: null,
        nama: "",
        no_ktp: "",
        alamat: "",
        tgl_lahir: "",
      },
      members: [],
    };
  },
  mounted() {
    this.fetchMembers();
  },
  methods: {
    async exportToPDF() {
      try {
        console.log("Memulai proses export PDF...");
        
        // Validasi data
        if (!this.selectedMemberForRiwayat) {
          console.error("Member belum dipilih");
          alert('Silakan pilih member terlebih dahulu');
          return;
        }

        if (this.riwayatPeminjaman.length === 0) {
          console.error("Tidak ada data riwayat peminjaman");
          alert('Tidak ada data riwayat peminjaman untuk diekspor');
          return;
        }

        // Buat dokumen PDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Informasi header
        const title = `RIWAYAT PEMINJAMAN BUKU`;
        const memberName = `Nama: ${this.selectedMemberForRiwayat.nama}`;
        const memberKTP = `No. KTP: ${this.selectedMemberForRiwayat.no_ktp}`;
        const printDate = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`;
        
        // Tambahkan header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(memberName, 14, 30);
        doc.text(memberKTP, 14, 35);
        doc.text(printDate, 14, 40);

        // Siapkan data tabel
        const tableData = this.riwayatPeminjaman.map((item, index) => [
          index + 1,
          item.buku?.judul || item.judul_buku || 'Buku tidak ditemukan',
          this.formatDate(item.tgl_pinjam),
          this.formatDate(item.tgl_kembali) || '-',
          this.getStatusText(item.status),
          this.formatCurrency(item.denda || 0, false) // false untuk tanpa simbol Rp
        ]);

        // Buat tabel menggunakan autoTable plugin
        autoTable(doc, {
          startY: 50,
          head: [['No', 'Judul Buku', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Denda']],
          body: tableData,
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 70 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20, halign: 'right' }
          },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(
              `Halaman ${data.pageNumber} dari ${pageCount}`,
              105,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        });

        // Simpan PDF
        const fileName = `Riwayat_Peminjaman_${this.selectedMemberForRiwayat.nama}_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
        console.log("PDF berhasil di-generate:", fileName);

      } catch (error) {
        console.error("Gagal membuat PDF:", error);
        alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
      }
    },

    formatCurrency(amount, withSymbol = true) {
      if (isNaN(amount)) amount = 0;
      const formatter = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      return withSymbol ? `Rp ${formatter.format(amount)}` : formatter.format(amount);
    },

    openForm() {
      this.showForm = true;
      this.isEditMode = false;
      this.resetForm();
    },
    
    filterMembers() {
      if (!this.searchQuery) {
        this.filteredMembers = [...this.members];
        return;
      }
      
      const query = this.searchQuery.toLowerCase();
      this.filteredMembers = this.members.filter(member => 
        member.nama.toLowerCase().includes(query) ||
        member.no_ktp.includes(query) ||
        member.alamat.toLowerCase().includes(query)
      );
    },

    async fetchMembers() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://45.64.100.26:88/perpus-api/public/api/member",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.members = res.data.data || res.data;
        this.filteredMembers = [...this.members]; // Initialize filteredMembers
      } catch (err) {
        console.error("❌ Gagal ambil member", err);
        this.errorMessage = "Gagal mengambil data member";
      }
    },
    
    async submitMember() {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";
      const token = localStorage.getItem("token");

      try {
        if (this.isEditMode && this.form.id) {
          await axios.put(
            `http://45.64.100.26:88/perpus-api/public/api/member/${this.form.id}`,
            this.form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          this.successMessage = "Member berhasil diperbarui.";
        } else {
          await axios.post(
            "http://45.64.100.26:88/perpus-api/public/api/member",
            this.form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          this.successMessage = "Member berhasil ditambahkan.";
        }

        this.fetchMembers();
        this.cancelForm();
      } catch (err) {
        console.error(err.response?.data || err.message);
        this.errorMessage = "Gagal menyimpan data member.";
      } finally {
        this.loading = false;
      }
    },
    
    editMember(member) {
      this.form = JSON.parse(JSON.stringify(member));
      this.isEditMode = true;
      this.showForm = true;
      this.errorMessage = "";
      this.successMessage = "";
    },
    
    async deleteMember(member) {
      const konfirmasi = confirm(`Hapus member "${member.nama}"?`);
      if (!konfirmasi) return;

      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `http://45.64.100.26:88/perpus-api/public/api/member/${member.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.successMessage = "Member berhasil dihapus.";
        this.fetchMembers();
      } catch (err) {
        this.errorMessage = "Gagal menghapus member.";
      }
    },
    
    viewDetail(member) {
      this.selectedMember = member;
    },
    
    openRiwayatModal() {
      this.showRiwayatModal = true;
      this.selectedMemberId = "";
      this.selectedMemberForRiwayat = null;
      this.riwayatPeminjaman = [];
    },
    
    async fetchRiwayatPeminjaman() {
      if (!this.selectedMemberId) {
        this.riwayatPeminjaman = [];
        this.selectedMemberForRiwayat = null;
        return;
      }

      this.loadingRiwayat = true;
      this.riwayatError = "";
      this.riwayatPeminjaman = [];

      const token = localStorage.getItem("token");
      if (!token) {
        this.riwayatError = "Token tidak ditemukan. Silakan login ulang.";
        this.loadingRiwayat = false;
        return;
      }

      try {
        // Temukan member yang dipilih
        this.selectedMemberForRiwayat = this.members.find(m => m.id == this.selectedMemberId);

        // Ambil data peminjaman dengan header yang lebih lengkap
        const response = await axios.get(
          `http://45.64.100.26:88/perpus-api/public/api/peminjaman?member_id=${this.selectedMemberId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Proses data response dengan lebih robust
        let rawData = [];
        if (Array.isArray(response.data)) {
          rawData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          rawData = response.data.data;
        } else if (response.data) {
          rawData = [response.data];
        }

        // Filter hanya untuk member yang dipilih
        rawData = rawData.filter(item =>
          (item.member_id == this.selectedMemberId) ||
          (item.id_member == this.selectedMemberId)
        );

        // Mapping data dengan penanganan error yang lebih baik
        this.riwayatPeminjaman = rawData.map(item => {
          // Tanggal
          const tglPinjam = item.tanggal_pinjam || item.tgl_pinjam;
          const tglKembali = item.tanggal_kembali || item.tgl_kembali || item.tgl_pengembalian;

          // Status
          const statusPeminjaman = (item.status || '').toUpperCase();
          const isReturned = statusPeminjaman === 'KEMBALI';
          const isLost = statusPeminjaman === 'HILANG';

          // Hitung jatuh tempo
          const tglJatuhTempo = item.tgl_jatuh_tempo || this.calculateDueDate(tglPinjam);

          // Denda - ambil dari API jika ada, jika tidak hitung otomatis
          let denda = 0;
          if (item.denda !== undefined && item.denda !== null) {
            denda = Number(item.denda) || 0;
          } else if (!isReturned && this.isOverdue(tglJatuhTempo)) {
            denda = this.calculateFine(tglJatuhTempo);
          }

          // Status untuk display
          let displayStatus = 'PINJAM';
          if (isReturned) {
            displayStatus = 'KEMBALI';
          } else if (isLost) {
            displayStatus = 'HILANG';
          } else if (this.isOverdue(tglJatuhTempo)) {
            displayStatus = 'TERLAMBAT';
          }

          return {
            id: item.id || item.id_peminjaman,
            buku: {
              id: item.buku?.id || item.id_buku,
              judul: item.buku?.judul || item.judul_buku || 'Buku tidak ditemukan'
            },
            tgl_pinjam: tglPinjam,
            tgl_kembali: tglKembali,
            tgl_jatuh_tempo: tglJatuhTempo,
            status: displayStatus,
            status_pengembalian: isReturned,
            denda: denda,
            terlambat: !isReturned && this.isOverdue(tglJatuhTempo),
            hari_terlambat: !isReturned && this.isOverdue(tglJatuhTempo)
              ? this.calculateDaysLate(tglJatuhTempo)
              : 0,
            // Untuk debugging
            rawData: item
          };
        });

      } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
        this.riwayatError = this.getErrorMessage(error);
      } finally {
        this.loadingRiwayat = false;
      }
    },
    
    calculateDueDate(pinjamDate) {
      if (!pinjamDate) return null;
      const date = new Date(pinjamDate);
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
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
    
    calculateFine(dueDate) {
      const daysLate = this.calculateDaysLate(dueDate);
      const perDayFine = 5000; // Rp. 5.000 per hari
      const maxDays = 30; // Maksimal 30 hari denda
      return Math.min(daysLate * perDayFine, perDayFine * maxDays);
    },
    
    formatDate(dateString) {
      if (!dateString) return "-";
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    
    getStatusText(status) {
      if (!status) return 'Tidak diketahui';

      const statusMap = {
        'PINJAM': 'Dipinjam',
        'KEMBALI': 'Dikembalikan',
        'HILANG': 'Hilang',
        'TERLAMBAT': 'Terlambat',
        'BELUM KEMBALI': 'Belum Kembali',
        'DIKEMBALIKAN': 'Dikembalikan',
        'SUDAH DIKEMBALIKAN': 'Dikembalikan'
      };

      // Normalisasi status ke uppercase dan hapus spasi berlebih
      const normalizedStatus = status.toString().toUpperCase().trim();
      return statusMap[normalizedStatus] || status;
    },
    
    closeRiwayatModal() {
      this.showRiwayatModal = false;
      this.selectedMemberId = "";
      this.selectedMemberForRiwayat = null;
      this.riwayatPeminjaman = [];
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
        nama: "",
        no_ktp: "",
        alamat: "",
        tgl_lahir: "",
      };
    },
    
    getErrorMessage(error) {
      if (error.response) {
        return error.response.data.message || error.response.statusText;
      }
      return error.message || "Terjadi kesalahan";
    }
  },
};
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

* {
  font-family: "Ubuntu", sans-serif;
  font-weight: 700;
  font-style: normal;
}

/* Main Container */
.member-page {
  padding: 2rem;
  background-color: #f7f7f7; /* Light grey background */
  min-height: 100vh;
  color: #333333;
}

/* Title */
.uyy {
  color: #4a4a4a; /* Dark grey */
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

/* Button Group */
.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap; /* Responsive */
}

/* Buttons */
.btn-add {
  background-color: #6e6e6e; /* Medium grey */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-add:hover {
  background-color: #4a4a4a; /* Darker grey */
}

.btn-history {
  background-color: #9e9e9e; /* Lighter grey */
}

.btn-history:hover {
  background-color: #6e6e6e; /* Medium grey */
}

/* Form */
.form-add-member {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #d0d0d0;
  background: #ffffff;
  border-radius: 6px;
}

.form-add-member h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a4a4a; /* Dark grey */
  font-weight: 600;
}

.form-add-member label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #666666;
}

.form-add-member input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid #bbb;
  font-size: 14px;
  box-sizing: border-box;
}

.form-add-member input:focus {
  outline: none;
  border-color: #6e6e6e; /* Medium grey focus border */
}

.form-add-member button[type="submit"] {
  background-color: #4a4a4a; /* Dark grey */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  font-weight: 500;
}

.form-add-member button[type="submit"]:hover {
  background-color: #2f2f2f; /* Darker grey */
}

.form-add-member button[type="button"] {
  background-color: #9e9e9e; /* Lighter grey */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.form-add-member button[type="button"]:hover {
  background-color: #6e6e6e; /* Medium grey */
}

/* Tables */
.member-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  overflow: hidden;
}

.member-table th {
  background-color: #e5e5e5; /* Light grey */
  color: #4a4a4a; /* Dark grey */
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #d0d0d0;
}

.member-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #555555;
}

.member-table tr:last-child td {
  border-bottom: none;
}

.member-table tr:hover {
  background-color: #f9f9f9; /* Very light grey */
}

.udin {
  background-color: #ffffff;
}

/* Action buttons in table */
.action-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 6px 10px;
  border-radius: 3px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 12px;
  transition: opacity 0.2s ease;
}

.btn-action:hover {
  opacity: 0.8;
}

.btn-action.detail {
  background-color: #6e6e6e; /* Medium grey */
}

.btn-action.edit {
  background-color: #9e9e9e; /* Lighter grey */
}

.btn-action.delete {
  background-color: #b74c4c; /* Muted red */
}

/* Messages */
.error {
  color: #a94442;
  padding: 10px;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  border-radius: 4px;
  margin: 10px 0;
}

.success {
  color: #3c763d;
  padding: 10px;
  background-color: #dff0d8;
  border: 1px solid #d6e9c6;
  border-radius: 4px;
  margin: 10px 0;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 6px;
  width: 90%; /* Responsive */
  max-width: 800px; /* Max width */
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #d0d0d0;
}

.modal-content h3 {
  margin-top: 0;
  color: #4a4a4a; /* Dark grey */
  font-weight: 600;
}

.modal-content button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #4a4a4a; /* Dark grey */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.modal-content button:hover {
  background-color: #2f2f2f; /* Darker grey */
}

/* Large modal for history */
.large-modal {
  width: 90%; /* Responsive */
  max-width: 800px; /* Max width */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #d0d0d0;
}

.member-selection {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.member-selection label {
  font-weight: 600;
  color: #4a4a4a; /* Dark grey */
}

.member-selection select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #bbb;
  min-width: 300px;
  font-size: 14px;
}

.member-selection select:focus {
  outline: none;
  border-color: #6e6e6e; /* Medium grey focus border */
}

/* History table */
.riwayat-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  overflow: hidden;
}

.riwayat-table th {
  background-color: #e5e5e5; /* Light grey */
  color: #4a4a4a; /* Dark grey */
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #d0d0d0;
}

.riwayat-table td {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #555555;
}

.riwayat-table tr:last-child td {
  border-bottom: none;
}

/* Loading and no data states */
.loading {
  padding: 20px;
  text-align: center;
  color: #999999;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #bbbbbb;
  font-style: italic;
}

.btn-close {
  background-color: #888888 !important;
}

.btn-close:hover {
  background-color: #aaaaaa !important;
}

/* Status styles - subtle greys */
.status-pinjam,
.status-belum,
.status-belum-dikembalikan {
  color: #666666;
  font-weight: 500;
}

.status-kembali,
.status-dikembalikan,
.status-sudah,
.status-sudah-dikembalikan {
  color: #333333;
  font-weight: 500;
}

.status-hilang {
  color: #777777;
  font-weight: 500;
}

.status-terlambat {
  color: #b74c4c; /* Muted red for overdue */
  font-weight: 500;
}

.status-unknown {
  color: #999999;
  font-weight: 500;
}

.btn-export {
  background-color: #6e6e6e; /* Medium grey */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  margin-left: auto;
  display: block;
}

.btn-export:hover {
  background-color: #4a4a4a; /* Darker grey */
}

.btn-export:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.modal-actions {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

</style>
