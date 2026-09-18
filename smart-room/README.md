# 🏢 SMART ROOM
## Sistem Peminjaman Ruangan & Loker Kunci Otomatis

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deploy-success?style=for-the-badge&logo=github)](https://naufalabufarhan2-arch.github.io/smart-room)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-F58220?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://en.wikipedia.org/wiki/HTML5)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

![Screenshot](docs/screenshot.png)

Aplikasi berbasis web untuk manajemen peminjaman ruangan dan loker kunci secara otomatis. Terintegrasi dengan Firebase sebagai backend dan perangkat ESP32 untuk kontrol loker fisik.

---

## ✨ Features
- [x] **Manajemen Ruangan**: Melihat daftar ruangan, status ketersediaan, dan fasilitas.
- [x] **Peminjaman Ruangan**: Sistem booking dengan validasi tanggal, waktu, dan konflik jadwal.
- [x] **Loker Kunci Otomatis**: Integrasi IoT untuk membuka loker kunci secara otomatis setelah peminjaman disetujui.
- [x] **Monitoring Admin**: Dashboard admin untuk menyetujui, menolak, dan mengawasi penggunaan ruangan.
- [x] **Sistem Notifikasi**: Notifikasi realtime kepada pengguna mengenai status booking.
- [x] **API ESP32**: Endpoints khusus untuk komunikasi aman dengan perangkat keras loker (ESP32).

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Deskripsi |
| --- | --- | --- |
| **Frontend** | HTML5, CSS3 (Bootstrap 5), JavaScript | Antarmuka pengguna responsif |
| **Backend & DB** | Firebase (Auth, Firestore, Hosting) | Autentikasi dan database realtime |
| **Hardware** | ESP32, Relay Module, Solenoid Lock | Mikrokontroler pembuka loker fisik |

---

## 📂 Project Structure
```text
smart-room/
├── docs/                     # Dokumentasi project (setup, database)
├── public/                   # File statis dan assets
│   ├── css/
│   ├── js/
│   ├── img/
│   └── index.html
├── src/                      # Source code aplikasi (opsional)
├── .gitignore
├── firebase.json             # Konfigurasi hosting Firebase
├── firestore.indexes.json    # Aturan index Firestore
├── firestore.rules           # Aturan keamanan database Firestore
└── README.md
```

---

## 🚀 Setup & Installation

Ikuti langkah-langkah di bawah untuk menjalankan project ini secara lokal atau mendeploy-nya.

### 1. Clone repository
```bash
git clone https://github.com/naufalabufarhan2-arch/smart-room.git
cd smart-room
```

### 2. Firebase Setup
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Aktifkan fitur **Authentication** (pilih provider Email/Password).
3. Aktifkan **Firestore Database** dan mulai dalam mode produksi.
4. Terapkan konfigurasi *security rules* dari file `firestore.rules`.
5. Di halaman project settings, buat Web App baru untuk mendapatkan konfigurasi Firebase.

### 3. Update Firebase Config
Buka file `public/js/firebase-config.js` (atau di mana pun file konfigurasinya berada) dan masukkan data berikut:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Deploy to GitHub Pages
1. Push project ke repository GitHub Anda.
2. Buka tab **Settings** > **Pages**.
3. Pada bagian *Build and deployment*, pilih branch **main** dan folder **/(root)** atau **/public**.
4. Klik Save dan tunggu proses build selesai.

### 5. Access the App
Buka tautan GitHub Pages (contoh: `https://naufalabufarhan2-arch.github.io/smart-room/`) untuk mulai menggunakan aplikasi.

---

## 💾 Firebase Firestore Data Structure

Terdapat 6 *collections* utama pada Firestore:

1. **`users`**: Menyimpan data pengguna (ID, nama, email, role).
2. **`rooms`**: Data master ruangan (ID, nama, kapasitas, fasilitas, status).
3. **`lockers`**: Data master loker (ID, roomId, status, esp32Id).
4. **`bookings`**: Transaksi peminjaman ruangan (ID, userId, roomId, date, startTime, endTime, status).
5. **`keyTransactions`**: Catatan pengambilan/pengembalian kunci (ID, bookingId, userId, pickupTime, returnTime).
6. **`notifications`**: Sistem notifikasi untuk pengguna (ID, userId, message, isRead, createdAt).

> Selengkapnya baca: [Database Structure Docs](docs/database-structure.md)

---

## 🌱 Default Seeding
Untuk menambahkan data ruangan dan loker pertama kalinya (seeding):
1. Daftar sebagai user biasa.
2. Ubah role akun Anda menjadi `admin` secara manual dari Firebase Console.
3. Login kembali ke aplikasi, akses halaman Admin Dashboard.
4. Tambahkan data ruangan dan loker melalui form yang disediakan.

---

## 🔌 ESP32 Integration
Sistem ini menggunakan ESP32 untuk membuka loker kunci secara otomatis.
- ESP32 terkoneksi melalui WiFi.
- Membaca status loker dari Firestore secara realtime.
- Saat peminjaman disetujui, admin mengirim sinyal (via database) yang memicu ESP32 untuk menyalakan Relay dan membuka kunci (*Solenoid Lock*).
> Baca: [Setup Guide](docs/setup-guide.md) untuk detail pemasangan hardware.

---

## 📸 Screenshots
![Dashboard](docs/screenshot_dashboard.png)
*(Placeholder untuk screenshot Dashboard)*

![Admin Panel](docs/screenshot_admin.png)
*(Placeholder untuk screenshot Admin Panel)*

---

## 🤝 Contributing
Kami menerima kontribusi! Untuk berkontribusi:
1. Fork repository ini.
2. Buat branch fitur baru (`git checkout -b fitur-keren`).
3. Commit perubahan (`git commit -m 'Menambahkan fitur keren'`).
4. Push ke branch (`git push origin fitur-keren`).
5. Buat **Pull Request**.

---

## 📄 License
Project ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detailnya.

---

**👤 Author:** [naufalabufarhan2-arch](https://github.com/naufalabufarhan2-arch)  
**📧 Contact:** Silakan buka *Issue* di repository ini jika terdapat pertanyaan atau kendala.
