# InternSync CMS 💻

InternSync CMS adalah antarmuka panel administrasi (Content Management System) untuk sistem manajemen magang/PKL **InternSync**. Aplikasi ini dibangun menggunakan **React 19**, **TypeScript**, **Vite 6**, dan **Tailwind CSS v4**.

---

## 🛠️ Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (versi 18.x / 20.x atau lebih baru)
*   [npm](https://www.npmjs.com/) (atau yarn/pnpm)

---

## 🚀 Panduan Setup & Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk memulai development di lingkungan lokal:

### 1. Install Dependensi
Unduh semua library dan modul Node.js yang diperlukan dengan menjalankan perintah:
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Pastikan file `.env` di direktori utama Anda berisi konfigurasi yang tepat. Secara default, untuk menghubungkan ke API lokal:
```env
# Koneksi ke API lokal (Laravel)
VITE_API_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:5173
```
*Catatan: Jika backend API Anda berjalan di port atau host lain, sesuaikan nilai `VITE_API_URL`.*

### 3. Menjalankan Server Development
Jalankan perintah berikut untuk menjalankan server development lokal dengan hot-reloading:
```bash
npm run dev
```
Setelah berhasil dijalankan, buka browser Anda dan akses **`http://localhost:5173`**.

---

## 📦 Perintah yang Tersedia (Scripts)

Di dalam file `package.json`, tersedia beberapa script yang bisa Anda jalankan:

*   **`npm run dev`**: Menjalankan server development lokal.
*   **`npm run build`**: Mengompilasi kode TypeScript dan membundle aset produksi menggunakan Vite ke dalam folder `/dist`.
*   **`npm run lint`**: Memeriksa kualitas kode menggunakan ESLint.
*   **`npm run preview`**: Menjalankan server preview lokal untuk hasil build produksi.

---

## 🔗 Hubungan ke Backend API
Aplikasi ini membutuhkan backend API yang aktif untuk bertukar data. Silakan merujuk ke panduan setup backend di repositori `internsync-api`.
Jika Anda menggunakan API lokal, pastikan service backend Laravel Anda (`php artisan serve`) sudah menyala di alamat `http://localhost:8000`.