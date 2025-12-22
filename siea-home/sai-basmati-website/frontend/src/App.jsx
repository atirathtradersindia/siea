import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navbar from "./components/Navbar";
import NavbarProd from "./components/NavbarProd";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Prices from "./pages/Prices";
import About from "./pages/About";
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
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminLayout from "./admin/AdminLayout";
import Users from "./admin/pages/Users";
import ProductsAdmin from "./admin/pages/Products";
import Orders from "./admin/pages/Orders";
import Services from "./admin/pages/Services";
import Dashboard from "./admin/pages/Dashboard";
import PendingQuotes from "./admin/pages/PendingQuotes";
import TodaysOrders from "./admin/pages/TodaysOrders";
import AdminMarketPrices from "./admin/AdminMarketPrices";
import History from "./admin/pages/History";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";



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
  const [searchQuery, setSearchQuery] = useState("");


  const [profile, setProfile] = useState(() => {
    try {
      const s = localStorage.getItem("profile");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // 🔐 Not logged in → remove fake admin/profile
        setProfile(null);
        localStorage.removeItem("profile");
        localStorage.removeItem("isAdmin");
      } else if (profile && profile.email !== user.email) {
        // 🔐 Logged in but mismatch → clear
        setProfile(null);
        localStorage.removeItem("profile");
      }
    });

    return () => unsub();
  }, []);


  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isAdminDashboard = location.pathname.startsWith("/admin");

  useEffect(() => {
    try {
      if (profile) localStorage.setItem("profile", JSON.stringify(profile));
      else localStorage.removeItem("profile");
    } catch { }
  }, [profile]);

  const handleLogout = () => {
    setProfile(null);
    localStorage.removeItem("profile");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const openProfilePanel = () => {
    if (!profile) {
      setShowWarningPopup(true);
      return;
    }
    setIsProfileOpen(true);
  };

  const closeProfilePanel = () => setIsProfileOpen(false);
  const closeWarningPopup = () => setShowWarningPopup(false);

  const showWarning = () => setShowWarningPopup(true);

  const searchProducts = (value) => {
    setSearchQuery(value);
  };


  const goHome = () => navigate("/");
  const isProductsPage =
    location.pathname === "/Products-All" ||
    location.pathname === "/transport" ||
    location.pathname === "/sea-freight";

  return (
    <LanguageProvider>
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
          {!isAdminDashboard && (
            <>
              {isProductsPage ? (
                <div className="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-h-[60px] tw-z-50 tw-bg-[#111111]">
                  <NavbarProd
                    searchProducts={searchProducts}
                    showProductsPage={() => navigate("/Products-All")}
                    showProfilePanel={openProfilePanel}
                    goHome={goHome}
                    isNavOpen={isNavOpen}
                    toggleNav={setIsNavOpen}
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
                  className={`navbar-menu-backdrop ${isNavOpen ? "open" : ""}`}
                  onClick={() => setIsNavOpen(false)}
                />
              )}
            </>
          )}
          {showWarningPopup && (
            <>
              <div
                className="tw-fixed tw-inset-0 tw-bg-black/60 tw-z-45"
                onClick={closeWarningPopup}
              />
              <div
                className="tw-fixed tw-z-50 tw-bg-white/10 tw-backdrop-blur-md tw-text-white tw-p-6 tw-rounded-2xl tw-shadow-2xl tw-max-w-md tw-w-11/12 tw-mx-auto tw-border tw-border-white/20"
                style={{ top: "90px", left: "50%", transform: "translateX(-50%)" }}
              >
                <div className="tw-text-center tw-text-xl tw-font-bold tw-mb-4 tw-text-red-400">
                  Warning
                </div>
                <div className="tw-text-center tw-mb-6 tw-text-red-600 tw-font-bold">
                  Please log in to access product details.
                </div>
                <div className="tw-flex tw-justify-center tw-space-x-8">
                  <button
                    className="tw-bg-blue-600 tw-hover:bg-blue-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-xl"
                    onClick={() => {
                      closeWarningPopup();
                      navigate("/login");
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="tw-bg-gray-600 tw-hover:bg-gray-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-xl"
                    onClick={closeWarningPopup}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
          <ScrollToHash />
          <main className={`tw-flex-1 ${isProductsPage && !isAdminDashboard ? "tw-pt-[60px]" : ""}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/market-rates" element={<Prices />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/about" element={<About />} />
              <Route path="/Products-All" element={<ProductApp profile={profile} setProfile={setProfile} showWarning={showWarning} searchQuery={searchQuery} />} />
              <Route path="/register" element={<Register setProfile={setProfile} />} />
              <Route path="/login" element={<Login setProfile={setProfile} />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/service" element={<Service />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/sea-freight" element={<SeaFreight />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="market-prices" element={<AdminMarketPrices />} />
                <Route path="orders" element={<Orders />} />
                <Route path="services" element={<Services />} />
                <Route path="pending-quotes" element={<PendingQuotes />} />
                <Route path="todays-orders" element={<TodaysOrders />} />
                <Route path="history" element={<History />} />
              </Route>
            </Routes>
          </main>

          {!isAdminDashboard && <Footer />}

          {profile && !isAdminDashboard && (
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
