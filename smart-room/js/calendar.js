const CalendarManager = {
  calendar: null,
  allEvents: [],
  selectedRoomFilter: 'all',
  roomsCache: {},

  async init(elementId) {
    const calendarEl = document.getElementById(elementId);
    if (!calendarEl) return;

    try {
      const rooms = await SmartRoomDB.rooms.getAll();
      rooms.forEach(r => { this.roomsCache[r.id] = r; });
    } catch(e) { console.error('Error fetching rooms:', e); }

    this.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      locale: 'id',
      slotMinTime: '07:00:00',
      slotMaxTime: '22:00:00',
      allDaySlot: false,
      events: async (fetchInfo, successCallback, failureCallback) => {
        try {
          const events = await this.loadEvents(this.selectedRoomFilter, fetchInfo.startStr, fetchInfo.endStr);
          successCallback(events);
        } catch (e) {
          failureCallback(e);
        }
      },
      eventClick: (info) => {
        this.showEventDetail(info.event);
      }
    });

    this.calendar.render();
  },

  async loadEvents(roomFilter = 'all', startStr, endStr) {
    this.selectedRoomFilter = roomFilter;
    try {
      const bookings = await SmartRoomDB.bookings.getAll();
      this.allEvents = [];

      bookings.forEach(booking => {
        if (booking.status === 'cancelled' || booking.status === 'rejected') return;
        if (roomFilter !== 'all' && booking.roomId !== roomFilter) return;

        const room = this.roomsCache[booking.roomId] || { name: 'Unknown Room' };
        this.allEvents.push(this.bookingToEvent(booking, room.name, booking.borrowerName));
      });

      return this.allEvents;
    } catch (error) {
      console.error('Error loading calendar events:', error);
      return [];
    }
  },

  bookingToEvent(booking, roomName, borrowerName) {
    const startDate = `${booking.date}T${booking.startTime}:00`;
    const endDate = `${booking.date}T${booking.endTime}:00`;
    
    return {
      id: booking.id,
      title: `${borrowerName} - ${roomName}`,
      start: startDate,
      end: endDate,
      color: this.getRoomColor(booking.roomId),
      extendedProps: {
        roomId: booking.roomId,
        roomName: roomName,
        borrowerName: borrowerName,
        purpose: booking.purpose,
        status: booking.status,
        participants: booking.participants
      }
    };
  },

  getRoomColor(roomId) {
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) {
      hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  },

  filterByRoom(roomId) {
    this.selectedRoomFilter = roomId;
    if (this.calendar) {
      this.calendar.refetchEvents();
    }
  },

  showEventDetail(event) {
    const props = event.extendedProps;
    const modalHtml = `
      <div class="modal fade" id="eventDetailModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detail Pemesanan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p><strong>Peminjam:</strong> ${props.borrowerName}</p>
              <p><strong>Ruangan:</strong> ${props.roomName}</p>
              <p><strong>Waktu:</strong> ${event.start.toLocaleString()} - ${event.end.toLocaleString()}</p>
              <p><strong>Tujuan:</strong> ${props.purpose}</p>
              <p><strong>Jumlah Peserta:</strong> ${props.participants}</p>
              <p><strong>Status:</strong> <span class="badge bg-primary">${props.status}</span></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existingModal = document.getElementById('eventDetailModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById('eventDetailModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
    
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.remove();
    });
  },

  refresh() {
    if (this.calendar) {
      this.calendar.refetchEvents();
    }
  },

  getTodayEvents() {
    const today = new Date().toISOString().split('T')[0];
    return this.allEvents.filter(e => e.start.startsWith(today));
  }
};
