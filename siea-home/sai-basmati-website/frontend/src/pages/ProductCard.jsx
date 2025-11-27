import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ProductCard = ({ product, showBuyQuery, profile, showWarning }) => {
  const { currentLang } = useLanguage();

  // Debug props
  console.log('ProductCard props:', { productId: product.id, price: product.price, profile, showWarning });

  const handleViewDetails = (e) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    console.log('View Details clicked for product:', product.name[currentLang], { profile });
    if (!profile) {
      console.log('User not logged in, triggering warning for View Details');
      showWarning();
      return;
    }
    console.log(`Opening Buy Modal for product: ${product.name[currentLang]}`);
    showBuyQuery(product.id); // Open Buy Modal on View Details
  };

  // Removed handleBuyQuery — no longer needed since card click does nothing

  // Fallback price if product.price is undefined
  const displayPrice = product.price || `₹1000-1000 per qtls`; // Default fallback

  return (
    <div className="product-card glass">
      {/* Removed onClick from card — now does nothing */}
      <img src={product.image} alt={product.name[currentLang]} className="product-image" />
      <div className="product-content">
        <h3 className="product-name">{product.name[currentLang]}</h3>
        <p className="product-desc">{product.desc[currentLang]}</p>
        <div className="product-footer">
          <p className="product-price">{displayPrice}</p>
          <div className="product-footer-bottom">
            <span className="product-category">{product.category}</span>
            <button 
              className="btn-view-details" 
              onClick={handleViewDetails}
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