import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ProductCard = ({
  product,
  showBuyQuery,
  profile,
  showWarning,
  currency,
  getConversionRate,
  getCurrencySymbol
}) => {
  const { currentLang } = useLanguage();

  const productName =
    product.name?.[currentLang] ||
    product.name?.en ||
    product.variety ||
    'Unknown Product';

  const productDesc =
    product.desc?.[currentLang] ||
    product.desc?.en ||
    '';

  const productImage = product.image || './img/placeholder-rice.jpg';
  const productCategory = product.category || 'Rice';

  // ✅ NEW: Specs & HSN
  const productSpecs = product.specs || {};
  const productHSN = product.hsn || null;

  // ✅ Smart Price Formatting with Currency Conversion
  const formatPriceWithCurrency = () => {
    if (!product.price || typeof product.price !== 'string') {
      return 'Price on request';
    }

    const numbers = product.price.match(/[\d,]+/g);
    if (!numbers || numbers.length < 2) return product.price;

    const [minStr, maxStr] = numbers;
    const minINR = parseInt(minStr.replace(/,/g, ''), 10);
    const maxINR = parseInt(maxStr.replace(/,/g, ''), 10);

    if (isNaN(minINR) || isNaN(maxINR)) return product.price;

    const rate = getConversionRate ? getConversionRate() : 1;
    const symbol = getCurrencySymbol ? getCurrencySymbol() : "₹";

    const minConverted = Math.round(minINR * rate);
    const maxConverted = Math.round(maxINR * rate);

    return `${symbol}${minConverted.toLocaleString()} – ${symbol}${maxConverted.toLocaleString()} / qtl`;
  };

  const displayPrice = formatPriceWithCurrency();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (!profile) {
      showWarning();
      return;
    }
    const productId = product.firebaseId || product.id;
    showBuyQuery(productId);
  };

  return (
    <div className="product-card glass">
      <img
        src={productImage}
        alt={productName}
        className="product-image"
        onError={(e) => {
          e.target.src = './img/placeholder-rice.jpg';
        }}
      />

      <div className="product-content">
        <h3 className="product-name">{productName}</h3>

        <p className="product-desc">{productDesc}</p>

        {productHSN && (
          <div className="product-hsn">
            <strong>HSN Code:</strong> {productHSN}
          </div>
        )}

        <div className="product-meta">
          {product.grade && <span className="product-grade">Grade: {product.grade}</span>}
          {product.origin && <span className="product-origin">Origin: {product.origin}</span>}
        </div>

        <div className="product-footer">
          <p className="product-price">{displayPrice}</p>

          <div className="product-footer-bottom">
            <span className="product-category">{productCategory}</span>

            <button
              className="btn-view-details"
              onClick={() => showBuyQuery(product.firebaseId || product.id, "details")}
            >
              View Details
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
