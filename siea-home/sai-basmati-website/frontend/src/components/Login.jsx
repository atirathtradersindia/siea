import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import "../Login.css";
import logo from "../assets/logo.png";
import { useLanguage } from "../contexts/LanguageContext";

export default function Login({ setProfile }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = formData;

    if (!email) {
      setError(t("email_required"));
      setLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("invalid_email"));
      setLoading(false);
      return;
    }
    if (!password) {
      setError(t("password_required"));
      setLoading(false);
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user profile from Firebase database
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      let profileData;

      if (snapshot.exists()) {
        const userData = snapshot.val();
        profileData = {
          uid: user.uid,
          name: userData.fullName || user.displayName || "User",
          email: userData.email || user.email,
          phone: userData.phone || "",
          avatar: user.photoURL || "https://randomuser.me/api/portraits/men/32.jpg",
        };
      } else {
        // Fallback if no database entry exists
        profileData = {
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email,
          phone: "",
          avatar: user.photoURL || "https://randomuser.me/api/portraits/men/32.jpg",
        };
      }

      // Set profile in state and localStorage
      setProfile(profileData);
      localStorage.setItem("profile", JSON.stringify(profileData));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("userEmail", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("userEmail");
      }

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") setError(t("no_account_found"));
      else if (err.code === "auth/wrong-password") setError(t("incorrect_password"));
      else if (err.code === "auth/invalid-email") setError(t("invalid_email"));
      else if (err.code === "auth/too-many-requests")
        setError(t("too_many_attempts"));
      else setError(t("failed_to_login"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const rememberedEmail = localStorage.getItem("userEmail");

    if (remembered === "true" && rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="mobile-login-container">
      <div className="login-form-box">
        <img src={logo} alt={t("logo_alt_text")} className="login-logo" />
        <h1 className="login-title">{t("login")}</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t("email")}</label>
            <input
              type="email"
              name="email"
              placeholder={t("enter_email")}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>{t("password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("enter_password")}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span>{t("remember_me")}</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              {t("forgot_password")}
            </Link>
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? t("logging_in") : t("login")}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p className="register-link">
          {t("no_account")}{" "}
          <Link to="/register" className="register-link-text">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}