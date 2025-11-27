import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import PriceTable from '../components/PriceTable';

export default function Prices() {
  const { t, currentLang } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fallback in case useLanguage fails
  if (!t) {
    return <div className="tw-text-red-500 tw-text-center tw-py-4">Error: Translation context not available.</div>;
  }

  // Function to fetch live prices from FastAPI backend
  const fetchLivePrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/live-basmati-prices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch live prices');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPrices(data.prices);
        setLastUpdated(data.last_updated);
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError('Live prices temporarily unavailable - showing standard prices');
      
      // Fallback to static prices
      setPrices([
        {
          product: "Traditional Basmati",
          specification: "8.10mm max",
          packing: "50 KG PP",
          port: "Mundra",
          price: "$1,450",
          trend: "stable",
          change: null
        },
        {
          product: "Pusa White Sella",
          specification: "Premium Grade",
          packing: "50 KG PP",
          port: "Nhava Sheva",
          price: "$1,380",
          trend: "stable",
          change: null
        },
        {
          product: "Steam Basmati",
          specification: "8.00mm max",
          packing: "50 KG PP",
          port: "Mundra",
          price: "$1,420",
          trend: "stable",
          change: null
        },
        {
          product: "Organic Brown",
          specification: "Certified",
          packing: "25 KG Jute",
          port: "Any Port",
          price: "$1,580",
          trend: "stable",
          change: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prices on mount and every 2 minutes
  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="pricing" className="tw-px-0 tw-mx-0 tw-w-full tw-max-w-none tw-py-8 sm:tw-py-10">
      <h2 className="tw-section-title tw-text-center tw-text-yellow-400 tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-4 tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-text-yellow-300">
        {t('basmati_price_board') || 'Live Basmati Rice Prices'}
        {!loading && lastUpdated && (
          <span className="tw-text-sm tw-ml-2 tw-text-green-500">● Live</span>
        )}
      </h2>
      
      {loading && (
        <div className="tw-text-center tw-text-yellow-400 tw-py-4">
          🔄 Loading live prices...
        </div>
      )}
      
      {error && (
        <div className="tw-text-center tw-text-yellow-600 tw-py-4 tw-bg-yellow-50/10 tw-mx-4 tw-rounded">
          ⚠️ {error}
        </div>
      )}

      <div className="tw-tableWrap tw-w-full tw-max-w-none">
        <table className="tw-w-full">
          <thead>
            <tr className="tw-bg-gray-900">
              <th className="tw-px-4 tw-py-3 tw-text-left tw-text-yellow-400">Product</th>
              <th className="tw-px-4 tw-py-3 tw-text-left tw-text-yellow-400">Specification</th>
              <th className="tw-px-4 tw-py-3 tw-text-left tw-text-yellow-400">Packing</th>
              <th className="tw-px-4 tw-py-3 tw-text-left tw-text-yellow-400">Port</th>
              <th className="tw-px-4 tw-py-3 tw-text-left tw-text-yellow-400">Price (USD/MT)</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((item, index) => (
              <tr key={index} className="tw-border-b tw-hover:tw-bg-gray-700">
                <td className="tw-px-4 tw-py-3 tw-font-medium tw-text-yellow-400">{item.product}</td>
                <td className="tw-px-4 tw-py-3 tw-text-yellow-400">{item.specification}</td>
                <td className="tw-px-4 tw-py-3 tw-text-yellow-400">{item.packing}</td>
                <td className="tw-px-4 tw-py-3 tw-text-yellow-400">{item.port}</td>
                <td className="tw-px-4 tw-py-3">
                  <strong className="tw-text-lg tw-text-yellow-400">{item.price}</strong>
                  {getTrendIndicator(item.trend)}
                  {item.change && (
                    <span className={`tw-text-xs tw-ml-1 ${
                      item.change.startsWith('+') ? 'tw-text-green-500' : 'tw-text-red-500'
                    }`}>
                      {item.change}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {lastUpdated && !loading && (
          <div className="tw-text-xs tw-text-yellow-300 tw-mt-4 tw-text-center">
            📊 Last updated: {new Date(lastUpdated).toLocaleTimeString()} | 
            Prices update every 2 minutes | 
            Source: Market Intelligence
          </div>
        )}
        
        <div className="tw-text-xs tw-text-yellow-300 tw-mt-2 tw-text-center">
          💡 Prices are indicative and may vary based on quantity, quality, and market conditions
        </div>
      </div>
    </section>
  );

  // Function to get trend indicator
  function getTrendIndicator(trend) {
    switch (trend) {
      case 'up':
        return <span className="tw-text-yellow-400 tw-ml-1 tw-text-sm">↗</span>;
      case 'down':
        return <span className="tw-text-yellow-400 tw-ml-1 tw-text-sm">↘</span>;
      case 'stable':
        return <span className="tw-text-yellow-400 tw-ml-1 tw-text-sm">→</span>;
      default:
        return null;
    }
  }
}