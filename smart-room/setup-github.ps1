# ================================================================
# SMART ROOM - Script Setup Git & Push ke GitHub
# Jalankan script ini setelah semua file selesai dibuat
# ================================================================
# Cara pakai:
#   1. Buka PowerShell di folder smart-room
#   2. Jalankan: .\setup-github.ps1
# ================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SMART ROOM - Git Setup & GitHub Push" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Konfigurasi
$GITHUB_USERNAME = "naufalabufarhan2-arch"
$REPO_NAME = "smart-room"
$REMOTE_URL = "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

Write-Host "[1/6] Inisialisasi Git repository..." -ForegroundColor Yellow
git init
git branch -M main

Write-Host "[2/6] Menambahkan semua file..." -ForegroundColor Yellow
git add .

Write-Host "[3/6] Membuat commit pertama..." -ForegroundColor Yellow
git commit -m "feat: Initial commit - SMART ROOM Sistem Peminjaman Ruangan & Loker Kunci Otomatis

- Landing page modern dengan animasi
- Sistem login & register dengan Firebase Auth
- Dashboard user & admin
- Manajemen ruangan & loker
- Sistem peminjaman dengan validasi jadwal
- Monitoring real-time
- Kalender jadwal
- Riwayat peminjaman
- Sistem notifikasi
- API documentation untuk ESP32
- Firestore security rules
- Setup documentation"

Write-Host "[4/6] Menambahkan remote GitHub..." -ForegroundColor Yellow
git remote add origin $REMOTE_URL

Write-Host "[5/6] Push ke GitHub (main branch)..." -ForegroundColor Yellow
Write-Host "CATATAN: Anda akan diminta username dan Personal Access Token (PAT)" -ForegroundColor Magenta
Write-Host "Buat PAT di: https://github.com/settings/tokens" -ForegroundColor Magenta
Write-Host ""
git push -u origin main

Write-Host ""
Write-Host "[6/6] Selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LANGKAH SELANJUTNYA:" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Buka: https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor White
Write-Host "2. Settings > Pages > Branch: main > Save" -ForegroundColor White
Write-Host "3. Website Anda akan live di:" -ForegroundColor White
Write-Host "   https://$GITHUB_USERNAME.github.io/$REPO_NAME" -ForegroundColor Green
Write-Host ""
Write-Host "4. Jangan lupa update js/firebase-config.js" -ForegroundColor Yellow
Write-Host "   dengan config Firebase Anda!" -ForegroundColor Yellow
Write-Host ""
