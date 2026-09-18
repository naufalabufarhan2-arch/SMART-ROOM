// =====================================================
// SMART ROOM - Authentication Module
// =====================================================

const SmartRoomAuth = {
  // Current user data
  currentUser: null,
  currentUserData: null,

  // Initialize auth listener
  init(redirectOnAuth = null, requireRole = null) {
    window.SmartRoom.auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      
      if (user) {
        // User is signed in.
        const userData = await this.getUserData(user.uid);
        this.currentUserData = userData;
        
        if (redirectOnAuth) {
          if (userData && userData.role === 'admin') {
            window.location.href = '/admin/index.html';
          } else {
            window.location.href = '/dashboard.html';
          }
        }
        
        if (requireRole && userData) {
            if (requireRole === 'admin' && userData.role !== 'admin') {
                window.location.href = '/dashboard.html';
            } else if (requireRole === 'user' && userData.role !== 'user') {
                window.location.href = '/admin/index.html';
            }
        }
      } else {
        // No user is signed in.
        this.currentUserData = null;
        if (requireRole) {
            window.location.href = '/login.html';
        }
      }
    });
  },

  // Register new user
  async register(name, email, username, password, role = 'user') {
    try {
      const userCredential = await window.SmartRoom.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      const userData = {
        uid: user.uid,
        name,
        email,
        username,
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        avatar: initials
      };
      
      await window.SmartRoom.db.collection('users').doc(user.uid).set(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Register error:", error);
      let message = "Terjadi kesalahan saat registrasi.";
      if (error.code === 'auth/email-already-in-use') message = "Email sudah digunakan.";
      if (error.code === 'auth/weak-password') message = "Password terlalu lemah.";
      return { success: false, message };
    }
  },

  // Login
  async login(email, password) {
    try {
      const userCredential = await window.SmartRoom.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Login error:", error);
      let message = "Login gagal. Silakan periksa kembali email dan password Anda.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          message = "Email atau password salah.";
      }
      return { success: false, message };
    }
  },

  // Logout
  async logout() {
    try {
      await window.SmartRoom.auth.signOut();
      window.location.href = '/login.html';
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const doc = await window.SmartRoom.db.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // Check if user is admin
  isAdmin() {
    return this.currentUserData && this.currentUserData.role === 'admin';
  },

  // Update profile
  async updateProfile(data) {
    if (!this.currentUser) return { success: false, message: "User not logged in." };
    try {
      await window.SmartRoom.db.collection('users').doc(this.currentUser.uid).update(data);
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: "Gagal memperbarui profil." };
    }
  },

  // Show auth error in UI
  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `<div class="alert alert-danger">${message}</div>`;
      el.style.display = 'block';
    }
  },

  // Show auth success in UI  
  showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `<div class="alert alert-success">${message}</div>`;
      el.style.display = 'block';
    }
  }
};
window.SmartRoomAuth = SmartRoomAuth;
