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
      setMessage({ type: "success", text: "Profile updated!" });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save." });
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

  return (
    <>
      {/* Backdrop */}
      <div className="tw-fixed tw-inset-0 tw-bg-black/40 tw-z-40" onClick={onClose} />

      {/* Main Panel */}
      <aside className="tw-fixed tw-top-16 tw-right-4 tw-w-80 tw-bg-gray-800 tw-text-white tw-rounded-lg tw-shadow-2xl tw-z-50">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-p-4 tw-border-b tw-border-gray-700">
          <div className="tw-w-12 tw-h-12 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-xl tw-font-bold">
            {editData.avatar ? (
              <img src={editData.avatar} alt="Avatar" className="tw-w-full tw-h-full tw-rounded-full" />
            ) : (
              getAvatarInitial()
            )}
          </div>
          <div className="tw-ml-3">
            <div className="tw-font-semibold">{getDisplayName()}</div>
            <div className="tw-text-sm tw-text-gray-400">{getDisplayEmail()}</div>
            {isDefaultAdmin && <div className="tw-text-xs tw-text-yellow-400">Default Administrator</div>}
          </div>
        </div>

        {/* Menu */}
        <div className="tw-p-2">
          {/* My Account */}
          <button
            onClick={() => setShowAccountSection(!showAccountSection)}
            className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-3 tw-text-gray-300 hover:tw-bg-gray-700 tw-rounded"
          >
            <span className="tw-flex tw-items-center">
              <span className="tw-mr-3">👤</span> {t("my_account")}
            </span>
            <span>{showAccountSection ? '▼' : '▶'}</span>
          </button>

          {/* My Orders */}
          <button
            onClick={() => {
              setShowOrdersPopup(true);
              setActiveTab("sample");
            }}
            className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-3 tw-text-gray-300 hover:tw-bg-gray-700 tw-rounded"
          >
            <span className="tw-flex tw-items-center">
              <span className="tw-mr-3">🛒</span> {t("my_orders")}
            </span>
            <span>▶</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsSection(!showSettingsSection)}
            className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-3 tw-bg-black tw-border tw-border-yellow-400 tw-rounded tw-text-white"
          >
            <span className="tw-flex tw-items-center">
              <span className="tw-mr-3">🌐</span> {t("settings")}
            </span>
            <span>{showSettingsSection ? '▼' : '▶'}</span>
          </button>

          {/* Language Dropdown */}
          {showSettingsSection && (
            <div className="tw-mt-2 tw-px-3">
              <select
                value={currentLang}
                onChange={(e) => setLanguage(e.target.value)}
                className="tw-w-full tw-p-3 tw-bg-black tw-text-white tw-border tw-border-yellow-400 tw-rounded focus:tw-outline-none"
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
                <option value="ur">Urdu</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="tw-flex tw-w-full tw-items-center tw-p-3 tw-text-red-400 hover:tw-bg-red-900 tw-rounded"
          >
            <span className="tw-mr-3">🚪</span> {t("sign_out")}
          </button>
        </div>

        {/* Account Section */}
        {showAccountSection && (
          <div className="tw-border-t tw-border-gray-700 tw-p-4">
            <div className="tw-flex tw-justify-between tw-mb-4">
              <h3 className="tw-text-lg tw-font-bold">{t("profile_details")}</h3>
              <button onClick={() => setIsEditing(!isEditing)} className="tw-text-blue-400">
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
                    <label className="tw-block tw-text-sm tw-capitalize">{t(field)}</label>
                    <input
                      id={field}
                      type={field === "email" ? "email" : "text"}
                      value={editData[field]}
                      onChange={handleChange}
                      className="tw-w-full tw-p-2 tw-mt-1 tw-bg-gray-700 tw-rounded tw-border tw-border-gray-600"
                      disabled={field === "email" && isDefaultAdmin}
                    />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="tw-w-full tw-py-2 tw-bg-blue-600 tw-rounded hover:tw-bg-blue-700"
                >
                  {isLoading ? "Saving..." : t("save_changes")}
                </button>
              </>
            ) : (
              <div className="tw-space-y-2">
                <p><strong>{t("name")}:</strong> {editData.name || "—"}</p>
                <p><strong>{t("email")}:</strong> {editData.email || "—"}</p>
                <p><strong>{t("phone")}:</strong> {editData.phone || "—"}</p>
                <p><strong>Street:</strong> {editData.street || "—"}</p>
                <p><strong>City:</strong> {editData.city || "—"}</p>
                <p><strong>State:</strong> {editData.addressState || "—"}</p>
                <p><strong>Country:</strong> {editData.addressCountry || "—"}</p>
                <p><strong>Pincode:</strong> {editData.pincode || "—"}</p>
                <p><strong>User ID:</strong> {editData.customId || "N/A"}</p>
              </div>
            )}

            {message.text && (
              <div className={`tw-mt-3 tw-p-3 tw-rounded tw-text-center ${message.type === "success" ? "tw-bg-green-900" : "tw-bg-red-900"}`}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* My Orders Popup */}
      {showOrdersPopup && !showOrderDetails && (
        <>
          <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-z-50" onClick={() => setShowOrdersPopup(false)} />
          <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
            <div className="tw-bg-gray-900 tw-rounded-2xl tw-shadow-2xl tw-max-w-2xl tw-w-full tw-max-h-[85vh] tw-overflow-hidden tw-border tw-border-gray-700">
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
                  className={`tw-flex-1 tw-py-4 tw-font-bold ${activeTab === "sample" ? "tw-bg-yellow-600 tw-text-black" : "tw-bg-gray-800"}`}
                >
                  Sample Courier
                </button>
                <button
                  onClick={() => setActiveTab("quote")}
                  className={`tw-flex-1 tw-py-4 tw-font-bold ${activeTab === "quote" ? "tw-bg-yellow-600 tw-text-black" : "tw-bg-gray-800"}`}
                >
                  Get Quote
                </button>
              </div>

              {/* Orders List */}
              <div className="tw-p-6 tw-max-h-96 tw-overflow-y-auto">
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
                      className="tw-bg-gray-800 tw-rounded-lg tw-p-4 tw-mb-4 tw-border tw-border-gray-700 hover:tw-border-yellow-500 tw-cursor-pointer"
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
                            className={`tw-inline-flex tw-items-center tw-justify-center tw-min-w-[70px] tw-h-[28px] tw-text-xs tw-font-semibold tw-text-white tw-rounded-full ${
                              order.type === "sample_courier"
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
          <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
            <div className="tw-bg-gray-900 tw-rounded-2xl tw-shadow-2xl tw-max-w-4xl tw-w-full tw-max-h-[90vh] tw-overflow-hidden tw-border tw-border-gray-700">
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
              <div className="tw-p-6 tw-overflow-y-auto tw-max-h-[70vh]">
                {/* Status Bar */}
                <div className="tw-mb-6 tw-p-4 tw-bg-gray-800 tw-rounded-lg">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <div>
                      <span className="tw-font-bold tw-text-lg">Status:</span>
                      <span className={`tw-ml-3 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold ${
                        selectedOrder.type === "sample_courier"
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

                {/* Order Details Grid - Conditional rendering based on order type */}
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
                              {/* <th className="tw-py-2 tw-text-left">Total</th> */}
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
                                {/* <td className="tw-py-3 tw-font-bold">₹{item.total || "0"}</td> */}
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