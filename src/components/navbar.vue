<template>
  <div :class="['navbar', { 'hide-navbar': isNavbarHidden }]">
    <div class="navbar-header">
      <h3>📚 Perpustakaan</h3>
    </div>
    <ul class="nav">
      <li class="nav-item">
        <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/members">Member</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/book">Book</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/peminjaman">Peminjaman</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/chart">Grafik</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/pengembalian">Pengembalian</router-link>
      </li>
      <li class="nav-item">
        <button class="btn nav-link logout" @click="logout">Logout</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lastScrollTop: 0,
      isNavbarHidden: false,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$router.push('/')
    },
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop > this.lastScrollTop && scrollTop > 50) {
        // Scroll ke bawah dan sudah melewati 50px → sembunyikan navbar
        this.isNavbarHidden = true
      } else {
        // Scroll ke atas → tampilkan navbar
        this.isNavbarHidden = false
      }
      this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap');

* {
  font-family: 'Ubuntu', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(90deg, #50535b, #505154);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  color: #fff;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

/* Navbar hilang saat scroll ke bawah */
.hide-navbar {
  transform: translateY(-100%);
}

.navbar-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
}

.nav {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.nav-item {
  margin-left: 1rem;
  white-space: nowrap;
}

.nav-link {
  display: block;
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.3s, transform 0.2s;
  text-decoration: none;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.logout {
  background: none;
  border: none;
  color: #f8d7da;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.logout:hover {
  background-color: rgba(248, 215, 218, 0.2);
}
</style>
