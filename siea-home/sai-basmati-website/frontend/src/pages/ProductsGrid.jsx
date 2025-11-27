import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';

const ProductsGrid = ({ products, showBuyQuery, profile, showWarning }) => {
  const { t } = useLanguage();

  // Debug props
  console.log('ProductsGrid props:', { productsCount: products.length, profile, showWarning });

  return (
    <div className="products-grid" id="productsGrid">
      {products.length > 0 ? (
        products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            showBuyQuery={showBuyQuery} 
            profile={profile}
            showWarning={showWarning}
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