import React, { useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";

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


export const getTransportPrice = (state, portName) => {
  const stateData = transportPricing.find(s => s.state === state);
  if (!stateData) return null;

  const route = stateData.routes.find(r => r.destination.includes(portName));
  if (!route) return null;

  const [min, max] = route.price.split("-").map(Number);
  return (min + max) / 2;
};


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
    <div className="tw-min-h-screen tw-w-full tw-py-4 sm:tw-py-6 lg:tw-py-8 tw-px-3 sm:tw-px-4 lg:tw-px-6 tw-bg-black/30 tw-backdrop-blur-sm tw-text-white">
      <div className="tw-container tw-mx-auto tw-max-w-4xl">
        <div className="tw-text-center tw-mb-6 sm:tw-mb-8">
          <h1 className="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-2">
            {t("transportation_pricing_quintals")}
          </h1>
        </div>

        <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-1 sm:tw-gap-2 lg:tw-gap-3 tw-mb-6 sm:tw-mb-8">
          {transportData.map((d) => (
            <button
              key={d.state}
              onClick={() => setSelectedState(d.state)}
              className={`
                tw-px-2 sm:tw-px-3 lg:tw-px-4 
                tw-py-1.5 sm:tw-py-2 
                tw-text-xs sm:tw-text-sm lg:tw-text-base 
                tw-rounded-md sm:tw-rounded-lg 
                tw-font-medium sm:tw-font-semibold 
                tw-transition-all tw-duration-200 tw-ease-in-out
                tw-min-w-[80px] sm:tw-min-w-[100px]
                tw-whitespace-nowrap
                ${selectedState === d.state
                  ? 'tw-bg-yellow-400 tw-text-black tw-shadow-lg tw-shadow-yellow-400/30 tw-scale-105'
                  : 'tw-bg-gray-800/90 tw-text-yellow-400 tw-border tw-border-yellow-400/40 hover:tw-bg-yellow-400/20 hover:tw-scale-105'
                }
              `}
            >
              {d.state}
            </button>
          ))}
        </div>

        {selectedStateData && (
          <div className="tw-bg-gray-900/90 tw-rounded-lg sm:tw-rounded-xl tw-p-3 sm:tw-p-4 lg:tw-p-6 tw-shadow-2xl tw-border tw-border-yellow-400/30 tw-backdrop-blur-sm tw-w-full">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-3 sm:tw-mb-4">
              <h2 className="tw-text-lg sm:tw-text-xl lg:tw-text-2xl tw-font-bold tw-text-yellow-400 tw-truncate tw-mr-2">
                {selectedStateData.state}
              </h2>
              <span className="tw-text-xs sm:tw-text-sm tw-text-gray-400 tw-whitespace-nowrap">
                {selectedStateData.routes.length} {t("routes") || "routes"}
              </span>
            </div>

            <div className="tw-w-full tw-overflow-hidden tw-rounded-lg tw-border tw-border-gray-700">
              <table className="tw-w-full">
                <thead>
                  <tr className="tw-bg-yellow-400/20">
                    <th className="tw-px-2 sm:tw-px-3 lg:tw-px-4 tw-py-2 tw-font-semibold tw-text-yellow-400 tw-text-left tw-text-xs sm:tw-text-sm tw-w-2/3">
                      {t("destination")}
                    </th>
                    <th className="tw-px-2 sm:tw-px-3 lg:tw-px-4 tw-py-2 tw-font-semibold tw-text-yellow-400 tw-text-right tw-text-xs sm:tw-text-sm tw-w-1/3 tw-whitespace-nowrap">
                      {t("price_qtls")} (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStateData.routes.map((r, i) => (
                    <tr 
                      key={i} 
                      className="tw-border-b tw-border-gray-700/50 hover:tw-bg-yellow-400/10 tw-transition-colors tw-duration-150"
                    >
                      <td className="tw-px-2 sm:tw-px-3 lg:tw-px-4 tw-py-2 tw-text-gray-300 tw-text-xs sm:tw-text-sm tw-break-words tw-w-2/3">
                        {r.destination}
                      </td>
                      <td className="tw-px-2 sm:tw-px-3 lg:tw-px-4 tw-py-2 tw-text-gray-300 tw-text-right tw-font-medium tw-text-xs sm:tw-text-sm tw-w-1/3 tw-whitespace-nowrap">
                        ₹{r.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tw-mt-4 sm:tw-mt-6 tw-text-center">
              <p className="tw-text-xs sm:tw-text-sm tw-text-gray-400 tw-italic">
                {t("Prices are per quintal and may vary based on market conditions")}
              </p>
            </div>
          </div>
        )}

        {!selectedStateData && (
          <div className="tw-text-center tw-py-8 sm:tw-py-12">
            <div className="tw-text-yellow-400 tw-text-lg sm:tw-text-xl tw-mb-2">
              {t("no_data_available") || "No pricing data available"}
            </div>
            <p className="tw-text-gray-400 tw-text-sm sm:tw-text-base">
              {t("select_another_state") || "Please select another state"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transport;