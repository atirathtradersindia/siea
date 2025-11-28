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

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const loadPaypal = (currency = "USD") => {
  return new Promise((resolve) => {
    const clientId = "AURJ-JxP9ks57rmAjpgygYWhay5TjDahC_6o5s89h7tu73o-UIlm7mYFSb_CSqS3u7l1TDAyQizRXLqV";
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('PayPal SDK failed to load:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const Service = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('airways');

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
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Get API base URL from environment variables with fallback
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  // Shipping charges
  const shippingCharges = {
    india: {
      airways: 350,
      train: 250
    },
    international: {
      airways: 1500,
      ship: 800
    }
  };

  // Quantity options with conversion factors to kg
  const quantityOptions = [
    { label: "300 grams", value: "300 grams", kg: 0.3 },
    { label: "500 grams", value: "500 grams", kg: 0.5 },
    { label: "1 kg", value: "1 kg", kg: 1 },
    { label: "2 kg", value: "2 kg", kg: 2 },
    { label: "3 kg", value: "3 kg", kg: 3 },
    { label: "5 kg", value: "5 kg", kg: 5 },
    { label: "8 kg", value: "8 kg", kg: 8 },
    { label: "10 kg", value: "10 kg", kg: 10 },
    { label: "12 kg", value: "12 kg", kg: 12 },
    { label: "15 kg", value: "15 kg", kg: 15 },
    { label: "18 kg", value: "18 kg", kg: 18 },
    { label: "20 kg", value: "20 kg", kg: 20 },
    { label: "25 kg", value: "25 kg", kg: 25 },
    { label: "30 kg", value: "30 kg", kg: 30 }
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

  // Calculate price for a specific rice item based on quantity
  const calculateItemPrice = (variety, grade, quantityValue) => {
    const riceItem = riceData.find(item => 
      item.variety === variety && item.grade === grade
    );
    
    if (!riceItem) return 0;

    const quantityOption = quantityOptions.find(q => q.value === quantityValue);
    if (!quantityOption) return 0;

    const pricePerKg = riceItem.price_inr;
    return pricePerKg * quantityOption.kg;
  };

  // Calculate total rice price
  const calculateTotalRicePrice = () => {
    return form.selectedItems.reduce((total, item) => {
      return total + calculateItemPrice(item.variety, item.grade, item.quantity);
    }, 0);
  };

  // Calculate shipping charges
  const calculateShippingCharges = () => {
    const isInternational = form.countryCode !== '+91';
    const charges = isInternational ? shippingCharges.international : shippingCharges.india;
    return charges[shippingMethod];
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    const riceTotal = calculateTotalRicePrice();
    const shipping = calculateShippingCharges();
    return riceTotal + shipping;
  };

  // Convert INR to other currencies for PayPal
  const convertToLocalCurrency = (amountINR) => {
    const totalAmount = amountINR;
    let currency = "USD";
    let amount = totalAmount;

    if (form.countryCode !== '+91') {
      switch (form.countryCode) {
        case '+1': // USA/Canada
          currency = "USD";
          amount = totalAmount * 0.012;
          break;
        case '+44': // UK
          currency = "GBP";
          amount = totalAmount * 0.009;
          break;
        case '+971': // UAE
          currency = "AED";
          amount = totalAmount * 0.044;
          break;
        case '+966': // Saudi Arabia
          currency = "SAR";
          amount = totalAmount * 0.045;
          break;
        case '+81': // Japan
          currency = "JPY";
          amount = totalAmount * 1.8;
          break;
        case '+49': // Germany
        case '+33': // France
          currency = "EUR";
          amount = totalAmount * 0.011;
          break;
        case '+86': // China
          currency = "CNY";
          amount = totalAmount * 0.085;
          break;
        default:
          currency = "USD";
          amount = totalAmount * 0.012;
      }
    }

    return {
      currency,
      amount: Math.round(amount * 100) / 100,
      amountINR: totalAmount
    };
  };

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

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setDebugInfo('Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.text();
        setDebugInfo(`Backend connection successful: ${data}`);
        return true;
      } else {
        setDebugInfo(`Backend connection failed: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      setDebugInfo(`Backend connection error: ${error.message}`);
      return false;
    }
  };

  const sendToWhatsApp = (currency = "INR", amount = null, paymentMethod = "Razorpay") => {
    const required = ['name', 'company', 'doorNo', 'area', 'town', 'city', 'district', 'pincode', 'phone', 'email'];
    const missing = required.filter(f => !form[f]?.trim());
    const phoneOk = form.phone.length === countryCodeRules[form.countryCode].length && !phoneError;
    const pinOk = form.pincode.length >= 4;
    const emailOk = validateEmail(form.email);
    const samplesOk = form.selectedItems.length > 0;

    if (missing.length > 0 || !phoneOk || !pinOk || !emailOk || !samplesOk) {
      alert('ALL FIELDS ARE MANDATORY! Please fill everything correctly.');
      return false;
    }

    const fullPhone = form.countryCode + form.phone;
    const whatsappNumber = '919247485871';
    const address = `${form.doorNo}, ${form.area}, ${form.town}, ${form.city}, ${form.district} - ${form.pincode}${form.landmark ? ` (Landmark: ${form.landmark})` : ''}`;

    const itemsList = form.selectedItems.map((item, i) =>
      `${i + 1}. *Variety*: ${item.variety}\n   *Grade*: ${item.grade}\n   *Weight*: ${item.quantity}\n   *Price*: ₹${item.price.toFixed(2)}`
    ).join('\n\n');

    const totalRicePrice = calculateTotalRicePrice();
    const shippingPrice = calculateShippingCharges();
    const totalAmount = calculateTotalAmount();

    const paymentAmount = amount || `₹${totalAmount.toFixed(2)}`;

    const message =
      `*Rice Sample Request - PAID*

*Samples*:
${itemsList}

*Price Breakdown*:
*Rice Total*: ₹${totalRicePrice.toFixed(2)}
*Shipping (${shippingMethod.toUpperCase()})*: ₹${shippingPrice.toFixed(2)}
*Total Amount*: ₹${totalAmount.toFixed(2)}

*Customer Details*:
*Name*: ${form.name}
*Company*: ${form.company}
*Full Address*: ${address}
*Country*: ${countryCodeRules[form.countryCode].name}
*Phone*: ${fullPhone}
*Email*: ${form.email}

*Shipping Method*: ${shippingMethod.toUpperCase()}
*Payment Status*: ✅ Paid (${paymentAmount})
*Payment Method*: ${paymentMethod}
*Time*: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      .trim();

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    alert(`Payment Successful! Your request has been sent via WhatsApp.`);
    return true;
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

  // Create Razorpay order with fallback
  const createRazorpayOrder = async (amount, currency) => {
    try {
      setDebugInfo(`Creating order with: ${API_BASE_URL}/create-razorpay-order`);
      
      const response = await fetch(`${API_BASE_URL}/create-razorpay-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          amount: Math.round(amount),
          currency: currency
        })
      });

      setDebugInfo(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setDebugInfo(`Order created successfully: ${data.order?.id}`);
      
      if (!data.order || !data.order.id) {
        throw new Error("Invalid order response from server");
      }
      
      return data.order;
    } catch (error) {
      setDebugInfo(`Order creation failed: ${error.message}`);
      throw error;
    }
  };

  const startRazorpayPayment = async () => {
    setForm(prev => ({ ...prev, submitted: true }));

    if (!allFieldsValid()) {
      alert('Please fill all required fields correctly before making payment.');
      return;
    }

    setPaymentLoading(true);
    setApiLoading(true);
    setDebugInfo('Starting payment process...');

    try {
      // Test backend first
      const connectionOk = await testBackendConnection();
      if (!connectionOk) {
        throw new Error("Cannot connect to payment server. Please try again later.");
      }

      const res = await loadRazorpay();
      if (!res) {
        throw new Error("Razorpay SDK failed to load");
      }

      const totalAmount = calculateTotalAmount();
      
      let currency = "INR";
      let amount = totalAmount;
      
      if (form.countryCode !== '+91') {
        switch (form.countryCode) {
          case '+1': currency = "USD"; amount = totalAmount * 0.012; break;
          case '+44': currency = "GBP"; amount = totalAmount * 0.009; break;
          case '+971': currency = "AED"; amount = totalAmount * 0.044; break;
          case '+966': currency = "SAR"; amount = totalAmount * 0.045; break;
          case '+81': currency = "JPY"; amount = totalAmount * 1.8; break;
          case '+49': case '+33': currency = "EUR"; amount = totalAmount * 0.011; break;
          case '+86': currency = "CNY"; amount = totalAmount * 0.085; break;
          default: currency = "USD"; amount = totalAmount * 0.012;
        }
      }

      const order = await createRazorpayOrder(amount, currency);

      const options = {
        key: "rzp_test_RfSBzDny9nssx0",
        amount: order.amount,
        currency: order.currency,
        name: "Sai Import Export Agro",
        description: "Rice Sample Courier Service Payment",
        order_id: order.id,
        handler: function (response) {
          setDebugInfo(`Payment successful: ${response.razorpay_payment_id}`);
          const success = sendToWhatsApp(currency, amount, "Razorpay");
          if (success) {
            setForm({
              name: '', company: '', doorNo: '', area: '', town: '', city: '', district: '', pincode: '', landmark: '',
              phone: '', email: '', countryCode: '+91', selectedItems: [], submitted: false
            });
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.countryCode + form.phone
        },
        theme: {
          color: "#F4C430"
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            setApiLoading(false);
            setDebugInfo('Payment modal dismissed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      setDebugInfo(`Payment error: ${error.message}`);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Cannot connect')) {
        alert("Cannot connect to payment server. Please check your internet connection or try again later.");
      } else if (error.message.includes('Failed to create order')) {
        alert("Payment service is temporarily unavailable. Please try again in a few minutes.");
      } else {
        alert(`Payment failed: ${error.message}`);
      }
    } finally {
      setPaymentLoading(false);
      setApiLoading(false);
    }
  };

  const startPaypalPayment = async () => {
    setForm(prev => ({ ...prev, submitted: true }));

    if (!allFieldsValid()) {
      alert('Please fill all required fields correctly before making payment.');
      return;
    }

    setPaymentLoading(true);
    setPaypalError('');

    try {
      const { currency, amount } = convertToLocalCurrency(calculateTotalAmount());
      
      const loaded = await loadPaypal(currency);
      if (!loaded) {
        throw new Error("PayPal SDK failed to load");
      }

      setPaypalLoaded(true);

      const paypalButtonsContainer = document.getElementById('paypal-button-container');
      if (paypalButtonsContainer) {
        paypalButtonsContainer.innerHTML = '';
      }

      if (!window.paypal) {
        throw new Error("PayPal is not available");
      }

      window.paypal.Buttons({
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              description: "Rice Sample Courier Service Payment",
              amount: {
                value: amount.toFixed(2),
                currency_code: currency
              }
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            const success = sendToWhatsApp(currency, `${amount.toFixed(2)} ${currency}`, "PayPal");
            if (success) {
              setForm({
                name: '', company: '', doorNo: '', area: '', town: '', city: '', district: '', pincode: '', landmark: '',
                phone: '', email: '', countryCode: '+91', selectedItems: [], submitted: false
              });
            }
            setPaymentLoading(false);
          });
        },
        onError: function(err) {
          console.error('PayPal error:', err);
          setPaypalError("PayPal payment failed. Please try again.");
          setPaymentLoading(false);
        },
        onCancel: function(data) {
          setPaypalError("Payment was cancelled. Please try again if you want to complete your order.");
          setPaymentLoading(false);
        }
      }).render('#paypal-button-container');

    } catch (error) {
      console.error('PayPal payment error:', error);
      setPaypalError(`PayPal failed: ${error.message}`);
      setPaymentLoading(false);
    }
  };

  const startPayment = () => {
    if (form.countryCode === '+91') {
      startRazorpayPayment();
    } else {
      startPaypalPayment();
    }
  };

  const services = [
    { image: MapImage, title: t("trusted_pan_india_network") },
    { image: Branding, title: t("branding_packaging_services") },
    { image: Profitable, title: t("profitable_purchase") },
    { image: Personalization, title: t("personalization_available") },
    { image: Guidance, title: t("professional_guidance") },
    { image: Quality, title: t("quality_assured") },
  ];

  const serviceOptions = [...Object.keys(otherServices), "Sample Courier Services"];

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
      setPaypalError('');
      setDebugInfo('');
    }
  };

  const showForm = selectedService === "Sample Courier Services";

  const getPaymentButtonText = () => {
    const totalAmount = calculateTotalAmount();
    if (form.countryCode === '+91') {
      return `Pay Total Amount: ₹${totalAmount.toFixed(2)}`;
    } else {
      const { currency, amount } = convertToLocalCurrency(totalAmount);
      return `Pay Total Amount: ${amount.toFixed(2)} ${currency}`;
    }
  };

  const handleFallbackPayment = () => {
    if (form.countryCode === '+91') {
      startRazorpayPayment();
    } else {
      alert("For international payments, please contact us directly at +91-9247485871 for alternative payment options.");
    }
  };

  // Rest of your existing JSX remains the same, but I'll add a debug section
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

            {showForm && (
              <div className="tw-mt-16 tw-max-w-6xl tw-mx-auto tw-p-10 tw-bg-black/40 tw-backdrop-blur-xl tw-rounded-3xl tw-shadow-2xl tw-border-4 tw-border-yellow-400 tw-relative overflow-hidden">
                <div className="tw-absolute tw-inset-0 tw-border-4 tw-border-yellow-500 tw-rounded-3xl tw-pointer-events-none tw-opacity-50"></div>

                <h4 className="tw-text-4xl tw-font-extrabold tw-text-yellow-400 tw-mb-10 tw-text-center tw-tracking-tight tw-drop-shadow-lg">
                  Request Multiple Rice Samples
                </h4>

                {/* Debug Section - Only show in development */}
                {process.env.NODE_ENV === 'development' && debugInfo && (
                  <div className="tw-mb-6 tw-p-4 tw-bg-gray-800 tw-rounded-xl tw-border tw-border-yellow-600">
                    <h5 className="tw-text-yellow-400 tw-font-bold tw-mb-2">Debug Info:</h5>
                    <p className="tw-text-white tw-text-sm">{debugInfo}</p>
                    <p className="tw-text-gray-400 tw-text-xs tw-mt-2">API URL: {API_BASE_URL}</p>
                  </div>
                )}

                <div className="tw-space-y-8">
                  {/* Your existing form fields remain the same */}
                  {/* ... form fields ... */}

                  {/* Payment Section */}
                  <div className="tw-bg-black/50 tw-backdrop-blur-lg tw-rounded-3xl tw-p-8 tw-border-2 tw-border-yellow-500">
                    <h5 className="tw-text-2xl tw-font-bold tw-text-yellow-400 tw-mb-6 tw-text-center">
                      {form.countryCode === '+91' ? 'Secure Payment (Razorpay)' : 'International Payment (PayPal)'}
                    </h5>
                    
                    {apiLoading && (
                      <div className="tw-flex tw-items-center tw-justify-center tw-mb-4">
                        <div className="tw-w-6 tw-h-6 tw-border-2 tw-border-yellow-400 tw-border-t-transparent tw-rounded-full tw-animate-spin"></div>
                        <span className="tw-ml-2 tw-text-yellow-400">Creating order...</span>
                      </div>
                    )}
                    
                    {paypalError && (
                      <div className="tw-mb-6 tw-p-4 tw-bg-red-900/50 tw-border tw-border-red-600 tw-rounded-xl">
                        <p className="tw-text-red-300 tw-text-center">{paypalError}</p>
                        <button
                          onClick={handleFallbackPayment}
                          className="tw-w-full tw-mt-3 tw-py-3 tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-black tw-font-bold tw-rounded-xl tw-transition-all"
                        >
                          Try Alternative Payment Method
                        </button>
                      </div>
                    )}
                    
                    {form.countryCode === '+91' ? (
                      <button
                        onClick={startPayment}
                        disabled={!allFieldsValid() || paymentLoading || apiLoading}
                        className="tw-w-full tw-max-w-2xl tw-mx-auto tw-py-6 tw-bg-green-500 hover:tw-bg-green-600 tw-text-white tw-font-extrabold tw-text-2xl tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-gap-4 tw-shadow-2xl tw-transition-all tw-duration-300 transform hover:tw-scale-105 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="tw-w-6 tw-h-6 tw-border-2 tw-border-white tw-border-t-transparent tw-rounded-full tw-animate-spin"></div>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <svg className="tw-w-8 tw-h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L5 9.5V15.5L3 16V18L9 16.5V18H15V16.5L21 18V16L19 15.5V9.5L21 9ZM15 16H9V14H15V16ZM15 12H9V10H15V12Z" />
                            </svg>
                            {getPaymentButtonText()}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="tw-space-y-6">
                        <button
                          onClick={startPayment}
                          disabled={!allFieldsValid() || paymentLoading}
                          className="tw-w-full tw-max-w-2xl tw-mx-auto tw-py-6 tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-font-extrabold tw-text-2xl tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-gap-4 tw-shadow-2xl tw-transition-all tw-duration-300 transform hover:tw-scale-105 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                        >
                          {paymentLoading ? (
                            <>
                              <div className="tw-w-6 tw-h-6 tw-border-2 tw-border-white tw-border-t-transparent tw-rounded-full tw-animate-spin"></div>
                              Loading PayPal...
                            </>
                          ) : (
                            <>
                              <svg className="tw-w-8 tw-h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7.5 14.5c-1.58 0-2.83.72-3.5 1.8V14H2v6h2v-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V20h2v-4.5c0-1.65-1.42-3-3-3zm10.5 0c-1.65 0-3 1.35-3 3V20h2v-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V20h2v-2.5c0-1.65-1.35-3-3-3zM20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H4V4h16v12z"/>
                              </svg>
                              {getPaymentButtonText()} with PayPal
                            </>
                          )}
                        </button>
                        
                        <div id="paypal-button-container" className="tw-flex tw-justify-center"></div>
                        
                        <p className="tw-text-center tw-text-yellow-300 tw-text-sm">
                          Secure international payment processed by PayPal
                        </p>
                      </div>
                    )}
                  </div>

                  {!allFieldsValid() && form.submitted && (
                    <p className="tw-text-red-500 tw-text-center tw-font-bold tw-text-xl tw-mt-6 tw-animate-pulse">
                      Please fill ALL fields correctly to proceed with payment
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
