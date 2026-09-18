const BookingManager = {
  selectedRoom: null,
  conflictingBookings: [],

  async loadRooms(selectElementId) {
    try {
      const rooms = await SmartRoomDB.rooms.getAll();
      const selectElement = document.getElementById(selectElementId);
      if (!selectElement) return;
      
      selectElement.innerHTML = '<option value="">Pilih Ruangan</option>';
      rooms.forEach(room => {
        if (room.status !== 'maintenance') {
          const option = document.createElement('option');
          option.value = room.id;
          option.textContent = `${room.name} (Kapasitas: ${room.capacity})`;
          selectElement.appendChild(option);
        }
      });
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  },

  async showRoomDetails(roomId, containerElementId) {
    try {
      const room = await SmartRoomDB.rooms.getById(roomId);
      const container = document.getElementById(containerElementId);
      if (!container || !room) return;

      this.selectedRoom = room;
      container.innerHTML = `
        <div class="card mb-3">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${room.imageUrl || 'assets/img/room-placeholder.jpg'}" class="img-fluid rounded-start h-100 object-fit-cover" alt="${room.name}">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${room.name}</h5>
                <p class="card-text">${room.description || 'Tidak ada deskripsi'}</p>
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <span class="badge bg-primary"><i class="fas fa-users"></i> Kapasitas: ${room.capacity}</span>
                  ${room.facilities.map(f => `<span class="badge bg-secondary"><i class="fas fa-check"></i> ${f}</span>`).join('')}
                </div>
                <p class="card-text"><small class="text-muted">Status: ${room.status === 'available' ? 'Tersedia' : 'Sedang Digunakan'}</small></p>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error showing room details:', error);
    }
  },

  async checkAvailability(roomId, date, startTime, endTime, excludeBookingId = null) {
    try {
      const bookings = await SmartRoomDB.bookings.getByRoomAndDate(roomId, date);
      
      const conflicts = bookings.filter(booking => {
        if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'rejected') return false;
        if (excludeBookingId && booking.id === excludeBookingId) return false;
        
        const newStart = new Date(`${date}T${startTime}`);
        const newEnd = new Date(`${date}T${endTime}`);
        const existingStart = new Date(`${booking.date}T${booking.startTime}`);
        const existingEnd = new Date(`${booking.date}T${booking.endTime}`);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });

      this.conflictingBookings = conflicts;
      return {
        available: conflicts.length === 0,
        conflicts: conflicts
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: false, conflicts: [] };
    }
  },

  showConflictWarning(conflicts, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    if (!conflicts || conflicts.length === 0) {
      container.innerHTML = '';
      return;
    }

    let conflictList = conflicts.map(c => `<li>${c.startTime} - ${c.endTime} (${c.borrowerName || 'Sudah dipesan'})</li>`).join('');
    container.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i> Waktu bentrok dengan pemesanan berikut:
        <ul class="mb-0 mt-2">${conflictList}</ul>
      </div>
    `;
  },

  validateForm(formData) {
    const errors = {};
    if (!formData.roomId) errors.roomId = 'Ruangan harus dipilih';
    if (!formData.date) errors.date = 'Tanggal harus diisi';
    if (!formData.startTime) errors.startTime = 'Waktu mulai harus diisi';
    if (!formData.endTime) errors.endTime = 'Waktu selesai harus diisi';
    if (!formData.purpose) errors.purpose = 'Tujuan penggunaan harus diisi';
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.time = 'Waktu selesai harus lebih besar dari waktu mulai';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  async submitBooking(formData) {
    const validation = this.validateForm(formData);
    if (!validation.valid) {
      return { success: false, error: 'Silakan periksa kembali form Anda', errors: validation.errors };
    }

    try {
      const availability = await this.checkAvailability(
        formData.roomId, 
        formData.date, 
        formData.startTime, 
        formData.endTime
      );
      
      if (!availability.available) {
        return { success: false, error: 'Jadwal bentrok dengan pemesanan lain' };
      }

      const currentUser = AuthManager.getCurrentUser();
      if (!currentUser) throw new Error("Not authenticated");

      const bookingData = {
        roomId: formData.roomId,
        userId: currentUser.uid,
        borrowerName: currentUser.displayName || formData.borrowerName,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        participants: parseInt(formData.participants) || 1,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const bookingId = await SmartRoomDB.bookings.create(bookingData);
      
      await SmartRoomDB.notifications.create({
        userId: 'admin',
        type: 'new_booking',
        message: `Pemesanan baru oleh ${bookingData.borrowerName} untuk ruangan ${this.selectedRoom?.name || formData.roomId}`,
        read: false,
        createdAt: new Date().toISOString()
      });

      return { success: true, bookingId };
    } catch (error) {
      console.error('Error submitting booking:', error);
      return { success: false, error: error.message };
    }
  },

  async cancelBooking(bookingId) {
    try {
      await SmartRoomDB.bookings.update(bookingId, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error canceling booking:', error);
      return false;
    }
  },

  formatBookingCard(booking, roomData) {
    const statusColors = {
      'pending': 'warning',
      'approved': 'primary',
      'active': 'success',
      'completed': 'secondary',
      'cancelled': 'danger',
      'rejected': 'danger'
    };
    const statusText = {
      'pending': 'Menunggu Persetujuan',
      'approved': 'Disetujui',
      'active': 'Sedang Berlangsung',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
      'rejected': 'Ditolak'
    };

    return `
      <div class="card booking-card border-left-${statusColors[booking.status] || 'secondary'} mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0">${roomData ? roomData.name : 'Ruangan'}</h5>
            <span class="badge bg-${statusColors[booking.status] || 'secondary'}">${statusText[booking.status] || booking.status}</span>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <p class="mb-1"><i class="fas fa-calendar-alt me-2 text-muted"></i>${booking.date}</p>
              <p class="mb-1"><i class="fas fa-clock me-2 text-muted"></i>${booking.startTime} - ${booking.endTime}</p>
            </div>
            <div class="col-sm-6">
              <p class="mb-1"><i class="fas fa-info-circle me-2 text-muted"></i>${booking.purpose}</p>
              <p class="mb-0"><i class="fas fa-users me-2 text-muted"></i>${booking.participants} Orang</p>
            </div>
          </div>
          ${booking.status === 'pending' || booking.status === 'approved' ? `
            <div class="mt-3 text-end">
              <button class="btn btn-sm btn-outline-danger" onclick="BookingManager.cancelBooking('${booking.id}').then(() => location.reload())">Batalkan</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  async getUserActiveBooking(userId) {
    try {
      const bookings = await SmartRoomDB.bookings.getByUser(userId);
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().substring(0,5);
      
      return bookings.find(b => b.date === today && (b.status === 'approved' || b.status === 'active') && b.endTime > now);
    } catch (error) {
      console.error('Error getting user active booking:', error);
      return null;
    }
  }
};
