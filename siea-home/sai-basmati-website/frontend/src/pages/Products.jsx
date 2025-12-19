// src/pages/Products.jsx
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
// import { getGradeSpecificPriceRange } from "../data/products";
import { useState, useEffect } from "react";

import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function Products() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [currency, setCurrency] = useState("INR");
  const [showDropdown, setShowDropdown] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]); // ← New: top 4 from Firebase

  const goToProd = () => navigate("/Products-All");

  const currencies = [
    { code: "INR", symbol: "₹", rate: 1 },
    { code: "USD", symbol: "$", rate: 1 / 83.5 },
    { code: "EUR", symbol: "€", rate: 1 / 90.2 },
    { code: "GBP", symbol: "£", rate: 1 / 108.5 },
  ];

  const currentCurrency = currencies.find((c) => c.code === currency);

  // Fetch products from Firebase and pick top 4 featured ones
  useEffect(() => {
    const r = ref(db, "products");
    const unsubscribe = onValue(r, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.values(data);

        // Optional: sort by some field like 'featured: true' or 'id' or 'name'
        // Here we just take first 4 (or you can filter featured ones later)
        const topFour = list.slice(0, 4);

        setFeaturedProducts(topFour);
      } else {
        setFeaturedProducts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Reuse your existing parse + format logic
  const parseMinMaxFromString = (priceStr) => {
    if (!priceStr || typeof priceStr !== "string") return null;
    const matches = priceStr.match(/[\d,]+/g);
    if (!matches || matches.length < 2) return null;
    const nums = matches.slice(0, 2).map((s) => Number(s.replace(/,/g, "")));
    if (nums.some(isNaN)) return null;
    return nums;
  };

  const formatPrice = (product) => {
    if (!product?.price) {
      const fallback = getGradeSpecificPriceRange(product?.name?.en || "", currency);
      return fallback || "N/A";
    }

    const parsed = parseMinMaxFromString(product.price);
    if (parsed) {
      const [minINR, maxINR] = parsed;
      const rate = currentCurrency.rate || 1;
      const minC = Math.round(minINR * rate);
      const maxC = Math.round(maxINR * rate);
      return `${currentCurrency.symbol}${minC} – ${currentCurrency.symbol}${maxC} / qtl`;
    }

    return "N/A";
  };

  // Fallback images map (in case image URL missing)
  const fallbackImages = {
    "1121 Basmati": "./img/1121_Golden_Basamati.jpg",
    "1401 Basmati": "./img/1401_Steam_Basamati.jpg",
    "Pusa Basmati": "./img/Pusa_Basmati.jpg",
    "1885 Basmati": "./img/1885_Basmati.jpg",
  };

  const getProductImage = (product) => {
    return product.image || fallbackImages[product.name?.en] || "./img/default_rice.jpg";
  };

  const getProductTitle = (product) => {
    return product.name?.[t("lang")] || product.name?.en || "Premium Basmati Rice";
  };

  const getProductDesc = (product) => {
    return product.desc?.[t("lang")] || product.desc?.en || t("premium_basmati_1121_desc");
  };

  return (
    <div className="tw-min-h-screen tw-w-full tw-py-8 sm:tw-py-12 tw-px-4 sm:tw-px-8 tw-flex tw-flex-col">
      {/* Centered Title + Currency Button */}
      <div className="tw-relative tw-flex tw-justify-center tw-items-center tw-mb-8">
        <h1 className="tw-text-3xl sm:tw-text-4xl tw-font-extrabold tw-text-yellow-400">
          {t("products_title")}
        </h1>

        <div className="tw-absolute tw-right-0 tw-mt-10 sm:tw-mt-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="tw-bg-black/50 tw-backdrop-blur-md tw-border tw-border-yellow-400/40 tw-text-yellow-300 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm sm:tw-text-base tw-font-semibold tw-transition-all tw-duration-300 hover:tw-bg-yellow-400 hover:tw-text-black hover:tw-shadow-md hover:tw-scale-105"
          >
            {currentCurrency.symbol} {currentCurrency.code}
          </button>

          {showDropdown && (
            <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-32 tw-bg-black/80 tw-backdrop-blur-lg tw-border tw-border-yellow-400/30 tw-rounded-lg tw-shadow-xl tw-z-50 tw-py-1">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setShowDropdown(false);
                  }}
                  className="tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm tw-text-yellow-200 hover:tw-bg-yellow-400/20 hover:tw-text-yellow-100 tw-transition-colors"
                >
                  {curr.symbol} {curr.code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Product Grid - Only Change Here */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-5 sm:tw-gap-6">
        {featuredProducts.length > 0 ? (
          featuredProducts.map((product) => (
            <div
              key={product.id || product.name?.en}
              className="tw-bg-black/40 tw-backdrop-blur-xl tw-border tw-border-yellow-500/20 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-yellow-400/40 tw-transition-all tw-duration-500 hover:tw-scale-105 tw-flex tw-flex-col"
            >
              <img
                src={getProductImage(product)}
                className="tw-w-full tw-h-40 tw-object-fill tw-rounded-t-2xl"
                alt={getProductTitle(product)}
                onError={(e) => {
                  e.target.src = "./img/default_rice.jpg"; // fallback if broken
                }}
              />
              <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col">
                <h3 className="tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2 hover:tw-text-yellow-300 tw-transition-colors">
                  {getProductTitle(product)}
                </h3>
                <p className="tw-text-sm tw-text-yellow-100 tw-flex-1 tw-line-clamp-3">
                  {getProductDesc(product)}
                </p>
                <div className="tw-mt-3">
                  <span className="tw-text-base tw-font-extrabold tw-text-yellow-400 tw-whitespace-nowrap">
                    {formatPrice(product)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Optional skeleton/loader while loading
          [...Array(4)].map((_, i) => (
            <div key={i} className="tw-bg-black/40 tw-backdrop-blur-xl tw-border tw-border-yellow-500/20 tw-rounded-2xl tw-shadow-2xl tw-animate-pulse">
              <div className="tw-w-full tw-h-40 tw-bg-gray-800 tw-rounded-t-2xl"></div>
              <div className="tw-p-4">
                <div className="tw-h-6 tw-bg-gray-700 tw-rounded tw-mb-2"></div>
                <div className="tw-h-4 tw-bg-gray-700 tw-rounded tw-w-11/12"></div>
                <div className="tw-h-4 tw-bg-gray-700 tw-rounded tw-w-10/12 tw-mt-1"></div>
                <div className="tw-h-6 tw-bg-yellow-600 tw-rounded tw-mt-4 tw-w-32"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Button - unchanged */}
      <div className="tw-mt-10 tw-text-center">
        <button
          onClick={goToProd}
          className="tw-bg-black/40 tw-backdrop-blur-lg tw-border tw-border-yellow-400/50 tw-text-yellow-300 tw-px-8 tw-py-4 tw-rounded-xl tw-text-lg sm:tw-text-xl tw-font-bold tw-transition-all tw-duration-500 hover:tw-scale-110 hover:tw-bg-yellow-400 hover:tw-text-black hover:tw-shadow-lg hover:tw-shadow-yellow-400/50"
        >
          {t("view_all_products")}
        </button>
      </div>
    </div>
  );
}