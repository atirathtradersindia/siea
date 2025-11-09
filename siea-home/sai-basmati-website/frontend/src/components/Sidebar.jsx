import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ filteredCategory, setFilteredCategory, isOpen, toggleSidebar }) => {
  const { t } = useLanguage();

  const handleCategoryClick = (category) => {
    setFilteredCategory(category);
    // Don't close sidebar on category selection for better UX
    // toggleSidebar(); 
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{ top: isOpen ? '1rem' : '4.5rem' }} // Adjust position when sidebar is open
      >
        {isOpen ? '✕' : '=>'}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="sidebar-backdrop open"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar glass ${isOpen ? 'open' : ''}`}
        aria-label="Product categories"
      >
        <nav className="sidebar-nav">
          <h3 className="sidebar-title">{t('categories')}</h3>
          <button
            className={`category-btn ${filteredCategory === 'Basmati Rice' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('Basmati Rice')}
          >
            {t('basmati_rice')}
          </button>
          <button
            className={`category-btn ${filteredCategory === 'Non Basmati Rice' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('Non Basmati Rice')}
          >
            {t('non_basmati_rice')}
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;