// Users.jsx – GOLD + BLACK THEME - RESPONSIVE
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);


  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        setLoading(false);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data).map((customId) => ({
            customId,          // user-1, user-2...
            firebaseUid: data[customId].uid, // original UID
            ...data[customId],
          }));

          setUsers(list);
        } else {
          setUsers([]);
        }
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        color: "#FFD700",
        textAlign: "center",
        padding: 20,
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h2 style={{
          fontSize: "clamp(20px, 5vw, 28px)",
          marginBottom: 20
        }}>
          All Users
        </h2>
        <div style={{
          color: "#fff",
          fontSize: "18px",
          textAlign: "center"
        }}>
          Loading users...
        </div>
      </div>
    );
  }
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.customId?.toLowerCase().includes(s) ||
      u.fullName?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s)
    );
  });


  return (
    <div style={{
      color: "#FFD700",
      padding: "16px 12px",
      overflowX: "auto"
    }}>
      <h2 style={{
        marginBottom: 20,
        fontSize: "clamp(20px, 5vw, 28px)",
        textAlign: "center"
      }}>
        All Users ({users.length})
      </h2>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 15px",
            width: "90%",
            maxWidth: "420px",
            borderRadius: "8px",
            border: "1px solid #FFD700",
            background: "#111",
            color: "#FFD700",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>


      {/* Table Container for Responsive Scroll */}
      <div className="
        tw-overflow-x-auto 
        tw-rounded-lg 
        tw-border tw-border-yellow-500/20
        tw-shadow-lg
      ">
        <table
          style={{
            width: "100%",
            minWidth: "600px",
            borderCollapse: "collapse",
            background: "#0d0d0d",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{
              background: "#1a1a1a",
              borderBottom: "2px solid #FFD700"
            }}>
              <th style={{
                padding: "12px 8px",
                color: "#FFD700",
                textAlign: "left",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}>
                UID
              </th>
              <th style={{
                padding: "12px 8px",
                color: "#FFD700",
                textAlign: "left",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}>
                Name
              </th>
              <th style={{
                padding: "12px 8px",
                color: "#FFD700",
                textAlign: "left",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}>
                Email
              </th>
              <th style={{
                padding: "12px 8px",
                color: "#FFD700",
                textAlign: "left",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}>
                Phone
              </th>
              <th style={{ padding: "12px 8px", color: "#FFD700" }}>Actions</th>

            </tr>

          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr
                  key={u.uid}
                  style={{
                    background: "#111",
                    borderBottom: "1px solid rgba(255,215,0,0.15)",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 8px",
                      fontSize: "11px",
                      color: "#ccc",
                      fontFamily: "monospace",
                      wordBreak: "break-word",
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={u.uid}
                  >
                    {u.customId}
                  </td>
                  <td style={{
                    padding: "10px 8px",
                    color: "#fff",
                    fontSize: "14px",
                    wordBreak: "break-word",
                    maxWidth: "150px"
                  }}>
                    {u.fullName || u.name || "N/A"}
                  </td>
                  <td style={{
                    padding: "10px 8px",
                    color: "#fff",
                    fontSize: "14px",
                    wordBreak: "break-word",
                    maxWidth: "200px"
                  }}>
                    {u.email || "N/A"}
                  </td>
                  <td style={{
                    padding: "10px 8px",
                    color: "#fff",
                    fontSize: "14px",
                    wordBreak: "break-word",
                    maxWidth: "120px"
                  }}>
                    {u.phone || "N/A"}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <button
                      onClick={() => setSelectedUser(u)}
                      style={{
                        padding: "6px 12px",
                        background: "#FFD700",
                        color: "#000",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "gray",
                    fontSize: "16px"
                  }}
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Hidden on desktop) */}
      <div className="
        tw-hidden 
        tw-grid 
        tw-grid-cols-1 
        tw-gap-4 
        tw-mt-6
        md:tw-hidden
      ">
        {users.map((u) => (
          <div
            key={u.uid}
            style={{
              background: "#111",
              borderRadius: 10,
              padding: 16,
              border: "1px solid rgba(255,215,0,0.2)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12
            }}>
              <div style={{
                fontSize: "12px",
                color: "#FFD700",
                fontWeight: "bold"
              }}>
                UID
              </div>
              <div style={{
                fontSize: "10px",
                color: "#ccc",
                fontFamily: "monospace",
                wordBreak: "break-all"
              }}>
                {u.uid.substring(0, 20)}...
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8
            }}>
              <div style={{ fontSize: "12px", color: "#FFD700" }}>Name:</div>
              <div style={{ fontSize: "14px", color: "#fff" }}>
                {u.fullName || u.name || "N/A"}
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8
            }}>
              <div style={{ fontSize: "12px", color: "#FFD700" }}>Email:</div>
              <div style={{
                fontSize: "14px",
                color: "#fff",
                wordBreak: "break-all"
              }}>
                {u.email || "N/A"}
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <div style={{ fontSize: "12px", color: "#FFD700" }}>Phone:</div>
              <div style={{ fontSize: "14px", color: "#fff" }}>
                {u.phone || "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Text for Mobile */}
      {users.length > 0 && (
        <div className="
          tw-text-center 
          tw-text-gray-400 
          tw-text-xs 
          tw-mt-4 
          tw-p-3 
          tw-bg-gray-900/50 
          tw-rounded-lg
          md:tw-hidden
        ">
          Swipe horizontally to view all user details
        </div>
      )}
      {selectedUser && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
    onClick={() => setSelectedUser(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#0d0d0d",
        padding: "25px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "420px",
        border: "1px solid #FFD700",
        boxShadow: "0 0 20px rgba(255,215,0,0.3)",
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "15px",
          textAlign: "center",
          letterSpacing: "1px",
        }}
      >
        User Profile
      </h2>

      {/* Custom User ID */}
      <p style={{ color: "#FFD700", marginBottom: 8 }}>
        <strong>Custom ID:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.customId}</span>
      </p>

      {/* Firebase UID */}
      <p style={{ color: "#FFD700", marginBottom: 8 }}>
        <strong>Firebase UID:</strong>{" "}
        <span
          style={{
            color: "#ccc",
            fontFamily: "monospace",
            wordBreak: "break-all",
            display: "inline-block",
            maxWidth: "100%",
          }}
        >
          {selectedUser.firebaseUid}
        </span>
      </p>

      {/* Full Name */}
      <p style={{ color: "#FFD700", marginBottom: 8 }}>
        <strong>Name:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.fullName}</span>
      </p>

      {/* Email */}
      <p style={{ color: "#FFD700", marginBottom: 8 }}>
        <strong>Email:</strong>{" "}
        <span style={{ color: "#fff", wordBreak: "break-all" }}>
          {selectedUser.email}
        </span>
      </p>

      {/* Phone */}
      <p style={{ color: "#FFD700", marginBottom: 8 }}>
        <strong>Phone:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.phone}</span>
      </p>

      {/* Address Section */}
      <h3 style={{ color: "#FFD700", marginTop: 15, marginBottom: 5 }}>Address</h3>

      <p style={{ color: "#FFD700", marginBottom: 6 }}>
        <strong>Street:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.street || "N/A"}</span>
      </p>

      <p style={{ color: "#FFD700", marginBottom: 6 }}>
        <strong>City:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.city || "N/A"}</span>
      </p>

      <p style={{ color: "#FFD700", marginBottom: 6 }}>
        <strong>State:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.addressState || "N/A"}</span>
      </p>

      <p style={{ color: "#FFD700", marginBottom: 6 }}>
        <strong>Country:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.addressCountry || "N/A"}</span>
      </p>

      <p style={{ color: "#FFD700", marginBottom: 6 }}>
        <strong>Pincode:</strong>{" "}
        <span style={{ color: "#fff" }}>{selectedUser.pincode || "N/A"}</span>
      </p>

      {/* Created At */}
      <p style={{ color: "#FFD700", marginTop: 10 }}>
        <strong>Created At:</strong>{" "}
        <span style={{ color: "#fff" }}>
          {selectedUser.createdAt || "N/A"}
        </span>
      </p>

      {/* Close Button */}
      <button
        onClick={() => setSelectedUser(null)}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          background: "#FFD700",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          color: "#000",
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
   </div>
  );
}