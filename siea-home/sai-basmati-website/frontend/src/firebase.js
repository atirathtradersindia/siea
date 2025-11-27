import { initializeApp, getApps } from "firebase/app";
import { getAuth, signOut, deleteUser } from "firebase/auth";   // ← add deleteUser
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDrZPJbXvflEP4Gqw64CsGi0XO7mO-OdJw",
  authDomain: "siea-reg-960b8.firebaseapp.com",
  databaseURL: "https://siea-reg-960b8-default-rtdb.firebaseio.com",
  projectId: "siea-reg-960b8",
  storageBucket: "siea-reg-960b8.firebasestorage.app",
  messagingSenderId: "624147907252",
  appId: "1:624147907252:web:e06b133e1772b246eccde1",
  measurementId: "G-4Q7V41H5L1"

};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);
export { deleteUser };               // ← export it

export const logout = async () => {
  try { await signOut(auth); } catch (e) { console.error(e); }
};

export default app;