# Perpustakaan Digital

Aplikasi web sederhana untuk manajemen perpustakaan berbasis Vue.  
Fitur utama:
- Manajemen buku & penerbit
- Manajemen anggota & kartu anggota
- Peminjaman & pengembalian buku
- Dashboard dengan daftar buku terbaru

---

## 🛠️ Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/azzierre/perpustakaan.git
   cd perpustakaan

2. nstall dependencies Laravel
composer install

3.Install dependencies Frontend
npm install

4.buat file env nya
cp .env.example .env

5.Generate key & migrate database
php artisan key:generate
php artisan migrate --seed

6.Jalankan server
 php artisan serve
npm run dev

🔑 Akun Dummy
admin@gmail.com
12345678

📌 Teknologi
Backend: Laravel 10
Frontend: Vue 3 + Vite
Database: MySQL

📜 Lisensi

---

### 2. Commit & Push ke GitHub

Sekarang jalankan perintah ini di terminal:

```bash
# Tambah file README.md
git add README.md

# Commit perubahan
git commit -m "Add README.md with installation guide and dummy accounts"

# Rename branch jadi main (kalau sebelumnya masih master)
git branch -M main

# Push ke GitHub
git push -u origin main
