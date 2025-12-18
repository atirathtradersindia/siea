import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../assets/logo.png';

const NavbarProd = ({ searchProducts, showProductsPage, showProfilePanel }) => {
  const { t } = useLanguage();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isTransport = location.pathname === '/transport';
  const isSeaFreight = location.pathname === '/sea-freight';


  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);


    if (!isNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleGoHome = () => {
    if (!isHome) {
      navigate('/');
    }
    if (isNavOpen) {
      setIsNavOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  const handleGoTransport = () => {
    if (!isTransport) {
      navigate('/transport');
    }
    if (isNavOpen) {
      setIsNavOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  const handleGoSeaFreight = () => {
    if (!isSeaFreight) {
      navigate('/sea-freight');
    }
    if (isNavOpen) {
      setIsNavOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNavOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        toggleNav();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isNavOpen) {
        setIsNavOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo-title" onClick={handleGoHome}>
        <img src={Logo} alt="Logo" className="navbar-logo" />
        <h1 className="navbar-title">SIEA</h1>
      </div>

      <div className="navbar-right">
        <div className="search-container">
          <input
            id="searchInput"
            type="text"
            placeholder={`${t('products')}...`}
            className="search-input"
            onChange={(e) => searchProducts(e.target.value)}
          />
        </div>

        <button
          ref={hamburgerRef}
          className="hamburger-btn"
          onClick={toggleNav}
          aria-label="Toggle menu"
          aria-expanded={isNavOpen}
        >
          <span className="hamburger-icon">
            <span className={`hamburger-line ${isNavOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isNavOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isNavOpen ? 'open' : ''}`}></span>
          </span>
        </button>
      </div>

      <div className={`navbar-backdrop ${isNavOpen ? 'open' : ''}`} onClick={toggleNav}></div>

      <div ref={menuRef} className={`navbar-menu ${isNavOpen ? 'open' : ''}`}>
        <button
          className={`nav-btn ${isHome ? 'active' : ''}`}
          onClick={handleGoHome}
          aria-current={isHome ? 'page' : undefined}
        >
          <span className="icon">&#8962;</span>
          <span>{t('home')}</span>
        </button>

        <button className="nav-btn" onClick={showProductsPage}>
          <span>{t('products')}</span>
        </button>

        <button
          className={`nav-btn ${isTransport ? 'active' : ''}`}
          onClick={handleGoTransport}
          aria-current={isTransport ? 'page' : undefined}
        >
          <span className="icon">&#128666;</span>
          <span>{t('transport')}</span>
        </button>

        <button
          className={`nav-btn ${isSeaFreight ? 'active' : ''}`}
          onClick={handleGoSeaFreight}
          aria-current={isSeaFreight ? 'page' : undefined}
        >
          <span className="icon">&#128674;</span>
          <span>{t('ocean_freight')}</span>
        </button>

        <button className="nav-btn profile-btn" onClick={showProfilePanel}>
          <span className="icon">&#128100;</span>
          <span>{t('profile')}</span>
        </button>
      </div>
    </nav>
  );
};

export default NavbarProd;