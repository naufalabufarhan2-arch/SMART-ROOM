const MonitoringManager = {
  countdownIntervals: {},
  lateCheckInterval: null,
  activeSubscriptions: [],

  init(containerElementId) {
    this.containerId = containerElementId;
    
    this.activeSubscriptions.forEach(unsub => unsub());
    this.activeSubscriptions = [];
    
    const unsubRooms = this.subscribeToRooms((rooms) => {
      this.renderRooms(rooms);
    });
    this.activeSubscriptions.push(unsubRooms);

    this.lateCheckInterval = setInterval(() => {
      this.getTodayActiveBookings().then(bookings => {
        this.checkForLateBookings(bookings);
      });
    }, 60000);
  },

  async renderRooms(rooms) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    container.innerHTML = '';
    for (const room of rooms) {
      const bookings = await SmartRoomDB.bookings.getByRoomAndDate(room.id, new Date().toISOString().split('T')[0]);
      const nowTime = new Date().toTimeString().substring(0,5);
      const activeBooking = bookings.find(b => b.status === 'active' || (b.status === 'approved' && b.startTime <= nowTime && b.endTime >= nowTime));
      
      let keyTransaction = null;
      if (activeBooking) {
         keyTransaction = await SmartRoomDB.keyTransactions.getLatestForBooking(activeBooking.id);
      }

      container.innerHTML += this.createRoomCard(room, activeBooking, keyTransaction);
      
      if (activeBooking && activeBooking.status === 'active') {
        this.startCountdown(activeBooking.id, `${activeBooking.date}T${activeBooking.endTime}:00`, `countdown-${room.id}`);
      }
    }
  },

  createRoomCard(room, activeBooking, keyTransaction) {
    const isOccupied = room.status === 'occupied' || (activeBooking && activeBooking.status === 'active');
    const statusColor = isOccupied ? 'danger' : (room.status === 'maintenance' ? 'warning' : 'success');
    const statusText = isOccupied ? 'Digunakan' : (room.status === 'maintenance' ? 'Perbaikan' : 'Tersedia');
    
    let bookingInfo = '<p class="text-muted mb-0">Tidak ada jadwal saat ini</p>';
    if (activeBooking) {
      bookingInfo = `
        <div class="booking-info mt-2">
          <p class="mb-1 fw-bold">${activeBooking.borrowerName}</p>
          <p class="mb-1 small"><i class="fas fa-clock"></i> ${activeBooking.startTime} - ${activeBooking.endTime}</p>
          <p class="mb-0 small text-primary" id="countdown-${room.id}"></p>
        </div>
      `;
    }

    let keyInfo = '';
    if (keyTransaction && keyTransaction.status === 'borrowed') {
      keyInfo = `<span class="badge bg-warning text-dark"><i class="fas fa-key"></i> Kunci Diambil</span>`;
    } else if (keyTransaction && keyTransaction.status === 'returned') {
      keyInfo = `<span class="badge bg-success"><i class="fas fa-key"></i> Kunci Dikembalikan</span>`;
    }

    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 room-monitoring-card border-top-${statusColor}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">${room.name}</h5>
              <span class="badge bg-${statusColor}">${statusText}</span>
            </div>
            ${keyInfo}
            <hr>
            ${bookingInfo}
          </div>
          <div class="card-footer bg-transparent border-top-0">
             <button class="btn btn-sm btn-outline-primary w-100" onclick="console.log('View history ${room.id}')">Lihat Riwayat</button>
          </div>
        </div>
      </div>
    `;
  },

  startCountdown(bookingId, endDateTimeStr, elementId) {
    this.stopCountdown(bookingId);
    
    this.countdownIntervals[bookingId] = setInterval(() => {
      const el = document.getElementById(elementId);
      if (!el) {
        this.stopCountdown(bookingId);
        return;
      }
      
      const timeInfo = this.formatTimeRemaining(endDateTimeStr);
      if (timeInfo.totalSeconds <= 0) {
        el.innerHTML = '<span class="text-danger fw-bold"><i class="fas fa-exclamation-circle"></i> Waktu Habis</span>';
        this.stopCountdown(bookingId);
      } else {
        el.innerHTML = `Sisa Waktu: ${timeInfo.hours}j ${timeInfo.minutes}m ${timeInfo.seconds}s`;
        if (timeInfo.totalSeconds < 900) {
           el.classList.replace('text-primary', 'text-danger');
           el.classList.add('fw-bold');
        }
      }
    }, 1000);
  },

  stopCountdown(bookingId) {
    if (this.countdownIntervals[bookingId]) {
      clearInterval(this.countdownIntervals[bookingId]);
      delete this.countdownIntervals[bookingId];
    }
  },

  stopAll() {
    Object.keys(this.countdownIntervals).forEach(id => this.stopCountdown(id));
    if (this.lateCheckInterval) clearInterval(this.lateCheckInterval);
    this.activeSubscriptions.forEach(unsub => unsub());
  },

  checkForLateBookings(bookings) {
    const now = new Date();
    const lateBookings = [];
    
    bookings.forEach(booking => {
      if (booking.status !== 'active') return;
      
      const endTime = new Date(`${booking.date}T${booking.endTime}:00`);
      if (now > endTime) {
        lateBookings.push(booking);
        console.warn(`Booking ${booking.id} is late!`);
      }
    });
    
    return lateBookings;
  },

  updateRoomCard(roomId, status, bookingData) {
    // Optional selective DOM update logic
  },

  formatTimeRemaining(endDateTimeStr) {
    const end = new Date(endDateTimeStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isLate: true, totalSeconds: 0 };

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      isLate: false,
      totalSeconds
    };
  },

  async getTodayActiveBookings() {
    const today = new Date().toISOString().split('T')[0];
    try {
      if(typeof SmartRoomDB !== 'undefined' && SmartRoomDB.bookings) {
        return await SmartRoomDB.bookings.getByDate(today);
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  subscribeToRooms(callback) {
    if(typeof firebase === 'undefined') return () => {};
    const db = firebase.firestore();
    return db.collection('rooms').onSnapshot(snapshot => {
      const rooms = [];
      snapshot.forEach(doc => rooms.push({ id: doc.id, ...doc.data() }));
      callback(rooms);
    });
  },

  subscribeToActiveBookings(callback) {
    if(typeof firebase === 'undefined') return () => {};
    const db = firebase.firestore();
    const today = new Date().toISOString().split('T')[0];
    return db.collection('bookings')
      .where('date', '==', today)
      .where('status', 'in', ['approved', 'active'])
      .onSnapshot(snapshot => {
        const bookings = [];
        snapshot.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));
        callback(bookings);
      });
  }
};
