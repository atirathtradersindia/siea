// src/admin/PendingQuotes.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
// import { db as dbQuote } from "../../firebasequote";
import { db } from "../../firebase";

export default function PendingQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingQuoteId, setProcessingQuoteId] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const statusOptions = ["Pending", "Processing", "Quoted", "Completed", "Cancelled", "On Hold"];

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "quotes/bulk"), (snap) => {
      if (!snap.exists()) {
        setQuotes([]);
        setLoading(false);
        return;
      }

      const data = snap.val();
      const pendingQuotesList = Object.entries(data)
        .map(([id, quote]) => ({ id, ...quote }))
        .filter(quote => !quote.status || quote.status === "Pending")
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setQuotes(pendingQuotesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProcessQuote = async (quoteId) => {
    try {
      setProcessingQuoteId(quoteId);
      
      await update(ref(db, `quotes/${quoteId}`), {
        status: "Processing",
        processedAt: Date.now()
      });

      navigate("/admin/orders?section=bulk");
      alert("Quote marked as processing and redirected to bulk orders!");
      
    } catch (error) {
      console.error("Error processing quote:", error);
      alert("Failed to process quote. Please try again.");
    } finally {
      setProcessingQuoteId(null);
    }
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowViewModal(true);
  };

  const handleUpdateQuote = (quote) => {
    setSelectedQuote(quote);
    setUpdateStatus(quote.status || "Pending");
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedQuote || !updateStatus) return;

    try {
      setUpdating(true);
      await update(ref(db, `quotes/${selectedQuote.id}`), {
        status: updateStatus,
        updatedAt: Date.now()
      });
      
      // Update local state
      setQuotes(prev => prev.map(quote => 
        quote.id === selectedQuote.id 
          ? { ...quote, status: updateStatus, updatedAt: Date.now() }
          : quote
      ));
      
      setShowUpdateModal(false);
      setSelectedQuote(null);
      alert(`Quote status updated to: ${updateStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleViewBulkOrders = () => {
    navigate("/admin/orders?section=bulk");
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
        <div className="tw-text-yellow-500 tw-text-lg">Loading pending quotes...</div>
      </div>
    );
  }

  return (
    <div className="tw-p-4 sm:tw-p-6">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <div>
          <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-500">
            Pending Quotes
          </h1>
          <p className="tw-text-gray-400 tw-mt-2">
            Process quotes and move them to bulk orders
          </p>
        </div>
        <div className="tw-flex tw-items-center tw-gap-4">
          <span className="tw-bg-red-500/20 tw-text-red-300 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
            {quotes.length} Pending
          </span>
          <button
            onClick={handleViewBulkOrders}
            className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors"
          >
            View Bulk Orders
          </button>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="tw-bg-gray-900/50 tw-rounded-xl tw-p-8 tw-text-center">
          <div className="tw-text-5xl tw-mb-4">⏳</div>
          <h3 className="tw-text-xl tw-text-gray-300 tw-mb-2">No Pending Quotes</h3>
          <p className="tw-text-gray-500 tw-mb-6">All quotes have been processed</p>
          <button
            onClick={handleViewBulkOrders}
            className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-px-6 tw-py-3 tw-rounded-lg tw-font-medium"
          >
            Go to Bulk Orders
          </button>
        </div>
      ) : (
        <>
          <div className="tw-mb-6 tw-p-4 tw-bg-blue-900/20 tw-rounded-lg tw-border tw-border-blue-500/30">
            <p className="tw-text-blue-300 tw-text-sm">
              💡 <strong>Tip:</strong> Click "View" to see complete quote details, "Update" to change status, or "Process Quote" to move to bulk orders.
            </p>
          </div>
          
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="tw-bg-gray-900/50 tw-rounded-xl tw-p-4 sm:tw-p-6 tw-border tw-border-yellow-500/20 hover:tw-border-yellow-500/40 tw-transition-colors"
              >
                <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                  <div>
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                      <span className={`tw-px-2 tw-py-1 tw-rounded tw-text-xs ${
                        quote.type === "sample_courier" 
                          ? "tw-bg-blue-500/20 tw-text-blue-300" 
                          : "tw-bg-purple-500/20 tw-text-purple-300"
                      }`}>
                        {quote.type === "sample_courier" ? "Sample Courier" : "Bulk Quote"}
                      </span>
                      <span className="tw-text-gray-500 tw-text-xs">
                        ID: {quote.id.slice(0, 8)}...
                      </span>
                    </div>
                    <h3 className="tw-text-lg tw-font-semibold tw-text-white">
                      {quote.type === "sample_courier" ? "Sample Courier Request" : "Bulk Quote Request"}
                    </h3>
                  </div>
                  <span className="tw-bg-yellow-500/20 tw-text-yellow-300 tw-px-3 tw-py-1 tw-rounded-full tw-text-xs">
                    Pending
                  </span>
                </div>

                <div className="tw-space-y-3">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-text-gray-400">👤</span>
                    <span className="tw-text-white">{quote.name || quote.email || "Anonymous"}</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-text-gray-400">📧</span>
                    <span className="tw-text-white">{quote.email || "No email"}</span>
                  </div>
                  {quote.phone && (
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <span className="tw-text-gray-400">📱</span>
                      <span className="tw-text-white">{quote.phone}</span>
                    </div>
                  )}
                  {quote.message && (
                    <div className="tw-mt-3">
                      <p className="tw-text-gray-400 tw-text-sm tw-mb-1">Message:</p>
                      <p className="tw-text-gray-300 tw-bg-gray-800/50 tw-p-3 tw-rounded-lg tw-text-sm">
                        {quote.message.length > 150 ? `${quote.message.substring(0, 150)}...` : quote.message}
                      </p>
                    </div>
                  )}
                  
                  {quote.quantity && (
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <span className="tw-text-gray-400">📊</span>
                      <span className="tw-text-white">Quantity: {quote.quantity}</span>
                    </div>
                  )}
                  
                  {quote.product && (
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <span className="tw-text-gray-400">📦</span>
                      <span className="tw-text-white">Product: {quote.product}</span>
                    </div>
                  )}

                  <div className="tw-flex tw-justify-between tw-items-center tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-700">
                    <div>
                      <span className="tw-text-gray-500 tw-text-sm tw-block">
                        {quote.timestamp ? new Date(quote.timestamp).toLocaleDateString() : "No date"}
                      </span>
                      <span className="tw-text-gray-500 tw-text-xs tw-block">
                        {quote.timestamp ? new Date(quote.timestamp).toLocaleTimeString() : ""}
                      </span>
                    </div>
                    <div className="tw-flex tw-gap-2">
                      <button 
                        onClick={() => handleViewQuote(quote)}
                        className="tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-sm tw-font-medium"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleUpdateQuote(quote)}
                        className="tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-white tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-sm tw-font-medium"
                      >
                        Update
                      </button>
                      <button 
                        onClick={() => handleProcessQuote(quote.id)}
                        disabled={processingQuoteId === quote.id}
                        className={`
                          tw-bg-yellow-500 hover:tw-bg-yellow-600 
                          tw-text-black tw-px-3 tw-py-1.5 tw-rounded-lg 
                          tw-text-sm tw-font-medium
                          tw-transition-colors
                          tw-flex tw-items-center tw-gap-2
                          ${processingQuoteId === quote.id ? 'tw-opacity-70 tw-cursor-not-allowed' : ''}
                        `}
                      >
                        {processingQuoteId === quote.id ? (
                          <>
                            <span className="tw-w-4 tw-h-4 tw-border-2 tw-border-black tw-border-t-transparent tw-rounded-full tw-animate-spin"></span>
                          </>
                        ) : (
                          'Process'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Quote Modal */}
      {showViewModal && selectedQuote && (
        <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
          <div className="tw-bg-gray-900 tw-rounded-xl tw-w-full tw-max-w-4xl tw-max-h-[90vh] tw-overflow-y-auto">
            <div className="tw-p-6">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-500">Quote Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="tw-text-gray-400 hover:tw-text-white tw-text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
                {/* Left Column - Basic Information */}
                <div className="tw-space-y-4">
                  <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
                    <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Basic Information</h3>
                    <div className="tw-space-y-2">
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Quote ID:</span>
                        <span className="tw-text-white tw-font-mono">{selectedQuote.id}</span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Type:</span>
                        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs ${
                          selectedQuote.type === "sample_courier" 
                            ? "tw-bg-blue-500/20 tw-text-blue-300" 
                            : "tw-bg-purple-500/20 tw-text-purple-300"
                        }`}>
                          {selectedQuote.type === "sample_courier" ? "Sample Courier" : "Bulk Quote"}
                        </span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Status:</span>
                        <span className="tw-bg-yellow-500/20 tw-text-yellow-300 tw-px-3 tw-py-1 tw-rounded-full tw-text-xs">
                          {selectedQuote.status || "Pending"}
                        </span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Date Created:</span>
                        <span className="tw-text-white">{formatDate(selectedQuote.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
                    <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Customer Information</h3>
                    <div className="tw-space-y-2">
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Name:</span>
                        <span className="tw-text-white">{selectedQuote.name || "Not provided"}</span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Email:</span>
                        <span className="tw-text-white">{selectedQuote.email || "Not provided"}</span>
                      </div>
                      <div className="tw-flex tw-justify-between">
                        <span className="tw-text-gray-400">Phone:</span>
                        <span className="tw-text-white">{selectedQuote.phone || "Not provided"}</span>
                      </div>
                      {selectedQuote.company && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Company:</span>
                          <span className="tw-text-white">{selectedQuote.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Quote Details */}
                <div className="tw-space-y-4">
                  <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
                    <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Quote Details</h3>
                    <div className="tw-space-y-2">
                      {selectedQuote.quantity && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Quantity:</span>
                          <span className="tw-text-white">{selectedQuote.quantity}</span>
                        </div>
                      )}
                      {selectedQuote.product && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Product:</span>
                          <span className="tw-text-white">{selectedQuote.product}</span>
                        </div>
                      )}
                      {selectedQuote.dimensions && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Dimensions:</span>
                          <span className="tw-text-white">{selectedQuote.dimensions}</span>
                        </div>
                      )}
                      {selectedQuote.material && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Material:</span>
                          <span className="tw-text-white">{selectedQuote.material}</span>
                        </div>
                      )}
                      {selectedQuote.color && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Color:</span>
                          <span className="tw-text-white">{selectedQuote.color}</span>
                        </div>
                      )}
                      {selectedQuote.shipping_address && (
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-text-gray-400">Shipping Address:</span>
                          <span className="tw-text-white">{selectedQuote.shipping_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedQuote.message && (
                    <div className="tw-bg-gray-800/50 tw-rounded-lg tw-p-4">
                      <h3 className="tw-text-lg tw-font-semibold tw-text-white tw-mb-3">Customer Message</h3>
                      <p className="tw-text-gray-300 tw-bg-gray-900/50 tw-p-3 tw-rounded tw-whitespace-pre-wrap">
                        {selectedQuote.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="tw-mt-6 tw-flex tw-justify-end tw-gap-3">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdateQuote(selectedQuote);
                  }}
                  className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium"
                >
                  Update Status
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleProcessQuote(selectedQuote.id);
                  }}
                  className="tw-bg-green-500 hover:tw-bg-green-600 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium"
                >
                  Process Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedQuote && (
        <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
          <div className="tw-bg-gray-900 tw-rounded-xl tw-w-full tw-max-w-md">
            <div className="tw-p-6">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-500">Update Quote Status</h2>
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="tw-text-gray-400 hover:tw-text-white tw-text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="tw-mb-6">
                <p className="tw-text-gray-300 tw-mb-2">Quote ID: <span className="tw-font-mono">{selectedQuote.id.slice(0, 12)}...</span></p>
                <p className="tw-text-gray-300">Customer: <span className="tw-text-white">{selectedQuote.name || selectedQuote.email || "Anonymous"}</span></p>
              </div>

              <div className="tw-mb-6">
                <label className="tw-block tw-text-gray-300 tw-mb-2">Select Status:</label>
                <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setUpdateStatus(status)}
                      className={`tw-p-2 tw-rounded tw-text-sm tw-font-medium tw-transition-colors ${
                        updateStatus === status
                          ? status === "Processing"
                            ? "tw-bg-yellow-600 tw-text-white"
                            : status === "Quoted"
                            ? "tw-bg-blue-600 tw-text-white"
                            : status === "Completed"
                            ? "tw-bg-green-600 tw-text-white"
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