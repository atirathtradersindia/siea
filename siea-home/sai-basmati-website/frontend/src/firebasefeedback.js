// firebasefeedback.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // ✅ Realtime Database

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJrrQUJcoTvmuF-cyi7R82kCvqLWtdamI",
  authDomain: "siea-feedback.firebaseapp.com",
  databaseURL: "https://siea-feedback-default-rtdb.firebaseio.com", // ✅ RTDB URL
  projectId: "siea-feedback",
  storageBucket: "siea-feedback.appspot.com", // ✅ FIXED
  messagingSenderId: "494833697559",
  appId: "1:494833697559:web:0784e5fe7d298ad75cad52",
  measurementId: "G-X0MDKTNW8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Export Realtime DB
export const db = getDatabase(app);
