<template>
  <div class="library-dashboard">
    <!-- Header sederhana -->
    <header class="header">
      <div class="container">
        <h1 class="header-title">Perpustakaan Digital</h1>
        <p class="header-subtitle">Temukan Buku Yang Diinginkan</p>
      </div>
    </header>


  </div>
</template>

<script>
export default {
  name: 'LibraryDashboard',
  data() {
    return {
      features: [
        {
          icon: 'fas fa-book-open',
          title: 'Katalog Buku',
          description: 'Telusuri ribuan buku dari berbagai kategori'
        },
        {
          icon: 'fas fa-user-graduate',
          title: 'Keanggotaan',
          description: 'Daftar menjadi anggota untuk menikmati fasilitas'
        },
        {
          icon: 'fas fa-calendar-alt',
          title: 'Jadwal',
          description: 'Lihat jadwal kegiatan dan event perpustakaan'
        }
      ],
      newBooks: [
        { title: 'Seni Hidup Minimalis', author: 'Francine Jay' },
        { title: 'Laut Bercerita', author: 'Leila S. Chudori' },
        { title: 'Filosofi Teras', author: 'Henry Manampiring' },
        { title: 'Atomic Habits', author: 'James Clear' }
      ]
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.library-dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #ffffff;
  min-height: 100vh;
  color: #1a1a1a;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header */
.header {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: black;
}

.header-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 1.25rem;
  font-weight: 300;
  opacity: 0.9;
  max-width: 500px;
  margin: 0 auto;
}





/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header {
    padding: 60px 0;
  }
  
  .header-title {
    font-size: 2.25rem;
  }
  
  .header-subtitle {
    font-size: 1.1rem;
  }
  
  .main-content {
    padding: 60px 0;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 60px;
  }
  
  .feature-card {
    padding: 32px 24px;
  }
  
  .new-books {
    margin-top: 60px;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .books-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>