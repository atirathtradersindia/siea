import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import freightData from '../data/ocean_frieght.json';
import { useLanguage } from "../contexts/LanguageContext";

const SeaFreight = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [openRegions, setOpenRegions] = useState(false);
    const [openCountries, setOpenCountries] = useState(false);

    const { t } = useLanguage(); 

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setSelectedCountry(null); 
        setOpenRegions(false);
        setOpenCountries(true); 
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setOpenCountries(false);
    };

    return (
        <div className="sea-freight-container">
            <h1 className="sea-freight-heading">{t("sea_freight_costs")}</h1>

            <div className="dropdown-container">
                <div className="dropdown">
                    <button
                        className="region-button"
                        onClick={() => setOpenRegions(!openRegions)}
                    >
                        <span>{selectedRegion ? selectedRegion : t("select_region")}</span>
                        <span className={`chevron-icon ${openRegions ? 'open' : ''}`}>
                            {openRegions ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </span>
                    </button>
                    {openRegions && (
                        <div className="region-content">
                            {freightData.map((regionData) => (
                                <button
                                    key={regionData.region}
                                    className="dropdown-item"
                                    onClick={() => handleRegionSelect(regionData.region)}
                                >
                                    {regionData.region}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dropdown">
                    <button
                        className="region-button"
                        onClick={() => selectedRegion && setOpenCountries(!openCountries)}
                        disabled={!selectedRegion} 
                    >
                        <span>{selectedCountry ? selectedCountry : t("select_country")}</span>
                        <span className={`chevron-icon ${openCountries ? 'open' : ''}`}>
                            {openCountries ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </span>
                    </button>
                    {openCountries && selectedRegion && (
                        <div className="region-content">
                            {freightData
                                .find((regionData) => regionData.region === selectedRegion)
                                ?.countries.map((country) => (
                                    <button
                                        key={country.name}
                                        className="dropdown-item"
                                        onClick={() => handleCountrySelect(country.name)}
                                    >
                                        {country.name}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="ports-container">
                <div className="country-content">
                    <h3 className="country-heading">{t("ports")}</h3>
                    {selectedCountry ? (
                        <ul className="port-list">
                            {freightData
                                .find((regionData) => regionData.region === selectedRegion)
                                ?.countries.find((country) => country.name === selectedCountry)
                                ?.ports.map((port) => (
                                    <li key={port.name} className="port-item">
                                        <span className="port-name">{port.name}</span>
                                        <span className="port-cost">{port.cost}</span>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <div className="port-placeholder">
                            {t("select_country_to_view_ports")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeaFreight;