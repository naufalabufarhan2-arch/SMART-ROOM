// =====================================================
// SMART ROOM - Database Helper
// =====================================================

const db = window.SmartRoom.db;

const SmartRoomDB = {
  // ROOMS
  rooms: {
    async getAll() {
      const snapshot = await db.collection('rooms').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
      const doc = await db.collection('rooms').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async create(data) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection('rooms').add(data);
      return docRef.id;
    },
    async update(id, data) {
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('rooms').doc(id).update(data);
      return true;
    },
    async delete(id) {
      await db.collection('rooms').doc(id).delete();
      return true;
    },
    async getAvailable() {
      const snapshot = await db.collection('rooms').where('status', '==', 'available').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    subscribeToChanges(callback) {
      return db.collection('rooms').onSnapshot(snapshot => {
        const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(rooms);
      });
    }
  },
  
  // LOCKERS
  lockers: {
    async getAll() {
      const snapshot = await db.collection('lockers').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
      const doc = await db.collection('lockers').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async create(data) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection('lockers').add(data);
      return docRef.id;
    },
    async update(id, data) {
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('lockers').doc(id).update(data);
      return true;
    },
    async delete(id) {
      await db.collection('lockers').doc(id).delete();
      return true;
    },
    async getByRoomId(roomId) {
      const snapshot = await db.collection('lockers').where('roomId', '==', roomId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    subscribeToChanges(callback) {
      return db.collection('lockers').onSnapshot(snapshot => {
        const lockers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(lockers);
      });
    }
  },
  
  // BOOKINGS
  bookings: {
    async getAll() {
      const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
      const doc = await db.collection('bookings').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async create(data) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      data.status = data.status || 'pending';
      const docRef = await db.collection('bookings').add(data);
      return docRef.id;
    },
    async update(id, data) {
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('bookings').doc(id).update(data);
      return true;
    },
    async getByUserId(userId) {
      const snapshot = await db.collection('bookings').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getByRoomId(roomId) {
      const snapshot = await db.collection('bookings').where('roomId', '==', roomId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getActiveBookings() {
      const snapshot = await db.collection('bookings').where('status', '==', 'active').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async checkConflict(roomId, date, startTime, endTime, excludeId = null) {
      const snapshot = await db.collection('bookings')
        .where('roomId', '==', roomId)
        .where('date', '==', date)
        .where('status', 'in', ['approved', 'active'])
        .get();
        
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      for (const b of bookings) {
        if (excludeId && b.id === excludeId) continue;
        if (startTime < b.endTime && endTime > b.startTime) {
          return true;
        }
      }
      return false;
    },
    async approve(id) {
      return this.update(id, { status: 'approved' });
    },
    async reject(id, reason) {
      return this.update(id, { status: 'rejected', rejectReason: reason });
    },
    subscribeToUserBookings(userId, callback) {
      return db.collection('bookings')
        .where('userId', '==', userId)
        .onSnapshot(snapshot => {
          const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          bookings.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          callback(bookings);
        });
    },
    subscribeToAll(callback) {
      return db.collection('bookings').onSnapshot(snapshot => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(bookings);
      });
    }
  },
  
  // KEY TRANSACTIONS
  keyTransactions: {
    async getAll() {
      const snapshot = await db.collection('key_transactions').orderBy('pickupTime', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
      const doc = await db.collection('key_transactions').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async create(data) {
      const docRef = await db.collection('key_transactions').add(data);
      return docRef.id;
    },
    async update(id, data) {
      await db.collection('key_transactions').doc(id).update(data);
      return true;
    },
    async getByBookingId(bookingId) {
      const snapshot = await db.collection('key_transactions').where('bookingId', '==', bookingId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getByUserId(userId) {
      const snapshot = await db.collection('key_transactions').where('userId', '==', userId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async pickupKey(bookingId, lockerId, userId) {
      const batch = db.batch();
      
      const transactionRef = db.collection('key_transactions').doc();
      batch.set(transactionRef, {
        bookingId,
        lockerId,
        userId,
        pickupTime: firebase.firestore.FieldValue.serverTimestamp(),
        returnTime: null,
        status: 'borrowed'
      });
      
      const lockerRef = db.collection('lockers').doc(lockerId);
      batch.update(lockerRef, { status: 'borrowed' });
      
      const bookingRef = db.collection('bookings').doc(bookingId);
      batch.update(bookingRef, { status: 'active' });
      
      await batch.commit();
      return transactionRef.id;
    },
    async returnKey(transactionId) {
      const transactionDoc = await this.getById(transactionId);
      if (!transactionDoc) throw new Error("Transaction not found");
      
      const bookingDoc = await SmartRoomDB.bookings.getById(transactionDoc.bookingId);
      if (!bookingDoc) throw new Error("Booking not found");
      
      const returnTime = new Date();
      const endTimeSplit = bookingDoc.endTime.split(':');
      const expectedEndDate = new Date(bookingDoc.date);
      expectedEndDate.setHours(parseInt(endTimeSplit[0]), parseInt(endTimeSplit[1]), 0, 0);
      
      let lateMinutes = 0;
      if (returnTime > expectedEndDate) {
        lateMinutes = Math.floor((returnTime - expectedEndDate) / 60000);
      }
      
      const batch = db.batch();
      const tRef = db.collection('key_transactions').doc(transactionId);
      batch.update(tRef, {
        returnTime: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'returned',
        lateMinutes
      });
      
      const lockerRef = db.collection('lockers').doc(transactionDoc.lockerId);
      batch.update(lockerRef, { status: 'available' });
      
      const bookingRef = db.collection('bookings').doc(transactionDoc.bookingId);
      batch.update(bookingRef, { status: 'completed' });
      
      await batch.commit();
      return { success: true, lateMinutes };
    },
    async getLateTransactions() {
      const snapshot = await db.collection('key_transactions').where('status', '==', 'borrowed').get();
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const lateList = [];
      const now = new Date();
      
      for (const t of transactions) {
        const booking = await SmartRoomDB.bookings.getById(t.bookingId);
        if (booking) {
          const endTimeSplit = booking.endTime.split(':');
          const expectedEndDate = new Date(booking.date);
          expectedEndDate.setHours(parseInt(endTimeSplit[0]), parseInt(endTimeSplit[1]), 0, 0);
          
          if (now > expectedEndDate) {
            lateList.push({ ...t, booking, lateMinutes: Math.floor((now - expectedEndDate) / 60000) });
          }
        }
      }
      return lateList;
    }
  },
  
  // NOTIFICATIONS
  notifications: {
    async getByUserId(userId) {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async create(userId, title, message) {
      const docRef = await db.collection('notifications').add({
        userId,
        title,
        message,
        isRead: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    },
    async markAsRead(id) {
      await db.collection('notifications').doc(id).update({ isRead: true });
    },
    async markAllAsRead(userId) {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();
        
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });
      await batch.commit();
    },
    async getUnreadCount(userId) {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();
      return snapshot.size;
    },
    subscribeToUserNotifications(userId, callback) {
      return db.collection('notifications')
        .where('userId', '==', userId)
        .onSnapshot(snapshot => {
          const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          notifications.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          callback(notifications);
        });
    }
  },
  
  // USERS
  users: {
    async getAll() {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
      const doc = await db.collection('users').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async update(id, data) {
      await db.collection('users').doc(id).update(data);
      return true;
    },
    async delete(id) {
      await db.collection('users').doc(id).delete();
      return true;
    }
  },

  // DASHBOARD STATS
  stats: {
    async getDashboardStats() {
      const roomsSnapshot = await db.collection('rooms').get();
      const bookingsSnapshot = await db.collection('bookings').where('status', '==', 'active').get();
      return {
        totalRooms: roomsSnapshot.size,
        activeBookings: bookingsSnapshot.size
      };
    },
    async getAdminStats() {
      const rooms = await db.collection('rooms').get();
      const users = await db.collection('users').get();
      const bookings = await db.collection('bookings').get();
      const pendingBookings = await db.collection('bookings').where('status', '==', 'pending').get();
      
      return {
        totalRooms: rooms.size,
        totalUsers: users.size,
        totalBookings: bookings.size,
        pendingBookings: pendingBookings.size
      };
    }
  }
};

window.SmartRoomDB = SmartRoomDB;
