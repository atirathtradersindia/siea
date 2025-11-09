import React, { useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";

/* -------------------------------------------------
   EXPORT RAW PRICING DATA
   ------------------------------------------------- */
export const transportPricing = [
  {
    state: "Punjab",
    routes: [
      { destination: "Kandla Port", price: "155-160" },
      { destination: "Mundra Port", price: "170-175" },
    ],
  },
  {
    state: "Haryana",
    routes: [
      { destination: "Tohana/Sirsa - Kandla Port", price: "150-155" },
      { destination: "Tohana/Sirsa - Mundra Port", price: "165-170" },
      { destination: "Sonipat/Karnal - Mundra Port", price: "165-170" },
      { destination: "Cheeka - Kandla Port", price: "150-155" },
      { destination: "Cheeka - Mundra Port", price: "165-170" },
    ],
  },
  {
    state: "Rajasthan",
    routes: [
      { destination: "Bundi - Kandla Port", price: "130-135" },
      { destination: "Bundi - Mundra Port", price: "155-160" },
      { destination: "Kota - Kandla Port", price: "130-135" },
      { destination: "Kota - Mundra Port", price: "155-160" },
    ],
  },
  {
    state: "Madhya Pradesh",
    routes: [
      { destination: "Mandideep - Kandla Port", price: "175-180" },
      { destination: "Mandideep - Mundra Port", price: "200-205" },
      { destination: "Mandideep - Nhava Sheva", price: "225-230" },
      { destination: "Pipariya - Kandla Port", price: "200-205" },
      { destination: "Pipariya - Mundra Port", price: "230-235" },
      { destination: "Pipariya - Nhava Sheva", price: "260-265" },
    ],
  },
  {
    state: "Uttar Pradesh",
    routes: [
      { destination: "Kandla Port", price: "175-180" },
      { destination: "Mundra Port", price: "195-200" },
      { destination: "Nhava Sheva", price: "265-270" },
    ],
  },
  {
    state: "Gujarat",
    routes: [
      { destination: "Kandla Port", price: "105-110" },
      { destination: "Mundra Port", price: "110-115" },
    ],
  },
  {
    state: "West Bengal",
    routes: [
      { destination: "Mundra Port", price: "400-405" },
    ],
  },
];

/* -------------------------------------------------
   HELPER: Get transport price (average of range)
   ------------------------------------------------- */
export const getTransportPrice = (state, portName) => {
  const stateData = transportPricing.find(s => s.state === state);
  if (!stateData) return null;

  const route = stateData.routes.find(r => r.destination.includes(portName));
  if (!route) return null;

  const [min, max] = route.price.split("-").map(Number);
  return (min + max) / 2;
};

/* -------------------------------------------------
   HELPER: Get available ports for a state
   ------------------------------------------------- */
export const getAvailablePortsForState = (state) => {
  const stateData = transportPricing.find(s => s.state === state);
  if (!stateData) return [];

  const portMap = {
    "Kandla Port": "Kandla",
    "Mundra Port": "Mundra",
    "Nhava Sheva": "Nhava Sheva",
    "Chennai": "Chennai",
    "Vizag": "Vizag",
    "Kolkata": "Kolkata",
  };

  return stateData.routes
    .map(r => {
      for (const [full, short] of Object.entries(portMap)) {
        if (r.destination.includes(full)) return short;
      }
      return null;
    })
    .filter(Boolean);
};

/* -------------------------------------------------
   COMPONENT (UI only)
   ------------------------------------------------- */
const Transport = () => {
  const { t } = useLanguage();

  const transportData = [
    { state: t("punjab"), routes: [
        { destination: `${t("kandla_port")}`, price: transportPricing[0].routes[0].price },
        { destination: `${t("mundra_port")}`, price: transportPricing[0].routes[1].price },
      ]},
    { state: t("haryana"), routes: [
        { destination: `${t("tohana_sirsa")} - ${t("kandla_port")}`, price: transportPricing[1].routes[0].price },
        { destination: `${t("tohana_sirsa")} - ${t("mundra_port")}`, price: transportPricing[1].routes[1].price },
        { destination: `${t("sonipat_karnal")} - ${t("mundra_port")}`, price: transportPricing[1].routes[2].price },
        { destination: `${t("cheeka")} - ${t("kandla_port")}`, price: transportPricing[1].routes[3].price },
        { destination: `${t("cheeka")} - ${t("mundra_port")}`, price: transportPricing[1].routes[4].price },
      ]},
    { state: t("rajasthan"), routes: [
        { destination: `${t("bundi")} - ${t("kandla_port")}`, price: transportPricing[2].routes[0].price },
        { destination: `${t("bundi")} - ${t("mundra_port")}`, price: transportPricing[2].routes[1].price },
        { destination: `${t("kota")} - ${t("kandla_port")}`, price: transportPricing[2].routes[2].price },
        { destination: `${t("kota")} - ${t("mundra_port")}`, price: transportPricing[2].routes[3].price },
      ]},
    { state: t("madhya_pradesh"), routes: [
        { destination: `${t("mandideep")} - ${t("kandla_port")}`, price: transportPricing[3].routes[0].price },
        { destination: `${t("mandideep")} - ${t("mundra_port")}`, price: transportPricing[3].routes[1].price },
        { destination: `${t("mandideep")} - ${t("nhava_sheva")}`, price: transportPricing[3].routes[2].price },
        { destination: `${t("pipariya")} - ${t("kandla_port")}`, price: transportPricing[3].routes[3].price },
        { destination: `${t("pipariya")} - ${t("mundra_port")}`, price: transportPricing[3].routes[4].price },
        { destination: `${t("pipariya")} - ${t("nhava_sheva")}`, price: transportPricing[3].routes[5].price },
      ]},
    { state: t("uttar_pradesh"), routes: [
        { destination: t("kandla_port"), price: transportPricing[4].routes[0].price },
        { destination: t("mundra_port"), price: transportPricing[4].routes[1].price },
        { destination: t("nhava_sheva"), price: transportPricing[4].routes[2].price },
      ]},
    { state: t("gujarat"), routes: [
        { destination: t("kandla_port"), price: transportPricing[5].routes[0].price },
        { destination: t("mundra_port"), price: transportPricing[5].routes[1].price },
      ]},
    { state: t("west_bengal"), routes: [
        { destination: t("mundra_port"), price: transportPricing[6].routes[0].price },
      ]},
  ];

  const [selectedState, setSelectedState] = useState(transportData[0].state);
  const selectedStateData = transportData.find(d => d.state === selectedState);

  return (
    <div className="tw-min-h-screen tw-w-full tw-py-8 sm:tw-py-10 tw-px-4 sm:tw-px-6 tw-bg-black/30 tw-backdrop-blur-sm tw-text-white">
      <div className="tw-container tw-mx-auto">
        <h1 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-8 tw-text-center">
          {t("transportation_pricing_quintals")}
        </h1>

        <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-2 sm:tw-gap-4 tw-mb-8">
          {transportData.map((d) => (
            <button
              key={d.state}
              onClick={() => setSelectedState(d.state)}
              className={`tw-px-4 tw-py-2 tw-rounded-lg tw-font-semibold tw-transition tw-duration-150 ${
                selectedState === d.state
                  ? 'tw-bg-yellow-400 tw-text-black'
                  : 'tw-bg-gray-900/80 tw-text-yellow-400 tw-border tw-border-yellow-400/50 hover:tw-bg-yellow-400/10'
              }`}
            >
              {d.state}
            </button>
          ))}
        </div>

        {selectedStateData && (
          <div className="tw-bg-gray-900/80 tw-rounded-lg tw-p-6 tw-shadow-lg tw-border tw-border-yellow-400/50">
            <h2 className="tw-text-xl sm:tw-text-2xl tw-font-semibold tw-text-yellow-400 tw-mb-4">
              {selectedStateData.state}
            </h2>
            <div className="tw-overflow-x-auto">
              <table className="tw-w-full tw-text-left tw-text-sm sm:tw-text-base">
                <thead>
                  <tr className="tw-bg-yellow-400/20">
                    <th className="tw-px-4 tw-py-2 tw-font-semibold tw-text-yellow-400">{t("destination")}</th>
                    <th className="tw-px-4 tw-py-2 tw-font-semibold tw-text-yellow-400">{t("price_qtls")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStateData.routes.map((r, i) => (
                    <tr key={i} className="tw-border-b tw-border-yellow-400/20 hover:tw-bg-yellow-400/10 tw-transition tw-duration-150">
                      <td className="tw-px-4 tw-py-2 tw-text-gray-300">{r.destination}</td>
                      <td className="tw-px-4 tw-py-2 tw-text-gray-300">{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transport;