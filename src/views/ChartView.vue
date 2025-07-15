<template>
  <div class="container">
    <header class="page-header">
      <h1 class="page-title">Grafik Peminjaman</h1>
      <select v-model="selectedYear" @change="updateChartData" class="year-selector">
        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </header>

    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default {
  name: "GrafikPeminjamanView",
  data() {
    return {
      peminjaman: [],
      selectedYear: new Date().getFullYear(),
      availableYears: [],
      chart: null,
    };
  },
  methods: {
    async fetchPeminjaman() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://45.64.100.26:88/perpus-api/public/api/peminjaman", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.peminjaman = res.data.data || res.data;
        this.extractAvailableYears();
        this.prepareChartData();
      } catch (err) {
        alert("Gagal mengambil data peminjaman");
      }
    },
    extractAvailableYears() {
      const years = new Set();
      this.peminjaman.forEach((item) => {
        if (item.tgl_pinjam) {
          const year = new Date(item.tgl_pinjam).getFullYear();
          years.add(year);
        }
      });
      this.availableYears = Array.from(years).sort((a, b) => b - a);
      this.selectedYear = this.availableYears[0] || new Date().getFullYear();
    },
    prepareChartData() {
      if (!this.$refs.chartCanvas) return;

      if (this.chart) this.chart.destroy();

      const filtered = this.peminjaman.filter((item) => {
        const year = new Date(item.tgl_pinjam).getFullYear();
        return year === this.selectedYear;
      });

      const counts = Array(12).fill(0);
      filtered.forEach((item) => {
        const month = new Date(item.tgl_pinjam).getMonth();
        counts[month]++;
      });

      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
          datasets: [
            {
              label: `Peminjaman ${this.selectedYear}`,
              data: counts,
              backgroundColor: "#d1d5db", // Abu-abu muda
              borderRadius: 8,
              barPercentage: 0.6,
              categoryPercentage: 0.5,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#f3f4f6",
              titleColor: "#111827",
              bodyColor: "#374151",
              borderColor: "#d1d5db",
              borderWidth: 1,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#4b5563",
              },
              grid: {
                color: "#e5e7eb",
              },
            },
            x: {
              ticks: {
                color: "#4b5563",
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    },
    updateChartData() {
      this.prepareChartData();
    },
  },
  mounted() {
    this.fetchPeminjaman();
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy();
  },
};
</script>

<style scoped>
.container {
  padding: 2rem;
  background-color: #f9fafb; /* Latar belakang abu terang */
  min-height: 100vh;
  color: #111827; /* Teks abu gelap */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #6b7280; /* Abu-abu elegan */
}

.year-selector {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-weight: 500;
  transition: all 0.3s ease;
}

.year-selector:hover {
  border-color: #9ca3af;
  box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.2);
}

.chart-container {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #e5e7eb;
  height: 400px;
}
</style>
