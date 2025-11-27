import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { products } from '../data/products';
import Sidebar from '../components/Sidebar';
import ProductsGrid from '../pages/ProductsGrid';
import BuyModal from '../pages/BuyModal';
import ThankYouPopup from '../components/ThankYouPopup';
import BasmatiRSSFeed from "../components/BasmatiRSSFeed";
import '../Prod.css';

const AppContent = ({ profile, showWarning }) => {
  const { t } = useLanguage();
  const [filteredCategory, setFilteredCategory] = useState('Basmati Rice');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRssFeed, setShowRssFeed] = useState(true);

  useEffect(() => {
    filterProducts();
  }, [filteredCategory, searchQuery]);

  const filterProducts = () => {
    let filtered = products;
    if (filteredCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === filteredCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.en.toLowerCase().includes(query) ||
          (product.desc.en && product.desc.en.toLowerCase().includes(query))
      );
    }
    setFilteredProducts(filtered);
  };

  const showBuyQuery = (productId) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product);
    setIsBuyModalOpen(true);
  };
  const hideBuyModal = () => {
    setIsBuyModalOpen(false);
    setSelectedProduct(null);
  };
  const handleBuySubmit = () => {
    setIsBuyModalOpen(false);
    setIsThankYouOpen(true);
  };
  const goHome = () => {
    setFilteredCategory('Basmati Rice');
    setSearchQuery('');
  };

  const toggleSidebar = () => {
    console.log('AppContent: Toggling sidebar, current isSidebarOpen:', isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  console.log('AppContent props:', { profile, showWarning });

  return (
    <div key="app-content" className="flex flex-1">
      {showRssFeed && <BasmatiRSSFeed />}
      <div className="flex flex-1 mt-14">
        <div
          className={`fixed top-[60px] bottom-[64px] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'
            } bg-[#111111] z-40 overflow-hidden`}
        >
          <Sidebar
            filteredCategory={filteredCategory}
            setFilteredCategory={setFilteredCategory}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </div>
        <div
          className={`products-container flex-1 transition-all duration-300 p-4 ${isSidebarOpen ? 'sidebar-open' : 'ml-0'
            }`}
        >
          <ProductsGrid
            products={filteredProducts}
            showBuyQuery={showBuyQuery}
            profile={profile}
            showWarning={showWarning}
          />
        </div>
      </div>

      <BuyModal
        isOpen={isBuyModalOpen}
        onClose={hideBuyModal}
        product={selectedProduct}
        products={products}
        onSubmit={handleBuySubmit}
        profile={profile}
      />
      <ThankYouPopup isOpen={isThankYouOpen} onClose={() => setIsThankYouOpen(false)} />
    </div>
  );
};

const ProductApp = ({ profile, setProfile, showWarning }) => (
  <AppContent profile={profile} showWarning={showWarning} />
);

export default ProductApp;
