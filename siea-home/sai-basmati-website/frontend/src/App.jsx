import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext"; // Add this import

import Navbar from "./components/Navbar";
import NavbarProd from "./components/NavbarProd";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import PriceTrends from "./pages/PriceTrends";
import Prices from "./pages/Prices";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import GoldenRiceAnimation from "./components/GoldenRiceAnimation";
import Logo from "./assets/logo.png";
import Register from "./components/Register";
import Login from "./components/Login";
import ProductApp from "./components/ProductApp";
import ProfilePanel from "./components/ProfilePanel";
import Feedback from "./pages/Feedback";
import Contact from "./components/Contact";
import Service from "./components/Service";
import Blog from "./components/Blog";
import Transport from "./components/Transport";
import ForgotPassword from "./components/ForgotPassword";
import SeaFreight from "./components/SeaFreight";
import JoinUs from "./pages/JoinUs";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const scrollTo =
            id === "footer" ? document.body.scrollHeight : element.offsetTop - 100;
          window.scrollTo({ top: scrollTo, behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  return null;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Load profile from localStorage (null if not present)
  const [profile, setProfile] = useState(() => {
    try {
      const s = localStorage.getItem("profile");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  // State for warning popup
  const [showWarningPopup, setShowWarningPopup] = useState(false);

  // Keep localStorage in sync when profile changes
  useEffect(() => {
    try {
      if (profile) localStorage.setItem("profile", JSON.stringify(profile));
      else localStorage.removeItem("profile");
    } catch (e) {
      /* ignore storage errors */
    }
  }, [profile]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    setProfile(null);
    setIsProfileOpen(false);
    localStorage.removeItem("profile");
    console.log("Logged out, profile cleared");
  };

  const openProfilePanel = () => {
    if (!profile) {
      setShowWarningPopup(true);
      console.log("Profile access attempted while signed out, showing warning");
      return;
    }
    setIsProfileOpen(true);
  };

  const closeProfilePanel = () => setIsProfileOpen(false);

  const closeWarningPopup = () => {
    setShowWarningPopup(false);
    console.log("Warning popup closed");
  };

  const showWarning = () => {
    setShowWarningPopup(true);
    console.log("Warning popup triggered");
  };

  const searchProducts = (query) => {
    console.log("Search products:", query);
  };

  const showProductsPage = () => navigate("/Products-All");
  const goHome = () => navigate("/");
  const toggleNav = (open) => setIsNavOpen(open);
  const isProductsPage = location.pathname === "/Products-All";

  return (
    <LanguageProvider> {/* Wrap the entire app with LanguageProvider */}
      <div className="tw-relative tw-min-h-screen tw-flex tw-flex-col">
        <div className="tw-fixed tw-inset-0 -tw-z-10">
          <GoldenRiceAnimation />
        </div>

        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center -tw-z-10 pointer-events-none">
          <img
            src={Logo}
            alt="Company Logo"
            className="tw-w-72 tw-h-72 md:tw-w-[28rem] md:tw-h-[28rem] lg:tw-w-[34rem] lg:tw-h-[34rem] tw-opacity-90"
          />
        </div>

        <div className="tw-flex tw-flex-col tw-min-h-screen tw-backdrop-blur-sm tw-bg-black/20 tw-text-white">
          {isProductsPage ? (
            <div className="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-h-[60px] tw-z-50 tw-bg-[#111111]">
              <NavbarProd
                searchProducts={searchProducts}
                showProductsPage={showProductsPage}
                showProfilePanel={openProfilePanel}
                goHome={goHome}
                isNavOpen={isNavOpen}
                toggleNav={toggleNav}
                profile={profile}
                handleLogout={handleLogout}
              />
            </div>
          ) : (
            <Navbar
              profile={profile}
              onProfileClick={openProfilePanel}
              handleLogout={handleLogout}
            />
          )}

          {isProductsPage && (
            <div
              className={`navbar-menu-backdrop ${isNavOpen ? 'open' : ''}`}
              onClick={() => setIsNavOpen(false)}
            />
          )}

          {/* Warning Popup Overlay */}
          {showWarningPopup && (
            <div
              className="tw-fixed tw-inset-0 tw-bg-black/60 tw-z-45"
              onClick={closeWarningPopup}
            ></div>
          )}

          {/* Warning Popup */}
          {showWarningPopup && (
            <div
              className="tw-fixed tw-z-50 tw-bg-white/10 tw-backdrop-blur-md tw-text-white tw-p-6 tw-rounded-2xl tw-shadow-2xl tw-max-w-md tw-w-11/12 tw-mx-auto tw-border tw-border-white/20 tw-transition-all tw-duration-300"
              style={{
                top: "90px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
              }}
            >
              <div className="tw-text-center tw-text-xl tw-font-bold tw-mb-4 tw-text-red-400">
                Warning
              </div>
              <div className="tw-text-center tw-mb-6 tw-text-red-600 tw-font-bold">
                Please log in to access product details.
              </div>
              <div className="tw-flex tw-justify-center tw-space-x-8">
                <button
                  className="tw-bg-blue-600 tw-hover:bg-blue-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-xl tw-transition tw-duration-200 tw-shadow-lg tw-hover:shadow-xl"
                  onClick={() => {
                    closeWarningPopup();
                    navigate("/Login");
                    console.log("Navigating to Login");
                  }}
                >
                  Login
                </button>
                <button
                  className="tw-bg-gray-600 tw-hover:bg-gray-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-xl tw-transition tw-duration-200 tw-shadow-lg tw-hover:shadow-xl"
                  onClick={closeWarningPopup}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <ScrollToHash />

          <main className={`tw-flex-1 ${isProductsPage ? 'tw-pt-[60px]' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/market-rates" element={<Prices />} />
              <Route path="/trends" element={<PriceTrends />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/about" element={<About />} />
              <Route path="/Products-All" element={<ProductApp profile={profile} setProfile={setProfile} showWarning={showWarning} />} />
              <Route path="/register" element={<Register setProfile={setProfile} />} />
              <Route path="/login" element={<Login setProfile={setProfile} />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/service" element={<Service />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/sea-freight" element={<SeaFreight />} />
              {/* <Route path="/join-us" element={<PriceTrends/>} /> */}
              <Route path="/join-us" element={<JoinUs/>}/>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />

          {profile && (
            <ProfilePanel
              isOpen={isProfileOpen}
              profile={profile}
              setProfile={setProfile}
              onClose={closeProfilePanel}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </LanguageProvider>
  );
}