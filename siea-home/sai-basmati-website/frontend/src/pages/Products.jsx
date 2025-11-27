import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../contexts/LanguageContext";
import { getGradeSpecificPriceRange } from "../data/products";
import { useState } from 'react';

export default function Products() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Currency selector
  const [currency, setCurrency] = useState('INR');
  const [showDropdown, setShowDropdown] = useState(false);

  const goToProd = () => navigate('/Products-All');

  const currencies = [
    { code: 'INR', symbol: '₹', rate: 1 },
    { code: 'USD', symbol: '$', rate: 1 / 83.5 },
    { code: 'EUR', symbol: '€', rate: 1 / 90.2 },
    { code: 'GBP', symbol: '£', rate: 1 / 108.5 },
  ];

  const currentCurrency = currencies.find(c => c.code === currency);

  // Single-line price with / qtl – NO DECIMALS
  const formatPrice = (grade) => {
    const raw = getGradeSpecificPriceRange(grade);
    if (!raw || typeof raw !== 'string') return 'N/A';

    const numbers = raw.match(/\d+/g);
    if (!numbers || numbers.length < 2) return raw;

    const [min, max] = numbers.map(Number);
    const minC = Math.round(min * currentCurrency.rate);  // No decimals
    const maxC = Math.round(max * currentCurrency.rate);  // No decimals

    return `${currentCurrency.symbol}${minC} – ${currentCurrency.symbol}${maxC} / qtl`;
  };

  return (
    <div className="tw-min-h-screen tw-w-full tw-py-8 sm:tw-py-12 tw-px-4 sm:tw-px-8 tw-flex tw-flex-col">

      {/* Centered Title + Currency Button */}
      <div className="tw-relative tw-flex tw-justify-center tw-items-center tw-mb-8">
        <h1 className="tw-text-3xl sm:tw-text-4xl tw-font-extrabold tw-text-yellow-400">
          {t("products_title")}
        </h1>

        {/* Currency Dropdown (right-aligned) */}
        <div className="tw-absolute tw-right-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="tw-bg-black/50 tw-backdrop-blur-md tw-border tw-border-yellow-400/40 tw-text-yellow-300 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm sm:tw-text-base tw-font-semibold tw-transition-all tw-duration-300 hover:tw-bg-yellow-400 hover:tw-text-black hover:tw-shadow-md hover:tw-scale-105"
          >
            {currentCurrency.symbol} {currentCurrency.code}
          </button>

          {showDropdown && (
            <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-32 tw-bg-black/80 tw-backdrop-blur-lg tw-border tw-border-yellow-400/30 tw-rounded-lg tw-shadow-xl tw-z-50 tw-py-1">
              {currencies.map(curr => (
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

      {/* Product Grid */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-5 sm:tw-gap-6">

        {/* Card 1 */}
        <div className="tw-bg-black/40 tw-backdrop-blur-xl tw-border tw-border-yellow-500/20 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-yellow-400/40 tw-transition-all tw-duration-500 hover:tw-scale-105 tw-flex tw-flex-col">
          <img src="./img/1121_Golden_Basamati.jpg" className="tw-w-full tw-h-40 tw-object-cover tw-rounded-t-2xl" alt={t("premium_basmati_1121")} />
          <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col">
            <h3 className="tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2 hover:tw-text-yellow-300 tw-transition-colors">
              {t("premium_basmati_1121")}
            </h3>
            <p className="tw-text-sm tw-text-yellow-100 tw-flex-1 tw-line-clamp-3">{t("premium_basmati_1121_desc")}</p>
            <div className="tw-mt-3">
              <span className="tw-text-base tw-font-extrabold tw-text-yellow-400 tw-whitespace-nowrap">
                {formatPrice("1121 Basmati")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="tw-bg-black/40 tw-backdrop-blur-xl tw-border tw-border-yellow-500/20 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-yellow-400/40 tw-transition-all tw-duration-500 hover:tw-scale-105 tw-flex tw-flex-col">
          <img src="./img/1401_Steam_Basamati.jpg" className="tw-w-full tw-h-40 tw-object-cover tw-rounded-t-2xl" alt={t("organic_basmati")} />
          <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col">
            <h3 className="tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2 hover:tw-text-yellow-300 tw-transition-colors">
              {t("organic_basmati")}
            </h3>
            <p className="tw-text-sm tw-text-yellow-100 tw-flex-1 tw-line-clamp-3">{t("organic_basmati_desc")}</p>
            <div className="tw-mt-3">
              <span className="tw-text-base tw-font-extrabold tw-text-yellow-400 tw-whitespace-nowrap">
                {formatPrice("1401 Basmati")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="tw-bg-black/40 tw-backdrop-blur-xl tw-border tw-border-yellow-500/20 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-yellow-400/40 tw-transition-all tw-duration-500 hover:tw-scale-105 tw-flex tw-flex-col">
          <img src="./img/Pusa_Basmati.jpg" className="tw-w-full tw-h-40 tw-object-cover tw-rounded-t-2xl" alt={t("pusa_basmati")} />
          <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col">
            <h3 className="tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2 hover:tw-text-yellow-300 tw-transition-colors">
              {t("pusa_basmati")}
            </h3>
            <p className="tw-text-sm tw-text-yellow-100 tw-flex-1 tw-line-clamp-3">{t("pusa_basmati_desc")}</p>
            <div className="tw-mt-3">
              <span className="tw-text-base tw-font-extrabold tw-text-yellow-400 tw-whitespace-nowrap">
                {formatPrice("Pusa Basmati")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="tw-bg-black/40 tw-backdrop-blur-xl tw-border tw-border-yellow-500/20 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-yellow-400/40 tw-transition-all tw-duration-500 hover:tw-scale-105 tw-flex tw-flex-col">
          <img src="./img/1885_Basmati.jpg" className="tw-w-full tw-h-40 tw-object-cover tw-rounded-t-2xl" alt={t("premium_basmati_1121")} />
          <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col">
            <h3 className="tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2 hover:tw-text-yellow-300 tw-transition-colors">
              {t("premium_basmati_1121")}
            </h3>
            <p className="tw-text-sm tw-text-yellow-100 tw-flex-1 tw-line-clamp-3">{t("premium_basmati_1121_desc")}</p>
            <div className="tw-mt-3">
              <span className="tw-text-base tw-font-extrabold tw-text-yellow-400 tw-whitespace-nowrap">
                {formatPrice("1121 Basmati")}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* View All Button */}
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
