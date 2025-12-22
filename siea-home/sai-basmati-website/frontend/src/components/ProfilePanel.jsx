import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { ref, onValue, set, off } from "firebase/database";
import { useLanguage } from "../contexts/LanguageContext";
// import { db as quoteDb } from "../firebasequote";

export default function ProfilePanel({ isOpen, profile, setProfile, onClose, onLogout }) {
  const { t, setLanguage, currentLang } = useLanguage();

  const [editData, setEditData] = useState({ name: "", email: "", phone: "", avatar: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showAccountSection, setShowAccountSection] = useState(false);
  const [showSettingsSection, setShowSettingsSection] = useState(false);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);

  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sample");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const isDefaultAdmin = profile?.isDefaultAdmin;

  const isValidFirebaseUid = (uid) => uid && !/[@.#$\[\]]/.test(uid);

  // Load profile data
  useEffect(() => {
    if (!isOpen || !profile) return;

    if (isDefaultAdmin) {
      setEditData({
        name: profile.displayName || profile.email?.split("@")[0] || "Admin",
        email: profile.email || "",
        phone: "",
        avatar: "",
      });
      return;
    }

    if (profile?.uid && isValidFirebaseUid(profile.uid)) {
      const usersRef = ref(db, "users");
      const unsub = onValue(usersRef, (snap) => {
        const data = snap.val() || {};
        let matchedUser = null;

        Object.keys(data).forEach((key) => {
          if (data[key].uid === profile.uid) {
            matchedUser = { customId: key, ...data[key] };
          }
        });

        if (matchedUser) {
          setEditData({
            name: matchedUser.fullName || matchedUser.name || "",
            email: matchedUser.email || auth.currentUser?.email || "",
            phone: matchedUser.phone || "",
            avatar: matchedUser.avatar || "",
            street: matchedUser.street || "",
            city: matchedUser.city || "",
            addressState: matchedUser.addressState || "",
            addressCountry: matchedUser.addressCountry || "",
            pincode: matchedUser.pincode || "",
            firebaseUid: matchedUser.uid,
            customId: matchedUser.customId,
          });
        }
      });

      return () => off(usersRef, "value", unsub);
    } else {
      setEditData({
        name: profile.displayName || "",
        email: profile.email || "",
        phone: "",
        avatar: ""
      });
    }
  }, [isOpen, profile, isDefaultAdmin]);



  // Load orders when popup opens
  useEffect(() => {
    if (!showOrdersPopup || !profile?.email) {
      setAllOrders([]);
      return;
    }

    setOrdersLoading(true);

    const userEmail = profile.email.toLowerCase();

    const bulkRef = ref(db, "quotes/bulk");
    const sampleRef = ref(db, "quotes/sample_courier");

    let bulkOrders = [];
    let sampleOrders = [];

    const unsub1 = onValue(bulkRef, (snap) => {
      const data = snap.val() || {};
      bulkOrders = Object.entries(data)
        .map(([id, order]) => ({
          id,
          ...order,
          type: "quote",
          status: order.status || "Pending",
          quoteId: order.quoteId || id
        }))
        .filter((o) => o.email?.toLowerCase() === userEmail);

      setAllOrders([
        ...bulkOrders,
        ...sampleOrders
      ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      setOrdersLoading(false);
    });

    const unsub2 = onValue(sampleRef, (snap) => {
      const data = snap.val() || {};
      sampleOrders = Object.entries(data)
        .map(([id, order]) => ({
          id,
          ...order,
          type: "sample_courier",
          paymentStatus: order.paymentStatus || "Pending",
          orderId: order.orderId || id
        }))
        .filter((o) => o.email?.toLowerCase() === userEmail);

      setAllOrders([
        ...bulkOrders,
        ...sampleOrders
      ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      setOrdersLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [showOrdersPopup, profile?.email]);

  useEffect(() => {
    const adminContainer = document.getElementById("admin-scroll-container");

    const preventScroll = (e) => {
      e.preventDefault();
    };

    if (isOpen) {
      // Lock all scroll sources
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      if (adminContainer) {
        adminContainer.style.overflow = "hidden";
        adminContainer.style.height = "100vh";
      }

      // 🚫 BLOCK TOUCH SCROLL (THIS WAS MISSING)
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventScroll, { passive: false });
    } else {
      // Unlock
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";

      if (adminContainer) {
        adminContainer.style.overflow = "";
        adminContainer.style.height = "";
      }

      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";

      if (adminContainer) {
        adminContainer.style.overflow = "";
        adminContainer.style.height = "";
      }

      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
    };
  }, [isOpen]);


  const filteredOrders = allOrders.filter((o) =>
    activeTab === "sample" ? o.type === "sample_courier" : o.type === "quote"
  );

  // Handlers
  const handleChange = (e) => setEditData({ ...editData, [e.target.id]: e.target.value });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isDefaultAdmin || !isValidFirebaseUid(profile?.uid)) {
        const updated = { ...profile, displayName: editData.name || profile.displayName };
        setProfile(updated);
        localStorage.setItem("profile", JSON.stringify(updated));
      } else {
        await set(ref(db, `users/${editData.customId}`), {
          uid: profile.uid,
          fullName: editData.name,
          email: editData.email || auth.currentUser.email,
          phone: editData.phone,
          avatar: editData.avatar,
          street: editData.street || "",
          city: editData.city || "",
          addressState: editData.addressState || "",
          addressCountry: editData.addressCountry || "",
          pincode: editData.pincode || "",
          createdAt: editData.createdAt || new Date().toISOString(),
        });
      }
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save changes. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    onLogout();
    onClose();
    window.location.href = "/";
  };

  const getDisplayName = () =>
    isDefaultAdmin
      ? profile.displayName || profile.email?.split("@")[0] || t("guest")
      : editData.name || profile?.displayName || t("guest");

  const getDisplayEmail = () =>
    isDefaultAdmin ? profile.email || "" : editData.email || profile?.email || "";

  const getAvatarInitial = () => (editData.avatar ? null : getDisplayName().charAt(0).toUpperCase());

  if (!isOpen) return null;

  const allowScrollInside = (e) => {
    e.stopPropagation();
  };


  return (
    <>
      {/* Backdrop */}
      <div
        className="tw-fixed tw-inset-0 tw-bg-black/50 tw-backdrop-blur-sm tw-z-40"
        onClick={onClose}
      />

      {/* Main Panel - POSITIONED ON LEFT SIDE TO AVOID RSS FEED */}
      <aside
        className="
    tw-fixed tw-z-50 tw-bg-gray-900 tw-text-white tw-shadow-2xl tw-border tw-border-gray-700 tw-flex tw-flex-col

    /* MOBILE (default) */
    tw-bottom-0 tw-left-0 tw-right-0
    tw-w-full tw-max-h-[85vh]
    tw-rounded-t-2xl

    /* TABLET */
    sm:tw-top-24 sm:tw-bottom-auto sm:tw-left-1/2 sm:-tw-translate-x-1/2
    sm:tw-w-[90%] sm:tw-max-w-[520px]
    sm:tw-rounded-2xl

    /* DESKTOP */
    lg:tw-top-28 lg:tw-right-6 lg:tw-left-auto lg:tw-translate-x-0
    lg:tw-w-[420px] lg:tw-max-h-[85vh]
  "
      >

        {/* Header */}
        <div className="tw-flex tw-items-center tw-p-5 tw-border-b tw-border-gray-700 tw-bg-gray-800/50 tw-sticky tw-top-0">
          <div className="tw-w-14 tw-h-14 tw-bg-gradient-to-br tw-from-green-500 tw-to-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-2xl tw-font-bold tw-shadow-lg">
            {editData.avatar ? (
              <img
                src={editData.avatar}
                alt="Avatar"
                className="tw-w-full tw-h-full tw-rounded-full tw-object-cover"
              />
            ) : (
              getAvatarInitial()
            )}
          </div>
          <div className="tw-ml-4">
            <div className="tw-font-bold tw-text-lg tw-text-white">{getDisplayName()}</div>
            <div className="tw-text-sm tw-text-gray-300 tw-mt-1">{getDisplayEmail()}</div>
            {isDefaultAdmin && (
              <div className="tw-inline-flex tw-items-center tw-mt-2 tw-px-3 tw-py-1 tw-bg-yellow-900/30 tw-text-yellow-300 tw-text-xs tw-font-medium tw-rounded-full tw-border tw-border-yellow-700/50">
                <span className="tw-w-2 tw-h-2 tw-bg-yellow-400 tw-rounded-full tw-mr-2"></span>
                Default Administrator
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="tw-ml-auto tw-text-gray-400 hover:tw-text-white tw-text-xl tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center hover:tw-bg-gray-700 tw-rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Menu Section */}
        <div className="tw-flex-1 tw-overflow-y-auto tw-scrollbar-thin">
          <div className="tw-p-4">
            {/* My Account */}
            <button
              onClick={() => setShowAccountSection(!showAccountSection)}
              className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-4 tw-mb-3 tw-bg-gray-800/50 hover:tw-bg-gray-700 tw-rounded-xl tw-transition-all tw-duration-200 tw-border tw-border-gray-700/50"
            >
              <span className="tw-flex tw-items-center tw-text-base">
                <span className="tw-mr-3 tw-text-xl">👤</span>
                <span className="tw-font-medium">{t("my_account")}</span>
              </span>
              <span className="tw-text-gray-400">{showAccountSection ? '▼' : '▶'}</span>
            </button>

            {/* My Orders */}
            <button
              onClick={() => {
                setShowOrdersPopup(true);
                setActiveTab("sample");

                if (window.innerWidth < 640) {
                  onClose(); // close profile on mobile
                }
              }}

              className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-4 tw-mb-3 tw-bg-gray-800/50 hover:tw-bg-gray-700 tw-rounded-xl tw-transition-all tw-duration-200 tw-border tw-border-gray-700/50"
            >
              <span className="tw-flex tw-items-center tw-text-base">
                <span className="tw-mr-3 tw-text-xl">🛒</span>
                <span className="tw-font-medium">{t("my_orders")}</span>
              </span>
              <span className="tw-text-gray-400">▶</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsSection(!showSettingsSection)}
              className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-4 tw-mb-3 tw-bg-gradient-to-r tw-from-yellow-900/30 tw-to-yellow-800/20 hover:tw-from-yellow-800/40 hover:tw-to-yellow-700/30 tw-rounded-xl tw-transition-all tw-duration-200 tw-border tw-border-yellow-700/50"
            >
              <span className="tw-flex tw-items-center tw-text-base">
                <span className="tw-mr-3 tw-text-xl">🌐</span>
                <span className="tw-font-medium tw-text-yellow-100">{t("settings")}</span>
              </span>
              <span className="tw-text-yellow-300">{showSettingsSection ? '▼' : '▶'}</span>
            </button>

            {/* Language Dropdown */}
            {showSettingsSection && (
              <div className="tw-mt-3 tw-mb-4 tw-p-4 tw-bg-gray-800/30 tw-rounded-xl tw-border tw-border-gray-700/50">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-300 tw-mb-2">
                  Select Language
                </label>
                <select
                  value={currentLang}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="tw-w-full tw-p-3 tw-bg-gray-800 tw-text-white tw-border tw-border-yellow-500/50 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-yellow-500 focus:tw-border-transparent"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="te">🇮🇳 Telugu</option>
                  <option value="hi">🇮🇳 Hindi</option>
                  <option value="ur">🇵🇰 Urdu</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                </select>
              </div>
            )}

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="tw-flex tw-w-full tw-items-center tw-justify-center tw-p-4 tw-mt-4 tw-bg-gradient-to-r tw-from-red-900/30 tw-to-red-800/20 hover:tw-from-red-800/40 hover:tw-to-red-700/30 tw-rounded-xl tw-transition-all tw-duration-200 tw-border tw-border-red-700/50"
            >
              <span className="tw-flex tw-items-center tw-text-base tw-text-red-300">
                <span className="tw-mr-3 tw-text-xl">🚪</span>
                <span className="tw-font-medium">{t("sign_out")}</span>
              </span>
            </button>
          </div>

          {/* Account Section */}
          {showAccountSection && (
            <div className="tw-border-t tw-border-gray-700/50 tw-p-5 tw-bg-gray-800/20">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-5">
                <h3 className="tw-text-lg tw-font-bold tw-text-white">{t("profile_details")}</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="tw-px-4 tw-py-2 tw-bg-blue-600 hover:tw-bg-blue-700 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors"
                >
                  {isEditing ? t("cancel") : t("edit")}
                </button>
              </div>

              {isEditing ? (
                <>
                  {[
                    "name",
                    "email",
                    "phone",
                    "street",
                    "city",
                    "addressState",
                    "addressCountry",
                    "pincode"
                  ].map((field) => (
                    <div key={field} className="tw-mb-3">
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-300 tw-mb-1 tw-capitalize">
                        {t(field)}
                      </label>
                      <input
                        id={field}
                        type={field === "email" ? "email" : "text"}
                        value={editData[field]}
                        onChange={handleChange}
                        className="tw-w-full tw-p-3 tw-mt-1 tw-bg-gray-800 tw-text-white tw-rounded-lg tw-border tw-border-gray-600 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent"
                        disabled={field === "email" && isDefaultAdmin}
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="tw-w-full tw-py-3 tw-mt-4 tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-700 hover:tw-from-blue-700 hover:tw-to-blue-800 tw-rounded-lg tw-font-medium tw-transition-all tw-duration-200"
                  >
                    {isLoading ? "Saving..." : t("save_changes")}
                  </button>
                </>
              ) : (
                <div className="tw-space-y-4">
                  <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">{t("name")}</p>
                      <p className="tw-font-medium tw-text-white">{editData.name || "—"}</p>
                    </div>
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">{t("email")}</p>
                      <p className="tw-font-medium tw-text-white tw-truncate">{editData.email || "—"}</p>
                    </div>
                  </div>

                  <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                    <p className="tw-text-sm tw-text-gray-400">{t("phone")}</p>
                    <p className="tw-font-medium tw-text-white">{editData.phone || "—"}</p>
                  </div>

                  <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">Street</p>
                      <p className="tw-font-medium tw-text-white">{editData.street || "—"}</p>
                    </div>
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">City</p>
                      <p className="tw-font-medium tw-text-white">{editData.city || "—"}</p>
                    </div>
                  </div>

                  <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">State</p>
                      <p className="tw-font-medium tw-text-white">{editData.addressState || "—"}</p>
                    </div>
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">Country</p>
                      <p className="tw-font-medium tw-text-white">{editData.addressCountry || "—"}</p>
                    </div>
                  </div>

                  <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">Pincode</p>
                      <p className="tw-font-medium tw-text-white">{editData.pincode || "—"}</p>
                    </div>
                    <div className="tw-bg-gray-800/50 tw-p-3 tw-rounded-lg">
                      <p className="tw-text-sm tw-text-gray-400">User ID</p>
                      <p className="tw-font-medium tw-text-white">{editData.customId || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {message.text && (
                <div className={`tw-mt-4 tw-p-3 tw-rounded-lg tw-text-center tw-text-sm tw-font-medium ${message.type === "success"
                  ? "tw-bg-green-900/30 tw-text-green-300 tw-border tw-border-green-700/50"
                  : "tw-bg-red-900/30 tw-text-red-300 tw-border tw-border-red-700/50"
                  }`}>
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tw-p-4 tw-border-t tw-border-gray-700/50 tw-bg-gray-800/30">
          <p className="tw-text-xs tw-text-center tw-text-gray-400">
            SIEA Rice Exports • © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* My Orders Popup */}
      {showOrdersPopup && !showOrderDetails && (
        <>
          <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-z-50" onClick={() => setShowOrdersPopup(false)} />
          <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4" style={{ paddingTop: '80px' }}>
            <div className="tw-bg-gray-900 tw-rounded-2xl tw-shadow-2xl tw-max-w-2xl tw-w-full tw-max-h-[75vh] tw-overflow-hidden tw-border tw-border-gray-700">
              <div className="tw-p-6 tw-border-b tw-border-gray-700 tw-flex tw-justify-between">
                <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-400">{t("my_orders")}</h2>
                <button onClick={() => setShowOrdersPopup(false)} className="tw-text-3xl tw-text-gray-400 hover:tw-text-white">
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="tw-flex tw-border-b tw-border-gray-700">
                <button
                  onClick={() => setActiveTab("sample")}
                  className={`tw-flex-1 tw-py-4 tw-font-bold tw-text-lg ${activeTab === "sample" ? "tw-bg-yellow-600 tw-text-black" : "tw-bg-gray-800 hover:tw-bg-gray-700"}`}
                >
                  Sample Courier
                </button>
                <button
                  onClick={() => setActiveTab("quote")}
                  className={`tw-flex-1 tw-py-4 tw-font-bold tw-text-lg ${activeTab === "quote" ? "tw-bg-yellow-600 tw-text-black" : "tw-bg-gray-800 hover:tw-bg-gray-700"}`}
                >
                  Get Quote
                </button>
              </div>

              {/* Orders List */}
              <div
                className="tw-p-6 tw-max-h-[50vh] tw-overflow-y-auto"
                onWheel={allowScrollInside}
                onTouchMove={allowScrollInside}
              >
                {ordersLoading ? (
                  <p className="tw-text-center tw-py-10 tw-text-gray-400">Loading orders...</p>
                ) : filteredOrders.length === 0 ? (
                  <p className="tw-text-center tw-py-10 tw-text-gray-400">
                    {activeTab === "sample" ? "No sample courier orders" : "No quote requests"}
                  </p>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="tw-bg-gray-800 tw-rounded-lg tw-p-4 tw-mb-4 tw-border tw-border-gray-700 hover:tw-border-yellow-500 tw-cursor-pointer tw-transition-all tw-duration-200"
                      onClick={() => handleViewOrderDetails(order)}
                    >
                      <div className="tw-flex tw-justify-between">
                        <div className="tw-flex-1">
                          <p className="tw-font-bold tw-text-yellow-300">
                            {order.type === "sample_courier" ? "Sample Courier" : "Quote Request"}
                          </p>
                          <p className="tw-text-xs tw-text-gray-400">
                            {new Date(order.timestamp || Date.now()).toLocaleString()}
                          </p>

                          {order.type === "sample_courier" ? (
                            <div className="tw-mt-2 tw-space-y-1">
                              <p>Items: {order.items?.length || 0}</p>
                              <p>Total: ₹{order.totalAmount || "0"}</p>
                              <p className="tw-text-sm tw-text-gray-300">Click to view details →</p>
                            </div>
                          ) : (
                            <div className="tw-mt-2 tw-space-y-1">
                              <p>Product: {order.product || "N/A"}</p>
                              <p>Total: ₹{order.totalPrice || "Pending"}</p>
                              <p className="tw-text-sm tw-text-gray-300">Click to view details →</p>
                            </div>
                          )}
                        </div>

                        <div className="tw-flex tw-flex-col tw-items-end tw-justify-between">
                          <span
                            className={`tw-inline-flex tw-items-center tw-justify-center tw-min-w-[70px] tw-h-[28px] tw-text-xs tw-font-semibold tw-text-white tw-rounded-full ${order.type === "sample_courier"
                              ? (order.paymentStatus === "Paid"
                                ? "tw-bg-green-600"
                                : "tw-bg-orange-500")
                              : order.status === "Completed"
                                ? "tw-bg-green-600"
                                : order.status === "Quoted"
                                  ? "tw-bg-blue-600"
                                  : order.status === "Cancelled"
                                    ? "tw-bg-red-600"
                                    : "tw-bg-orange-500"
                              }`}
                          >
                            {order.type === "sample_courier"
                              ? (order.paymentStatus || "Pending")
                              : (order.status || "Pending")}
                          </span>
                          <button className="tw-mt-2 tw-text-blue-400 hover:tw-text-blue-300 tw-text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Details Popup */}
      {showOrderDetails && selectedOrder && (
        <>
          <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-z-50" onClick={() => setShowOrderDetails(false)} />
          <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4" style={{ paddingTop: '80px' }}>
            <div className="tw-bg-gray-900 tw-rounded-2xl tw-shadow-2xl tw-max-w-4xl tw-w-full tw-max-h-[80vh] tw-overflow-hidden tw-border tw-border-gray-700">
              {/* Header */}
              <div className="tw-p-6 tw-border-b tw-border-gray-700 tw-flex tw-justify-between tw-items-center">
                <div>
                  <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-400">
                    {selectedOrder.type === "sample_courier" ? "Sample Courier Order" : "Quote Request"}
                  </h2>
                  <p className="tw-text-sm tw-text-gray-400">
                    Order ID: {selectedOrder.id} • {new Date(selectedOrder.timestamp || Date.now()).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="tw-text-3xl tw-text-gray-400 hover:tw-text-white"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div
                className="tw-p-6 tw-overflow-y-auto tw-max-h-[60vh]"
                onWheel={allowScrollInside}
                onTouchMove={allowScrollInside}
              >
                {/* Status Bar */}
                <div className="tw-mb-6 tw-p-4 tw-bg-gray-800 tw-rounded-lg">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <div>
                      <span className="tw-font-bold tw-text-lg">Status:</span>
                      <span className={`tw-ml-3 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold ${selectedOrder.type === "sample_courier"
                        ? (selectedOrder.paymentStatus === "Paid"
                          ? "tw-bg-green-600 tw-text-white"
                          : "tw-bg-orange-500 tw-text-white")
                        : selectedOrder.status === "Completed"
                          ? "tw-bg-green-600 tw-text-white"
                          : selectedOrder.status === "Quoted"
                            ? "tw-bg-blue-600 tw-text-white"
                            : selectedOrder.status === "Cancelled"
                              ? "tw-bg-red-600 tw-text-white"
                              : "tw-bg-orange-500 tw-text-white"
                        }`}>
                        {selectedOrder.type === "sample_courier"
                          ? (selectedOrder.paymentStatus || "Pending")
                          : (selectedOrder.status || "Pending")}
                      </span>
                    </div>
                    <div className="tw-text-right">
                      <p className="tw-text-2xl tw-font-bold tw-text-yellow-400">
                        ₹{selectedOrder.type === "sample_courier"
                          ? selectedOrder.totalAmount || "0"
                          : selectedOrder.totalPrice || "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
                  {/* Customer Details - Only for Sample Courier */}
                  {selectedOrder.type === "sample_courier" && (
                    <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
                      <h3 className="tw-text-lg tw-font-bold tw-text-yellow-400 tw-mb-3">Customer Details</h3>
                      <div className="tw-space-y-2">
                        <p><strong>Name:</strong> {selectedOrder.name || "N/A"}</p>
                        <p><strong>Email:</strong> {selectedOrder.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedOrder.phone || "N/A"}</p>
                        <p><strong>Company:</strong> {selectedOrder.company || "N/A"}</p>
                        {selectedOrder.address && (
                          <p><strong>Address:</strong> {selectedOrder.address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Information */}
                  <div className={`tw-bg-gray-800 tw-p-4 tw-rounded-lg ${selectedOrder.type === "sample_courier" ? "" : "md:tw-col-span-2"}`}>
                    <h3 className="tw-text-lg tw-font-bold tw-text-yellow-400 tw-mb-3">Order Information</h3>
                    <div className="tw-space-y-2">
                      {selectedOrder.type === "sample_courier" ? (
                        <>
                          <p><strong>Courier Type:</strong> {selectedOrder.courierType || "Standard"}</p>
                          <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
                          <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || "Pending"}</p>
                          {selectedOrder.trackingNumber && (
                            <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                          )}
                          <p><strong>Order Date:</strong> {new Date(selectedOrder.timestamp || Date.now()).toLocaleDateString()}</p>
                        </>
                      ) : (
                        <>
                          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                            <div>
                              <p><strong>Product:</strong> {selectedOrder.product || "N/A"}</p>
                              <p><strong>Quantity:</strong> {selectedOrder.quantity || "N/A"}</p>
                            </div>
                            <div>
                              {selectedOrder.quoteId && (
                                <p><strong>Quote ID:</strong> {selectedOrder.quoteId}</p>
                              )}
                              <p><strong>Order Date:</strong> {new Date(selectedOrder.timestamp || Date.now()).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="tw-bg-gray-800 tw-p-4 tw-rounded-lg">
                  <h3 className="tw-text-lg tw-font-bold tw-text-yellow-400 tw-mb-3">
                    {selectedOrder.type === "sample_courier" ? "Order Items" : "Request Details"}
                  </h3>

                  {selectedOrder.type === "sample_courier" ? (
                    selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="tw-overflow-x-auto">
                        <table className="tw-w-full tw-text-sm">
                          <thead>
                            <tr className="tw-border-b tw-border-gray-700">
                              <th className="tw-py-2 tw-text-left">Product</th>
                              <th className="tw-py-2 tw-text-left">Quantity</th>
                              <th className="tw-py-2 tw-text-left">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index} className="tw-border-b tw-border-gray-700">
                                <td className="tw-py-3">
                                  <div>
                                    <p className="tw-font-medium">{item.productName || "Product"}</p>
                                    {item.productId && <p className="tw-text-xs tw-text-gray-400">ID: {item.productId}</p>}
                                  </div>
                                </td>
                                <td className="tw-py-3">{item.quantity || 1}</td>
                                <td className="tw-py-3">₹{item.price || "0"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="tw-text-gray-400">No items found in this order</p>
                    )
                  ) : (
                    <div className="tw-space-y-4">
                      <div>
                        <p><strong>Additional Requirements:</strong></p>
                        <p className="tw-text-gray-300">{selectedOrder.additionalRequirements || "None"}</p>
                      </div>
                      {selectedOrder.specifications && (
                        <div>
                          <p><strong>Specifications:</strong></p>
                          <p className="tw-text-gray-300">{selectedOrder.specifications}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes/Additional Info */}
                {(selectedOrder.notes || selectedOrder.additionalInfo) && (
                  <div className="tw-mt-6 tw-bg-gray-800 tw-p-4 tw-rounded-lg">
                    <h3 className="tw-text-lg tw-font-bold tw-text-yellow-400 tw-mb-3">Additional Information</h3>
                    <p className="tw-text-gray-300">{selectedOrder.notes || selectedOrder.additionalInfo}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="tw-p-6 tw-border-t tw-border-gray-700 tw-bg-gray-800">
                <div className="tw-flex tw-justify-between tw-items-center">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="tw-px-6 tw-py-2 tw-bg-gray-700 tw-rounded hover:tw-bg-gray-600"
                  >
                    Back to Orders
                  </button>
                  <div className="tw-text-right">
                    <p className="tw-text-sm tw-text-gray-400">Need help with this order?</p>
                    <p className="tw-text-yellow-400">Contact Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}