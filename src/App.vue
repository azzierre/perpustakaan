<template>
  <div id="app">
    <!-- Hanya tampilkan navbar kalau bukan di halaman login -->
    <Navbar v-if="$route.path !== '/'" />
    <router-view />
  </div>
</template>
<script>
import Navbar from './components/navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
/* Reset default style */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: white;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

/* Optional: Style container */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw; /* Lebar penuh viewport */
  margin: 0 auto; /* Center horizontal (optional) */
  padding: 0; /* Buat aman */
}
</style>
