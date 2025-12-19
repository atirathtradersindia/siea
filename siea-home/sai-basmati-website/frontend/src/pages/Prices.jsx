import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

const Prices = () => {
  const [data, setData] = useState({});
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(true);

  /* ------------------ CURRENCY CONVERTER ------------------ */
  const [currency, setCurrency] = useState("INR");
  const rates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0096,
    AED: 0.044,
  };

  const convertPrice = (priceRange) => {
    if (!priceRange) return "";

    const symbols = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      AED: "د.إ",
    };

    if (currency === "INR") return priceRange;

    const [low, high] = priceRange
      .replace(/₹/g, "")
      .split("-")
      .map((n) => parseFloat(n.trim()));

    return `${symbols[currency]}${(low * rates[currency]).toFixed(
      2
    )} - ${symbols[currency]}${(high * rates[currency]).toFixed(2)}`;
  };
  /* -------------------------------------------------------- */

  useEffect(() => {
    const ratesRef = ref(db, "market_rates/");
    onValue(ratesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allData = snapshot.val();
        setData(allData);
        setSelectedState(Object.keys(allData)[0]);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loader}></div>
        <span style={styles.loadingText}>Fetching Market Rates...</span>
      </div>
    );
  }

  const states = Object.keys(data);
  const isMobile = window.innerWidth < 640;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Basmati & Non-Basmati Market Rates</h1>

      {/* Currency */}
      <div style={styles.currencyBox}>
        <label style={{ marginRight: "10px" }}>Currency:</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={styles.currencyDropdown}
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="AED">AED (د.إ)</option>
        </select>
      </div>

      {/* State Tabs */}
      <div style={styles.tabRow}>
        {states.map((state) => (
          <button
            key={state}
            onClick={() => setSelectedState(state)}
            style={{
              ...styles.tabButton,
              background:
                selectedState === state ? "#FFD700" : "rgba(255,255,255,0.06)",
              color: selectedState === state ? "#000" : "#fff",
              border:
                selectedState === state
                  ? "1px solid #FFD700"
                  : "1px solid #333",
            }}
          >
            {state.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Data Card */}
      <div style={styles.card}>
        <h2 style={styles.stateTitle}>
          {selectedState.replace("_", " ").toUpperCase()}
        </h2>

        {/* BASMATI */}
        {data[selectedState]?.basmati && (
          <>
            <h3 style={styles.sectionTitle}>
              BASMATI <span style={styles.goldLine}></span>
            </h3>

            {data[selectedState].basmati.map((item, idx) => (
              <div key={idx} style={styles.varietyCard}>
                <h4 style={styles.varietyName}>{item.variety}</h4>

                {item.items.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.row,
                      gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                    }}
                  >
                    {/* LEFT */}
                    <div>
                      <div style={styles.rowLabel}>{v.type}</div>
                      <div style={styles.cropYear}>
                        Crop Year: {v.crop_year}
                      </div>
                    </div>

                    {/* RIGHT PRICE */}
                    <div style={styles.rowPrice}>
                      {convertPrice(v.price)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* NON BASMATI */}
        {data[selectedState]?.non_basmati && (
          <>
            <h3 style={styles.sectionTitle}>
              NON-BASMATI <span style={styles.goldLine}></span>
            </h3>

            {data[selectedState].non_basmati.map((item, idx) => (
              <div key={idx} style={styles.varietyCard}>
                <h4 style={styles.varietyName}>{item.variety}</h4>

                {item.items.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.row,
                      gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                    }}
                  >
                    <div>
                      <div style={styles.rowLabel}>{v.type}</div>
                      <div style={styles.cropYear}>
                        Crop Year: {v.crop_year}
                      </div>
                    </div>

                    <div style={styles.rowPrice}>
                      {convertPrice(v.price)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "#000",
    minHeight: "100vh",
    padding: "clamp(12px, 4vw, 20px)",
    fontFamily: "Poppins, sans-serif",
    color: "white",
  },

  mainTitle: {
    textAlign: "center",
    fontSize: "clamp(18px, 5vw, 28px)",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "#FFD700",
  },

  currencyBox: { textAlign: "center", marginBottom: "20px" },

  currencyDropdown: {
    padding: "10px 15px",
    borderRadius: "8px",
    background: "#111",
    color: "#fff",
    border: "1px solid #FFD700",
  },

  tabRow: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    marginBottom: "25px",
  },

  tabButton: {
    padding: "10px 18px",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  card: {
    background: "#0d0d0d",
    padding: "clamp(14px, 4vw, 20px)",
    borderRadius: "15px",
    border: "1px solid #FFD700",
  },

  stateTitle: {
    fontSize: "clamp(18px, 4.5vw, 24px)",
    marginBottom: "20px",
  },

  sectionTitle: {
    fontSize: "clamp(16px, 4vw, 20px)",
    color: "#FFD700",
    marginBottom: "12px",
  },

  goldLine: {
    display: "block",
    height: "3px",
    width: "60px",
    background: "#FFD700",
    marginTop: "4px",
  },

  varietyCard: {
    background: "#1a1a1a",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "15px",
    borderLeft: "4px solid #FFD700",
  },

  varietyName: {
    fontSize: "18px",
    color: "#FFD700",
    marginBottom: "10px",
  },

  row: {
    display: "grid",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #333",
    alignItems: "center",
  },

  rowLabel: { fontWeight: "700" },

  cropYear: {
    fontSize: "13px",
    opacity: 0.7,
  },

  rowPrice: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: "clamp(14px, 4vw, 18px)",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "150px",
  },

  loader: {
    width: "50px",
    height: "50px",
    border: "5px solid #333",
    borderTop: "5px solid #FFD700",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: { marginTop: "10px" },
};

export default Prices;
