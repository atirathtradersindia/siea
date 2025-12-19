import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function History() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  const notifyAdminModal = (open) => {
    window.dispatchEvent(new CustomEvent("admin-modal", { detail: open }));
  };


  useEffect(() => {
    const historyRef = ref(db, "history");

    const unsub = onValue(historyRef, (snap) => {
      if (!snap.exists()) {
        setHistory([]);
        return;
      }

      const list = Object.entries(snap.val())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setHistory(list);
    });

    return () => unsub();
  }, []);

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
        return "tw-bg-green-600";
      case "UPDATE":
        return "tw-bg-yellow-500 tw-text-black";
      case "DELETE":
        return "tw-bg-red-600";
      case "LOGIN":
        return "tw-bg-blue-600";
      default:
        return "tw-bg-gray-600";
    }
  };

  return (
    <div className="tw-p-6 tw-text-white">
      <h1 className="tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-6">
        System History
      </h1>

      <div className="tw-overflow-x-auto">
        <table className="tw-w-full tw-bg-black/40 tw-rounded-xl">
          <thead>
            <tr className="tw-bg-yellow-500 tw-text-black">
              <th className="tw-p-3">Time</th>
              <th className="tw-p-3">Entity</th>
              <th className="tw-p-3">Action</th>
              <th className="tw-p-3">Changed By</th>
              <th className="tw-p-3">Path</th>
              <th className="tw-p-3">View</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan="6" className="tw-text-center tw-p-6 tw-text-gray-400">
                  No history records found
                </td>
              </tr>
            )}

            {history.map((h) => (
              <tr
                key={h.id}
                className="tw-border-b tw-border-gray-700 hover:tw-bg-white/5"
              >
                <td className="tw-p-3 tw-text-sm">
                  {new Date(h.timestamp).toLocaleString()}
                </td>

                <td className="tw-p-3 tw-font-semibold">
                  {h.entity || "-"}
                </td>

                <td className="tw-p-3">
                  <span
                    className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold ${getActionColor(
                      h.action
                    )}`}
                  >
                    {h.action}
                  </span>
                </td>

                <td className="tw-p-3 tw-text-sm">
                  {h.actor || "System"}
                </td>

                <td className="tw-p-3 tw-text-blue-400 tw-text-sm">
                  {h.path}
                </td>

                <td className="tw-p-3">
                  <button
                    onClick={() => {
                      setSelected(h);
                      notifyAdminModal(true);
                    }}

                    className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-3 tw-py-1 tw-rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {selected && (
        <div className="tw-fixed tw-inset-0 tw-bg-black/70 tw-flex tw-justify-center tw-items-center tw-z-50">
          <div className="tw-bg-[#0f172a] tw-w-[90%] md:tw-w-[70%] tw-max-h-[85vh] tw-p-6 tw-rounded-xl tw-overflow-hidden">
            <button
              onClick={() => {
                setSelected(null);
                notifyAdminModal(false);
              }}
              className="tw-text-red-400 tw-text-2xl tw-float-right"
            >
              ✕
            </button>

            <h2 className="tw-text-yellow-400 tw-text-xl tw-mb-2">
              History Details
            </h2>

            <p className="tw-text-sm tw-text-gray-400 tw-mb-4">
              <b>Time:</b>{" "}
              {new Date(selected.timestamp).toLocaleString()}
              <br />
              <b>Changed By:</b> {selected.actor || "System"}
              <br />
              <b>Action:</b> {selected.action}
              <br />
              <b>Path:</b> {selected.path}
            </p>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-max-h-[60vh] tw-overflow-y-auto">
              <div>
                <h3 className="tw-text-red-400 tw-font-bold tw-mb-2">
                  Before
                </h3>
                <pre className="tw-bg-black tw-p-4 tw-text-xs tw-rounded tw-overflow-auto">
                  {JSON.stringify(selected.before, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="tw-text-green-400 tw-font-bold tw-mb-2">
                  After
                </h3>
                <pre className="tw-bg-black tw-p-4 tw-text-xs tw-rounded tw-overflow-auto">
                  {JSON.stringify(selected.after, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
