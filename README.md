# Proyek Phytoremediasi — AkarAsa

Ini adalah situs statis sederhana yang memperkenalkan proyek fitoremediasi untuk memulihkan lahan bekas tambang nikel menggunakan tanaman *Alyssum murale*.

Isi utama:

- `index.html` — Halaman utama situs (bahasa Indonesia).
- `style.css` — Gaya halaman.
- `assets/` — Gambar dan aset statis yang digunakan di halaman:
  - `logo.png`
  - `maskot.png`
  - `model.png`
  - `parameter.png`
  - `tanaman alis.webp`
  - `tanaman.png`

Fitur penting

- Deskripsi gagasan, maskot, dan informasi tentang *Alyssum murale*.
- Bagian "Model Matematika" menjelaskan model interaksi biomassa (A) dan nikel tanah (N).
- Alat Prediksi: simulasi sederhana di browser yang memodelkan evolusi biomassa dan konsentrasi nikel selama waktu (dengan Chart.js). Anda dapat mengubah nilai awal dan menekan tombol "Jalankan Simulasi".

Cara menjalankan

Karena ini adalah situs statis, cara termudah untuk melihatnya:

1. Buka `index.html` di browser dengan cara klik dua kali file tersebut atau buka dengan perintah "Open File..." pada browser.
2. (Opsional) Jalankan server lokal sederhana jika ingin fitur CORS konsisten atau pengembangan yang lebih nyaman. Contoh dengan Python 3 (PowerShell / CMD):

```powershell
# dari folder proyek
python -m http.server 8000; Start-Process "http://localhost:8000"
```

Catatan tentang Alat Prediksi

- Input: Biomassa awal `A₀` (kg/ha) dan Konsentrasi nikel awal `N₀` (ppm).
- Hasil: grafik time series (Biomassa dan Nikel) dan potret fasa (A vs N). Jika `N` turun di bawah 70 ppm selama simulasi (50 tahun), aplikasi akan menampilkan estimasi waktu pemulihan.
- Parameter dinamika ada di `index.html` (variabel `params`) — Anda bisa menyesuaikannya untuk eksperimen.

Kontribusi

Jika Anda ingin berkontribusi:

- Perbaiki konten teks (bahasa atau penjelasan ilmiah).
- Tambah opsi konfigurasi simulasi (unit, skala waktu, ekspor data).
- Tambah pengujian atau dokumentasi lebih rinci untuk model matematika.

Lisensi

Gunakan sesuka hati — tambahkan lisensi ke repositori jika ingin membatasi penggunaan.

Kontak

Proyek ini dibuat oleh kontributor lokal (tidak ada kontak spesifik dalam repo).
