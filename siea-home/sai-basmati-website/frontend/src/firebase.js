import { initializeApp, getApps } from "firebase/app";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  runTransaction,
  push
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDrZPJbXvflEP4Gqw64CsGi0XO7mO-OdJw",
  authDomain: "siea-reg-960b8.firebaseapp.com",
  databaseURL: "https://siea-reg-960b8-default-rtdb.firebaseio.com",
  projectId: "siea-reg-960b8",
  storageBucket: "siea-reg-960b8.firebasestorage.app",
  messagingSenderId: "624147907252",
  appId: "1:624147907252:web:e06b133e1772b246eccde1"
};

const app =
  !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);

/* ---------------- LOGOUT ---------------- */
export const logout = async () => {
  localStorage.removeItem("profile");
  localStorage.removeItem("isAdmin");
  await signOut(auth);
};

/* =====================================================
   🔑 FIX: RESOLVE ACTOR CORRECTLY (ADMIN SAFE)
===================================================== */
const resolveActor = () => {
  try {
    const stored = localStorage.getItem("profile");
    if (stored) {
      const profile = JSON.parse(stored);
      return {
        email: profile.email,
        uid: profile.uid || null,
        role: "admin"
      };
    }
  } catch (e) {}

  if (auth.currentUser) {
    return {
      email: auth.currentUser.email,
      uid: auth.currentUser.uid,
      role: "user"
    };
  }

  return {
    email: "System",
    uid: null,
    role: "system"
  };
};

/* =====================================================
   🧠 HISTORY LOGGER (FIXED)
===================================================== */
export const logHistory = async ({
  path,
  entity,
  action,
  before = null,
  after = null
}) => {
  const actor = resolveActor();

  await push(ref(db, "history"), {
    path,
    entity,
    action,
    before,
    after,
    actor: actor.email,
    actorUid: actor.uid,
    actorRole: actor.role,
    timestamp: Date.now()
  });
};

/* =====================================================
   ✍️ WRITE WITH HISTORY (UNCHANGED USAGE)
===================================================== */
export const writeWithHistory = async ({
  path,
  entity,
  data
}) => {
  const dataRef = ref(db, path);
  const snap = await get(dataRef);
  const before = snap.exists() ? snap.val() : null;

  const action =
    !before && data ? "CREATE" :
    before && !data ? "DELETE" :
    "UPDATE";

  await logHistory({
    path,
    entity,
    action,
    before,
    after: data
  });

  if (data === null) {
    await set(dataRef, null);
  } else {
    await set(dataRef, data);
  }
};

/* =====================================================
   🚀 SUBMIT QUOTE (UNCHANGED)
===================================================== */
export const submitQuote = async (data) => {
  const isSample = data.type === "sample_courier";

  const counterRef = ref(
    db,
    `counters/${isSample ? "sampleCourier" : "bulkQuote"}`
  );

  const result = await runTransaction(counterRef, (v) => (v || 0) + 1);
  if (!result.committed) throw new Error("Counter failed");

  const id = result.snapshot.val();
  const quoteId = isSample
    ? `SampleCourier-${id}`
    : `BulkQuote-${id}`;

  const path = `quotes/${isSample ? "sample_courier" : "bulk"}/${quoteId}`;

  await writeWithHistory({
    path,
    entity: "ORDER",
    data: {
      quoteId,
      ...data,
      status: "Pending",
      timestamp: Date.now()
    }
  });

  return quoteId;
};

export { deleteUser };
export default app;
