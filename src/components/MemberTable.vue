<template>
  <div class="mt-5">
    <h4>Daftar Member</h4>

    <div class="table-responsive mt-3">
      <table class="table table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>No KTP</th>
            <th>Nama</th>
            <th>Alamat</th>
            <th>Tgl Lahir</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(member, index) in members" :key="member.id">
            <td>{{ index + 1 }}</td>
            <td>{{ member.no_ktp }}</td>
            <td>{{ member.nama }}</td>
            <td>{{ member.alamat }}</td>
            <td>{{ formatDate(member.tgl_lahir) }}</td>
            <td>

              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-info btn-sm" @click="$emit('showDetail', member)">
                  <i class="bi bi-eye"></i> Detail
                </button>
                <button class="btn btn-warning btn-sm" @click="$emit('editMember', member)">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" @click="deleteMember(member.id)">
                  <i class="bi bi-trash"></i> Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="members.length === 0" class="text-muted">Belum ada data member.</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MemberTable',
  props: ['members'],
  methods: {
    async deleteMember(id) {
      if (confirm('Yakin mau hapus member ini?')) {
        try {
          await axios.delete(`http://45.64.100.26:88/perpus-api/public/api/member/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          this.$emit('refresh')
        } catch (error) {
          console.error('Gagal hapus member:', error)
        }
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

@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

*{
  font-family: "Ubuntu", sans-serif;
  font-weight: 700;
  font-style: normal;
}
.table th, .table td {
  vertical-align: middle;
}
</style>
