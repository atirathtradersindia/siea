import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logoUrl from "../assets/logo.png";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navbar({ profile, handleLogout, onProfileClick = () => { } }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const closeMenu = () => setMenuOpen(false);

  const handleSectionNavigation = (sectionId, isFooter = false) => {
    closeMenu();
    if (location.pathname === "/") {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const scrollTo = isFooter ? document.body.scrollHeight : element.offsetTop - 80;
          window.scrollTo({ top: scrollTo, behavior: "smooth" });
        }
      }, 100);
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  const openSampleCourierForm = () => {
    closeMenu();
    navigate("/service");
    setTimeout(() => {
      const dropdown = document.querySelector('.service-dropdown-container .region-button');
      if (dropdown) dropdown.click();

      setTimeout(() => {
        const option = Array.from(document.querySelectorAll('.dropdown-item'))
          .find(el => el.textContent.includes("Sample Courier Services"));
        if (option) option.click();
      }, 300);
    }, 500);
  };

  return (
    <nav className="tw-sticky tw-top-0 tw-z-50 tw-py-3 tw-backdrop-blur-md tw-bg-black/20 tw-shadow-lg">
      <div className="tw-flex tw-justify-between tw-items-center tw-w-full tw-px-4 lg:tw-px-6">
        <NavLink to="/" className="tw-flex tw-items-center tw-gap-2 tw-no-underline" onClick={closeMenu}>
          <img src={logoUrl} alt="Sai Import Exports & Agro" width="36" height="36" className="tw-block" />
          <span className="tw-font-bold tw-text-yellow-400 tw-text-lg">{t("brand")}</span>
        </NavLink>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="tw-text-yellow-400 hover:tw-text-yellow-300 tw-transition tw-duration-150 lg:tw-hidden tw-p-2 focus:tw-outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tw-text-yellow-400">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <div
          className={`${menuOpen ? "tw-flex" : "tw-hidden"
            } tw-flex-col lg:tw-flex lg:tw-flex-row tw-w-full lg:tw-w-auto 
          tw-bg-black/50 tw-backdrop-blur-md tw-rounded-xl
          tw-pt-4 lg:tw-pt-0 tw-gap-6 lg:tw-gap-8 
          tw-items-start lg:tw-items-center 
          tw-absolute lg:tw-relative tw-left-0 tw-right-0 tw-top-16 lg:tw-top-auto 
          tw-z-40 tw-px-6 lg:tw-px-0 tw-shadow-lg lg:tw-shadow-none`}
        >
          <ul className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-6 tw-w-full lg:tw-w-auto">
            <li>
              <NavLink end to="/" className={({ isActive }) => `tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150 ${isActive ? "tw-text-white tw-font-medium" : ""}`} onClick={closeMenu}>
                {t("home")}
              </NavLink>
            </li>

            <li>
              <NavLink to="/about" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("about_us")}
              </NavLink>
            </li>

            <li>
              <NavLink to="/products" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("products")}
              </NavLink>
            </li>

            <li>
              <NavLink to="/market-rates" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("market_rates")}
              </NavLink>
            </li>

            <li>
              <NavLink to="/service" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("services")}
              </NavLink>
            </li>

            <li>
              <button
                onClick={openSampleCourierForm}
                className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150 tw-font-medium"
              >
                Sample Courier Service
              </button>
            </li>

            <li>
              <NavLink to="/join-us" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("join_us")}
              </NavLink>
            </li>

            <li>
              <NavLink to="/blog" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("blog")}
              </NavLink>
            </li>

            <li>
              <NavLink to="/contact" className="tw-block tw-py-1 tw-text-yellow-400 hover:tw-text-yellow-300 hover:tw-underline tw-transition tw-duration-150" onClick={closeMenu}>
                {t("contact")}
              </NavLink>
            </li>

            {profile ? (
              <li>
                <button
                  onClick={() => {
                    closeMenu();
                    onProfileClick();
                  }}
                  className="tw-block tw-w-full lg:tw-w-auto tw-bg-yellow-400 tw-text-black tw-px-6 tw-py-2 tw-rounded tw-font-medium hover:tw-bg-yellow-300 tw-transition tw-duration-150"
                >
                  {t("profile_button")}
                </button>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className="tw-block tw-w-full lg:tw-w-auto tw-bg-yellow-400 tw-text-black tw-px-6 tw-py-2 tw-rounded tw-font-medium hover:tw-bg-yellow-300 tw-transition tw-duration-150" onClick={closeMenu}>
                    {t("login")}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" className="tw-block tw-w-full lg:tw-w-auto tw-bg-yellow-400 tw-text-black tw-px-6 tw-py-2 tw-rounded tw-font-medium hover:tw-bg-yellow-300 tw-transition tw-duration-150" onClick={closeMenu}>
                    {t("register")}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}