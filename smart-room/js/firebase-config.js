// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoyLaifiLz9sxIUMhJGKAV64vkxHWpAVw",
  authDomain: "smart-room-f2218.firebaseapp.com",
  projectId: "smart-room-f2218",
  storageBucket: "smart-room-f2218.firebasestorage.app",
  messagingSenderId: "500980112934",
  appId: "1:500980112934:web:5a76f2a5424c4f53bc90e7",
  measurementId: "G-6SZL31GFV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
