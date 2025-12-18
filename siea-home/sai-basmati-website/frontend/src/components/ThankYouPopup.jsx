import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ThankYouPopup = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);

      const timer = setTimeout(() => {
        handleClose();
      }, 60000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen && !show) return null;

  return (
    <div className="thank-you-popup">
      <div className={`popup-content ${show ? 'show' : 'hide'}`}>
        <h2 className="popup-title">
          🎉 Thank You!
        </h2>
        <p className="popup-desc">
          Your query has been submitted successfully.
        </p>
        <p className="popup-info">
          Our team will contact you within 24 hours.
        </p>
        <div className="popup-actions">
          <button
            onClick={handleClose}
            className="popup-close-btn"
            aria-label="Close thank you message"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPopup;
