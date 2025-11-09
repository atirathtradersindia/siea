import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBu3EGdQAOCI8POVhtr3crb838Gqdep8wQ",
  authDomain: "siea-getquote.firebaseapp.com",
  databaseURL: "https://siea-getquote-default-rtdb.firebaseio.com",
  projectId: "siea-getquote",
  storageBucket: "siea-getquote.firebasestorage.app",
  messagingSenderId: "559028302487",
  appId: "1:559028302487:web:9541e5e9611353391b6fd2",
  measurementId: "G-93VNJEF6J0",
};

// 👇 Give this app a unique name: "QuoteApp"
const app =
  !getApps().some((a) => a.name === "QuoteApp")
    ? initializeApp(firebaseConfig, "QuoteApp")
    : getApps().find((a) => a.name === "QuoteApp");

// Analytics (optional)
try {
  getAnalytics(app);
} catch (err) {
  console.warn("Analytics not supported in this environment");
}

export const auth = getAuth(app);
export const db = getDatabase(app);

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// ✅ Save quote data to Realtime Database
export const submitQuote = async (data) => {
  try {
    const quoteRef = ref(db, "quotes");
    await push(quoteRef, data);
  } catch (error) {
    console.error("Failed to submit quote:", error);
  }
};

export default app;

