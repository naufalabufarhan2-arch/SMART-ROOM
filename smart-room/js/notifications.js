// =====================================================
// SMART ROOM - Notifications System
// =====================================================

const SmartRoomNotifications = {
  async createNotification(userId, title, message) {
    if (window.SmartRoomDB) {
      return await window.SmartRoomDB.notifications.create(userId, title, message);
    }
    return null;
  },

  async sendBookingApprovedNotification(userId, roomName, date, startTime, endTime) {
    const title = "Peminjaman Disetujui";
    const message = `Peminjaman ruangan ${roomName} pada ${date} pukul ${startTime}-${endTime} telah disetujui.`;
    return await this.createNotification(userId, title, message);
  },

  async sendBookingRejectedNotification(userId, roomName, reason) {
    const title = "Peminjaman Ditolak";
    const message = `Peminjaman ruangan ${roomName} ditolak. Alasan: ${reason}`;
    return await this.createNotification(userId, title, message);
  },

  async sendKeyPickedUpNotification(userId, roomName, lockerNumber) {
    const title = "Kunci Diambil";
    const message = `Kunci untuk ruangan ${roomName} telah diambil dari Loker ${lockerNumber}.`;
    return await this.createNotification(userId, title, message);
  },

  async sendKeyReturnedNotification(userId, roomName) {
    const title = "Kunci Dikembalikan";
    const message = `Kunci untuk ruangan ${roomName} telah dikembalikan. Terima kasih.`;
    return await this.createNotification(userId, title, message);
  },

  async sendLateWarningNotification(userId, roomName, minutesLate) {
    const title = "Peringatan Keterlambatan";
    const message = `Waktu peminjaman ruangan ${roomName} telah habis. Anda terlambat ${minutesLate} menit mengembalikan kunci.`;
    return await this.createNotification(userId, title, message);
  },

  showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    let icon = 'info-circle';
    let theme = 'primary';

    if (type === 'success') { icon = 'check-circle'; theme = 'success'; }
    else if (type === 'error') { icon = 'exclamation-circle'; theme = 'danger'; }
    else if (type === 'warning') { icon = 'exclamation-triangle'; theme = 'warning'; }

    const toastHtml = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header text-${theme}">
          <i class="fas fa-${icon} me-2"></i>
          <strong class="me-auto text-capitalize">${type}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    
    if (typeof bootstrap !== 'undefined') {
      const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
      toast.show();
    } else {
      toastElement.style.display = 'block';
      setTimeout(() => { toastElement.style.display = 'none'; }, 5000);
    }

    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  },

  updateBadge(count) {
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    });
  }
};

window.SmartRoomNotifications = SmartRoomNotifications;
