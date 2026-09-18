// =====================================================
// SMART ROOM - Firebase Configuration
// =====================================================
// PENTING: Ganti nilai di bawah ini dengan konfigurasi
// Firebase project Anda yang sebenarnya.
// Cara mendapatkan: Firebase Console > Project Settings > Your Apps
// =====================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore settings
db.settings({ experimentalForceLongPolling: true });

// Export for use in other modules
// (using window object since we're not using ES modules)
window.SmartRoom = window.SmartRoom || {};
window.SmartRoom.auth = auth;
window.SmartRoom.db = db;
