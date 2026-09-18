# Panduan Setup SMART ROOM

Berikut adalah panduan lengkap untuk melakukan instalasi dan konfigurasi sistem Smart Room.

## 1. Persiapan
Sebelum memulai, pastikan Anda telah menginstal dan menyiapkan hal-hal berikut:
- **Git**: Untuk melakukan kloning repository.
- **Browser Modern**: Chrome, Firefox, atau Edge versi terbaru.
- **Akun GitHub**: Untuk hosting aplikasi di GitHub Pages.
- **Akun Firebase**: Untuk manajemen database dan autentikasi.

## 2. Step-by-step Firebase Setup

### a. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Klik tombol **Add Project**.
3. Masukkan nama project (contoh: `SmartRoom-App`).
4. (Opsional) Matikan Google Analytics jika tidak diperlukan.
5. Klik **Create Project**.

### b. Enable Authentication (Email/Password)
1. Di panel kiri Firebase Console, buka menu **Build** > **Authentication**.
2. Klik **Get Started**.
3. Pilih tab **Sign-in method**, lalu pilih **Email/Password**.
4. Aktifkan *Enable* pada toggle Email/Password, lalu klik **Save**.

### c. Enable Firestore Database
1. Di panel kiri, buka menu **Build** > **Firestore Database**.
2. Klik **Create Database**.
3. Pilih lokasi server database terdekat (misalnya: `asia-southeast2` untuk Jakarta).
4. Mulai dalam **Production Mode**.

### d. Setup Firestore Rules
1. Masuk ke tab **Rules** pada Firestore Database.
2. Salin isi dari file `firestore.rules` di repository ini.
3. Paste ke dalam editor rules di Firebase, lalu klik **Publish**.

### e. Dapatkan Firebase Config
1. Buka menu **Project Overview** (ikon gear/roda gigi di kiri atas) > **Project settings**.
2. Di bagian bawah (*Your apps*), klik ikon web (`</>`) untuk membuat aplikasi web baru.
3. Beri nama aplikasi (contoh: `SmartRoom-Web`).
4. Klik **Register app**.
5. Anda akan melihat blok kode berisi `firebaseConfig`.

### f. Update firebase-config.js
1. Buka project lokal di code editor Anda.
2. Cari file `public/js/firebase-config.js` (atau letak file konfigurasi yang Anda buat).
3. Salin nilai-nilai dari `firebaseConfig` yang didapat pada langkah sebelumnya, kemudian simpan.

## 3. GitHub Pages Deployment Steps
Untuk mendeploy ke GitHub Pages, ikuti langkah berikut:
1. Pastikan Anda sudah push project lengkap dengan `firebase-config.js` terbaru ke repository GitHub Anda.
2. Di GitHub, buka repository project, masuk ke tab **Settings**.
3. Pada sidebar kiri, klik menu **Pages**.
4. Pada bagian *Build and deployment*, pilih *Source*: **Deploy from a branch**.
5. Pilih branch **main** dan folder root (`/`).
6. Klik **Save**.
7. Tunggu beberapa menit, URL aplikasi Anda akan muncul di bagian atas halaman Settings > Pages.

## 4. Seed Data Awal

### Cara Membuat Akun Admin Pertama
Aplikasi belum memiliki akun admin bawaan. Untuk membuatnya:
1. Buka aplikasi yang sudah Anda deploy.
2. Lakukan pendaftaran (Sign Up) sebagai pengguna biasa.
3. Buka **Firebase Console** > **Firestore Database**.
4. Masuk ke collection `users`, cari dokumen yang memiliki email Anda.
5. Edit *field* `role` dari `"user"` menjadi `"admin"`.
6. Reload aplikasi, Anda sekarang login sebagai Admin.

### Menambah Ruangan dan Loker Lewat Admin Dashboard
1. Login dengan akun admin Anda.
2. Masuk ke menu **Admin Dashboard**.
3. Gunakan formulir **Tambah Ruangan** untuk mengisi data (Nama, Kapasitas, Fasilitas).
4. Gunakan formulir **Tambah Loker** untuk mendaftarkan loker baru dan menautkannya dengan ID Ruangan yang ada.

## 5. ESP32 Setup
Sistem ini menggunakan ESP32 untuk kontrol relai pengunci loker (Solenoid Lock).

1. **Install Arduino IDE**: Unduh dan pasang Arduino IDE.
2. **Install Board ESP32**: Tambahkan link board manager ESP32 di Arduino IDE dan instal library ESP32.
3. **Install Required Libraries**: 
   - `WiFi.h` (Bawaan ESP32)
   - `Firebase_ESP_Client` oleh Mobizt
4. **Upload Sketch**: Buka file kodingan `.ino` di folder terkait hardware (jika disediakan). Sesuaikan pin relay.
5. **Konfigurasi**: Pada kode Arduino, perbarui konstanta `WIFI_SSID`, `WIFI_PASSWORD`, `FIREBASE_HOST`, dan `FIREBASE_AUTH` sesuai dengan credentials Firebase Anda. Lalu *Upload* ke board ESP32.

## 6. Troubleshooting Common Issues
- **Error CORS/Gagal Ambil Data**: Pastikan Firebase Firestore Rules sudah diperbarui dan Anda memasukkan `firebaseConfig` yang benar.
- **ESP32 Tidak Bisa Terkoneksi**: Periksa apakah jaringan WiFi menggunakan *captive portal* (ESP32 sulit login). Gunakan koneksi tethering HP standar untuk tes.
- **Dashboard Kosong Setelah Login**: Pastikan data di koleksi `rooms` sudah Anda tambahkan. Cek inspect element (F12) untuk melihat pesan error.

## 7. FAQ
- **Q**: Apakah aplikasi ini gratis?
  **A**: Ya, selama dalam batas kuota Firebase Spark Plan.
- **Q**: Bagaimana cara menambah admin baru?
  **A**: Admin yang sudah ada bisa mengubah role user melalui Dashboard (jika fitur tersedia), atau manual lewat Firebase Console.
