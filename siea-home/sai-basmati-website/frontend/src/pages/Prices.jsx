import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

const Prices = () => {
  const [data, setData] = useState({});
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(true);

  /* ------------------ NEW: CURRENCY CONVERTER ------------------ */
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState({
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0096,
    AED: 0.044,
  });

  const convertPrice = (priceRange) => {
  if (!priceRange) return "";

  // Currency symbols
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
  };

  const symbol = symbols[currency];

  // No conversion needed for INR
  if (currency === "INR") return priceRange;

  const num = priceRange.replace(/₹/g, "").split("-");
  const low = parseFloat(num[0].trim());
  const high = parseFloat(num[1].trim());

  const rate = rates[currency];

  const convertedLow = (low * rate).toFixed(2);
  const convertedHigh = (high * rate).toFixed(2);

  return `${symbol}${convertedLow} - ${symbol}${convertedHigh}`;
};

  /* -------------------------------------------------------------- */

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

  if (loading)
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loader}></div>
        <span style={styles.loadingText}>Fetching Market Rates...</span>
      </div>
    );

  const states = Object.keys(data);

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Basmati & Non-Basmati Market Rates</h1>

      {/* ------------------- NEW CURRENCY DROPDOWN ------------------- */}
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
      {/* -------------------------------------------------------------- */}

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

      {/* Selected State Data */}
      <div style={styles.card}>
        <h2 style={styles.stateTitle}>
          {selectedState.replace("_", " ").toUpperCase()}
        </h2>

        {/* BASMATI */}
        {data[selectedState].basmati && (
          <>
            <h3 style={styles.sectionTitle}>
              BASMATI <span style={styles.goldLine}></span>
            </h3>

            {data[selectedState].basmati.map((item, idx) => (
              <div key={idx} style={styles.varietyCard}>
                <h4 style={styles.varietyName}>{item.variety}</h4>

                {item.items.map((v, i) => (
                  <div key={i} style={styles.row}>
                    <span style={styles.rowLabel}>{v.type}</span>
                    <span>{v.crop_year}</span>

                    {/* NEW: Converted Price */}
                    <span style={styles.rowPrice}>
                      {convertPrice(v.price)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* NON BASMATI */}
        {data[selectedState].non_basmati && (
          <>
            <h3 style={styles.sectionTitle}>
              NON-BASMATI <span style={styles.goldLine}></span>
            </h3>

            {data[selectedState].non_basmati.map((item, idx) => (
              <div key={idx} style={styles.varietyCard}>
                <h4 style={styles.varietyName}>{item.variety}</h4>

                {item.items.map((v, i) => (
                  <div key={i} style={styles.row}>
                    <span style={styles.rowLabel}>{v.type}</span>
                    <span>{v.crop_year}</span>

                    {/* NEW: Converted Price */}
                    <span style={styles.rowPrice}>
                      {convertPrice(v.price)}
                    </span>
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
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
    color: "white",
  },

  mainTitle: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "#FFD700",
    textShadow: "0 0 10px rgba(212,175,55,0.8)",
  },

  /* ---------------------- NEW CURRENCY DROPDOWN ---------------------- */
  currencyBox: {
    marginBottom: "20px",
    textAlign: "center",
  },

  currencyDropdown: {
    padding: "10px 15px",
    borderRadius: "8px",
    background: "#111",
    color: "white",
    border: "1px solid #FFD700",
    fontSize: "14px",
  },
  /* --------------------------------------------------------------------- */

  tabRow: {
    display: "flex",
    overflowX: "auto",
    gap: "12px",
    paddingBottom: "10px",
    marginBottom: "25px",
  },

  tabButton: {
    padding: "12px 20px",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.3s",
    whiteSpace: "nowrap",
  },

  card: {
    background: "#0d0d0d",
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid #FFD700",
    boxShadow: "0 0 20px rgba(212,175,55,0.3)",
  },

  stateTitle: {
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: "20px",
    color: "#FFD700",
    marginTop: "20px",
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
    gridTemplateColumns: "1fr 100px 150px",
    padding: "10px 0",
    borderBottom: "1px solid #333",
    alignItems: "center",
    fontSize: "15px",
  },

  rowLabel: { fontWeight: "bold" },

  rowPrice: {
    color: "#FFD700",
    fontWeight: "600",
    textAlign: "right",
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

  loadingText: { marginTop: "10px", fontSize: "16px" },
};

export default Prices;
