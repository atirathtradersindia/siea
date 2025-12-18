import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';

const ProductsGrid = ({ 
  products, 
  showBuyQuery, 
  profile, 
  showWarning,
  currency,
  getConversionRate,
  getCurrencySymbol 
}) => {
  const { t } = useLanguage();

  return (
    <div className="products-grid" id="productsGrid">
      {products.length > 0 ? (
        products.map(product => (
          <ProductCard 
            key={product.firebaseId || product.id} 
            product={product} 
            showBuyQuery={showBuyQuery} 
            profile={profile}
            showWarning={showWarning}
            currency={currency}
            getConversionRate={getConversionRate}
            getCurrencySymbol={getCurrencySymbol}
          />
        ))
      ) : (
        <div className="no-products-message">
          {t('no_products')}
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;