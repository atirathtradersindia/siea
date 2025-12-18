// src/admin/TodaysOrders.jsx
import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
// import { db as dbQuote } from "../../firebasequote";
import { db } from "../../firebase";

export default function TodaysOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const statusOptions = ["Pending", "Processing", "Quoted", "Completed", "Cancelled", "On Hold", "Shipped", "Delivered"];

  useEffect(() => {
    const bulkRef = ref(db, "quotes/bulk");
    const sampleRef = ref(db, "quotes/sample_courier");

    let bulkOrders = [];
    let sampleOrders = [];

    const todayStart = new Date().setHours(0, 0, 0, 0);

    const unsub1 = onValue(bulkRef, (snap) => {
      const data = snap.val() || {};

      bulkOrders = Object.entries(data)
        .map(([id, order]) => ({
          id,
          ...order,
          type: "bulk",
        }))
        .filter((o) => o.timestamp >= todayStart);

      setOrders(
        [...bulkOrders, ...sampleOrders].sort(
          (a, b) => b.timestamp - a.timestamp
        )
      );

      setLoading(false);
    });

    const unsub2 = onValue(sampleRef, (snap) => {
      const data = snap.val() || {};

      sampleOrders = Object.entries(data)
        .map(([id, order]) => ({
          id,
          ...order,
          type: "sample_courier",
        }))
        .filter((o) => o.timestamp >= todayStart);

      setOrders(
        [...bulkOrders, ...sampleOrders].sort(
          (a, b) => b.timestamp - a.timestamp
        )
      );

      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status || "Pending");
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !updateStatus) return;

    try {
      setUpdating(true);
      const path =
        selectedOrder.type === "sample_courier"
          ? `quotes/sample_courier/${selectedOrder.id}`
          : `quotes/bulk/${selectedOrder.id}`;

      await update(ref(db, path), {
        status: updateStatus,
        updatedAt: Date.now(),
      });

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: updateStatus, updatedAt: Date.now() }
          : order
      ));

      setShowUpdateModal(false);
      setSelectedOrder(null);
      alert(`Order status updated to: ${updateStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tw-p-4 sm:tw-p-6">
        <div className="tw-text-yellow-500 tw-text-lg">Loading today's orders...</div>
      </div>
    );
  }

  return (
    <div className="tw-p-4 sm:tw-p-6">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-500">
          Today's Orders
        </h1>
        <div className="tw-flex tw-items-center tw-gap-3">
          <span className="tw-bg-green-500/20 tw-text-green-300 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
            {orders.length} Today
          </span>
          <span className="tw-text-gray-400 tw-text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="tw-bg-gray-900/50 tw-rounded-xl tw-p-8 tw-text-center">
          <div className="tw-text-5xl tw-mb-4">📅</div>
          <h3 className="tw-text-xl tw-text-gray-300 tw-mb-2">No Orders Today</h3>
          <p className="tw-text-gray-500">No orders have been placed yet today</p>
        </div>
      ) : (
        <div className="tw-overflow-x-auto">
          <table className="tw-w-full tw-border-collapse">
            <thead>
              <tr className="tw-border-b tw-border-gray-700">
                <th className="tw-text-left tw-py-3 tw-px-4 tw-text-gray-400 tw-font-medium">Order ID</th>
                <th className="tw-text-left tw-py-3 tw-px-4 tw-text-gray-400 tw-font-medium">Customer</th>
                <th className="tw-text-left tw-py-3 tw-px-4 tw-text-gray-400 tw-font-medium">Type</th>
                <th className="tw-text-left tw-py-3 tw-px-4 tw-text-gray-400 tw-font-medium">Status</th>
                <th className="tw-text-left tw-py-3 tw-px-4 tw-text-gray-400 tw-font-medium">Time</th>
                <th className="tw-text-left tw-py-3 tw-px-4 tw-text-gray-400 tw-font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="tw-border-b tw-border-gray-800 hover:tw-bg-gray-900/50"
                >
                  <td className="tw-py-3 tw-px-4">
                    <span className="tw-text-gray-300 tw-font-mono tw-text-sm">
                      {order.id.slice(0, 10)}...
                    </span>
                  </td>
                  <td className="tw-py-3 tw-px-4">
                    <div>
                      <p className="tw-text-white">{order.name || "Anonymous"}</p>
                      <p className="tw-text-gray-500 tw-text-sm">{order.email}</p>
                    </div>
                  </td>
                  <td className="tw-py-3 tw-px-4">
                    <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs ${order.type === "sample_courier"
                        ? "tw-bg-blue-500/20 tw-text-blue-300"
                        : "tw-bg-purple-500/20 tw-text-purple-300"
                      }`}>
                      {order.type === "sample_courier" ? "Sample" : "Bulk"}
                    </span>
                  </td>
                  <td className="tw-py-3 tw-px-4">
                    <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs ${order.status === "Completed"
                        ? "tw-bg-green-500/20 tw-text-green-300"
                        : order.status === "Processing"
                          ? "tw-bg-yellow-500/20 tw-text-yellow-300"
                          : order.status === "Quoted"
                            ? "tw-bg-blue-500/20 tw-text-blue-300"
                            : order.status === "Cancelled"
                              ? "tw-bg-red-500/20 tw-text-red-300"
                              : "tw-bg-gray-500/20 tw-text-gray-300"
                      }`}>
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="tw-py-3 tw-px-4">
                    <span className="tw-text-gray-400 tw-text-sm">
                      {new Date(order.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="tw-py-3 tw-px-4">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-px-4 tw-py-1.5 tw-rounded-lg tw-text-sm tw-font-medium tw-mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUpdateOrder(order)}
                      className="tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-white tw-px-4 tw-py-1.5 tw-rounded-lg tw-text-sm tw-font-medium"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="tw-mt-8 tw-grid tw-grid-cols-1 sm:tw-grid-cols-4 tw-gap-4">
          <div className="tw-bg-gray-900/50 tw-rounded-xl tw-p-4 tw-border tw-border-yellow-500/20">
            <p className="tw-text-gray-400 tw-text-sm">Total Orders</p>
            <p className="tw-text-3xl tw-font-bold tw-text-yellow-500">{orders.length}</p>
          </div>
          <div className="tw-bg-gray-900/50 tw-rounded-xl tw-p-4 tw-border tw-border-red-500/20">
            <p className="tw-text-gray-400 tw-text-sm">Pending</p>
            <p className="tw-text-3xl tw-font-bold tw-text-red-500">
              {orders.filter(o => !o.status || o.status === "Pending").length}
            </p>
          </div>
          <div className="tw-bg-gray-900/50 tw-rounded-xl tw-p-4 tw-border tw-border-green-500/20">
            <p className="tw-text-gray-400 tw-text-sm">Completed</p>
            <p className="tw-text-3xl tw-font-bold tw-text-green-500">
              {orders.filter(o => o.status === "Completed").length}
            </p>
          </div>
          <div className="tw-bg-gray-900/50 tw-rounded-xl tw-p-4 tw-border tw-border-blue-500/20">
            <p className="tw-text-gray-400 tw-text-sm">Quoted</p>
            <p className="tw-text-3xl tw-font-bold tw-text-blue-500">
              {orders.filter(o => o.status === "Quoted").length}
            </p>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
          <div className="tw-bg-gray-900 tw-rounded-xl tw-w-full tw-max-w-4xl tw-max-h-[90vh] tw-overflow-y-auto">
            <div className="tw-p-6">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-500">Order Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="tw-text-gray-400 hover:tw-text-white tw-text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
                {/* Left Column - Order Information */}
                <div className="tw-space-y-4">
                  <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
                    <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Basic Information</h3>
                    <div className="tw-space-y-2">
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Order ID:</span>
                        <span className="tw-text-white tw-font-mono">{selectedOrder.id}</span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Type:</span>
                        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs ${selectedOrder.type === "sample_courier"
                            ? "tw-bg-blue-500/20 tw-text-blue-300"
                            : "tw-bg-purple-500/20 tw-text-purple-300"
                          }`}>
                          {selectedOrder.type === "sample_courier" ? "Sample Courier" : "Bulk Quote"}
                        </span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Status:</span>
                        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs ${selectedOrder.status === "Completed"
                            ? "tw-bg-green-500/20 tw-text-green-300"
                            : selectedOrder.status === "Processing"
                              ? "tw-bg-yellow-500/20 tw-text-yellow-300"
                              : selectedOrder.status === "Quoted"
                                ? "tw-bg-blue-500/20 tw-text-blue-300"
                                : selectedOrder.status === "Cancelled"
                                  ? "tw-bg-red-500/20 tw-text-red-300"
                                  : "tw-bg-gray-500/20 tw-text-gray-300"
                          }`}>
                          {selectedOrder.status || "Pending"}
                        </span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Date Created:</span>
                        <span className="tw-text-white">{formatDate(selectedOrder.timestamp)}</span>
                      </div>
                      {selectedOrder.updatedAt && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Last Updated:</span>
                          <span className="tw-text-white">{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
                    <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Customer Information</h3>
                    <div className="tw-space-y-2">
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Name:</span>
                        <span className="tw-text-white">{selectedOrder.name || "Not provided"}</span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Email:</span>
                        <span className="tw-text-white">{selectedOrder.email || "Not provided"}</span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Phone:</span>
                        <span className="tw-text-white">{selectedOrder.phone || "Not provided"}</span>
                      </div>
                      {selectedOrder.company && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Company:</span>
                          <span className="tw-text-white">{selectedOrder.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Details */}
<div className="tw-space-y-4">
  {selectedOrder.type === "sample_courier" ? (
    <>
      <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Shipping Information</h3>
        <div className="tw-space-y-2">
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Shipping Method:</span>
            <span className="tw-text-white tw-capitalize">{selectedOrder.shippingMethod || "N/A"}</span>
          </div>
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Address:</span>
            <span className="tw-text-white">{selectedOrder.address || "Not provided"}</span>
          </div>
        </div>
      </div>

      <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Items Ordered</h3>
        <div className="tw-space-y-4">
          {selectedOrder.items && selectedOrder.items.length > 0 ? (
            selectedOrder.items.map((item, index) => (
              <div key={index} className="tw-bg-gray-900/50 tw-rounded-lg tw-p-4">
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-2">
                  <div>
                    <span className="tw-text-gray-400">Variety:</span>
                    <span className="tw-text-white tw-ml-2">{item.variety || "N/A"}</span>
                  </div>
                  <div>
                    <span className="tw-text-gray-400">Grade:</span>
                    <span className="tw-text-white tw-ml-2">{item.grade || "N/A"}</span>
                  </div>
                  <div>
                    <span className="tw-text-gray-400">Quantity:</span>
                    <span className="tw-text-white tw-ml-2">{item.quantity || "N/A"}</span>
                  </div>
                  <div>
                    <span className="tw-text-gray-400">Price:</span>
                    <span className="tw-text-white tw-ml-2">{item.price || "N/A"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="tw-text-gray-500">No items listed</p>
          )}
        </div>
      </div>

      <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Payment Summary</h3>
        <div className="tw-grid tw-grid-cols-2 tw-gap-4">
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Rice Total:</span>
            <span className="tw-text-white">₹{selectedOrder.riceTotal || "0"}</span>
          </div>
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Shipping Charge:</span>
            <span className="tw-text-white">₹{selectedOrder.shippingCharge || "0"}</span>
          </div>
          <div className="tw-flex tw-justify-between tw-font-bold">
            <span className="tw-text-gray-300">Total Amount:</span>
            <span className="tw-text-yellow-500">₹{selectedOrder.totalAmount || "0"}</span>
          </div>
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Payment Status:</span>
            <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs ${
              selectedOrder.paymentStatus === "Paid" 
                ? "tw-bg-green-500/20 tw-text-green-300" 
                : "tw-bg-red-500/20 tw-text-red-300"
            }`}>
              {selectedOrder.paymentStatus || "Pending"}
            </span>
          </div>
        </div>
      </div>
    </>
  ) : (
    // Existing generic order details for bulk (keep your original code here)
    <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
      <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Order Details</h3>
      <div className="tw-space-y-2">
        {selectedOrder.quantity && (
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Quantity:</span>
            <span className="tw-text-white">{selectedOrder.quantity}</span>
          </div>
        )}
        {selectedOrder.product && (
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Product:</span>
            <span className="tw-text-white">{selectedOrder.product}</span>
          </div>
        )}
        {/* ... keep all your existing fields like dimensions, material, color, etc. ... */}
        {selectedOrder.shipping_address && (
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-400">Shipping Address:</span>
            <span className="tw-text-white">{selectedOrder.shipping_address}</span>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Customer Message and Admin Notes (common to both) */}
  {selectedOrder.message && (
    <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
      <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Customer Message</h3>
      <p className="tw-text-gray-300 tw-bg-gray-900/50 tw-p-3 tw-rounded tw-whitespace-pre-wrap">
        {selectedOrder.message}
      </p>
    </div>
  )}

  {selectedOrder.notes && (
    <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
      <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Admin Notes</h3>
      <p className="tw-text-gray-300 tw-bg-gray-900/50 tw-p-3 tw-rounded tw-whitespace-pre-wrap">
        {selectedOrder.notes}
      </p>
    </div>
  )}
</div>
              </div>

              <div className="tw-mt-6 tw-flex tw-justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdateOrder(selectedOrder);
                  }}
                  className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
          <div className="tw-bg-gray-900 tw-rounded-xl tw-w-full tw-max-w-md">
            <div className="tw-p-6">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-500">Update Order Status</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="tw-text-gray-400 hover:tw-text-white tw-text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="tw-mb-6">
                <p className="tw-text-gray-300 tw-mb-2">Order ID: <span className="tw-font-mono">{selectedOrder.id.slice(0, 12)}...</span></p>
                <p className="tw-text-gray-300">Customer: <span className="tw-text-white">{selectedOrder.name || selectedOrder.email || "Anonymous"}</span></p>
              </div>

              <div className="tw-mb-6">
                <label className="tw-block tw-text-gray-300 tw-mb-2">Select Status:</label>
                <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setUpdateStatus(status)}
                      className={`tw-p-2 tw-rounded tw-text-sm tw-font-medium tw-transition-colors ${updateStatus === status
                          ? status === "Completed"
                            ? "tw-bg-green-600 tw-text-white"
                            : status === "Processing"
                              ? "tw-bg-yellow-600 tw-text-white"
                              : status === "Quoted"
                                ? "tw-bg-blue-600 tw-text-white"
                                : status === "Cancelled"
                                  ? "tw-bg-red-600 tw-text-white"
                                  : "tw-bg-gray-700 tw-text-white"
                          : "tw-bg-gray-800 tw-text-gray-300 hover:tw-bg-gray-700"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tw-flex tw-justify-end tw-gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || !updateStatus}
                  className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-flex tw-items-center tw-gap-2"
                >
                  {updating ? (
                    <>
                      <span className="tw-w-4 tw-h-4 tw-border-2 tw-border-black tw-border-t-transparent tw-rounded-full tw-animate-spin"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}