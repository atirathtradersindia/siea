import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import PriceTable from "../components/PriceTable";
import Products from "./Products";
import PriceTrends from "./PriceTrends";
import About from "./About";
import Feedback from "./Feedback";
import Contact from "../components/Contact";
import Service from "../components/Service";
import video1 from "../assets/siea1.mp4";
import video2 from "../assets/siea2.mp4";
import { useLanguage } from "../contexts/LanguageContext";
import IndianAgriRSSFeed from "../components/IndianAgriRSSFeed";
// import ErrorBoundary from "../components/ErrorBoundary";

export default function Home() {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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
      setError('Failed to fetch live prices');
      
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

  return (
    <>
      {/* <ErrorBoundary> */}
        <IndianAgriRSSFeed />
      {/* </ErrorBoundary> */}
      <section className="relative tw-text-yellow-600 tw-py-16" style={{ marginTop: "10px" }}>
        <div className="container">
          <div className="row align-items-center gy-4 tw-bg-white/10 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-lg tw-p-8">
            <div className="col-lg-6">
              <h1 className="tw-text-4xl tw-font-bold tw-leading-tight">
                {t("hero_title")}
              </h1>
              <p className="tw-mt-3 tw-text-yellow-600/90">
                {t("hero_subtitle")}
              </p>
              <div className="tw-mt-5 tw-flex tw-gap-3">
                <Link to="/products" className="btn btn-light">
                  {t("see_prices")}
                </Link>
                <Link to="/feedback" className="btn btn-outline-light">
                  {t("feedback")}
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <Swiper
                modules={[Pagination, Navigation]}
                pagination={{ clickable: true }}
                navigation={true}
                loop={true}
                className="tw-rounded-2xl tw-shadow-2xl tw-border tw-border-white/20"
              >
                <SwiperSlide>
                  <video
                    src={video1}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="tw-rounded-2xl tw-w-full tw-h-[320px] tw-object-cover tw-shadow-[0_0_20px_rgba(255,215,0,0.7)]"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <video
                    src={video2}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="tw-rounded-2xl tw-w-full tw-h-[320px] tw-object-cover tw-shadow-[0_0_20px_rgba(255,215,0,0.7)]"
                  />
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      <section className="tw-my-12">
        <div className="container tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-2xl tw-shadow-md tw-p-8">
          <About />
        </div>
      </section>
      <section className="tw-my-12">
        <div className="container tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-2xl tw-shadow-md tw-p-8">
          <Products />
        </div>
      </section>
      <section className="tw-py-6">
        <div className="container tw-bg-white/10 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-lg tw-p-8">
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
          <div className="tw-mt-4">
            <Link to="/market-rates" className="btn btn-primary">
              {t("go_to_full_prices")}
            </Link>
          </div>
        </div>
      </section>
      <section className="tw-my-12">
        <div className="container tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-2xl tw-shadow-md tw-p-8">
          <PriceTrends />
        </div>
      </section>
      <section className="tw-my-12">
        <div className="container tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-2xl tw-shadow-md tw-p-8">
          <Service />
        </div>
      </section>
      <section id="contact-feedback" className="tw-my-12">
        <div className="container tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-2xl tw-shadow-md tw-p-8">
          <h2 className="tw-text-3xl tw-font-bold tw-text-center tw-text-yellow-400 tw-mb-8">
            {t("get_in_touch")}
          </h2>
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8">
            <div>
              <div className="tw-bg-black/20 tw-p-6 tw-rounded-lg">
                <Contact />
              </div>
            </div>
            <div>
              <div className="tw-bg-black/20 tw-p-6 tw-rounded-lg">
                <Feedback />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}