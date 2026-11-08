# Menyambungkan admin ke backend Laravel

1. Pastikan backend jalan: `php artisan serve` (http://localhost:8000).
2. Alamat API dibaca dari `VITE_API_URL` (lihat `.env.example`, default `http://localhost:8000/api`).
3. `npm install` lalu `npm run dev` (http://localhost:5173). Login dengan akun admin dari database.

Struktur: semua pemanggilan API ada di `src/api.js`. Halaman memakai objek `api`
(mis. `api.produk.list()`), jadi alamat/format request hanya perlu diubah di satu file.

Deploy (mis. Vercel): isi environment variable `VITE_API_URL` dengan alamat API **https**.
Halaman https tidak boleh memanggil API http (diblokir browser).
