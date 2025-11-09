import React, { useState, useRef, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { auth, db, deleteUser } from "../firebase";   // ← import deleteUser
import { useLanguage } from "../contexts/LanguageContext";
import logo from "../assets/logo.png";
import "../Register.css";

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+971",
    phoneNumber: "",
  });
  const [phoneErr, setPhoneErr] = useState("");
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);

  const countryOptions = [
    { code: "+91", label: "+91 (India)", len: 10 },
    { code: "+1",  label: "+1 (USA)",   len: 10 },
    { code: "+44", label: "+44 (UK)",   len: 10 },
    { code: "+971",label: "+971 (UAE)", len: 9 },
    { code: "+61", label: "+61 (AU)",   len: 9 },
    { code: "+98", label: "+98 (Iran)", len: 10 },
  ];

  const phoneLen = () => {
    const sel = countryOptions.find(o => o.code === form.countryCode);
    return sel ? sel.len : 10;
  };

  // reset phone when country changes
  useEffect(() => {
    setForm(p => ({ ...p, phoneNumber: "" }));
    setPhoneErr("");
  }, [form.countryCode]);

  const validatePhone = () => {
    const v = form.phoneNumber.trim();
    if (!/^\d+$/.test(v)) return t("phone_digits_error");
    if (v.length !== phoneLen()) return t("phone_length_error").replace("{length}", phoneLen());
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGlobalErr("");
    setPhoneErr("");

    // ---- client validation -------------------------------------------------
    const pErr = validatePhone();
    if (pErr) { setPhoneErr(pErr); return; }

    if (!form.fullName.trim()) return setGlobalErr(t("full_name_required"));
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setGlobalErr(t("email_invalid"));
    if (form.password.length < 6) return setGlobalErr(t("password_min_length"));
    if (form.password !== form.confirmPassword) return setGlobalErr(t("passwords_mismatch"));

    const phone = form.countryCode + form.phoneNumber.trim();

    setLoading(true);
    let cred = null;

    try {
      // 1. CREATE AUTH USER
      cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      console.log("Auth user created →", cred.user.uid);

      // 2. UPDATE DISPLAY NAME
      await updateProfile(cred.user, { displayName: form.fullName });

      // 3. WRITE TO REALTIME DB
      const userRef = ref(db, `users/${cred.user.uid}`);
      console.log("Writing DB →", userRef.toString());

      await set(userRef, {
        fullName: form.fullName,
        email: form.email,
        phone,
        createdAt: new Date().toISOString(),
      });
      console.log("DB write OK");

      // SUCCESS
      alert(
        `${t("registration_success")}\n\n${t("name")}: ${form.fullName}\n${t("email")}: ${form.email}\n${t("phone")}: ${phone}`
      );
      navigate("/login");
    } catch (err) {
      console.error("Registration error →", err);

      // ---- IF DB WRITE FAILED BUT AUTH SUCCEEDED → DELETE AUTH USER ----
      if (cred?.user && err.code === "permission-denied") {
        try {
          await deleteUser(cred.user);
          console.log("Orphan Auth user removed");
        } catch (delErr) {
          console.error("Could not delete orphan user:", delErr);
        }
      }

      // ---- USER-FRIENDLY MESSAGES ----
      let msg = t("registration_failed");
      if (err.code === "auth/email-already-in-use") msg = t("email_already_used");
      else if (err.code === "auth/invalid-email") msg = t("email_invalid");
      else if (err.code === "auth/weak-password") msg = t("password_weak");
      else if (err.code === "permission-denied") msg = t("db_permission_error") || "Database permission denied";
      else msg = err.message || msg;

      setGlobalErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container">
      <div className="form-box">
        <img src={logo} alt={t("logo_alt_text")} className="logo" />
        <h1>{t("register_title")}</h1>

        <form className="form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="input-group">
            <label>{t("full_name")}</label>
            <input
              type="text"
              placeholder={t("full_name_placeholder")}
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label>{t("email")}</label>
            <input
              type="email"
              placeholder={t("email_placeholder")}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Phone */}
          <div className="input-group">
            <label>{t("phone")}</label>
            <div className="phone-input">
              <select
                value={form.countryCode}
                onChange={e => setForm({ ...form, countryCode: e.target.value })}
              >
                {countryOptions.map(o => (
                  <option key={o.code} value={o.code}>{o.label}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder={t("phone_placeholder").replace("{length}", phoneLen())}
                value={form.phoneNumber}
                maxLength={phoneLen()}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "") })}
                required
              />
            </div>
            {phoneErr && <p className="error-text">{phoneErr}</p>}
          </div>

          {/* Password */}
          <div className="input-group">
            <label>{t("password")}</label>
            <input
              type="password"
              placeholder={t("password_placeholder")}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label>{t("confirm_password")}</label>
            <input
              type="password"
              placeholder={t("confirm_password_placeholder")}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? t("creating_account") : t("register")}
          </button>
        </form>

        {globalErr && <p className="error-text">{globalErr}</p>}

        <p className="login-link">
          {t("already_have_account")} <a href="/login">{t("login")}</a>
        </p>
      </div>
    </div>
  );
}