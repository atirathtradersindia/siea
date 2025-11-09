// src/components/Service.jsx
import React, { useState, useEffect } from 'react';
import MapImage from "../assets/Map.png";
import Branding from "../assets/Branding-Services.png";
import Profitable from "../assets/Profitable-Purchase.jpg";
import Personalization from "../assets/Personalization.jpg";
import Guidance from "../assets/Guidance.jpg";
import Quality from "../assets/Quality.jpg";
import { useLanguage } from "../contexts/LanguageContext";
import { riceData } from "../data/products";
import { otherServices } from "../data/services";

const Service = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const countryCodeRules = {
    '+91': { name: 'India', length: 10, api: 'india' },
    '+1': { name: 'USA/Canada', length: 10, api: 'usa_canada' },
    '+44': { name: 'UK', length: 10, api: 'uk' },
    '+971': { name: 'UAE', length: 9, api: 'manual' },
    '+966': { name: 'Saudi Arabia', length: 9, api: 'manual' },
    '+81': { name: 'Japan', length: 10, api: 'manual' },
    '+49': { name: 'Germany', length: 11, api: 'manual' },
    '+33': { name: 'France', length: 9, api: 'manual' },
    '+86': { name: 'China', length: 11, api: 'manual' },
  };

  const [form, setForm] = useState({
    name: '', company: '', doorNo: '', area: '', town: '', city: '', district: '', pincode: '', landmark: '',
    phone: '', email: '', countryCode: '+91', selectedItems: [], submitted: false
  });

  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [varietyOptions, setVarietyOptions] = useState([]);
  const [gradeMap, setGradeMap] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState('');

  const quantityOptions = [
    "300 grams", "500 grams", "1 kg", "2 kg", "3 kg", "5 kg",
    "8 kg", "10 kg", "12 kg", "15 kg", "18 kg", "20 kg", "25 kg", "30 kg"
  ];

  useEffect(() => {
    const uniqueVarieties = [...new Set(riceData.map(item => item.variety))].sort();
    setVarietyOptions(uniqueVarieties);

    const map = {};
    riceData.forEach(item => {
      if (!map[item.variety]) map[item.variety] = [];
      if (!map[item.variety].includes(item.grade)) {
        map[item.variety].push(item.grade);
      }
    });
    Object.keys(map).forEach(v => map[v].sort());
    setGradeMap(map);
  }, []);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      const maxLength = countryCodeRules[form.countryCode].length;
      setPhoneError(digitsOnly.length > maxLength ? `Enter exactly ${maxLength} digits` : '');
      setForm(prev => ({ ...prev, phone: digitsOnly }));
    }
    else if (name === 'countryCode') {
      setForm(prev => ({ ...prev, countryCode: value, phone: '', pincode: '', area: '', town: '', city: '', district: '', landmark: '' }));
      setPhoneError('');
      setPincodeMessage('');
    }
    else if (name === 'pincode') {
      let cleaned = value;
      if (form.countryCode === '+44') {
        cleaned = value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
      } else {
        cleaned = value.replace(/\D/g, '').slice(0, 10);
      }
      setForm(prev => ({ ...prev, pincode: cleaned }));
      setPincodeMessage('');
    }
    else if (name === 'email') {
      setForm(prev => ({ ...prev, email: value }));
      setEmailError(value.trim() && !validateEmail(value) ? 'Invalid email' : '');
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePincodeFetch = async (e) => {
    let pincode = e.target.value.trim();
    if (!pincode || pincode.length < 3) return;

    const country = countryCodeRules[form.countryCode];
    if (country.api === 'manual') {
      setPincodeMessage(`Manual entry required for ${country.name}`);
      return;
    }

    setPincodeLoading(true);
    setPincodeMessage('');

    try {
      let url = '';
      let parser = null;
      let apiPincode = pincode;

      if (country.api === 'india') {
        apiPincode = pincode.replace(/\D/g, '');
        if (apiPincode.length !== 6) throw new Error("Invalid Indian pincode");
        url = `https://api.postalpincode.in/pincode/${apiPincode}`;
        parser = (data) => {
          if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            return { 
              area: '', // Not fetching street/area
              town: po.Block || po.District || '', 
              city: po.District || '', 
              district: po.District || '' 
            };
          }
          return null;
        };
      } 
      else if (country.api === 'usa_canada') {
        apiPincode = pincode.replace(/\D/g, '');
        if (apiPincode.length < 5) throw new Error("Invalid US/Canada zipcode");
        
        // Try Zippopotam first
        const countryCode = form.countryCode === '+1' ? 'us' : 'ca';
        url = `https://api.zippopotam.us/${countryCode}/${apiPincode}`;
        parser = (data) => {
          if (data.places?.length > 0) {
            const p = data.places[0];
            return {
              area: '', // Not fetching street/area
              town: p['place name'] || '',
              city: p['place name'] || '',
              district: p.state || p['state abbreviation'] || ''
            };
          }
          return null;
        };
      }
      else if (country.api === 'uk') {
        apiPincode = pincode.replace(/\s/g, '').toUpperCase();
        if (apiPincode.length < 5) throw new Error("Invalid UK postcode");
        
        // Try Postcodes.io for UK
        url = `https://api.postcodes.io/postcodes/${apiPincode}`;
        parser = (data) => {
          if (data.status === 200 && data.result) {
            return {
              area: '', // Not fetching street/area
              town: data.result.admin_district || data.result.region || '',
              city: data.result.admin_district || data.result.region || '',
              district: data.result.region || data.result.country || ''
            };
          }
          return null;
        };
      }

      if (!url) {
        throw new Error("API not configured for this country");
      }

      const response = await fetch(url);
      if (!response.ok) {
        // If primary API fails, try fallback for US/Canada
        if (country.api === 'usa_canada') {
          const zipCodeApiUrl = `https://api.zippopotam.us/us/${apiPincode}`;
          const fallbackResponse = await fetch(zipCodeApiUrl);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const result = parser(fallbackData);
            if (result) {
              setForm(prev => ({
                ...prev,
                town: result.town || prev.town,
                city: result.city || prev.city,
                district: result.district || prev.district,
              }));
              setPincodeMessage(`Location found: ${result.city || result.town}, ${country.name}`);
              return;
            }
          }
        }
        throw new Error("Not found");
      }

      const data = await response.json();
      const result = parser(data);

      if (result) {
        setForm(prev => ({
          ...prev,
          town: result.town || prev.town,
          city: result.city || prev.city,
          district: result.district || prev.district,
        }));
        setPincodeMessage(`Location found: ${result.city || result.town}, ${country.name}`);
      } else {
        setPincodeMessage(`No data found for "${pincode}". Enter manually.`);
      }
    } catch (err) {
      console.error('Pincode fetch error:', err);
      
      // Provide more specific error messages
      if (err.message.includes('Invalid')) {
        setPincodeMessage(`Invalid format for ${country.name}`);
      } else if (err.message.includes('Not found')) {
        setPincodeMessage(`No data found for "${pincode}". Enter manually.`);
      } else if (err.message.includes('API not configured')) {
        setPincodeMessage(`Manual entry required for ${country.name}`);
      } else {
        setPincodeMessage(`Service temporarily unavailable. Enter manually.`);
      }
    } finally {
      setPincodeLoading(false);
    }
  };

  const toggleItem = (variety, grade) => {
    setForm(prev => {
      const key = `${variety}-${grade}`;
      const exists = prev.selectedItems.find(i => i.key === key);
      if (exists) {
        return { ...prev, selectedItems: prev.selectedItems.filter(i => i.key !== key) };
      } else {
        return { ...prev, selectedItems: [...prev.selectedItems, { variety, grade, quantity: "1 kg", key }] };
      }
    });
  };

  const updateQuantity = (key, newQuantity) => {
    setForm(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map(item => item.key === key ? { ...item, quantity: newQuantity } : item)
    }));
  };

  const sendToWhatsApp = () => {
    setForm(prev => ({ ...prev, submitted: true }));

    const required = ['name', 'company', 'doorNo', 'area', 'town', 'city', 'district', 'pincode', 'phone', 'email'];
    const missing = required.filter(f => !form[f]?.trim());
    const phoneOk = form.phone.length === countryCodeRules[form.countryCode].length && !phoneError;
    const pinOk = form.pincode.length >= 4;
    const emailOk = validateEmail(form.email);
    const samplesOk = form.selectedItems.length > 0;

    if (missing.length > 0 || !phoneOk || !pinOk || !emailOk || !samplesOk) {
      alert('ALL FIELDS ARE MANDATORY! Please fill everything correctly.');
      return;
    }

    const fullPhone = form.countryCode + form.phone;
    const whatsappNumber = '919247485871';
    const address = `${form.doorNo}, ${form.area}, ${form.town}, ${form.city}, ${form.district} - ${form.pincode}${form.landmark ? ` (Landmark: ${form.landmark})` : ''}`;

    const itemsList = form.selectedItems.map((item, i) =>
      `${i + 1}. *Variety*: ${item.variety}\n   *Grade*: ${item.grade}\n   *Weight*: ${item.quantity}`
    ).join('\n\n');

    const message = 
`*Rice Sample Request*

*Samples*:
${itemsList}

*Customer Details*:
*Name*: ${form.name}
*Company*: ${form.company}
*Full Address*: ${address}
*Country*: ${countryCodeRules[form.countryCode].name}
*Phone*: ${fullPhone}
*Email*: ${form.email}

*Time*: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    .trim();

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    alert("Request Sent Successfully! We will contact you soon.");
  };

  const currentLength = countryCodeRules[form.countryCode]?.length || 10;

  const allFieldsValid = () => {
    const req = ['name', 'company', 'doorNo', 'area', 'town', 'city', 'district', 'pincode', 'phone', 'email'];
    return req.every(f => form[f]?.trim()) &&
           form.phone.length === currentLength && !phoneError &&
           form.pincode.length >= 4 &&
           validateEmail(form.email) &&
           form.selectedItems.length > 0;
  };

  const services = [
    { image: MapImage, title: t("trusted_pan_india_network") },
    { image: Branding, title: t("branding_packaging_services") },
    { image: Profitable, title: t("profitable_purchase") },
    { image: Personalization, title: t("personalization_available") },
    { image: Guidance, title: t("professional_guidance") },
    { image: Quality, title: t("quality_assured") },
  ];

  const serviceOptions = ["Sample Courier Services", ...Object.keys(otherServices)];

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setIsDropdownOpen(false);
    if (service === "Sample Courier Services") {
      setForm({ 
        name: '', company: '', doorNo: '', area: '', town: '', city: '', district: '', pincode: '', landmark: '',
        phone: '', email: '', countryCode: '+91', selectedItems: [], submitted: false 
      });
      setPhoneError(''); 
      setEmailError(''); 
      setPincodeLoading(false); 
      setPincodeMessage('');
    }
  };

  const showForm = selectedService === "Sample Courier Services";

  return (
    <>
      <section className="service-section">
        <div className="container">
          <h1 className="tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-8 tw-text-center service-heading">
            {t("our_services")}
          </h1>

          <div className="service-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <img src={service.image} alt={service.title} className="service-image" />
                <p className="service-title" dangerouslySetInnerHTML={{ __html: service.title.replace("&", "&amp;") }} />
              </div>
            ))}
          </div>

          <div className="other-services-section tw-mt-16">
            <h2 className="tw-text-2xl tw-font-bold tw-text-yellow-400 tw-mb-6 tw-text-center">
              Other Services
            </h2>

            <div className="service-dropdown-container tw-mb-8">
              <div className="relative tw-w-full tw-max-w-md tw-mx-auto">
                <button onClick={toggleDropdown} className="region-button tw-w-full">
                  <span>{selectedService || "Select vendor type"}</span>
                  <div className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isDropdownOpen && (
                  <div className="region-content tw-max-h-60 tw-overflow-y-auto">
                    {serviceOptions.map((service, index) => (
                      <button key={index} onClick={() => handleServiceSelect(service)} className="dropdown-item">
                        {service}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* VENDOR CARDS */}
            {selectedService && otherServices[selectedService] && selectedService !== "Sample Courier Services" && (
              <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-mt-12">
                {otherServices[selectedService].map((vendor) => {
                  const cleanNum = vendor.contactNo?.replace(/\D/g, '') || '';
                  let phone = cleanNum.startsWith('91') && cleanNum.length > 10 ? cleanNum.slice(2) : cleanNum;
                  if (cleanNum.length > 10) phone = cleanNum.slice(-10);

                  const emailLink = vendor.email && vendor.email !== "N/A" ? `mailto:${vendor.email}` : null;
                  const callLink = phone.length >= 10 ? `tel:+91${phone}` : null;

                  const hasEmail = !!emailLink;
                  const hasPhone = !!callLink;
                  const buttonCount = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0);

                  return (
                    <div key={vendor.serialNo} className="tw-relative tw-bg-gray-900 tw-border-2 tw-border-yellow-500 tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl tw-flex tw-flex-col tw-h-full" style={{ borderTop: '10px solid #FFD700' }}>
                      <div className="tw-absolute -tw-top-5 -tw-left-5 tw-w-14 tw-h-14 tw-bg-yellow-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-black tw-font-bold tw-text-2xl tw-shadow-2xl tw-z-10">
                        {vendor.serialNo}
                      </div>
                      <div className="tw-p-8 tw-pt-12 tw-flex-1 tw-flex tw-flex-col">
                        <h3 className="tw-text-2xl tw-font-extrabold tw-text-yellow-400 tw-mb-5 tw-tracking-tight">{vendor.partyName}</h3>
                        <div className="tw-space-y-4 tw-flex-1">
                          <div><p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider">Product:</p><p className="tw-text-white tw-font-semibold">{vendor.product}</p></div>
                          <div><p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider">Address:</p><p className="tw-text-white tw-font-medium">{vendor.address}</p></div>
                          {vendor.contactPerson && (<div><p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider">Contact Person:</p><p className="tw-text-white tw-font-medium">{vendor.contactPerson}</p></div>)}
                        </div>
                        <div className={`tw-flex tw-gap-4 tw-mt-8 ${buttonCount === 1 ? 'tw-justify-center' : 'tw-justify-between'}`}>
                          {hasEmail && (
                            <a href={emailLink} className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-40 tw-bg-transparent tw-border-2 tw-border-yellow-500 tw-text-yellow-400 tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl hover:tw-bg-yellow-500 hover:tw-text-black tw-transition-all tw-shadow-lg">
                              Email
                            </a>
                          )}
                          {hasPhone && (
                            <a href={callLink} className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-40 tw-bg-transparent tw-border-2 tw-border-yellow-500 tw-text-yellow-400 tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl hover:tw-bg-yellow-500 hover:tw-text-black tw-transition-all tw-shadow-lg">
                              Call
                            </a>
                          )}
                          {buttonCount === 0 && (
                            <p className="tw-text-gray-500 tw-text-sm tw-italic tw-w-full tw-text-center">Contact details not available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SAMPLE COURIER FORM - PHONE & EMAIL ON TOP */}
            {showForm && (
              <div className="tw-mt-16 tw-max-w-6xl tw-mx-auto tw-p-10 tw-bg-black/40 tw-backdrop-blur-xl tw-rounded-3xl tw-shadow-2xl tw-border-4 tw-border-yellow-400 tw-relative overflow-hidden">
                <div className="tw-absolute tw-inset-0 tw-border-4 tw-border-yellow-500 tw-rounded-3xl tw-pointer-events-none tw-opacity-50"></div>
                
                <h4 className="tw-text-4xl tw-font-extrabold tw-text-yellow-400 tw-mb-10 tw-text-center tw-tracking-tight tw-drop-shadow-lg">
                  Request Multiple Rice Samples
                </h4>

                <div className="tw-space-y-8">
                  

                  {/* NAME & COMPANY */}
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
                    <div>
                      <input type="text" name="name" placeholder="Your Name *" value={form.name} onChange={handleInputChange}
                        className="tw-w-full tw-px-6 tw-py-5 tw-rounded-2xl tw-bg-black/60 tw-backdrop-blur-md tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border-2 tw-border-yellow-600 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-yellow-400 tw-transition-all tw-shadow-xl" />
                      {!form.name && form.submitted && <p className="tw-text-red-400 tw-text-sm tw-mt-2">Required</p>}
                    </div>
                    <div>
                      <input type="text" name="company" placeholder="Company Name *" value={form.company} onChange={handleInputChange}
                        className="tw-w-full tw-px-6 tw-py-5 tw-rounded-2xl tw-bg-black/60 tw-backdrop-blur-md tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border-2 tw-border-yellow-600 focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-yellow-400 tw-transition-all tw-shadow-xl" />
                      {!form.company && form.submitted && <p className="tw-text-red-400 tw-text-sm tw-mt-2">Required</p>}
                    </div>
                  </div>

                  {/* PHONE & EMAIL - ON TOP */}
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
                    <div>
                      <div className="tw-flex tw-rounded-2xl tw-overflow-hidden tw-border-2 tw-border-yellow-600">
                        <select name="countryCode" value={form.countryCode} onChange={handleInputChange} className="tw-px-3 tw-py-5 tw-w-32 tw-bg-black/70 tw-backdrop-blur-md tw-text-yellow-100 tw-border-r-2 tw-border-r-yellow-600 tw-outline-none tw-text-sm">
                          {Object.keys(countryCodeRules).map(code => (
                            <option key={code} value={code} className="tw-bg-black">
                              {code} {countryCodeRules[code].name}
                            </option>
                          ))}
                        </select>
                        <input type="tel" name="phone" placeholder={`Enter ${currentLength} digits *`} value={form.phone} onChange={handleInputChange} maxLength={currentLength} className="tw-flex-1 tw-px-5 tw-py-5 tw-bg-black/60 tw-backdrop-blur-md tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-outline-none" />
                      </div>
                      {phoneError && <p className="tw-text-red-400 tw-text-sm tw-mt-2">{phoneError}</p>}
                      {!form.phone && form.submitted && <p className="tw-text-red-400 tw-text-sm tw-mt-2">Required</p>}
                    </div>
                    <div>
                      <input type="email" name="email" placeholder="Email Address *" value={form.email} onChange={handleInputChange} className="tw-w-full tw-px-6 tw-py-5 tw-rounded-2xl tw-bg-black/60 tw-backdrop-blur-md tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border-2 tw-border-yellow-600 focus:tw-ring-4 focus:tw-ring-yellow-400 tw-shadow-xl" />
                      {emailError && <p className="tw-text-red-400 tw-text-sm tw-mt-2">{emailError}</p>}
                      {!form.email && form.submitted && <p className="tw-text-red-400 tw-text-sm tw-mt-2">Required</p>}
                    </div>
                  </div>

                  {/* ADDRESS FIELDS */}
                  <div className="tw-bg-black/50 tw-backdrop-blur-lg tw-rounded-3xl tw-p-8 tw-border-2 tw-border-yellow-600">
                    <h5 className="tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-6 tw-text-center">Delivery Address</h5>
                    <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-6">
                      <div>
                        <input type="text" name="doorNo" placeholder="Door No / Apt / Plot *" value={form.doorNo} onChange={handleInputChange} className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400" />
                        {!form.doorNo && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Required</p>}
                      </div>
                      <div>
                        <input type="text" name="area" placeholder="Area / Street / Locality *" value={form.area} onChange={handleInputChange} className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400" />
                        {!form.area && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Required</p>}
                      </div>
                      <div>
                        <input type="text" name="town" placeholder="Town / Suburb / Mandal *" value={form.town} onChange={handleInputChange} className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400" />
                        {!form.town && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Required</p>}
                      </div>
                      <div>
                        <input type="text" name="city" placeholder="City *" value={form.city} onChange={handleInputChange} className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400" />
                        {!form.city && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Required</p>}
                      </div>
                      <div>
                        <input type="text" name="district" placeholder="District / County *" value={form.district} onChange={handleInputChange} className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400" />
                        {!form.district && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Required</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="pincode"
                          placeholder={form.countryCode === '+44' ? "Postcode (e.g. SW1A 1AA) *" : "Zip / Postal Code *"}
                          value={form.pincode}
                          onChange={handleInputChange}
                          onBlur={handlePincodeFetch}
                          maxLength="12"
                          className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400 tw-font-mono"
                        />
                        {form.pincode && form.pincode.length < 4 && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Too short</p>}
                        {!form.pincode && form.submitted && <p className="tw-text-red-400 tw-text-xs tw-mt-1">Required</p>}
                        {pincodeLoading && (
                          <div className="tw-flex tw-items-center tw-gap-2 tw-mt-2">
                            <div className="tw-w-4 tw-h-4 tw-border-2 tw-border-yellow-400 tw-border-t-transparent tw-rounded-full tw-animate-spin"></div>
                            <p className="tw-text-yellow-300 tw-text-xs">Searching globally...</p>
                          </div>
                        )}
                        {pincodeMessage && !pincodeLoading && (
                          <p className={`tw-text-xs tw-mt-2 ${pincodeMessage.includes('found') ? 'tw-text-green-400' : pincodeMessage.includes('Manual') ? 'tw-text-blue-400' : 'tw-text-orange-400'}`}>
                            {pincodeMessage}
                          </p>
                        )}
                      </div>
                      <div className="sm:tw-col-span-2">
                        <input type="text" name="landmark" placeholder="Landmark / Nearby Place (Optional)" value={form.landmark} onChange={handleInputChange} className="tw-w-full tw-px-5 tw-py-4 tw-rounded-xl tw-bg-black/60 tw-text-yellow-100 placeholder:tw-text-yellow-500 tw-border tw-border-yellow-700 focus:tw-ring-4 focus:tw-ring-yellow-400" />
                        <p className="tw-text-gray-400 tw-text-xs tw-mt-1">Help delivery partners locate your address easily</p>
                      </div>
                    </div>
                  </div>

                  {/* SAMPLE SELECTION */}
                  <div className="tw-bg-black/50 tw-backdrop-blur-lg tw-rounded-3xl tw-p-8 tw-border-2 tw-border-yellow-500">
                    <h5 className="tw-text-2xl tw-font-bold tw-text-yellow-400 tw-mb-8 tw-text-center">Select Samples & Quantity</h5>
                    <div className="tw-space-y-8">
                      {varietyOptions.map(variety => (
                        <div key={variety} className="tw-bg-black/60 tw-backdrop-blur-md tw-rounded-2xl tw-p-6 tw-border tw-border-yellow-600">
                          <div className="tw-font-bold tw-text-yellow-300 tw-text-xl tw-mb-6">{variety}</div>
                          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-6">
                            {gradeMap[variety]?.map(grade => {
                              const key = `${variety}-${grade}`;
                              const item = form.selectedItems.find(i => i.key === key);
                              const isChecked = !!item;
                              return (
                                <div key={grade} className="tw-bg-black/70 tw-backdrop-blur-sm tw-rounded-xl tw-p-5 tw-border tw-border-yellow-700 hover:tw-border-yellow-400 tw-transition-all tw-flex tw-flex-col" style={{ height: '110px' }}>
                                  <label className="tw-flex tw-items-center tw-gap-4 tw-cursor-pointer tw-mb-3 tw-min-h-10">
                                    <div className="tw-flex-shrink-0">
                                      <input type="checkbox" checked={isChecked} onChange={() => toggleItem(variety, grade)}
                                        className="tw-w-7 tw-h-7 tw-text-yellow-400 tw-bg-black/50 tw-rounded-lg focus:tw-ring-4 focus:tw-ring-yellow-400 tw-border-2 tw-border-yellow-600" />
                                    </div>
                                    <span className="tw-text-yellow-100 tw-font-semibold tw-text-base tw-leading-tight tw-break-words">{grade}</span>
                                  </label>
                                  {isChecked && (
                                    <select value={item.quantity} onChange={(e) => updateQuantity(key, e.target.value)}
                                      className="tw-w-full tw-px-3 tw-py-2 tw-bg-black/70 tw-backdrop-blur-md tw-text-yellow-100 tw-border tw-border-yellow-600 tw-rounded-lg tw-text-sm focus:tw-ring-4 focus:tw-ring-yellow-400 tw-mt-auto">
                                      {quantityOptions.map(q => <option key={q} value={q} className="tw-bg-black">{q}</option>)}
                                    </select>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {form.selectedItems.length > 0 && (
                      <div className="tw-mt-10 tw-p-8 tw-bg-gradient-to-br tw-from-yellow-900/50 tw-to-black/70 tw-backdrop-blur-lg tw-rounded-2xl tw-border-2 tw-border-yellow-500">
                        <p className="tw-text-2xl tw-font-bold tw-text-yellow-300 tw-mb-5">Selected: {form.selectedItems.length} Sample(s)</p>
                        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                          {form.selectedItems.map(item => (
                            <div key={item.key} className="tw-text-yellow-200 tw-bg-black/60 tw-backdrop-blur tw-px-5 tw-py-3 tw-rounded-xl tw-text-center tw-border tw-border-yellow-600">
                              <span className="tw-font-medium">{item.variety}</span> → <strong className="tw-text-yellow-400">{item.grade}</strong><br/>
                              <span className="tw-text-sm tw-text-yellow-300">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={sendToWhatsApp} disabled={!allFieldsValid()}
                    className="tw-w-full tw-max-w-2xl tw-mx-auto tw-py-6 tw-bg-gradient-to-r tw-from-yellow-500 tw-to-yellow-600 hover:tw-from-yellow-400 hover:tw-to-yellow-500 tw-text-black tw-font-extrabold tw-text-2xl tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-gap-4 tw-shadow-2xl tw-transition-all tw-duration-300 transform hover:tw-scale-105 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed">
                    <svg className="tw-w-9 tw-h-9" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.263c.001-5.45 4.436-9.87 9.885-9.87 2.64 0 5.143 1.03 7.012 2.895 1.87 1.87 2.897 4.36 2.896 7.01-.001 5.45-4.436 9.87-9.884 9.87m.006-18.74c-5.82 0-10.55 4.73-10.55 10.55 0 1.898.502 3.745 1.455 5.332l-1.567 5.746 5.895-1.548a10.53 10.53 0 004.76 1.183c5.82 0 10.55-4.73 10.55-10.55 0-2.82-1.12-5.41-2.94-7.27-1.82-1.82-4.41-2.94-7.27-2.94"/>
                    </svg>
                    Send Complete Request ({form.selectedItems.length} Samples)
                  </button>

                  {!allFieldsValid() && form.submitted && (
                    <p className="tw-text-red-500 tw-text-center tw-font-bold tw-text-xl tw-mt-6 tw-animate-pulse">
                      Please fill ALL fields correctly
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Service;