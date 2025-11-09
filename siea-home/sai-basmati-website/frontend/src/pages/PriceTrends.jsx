import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext"; // Verified import

export default function App() {
  const products = {
    basmati: [
      {
        id: 1,
        title: {
          en: "1121 Steam A+ Basmati",
          te: "1121 స్టీమ్ A+ బాస్మతి",
          hi: "1121 स्टीम A+ बासमती",
          ur: "1121 سٹیم A+ باسمتی",
          es: "1121 Vapor A+ Basmati",
          fr: "1121 Vapeur A+ Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "3000 MT",
        packing: "50kg PP Bags",
        price: "₹97/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "8.30+ MM",
            te: "8.30+ మిమీ",
            hi: "8.30+ मिमी",
            ur: "8.30+ ملی میٹر",
            es: "8.30+ MM",
            fr: "8.30+ MM",
          },
          moisture: {
            en: "12.0%",
            te: "12.0%",
            hi: "12.0%",
            ur: "12.0%",
            es: "12.0%",
            fr: "12.0%",
          },
          broken: {
            en: "Under 1%",
            te: "1% కింద",
            hi: "1% से कम",
            ur: "1% سے کم",
            es: "Menor al 1%",
            fr: "Moins de 1%",
          },
          kett: {
            en: "30-32",
            te: "30-32",
            hi: "30-32",
            ur: "30-32",
            es: "30-32",
            fr: "30-32",
          },
        },
        description: {
          en: "Premium quality 1121 Steam A+ Basmati rice with excellent cooking results",
          te: "శ్రేష్ఠ నాణ్యత గల 1121 స్టీమ్ A+ బాస్మతి ధాన్యం ఉత్తమంగా వంట చేయగలదు",
          hi: "उत्कृष्ट गुणवत्ता वाला 1121 स्टीम A+ बासमती चावल जो शानदार खाना पकाने के परिणाम देता है",
          ur: "پریمیئم معیار کا 1121 سٹیم A+ باسمتی چاول جو شاندار کھانا پکانے کے نتائج دیتا ہے",
          es: "Arroz Basmati 1121 Vapor A+ de alta calidad con excelentes resultados de cocción",
          fr: "Riz Basmati 1121 Vapeur A+ de haute qualité avec d'excellents résultats de cuisson",
        },
        location: "Chhattisgarh",
      },
      {
        id: 2,
        title: {
          en: "1509 Golden Sella A+ Basmati",
          te: "1509 గోల్డెన్ సెల్లా A+ బాస్మతి",
          hi: "1509 गोल्डन सेला A+ बासमती",
          ur: "1509 گولڈن سیلا A+ باسمتی",
          es: "1509 Dorado Sella A+ Basmati",
          fr: "1509 Doré Sella A+ Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "5000 MT",
        packing: "50kg PP Bags",
        price: "₹148/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "8.35+ MM",
            te: "8.35+ మిమీ",
            hi: "8.35+ मिमी",
            ur: "8.35+ ملی میٹر",
            es: "8.35+ MM",
            fr: "8.35+ MM",
          },
          moisture: {
            en: "11.8%",
            te: "11.8%",
            hi: "11.8%",
            ur: "11.8%",
            es: "11.8%",
            fr: "11.8%",
          },
          broken: {
            en: "Under 1%",
            te: "1% కింద",
            hi: "1% से कम",
            ur: "1% سے کم",
            es: "Menor al 1%",
            fr: "Moins de 1%",
          },
          kett: {
            en: "31-33",
            te: "31-33",
            hi: "31-33",
            ur: "31-33",
            es: "31-33",
            fr: "31-33",
          },
        },
        description: {
          en: "Premium quality 1509 Golden Sella A+ Basmati rice",
          te: "శ్రేష్ఠ నాణ్యత గల 1509 గోల్డెన్ సెల్లా A+ బాస్మతి ధాన్యం",
          hi: "उत्कृष्ट गुणवत्ता वाला 1509 गोल्डन सेला A+ बासमती चावल",
          ur: "پریمیئم معیار کا 1509 گولڈن سیلا A+ باسمتی چاول",
          es: "Arroz Basmati 1509 Dorado Sella A+ de alta calidad",
          fr: "Riz Basmati 1509 Doré Sella A+ de haute qualité",
        },
        location: "Haryana",
      },
      {
        id: 3,
        title: {
          en: "1401 White Sella A+ Basmati",
          te: "1401 వైట్ సెల్లా A+ బాస్మతి",
          hi: "1401 व्हाइट सेला A+ बासमती",
          ur: "1401 وائٹ سیلا A+ باسمتی",
          es: "1401 Blanco Sella A+ Basmati",
          fr: "1401 Blanc Sella A+ Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "5000 MT",
        packing: "50kg PP Bags",
        price: "₹143/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "7.90+ MM",
            te: "7.90+ మిమీ",
            hi: "7.90+ मिमी",
            ur: "7.90+ ملی میٹر",
            es: "7.90+ MM",
            fr: "7.90+ MM",
          },
          moisture: {
            en: "11.8%",
            te: "11.8%",
            hi: "11.8%",
            ur: "11.8%",
            es: "11.8%",
            fr: "11.8%",
          },
          broken: {
            en: "Under 1%",
            te: "1% కింద",
            hi: "1% से कम",
            ur: "1% سے کم",
            es: "Menor al 1%",
            fr: "Moins de 1%",
          },
          kett: {
            en: "28-30",
            te: "28-30",
            hi: "28-30",
            ur: "28-30",
            es: "28-30",
            fr: "28-30",
          },
        },
        description: {
          en: "Premium quality 1401 White Sella A+ Basmati rice",
          te: "శ్రేష్ఠ నాణ్యత గల 1401 వైట్ సెల్లా A+ బాస్మతి ధాన్యం",
          hi: "उत्कृष्ट गुणवत्ता वाला 1401 व्हाइट सेला A+ बासमती चावल",
          ur: "پریمیئم معیار کا 1401 وائٹ سیلا A+ باسمتی چاول",
          es: "Arroz Basmati 1401 Blanco Sella A+ de alta calidad",
          fr: "Riz Basmati 1401 Blanc Sella A+ de haute qualité",
        },
        location: "Chhattisgarh",
      },
      {
        id: 4,
        title: {
          en: "Pusa Steam A+ Basmati",
          te: "పూసా స్టీమ్ A+ బాస్మతి",
          hi: "पुषा स्टीम A+ बासमती",
          ur: "پوشا سٹیم A+ باسمتی",
          es: "Pusa Vapor A+ Basmati",
          fr: "Pusa Vapeur A+ Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "2000 MT",
        packing: "50kg PP Bags",
        price: "₹119/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "7.75+ MM",
            te: "7.75+ మిమీ",
            hi: "7.75+ मिमी",
            ur: "7.75+ ملی میٹر",
            es: "7.75+ MM",
            fr: "7.75+ MM",
          },
          moisture: {
            en: "12.0%",
            te: "12.0%",
            hi: "12.0%",
            ur: "12.0%",
            es: "12.0%",
            fr: "12.0%",
          },
          broken: {
            en: "Under 1%",
            te: "1% కింద",
            hi: "1% से कम",
            ur: "1% سے کم",
            es: "Menor al 1%",
            fr: "Moins de 1%",
          },
          kett: {
            en: "28-30",
            te: "28-30",
            hi: "28-30",
            ur: "28-30",
            es: "28-30",
            fr: "28-30",
          },
        },
        description: {
          en: "Premium quality Pusa Steam A+ Basmati rice",
          te: "శ్రేష్ఠ నాణ్యత గల పూసా స్టీమ్ A+ బాస్మతి ధాన్యం",
          hi: "उत्कृष्ट गुणवत्ता वाला पुषा स्टीम A+ बासमती चावल",
          ur: "پریمیئم معیار کا پوشا سٹیم A+ باسمتی چاول",
          es: "Arroz Basmati Pusa Vapor A+ de alta calidad",
          fr: "Riz Basmati Pusa Vapeur A+ de haute qualité",
        },
        location: "Chhattisgarh",
      },
      {
        id: 5,
        title: {
          en: "1718 White Sella A+ Basmati",
          te: "1718 వైట్ సెల్లా A+ బాస్మతి",
          hi: "1718 व्हाइट सेला A+ बासमती",
          ur: "1718 وائٹ سیلا A+ باسمتی",
          es: "1718 Blanco Sella A+ Basmati",
          fr: "1718 Blanc Sella A+ Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "3000 MT",
        packing: "50kg PP Bags",
        price: "₹121/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "8.20+ MM",
            te: "8.20+ మిమీ",
            hi: "8.20+ मिमी",
            ur: "8.20+ ملی میٹر",
            es: "8.20+ MM",
            fr: "8.20+ MM",
          },
          moisture: {
            en: "11.8%",
            te: "11.8%",
            hi: "11.8%",
            ur: "11.8%",
            es: "11.8%",
            fr: "11.8%",
          },
          broken: {
            en: "Under 1%",
            te: "1% కింద",
            hi: "1% से कम",
            ur: "1% سے کم",
            es: "Menor al 1%",
            fr: "Moins de 1%",
          },
          kett: {
            en: "30-32",
            te: "30-32",
            hi: "30-32",
            ur: "30-32",
            es: "30-32",
            fr: "30-32",
          },
        },
        description: {
          en: "Premium quality 1718 White Sella A+ Basmati rice",
          te: "శ్రేష్ఠ నాణ్యత గల 1718 వైట్ సెల్లా A+ బాస్మతి ధాన్యం",
          hi: "उत्कृष्ट गुणवत्ता वाला 1718 व्हाइट सेला A+ बासमती चावल",
          ur: "پریمیئم معیار کا 1718 وائٹ سیلا A+ باسمتی چاول",
          es: "Arroz Basmati 1718 Blanco Sella A+ de alta calidad",
          fr: "Riz Basmati 1718 Blanc Sella A+ de haute qualité",
        },
        location: "Madhya Pradesh",
      },
    ],
    "non-basmati": [
      {
        id: 6,
        title: {
          en: "Sugandha Creamy Parboiled Non-Basmati",
          te: "సుగంధ క్రీమీ పార్బాయిల్డ్ నాన్-బాస్మతి",
          hi: "सुगंधा क्रीमी परबॉइल्ड नॉन-बासमती",
          ur: "سuganذا کریمی پاربوائلڈ نان باسمتی",
          es: "Sugandha Cremoso Parbolizado No Basmati",
          fr: "Sugandha Crémeux Parboiled Non Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "5000 MT",
        packing: "50kg PP Bags",
        price: "₹108/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "6.50+ MM",
            te: "6.50+ మిమీ",
            hi: "6.50+ मिमी",
            ur: "6.50+ ملی میٹر",
            es: "6.50+ MM",
            fr: "6.50+ MM",
          },
          moisture: {
            en: "13.0%",
            te: "13.0%",
            hi: "13.0%",
            ur: "13.0%",
            es: "13.0%",
            fr: "13.0%",
          },
          broken: {
            en: "Under 2%",
            te: "2% కింద",
            hi: "2% से कम",
            ur: "2% سے کم",
            es: "Menor al 2%",
            fr: "Moins de 2%",
          },
          kett: {
            en: "25-27",
            te: "25-27",
            hi: "25-27",
            ur: "25-27",
            es: "25-27",
            fr: "25-27",
          },
        },
        description: {
          en: "High-quality Sugandha Creamy Parboiled Non-Basmati rice",
          te: "ఉత్తమ నాణ్యత గల సుగంధ క్రీమీ పార్బాయిల్డ్ నాన్-బాస్మతి ధాన్యం",
          hi: "उच्च गुणवत्ता वाला सुगंधा क्रीमी परबॉइल्ड नॉन-बासमती चावल",
          ur: "ہائی کوالٹی سوگانذا کریمی پاربوائلڈ نان باسمتی چاول",
          es: "Arroz No Basmati Sugandha Cremoso Parbolizado de alta calidad",
          fr: "Riz Non Basmati Sugandha Crémeux Parboiled de haute qualité",
        },
        location: "Chhattisgarh",
      },
      {
        id: 7,
        title: {
          en: "Sharbati Golden Non-Basmati",
          te: "శర్భతి గోల్డెన్ నాన్-బాస్మతి",
          hi: "शरबती गोल्डन नॉन-बासमती",
          ur: "شربتی گولڈن نان باسمتی",
          es: "Sharbati Dorado No Basmati",
          fr: "Sharbati Doré Non Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "5000 MT",
        packing: "50kg PP Bags",
        price: "₹150/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "6.50+ MM",
            te: "6.50+ మిమీ",
            hi: "6.50+ मिमी",
            ur: "6.50+ ملی میٹر",
            es: "6.50+ MM",
            fr: "6.50+ MM",
          },
          moisture: {
            en: "13.0%",
            te: "13.0%",
            hi: "13.0%",
            ur: "13.0%",
            es: "13.0%",
            fr: "13.0%",
          },
          broken: {
            en: "Under 2%",
            te: "2% కింద",
            hi: "2% से कम",
            ur: "2% سے کم",
            es: "Menor al 2%",
            fr: "Moins de 2%",
          },
          kett: {
            en: "25-27",
            te: "25-27",
            hi: "25-27",
            ur: "25-27",
            es: "25-27",
            fr: "25-27",
          },
        },
        description: {
          en: "High-quality Sharbati Golden Non-Basmati rice",
          te: "ఉత్తమ నాణ్యత గల శర్భతి గోల్డెన్ నాన్-బాస్మతి ధాన్యం",
          hi: "उच्च गुणवत्ता वाला शरबती गोल्डन नॉन-बासमती चावल",
          ur: "ہائی کوالٹی شربتی گولڈن نان باسمتی چاول",
          es: "Arroz No Basmati Sharbati Dorado de alta calidad",
          fr: "Riz Non Basmati Sharbati Doré de haute qualité",
        },
        location: "Chhattisgarh",
      },
      {
        id: 8,
        title: {
          en: "PR-11/14 Creamy Parboiled Non-Basmati",
          te: "PR-11/14 క్రీమీ పార్బాయిల్డ్ నాన్-బాస్మతి",
          hi: "PR-11/14 क्रीमी परबॉइल्ड नॉन-बासमती",
          ur: "PR-11/14 کریمی پاربوائلڈ نان باسمتی",
          es: "PR-11/14 Cremoso Parbolizado No Basmati",
          fr: "PR-11/14 Crémeux Parboiled Non Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "5000 MT",
        packing: "50kg PP Bags",
        price: "₹149/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "6.60+ MM",
            te: "6.60+ మిమీ",
            hi: "6.60+ मिमी",
            ur: "6.60+ ملی میٹر",
            es: "6.60+ MM",
            fr: "6.60+ MM",
          },
          moisture: {
            en: "13.0%",
            te: "13.0%",
            hi: "13.0%",
            ur: "13.0%",
            es: "13.0%",
            fr: "13.0%",
          },
          broken: {
            en: "Under 2%",
            te: "2% కింద",
            hi: "2% से कम",
            ur: "2% سے کم",
            es: "Menor al 2%",
            fr: "Moins de 2%",
          },
          kett: {
            en: "25-27",
            te: "25-27",
            hi: "25-27",
            ur: "25-27",
            es: "25-27",
            fr: "25-27",
          },
        },
        description: {
          en: "High-quality PR-11/14 Creamy Parboiled Non-Basmati rice",
          te: "ఉత్తమ నాణ్యత గల PR-11/14 క్రీమీ పార్బాయిల్డ్ నాన్-బాస్మతి ధాన్యం",
          hi: "उच्च गुणवत्ता वाला PR-11/14 क्रीमी परबॉइल्ड नॉन-बासमती चावल",
          ur: "ہائی کوالٹی PR-11/14 کریمی پاربوائلڈ نان باسمتی چاول",
          es: "Arroz No Basmati PR-11/14 Cremoso Parbolizado de alta calidad",
          fr: "Riz Non Basmati PR-11/14 Crémeux Parboiled de haute qualité",
        },
        location: "West Bengal",
      },
      {
        id: 9,
        title: {
          en: "Sona Masoori Steam Non-Basmati",
          te: "సోనా మసూరి స్టీమ్ నాన్-బాస్మతి",
          hi: "सोना मसूरी स्टीम नॉन-बासमती",
          ur: "سونہ مسوری سٹیم نان باسمتی",
          es: "Sona Masoori Vapor No Basmati",
          fr: "Sona Masoori Vapeur Non Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "10000 MT",
        packing: "50kg PP Bags",
        price: "₹134/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "5.00+ MM",
            te: "5.00+ మిమీ",
            hi: "5.00+ मिमी",
            ur: "5.00+ ملی میٹر",
            es: "5.00+ MM",
            fr: "5.00+ MM",
          },
          moisture: {
            en: "13.0%",
            te: "13.0%",
            hi: "13.0%",
            ur: "13.0%",
            es: "13.0%",
            fr: "13.0%",
          },
          broken: {
            en: "Under 2%",
            te: "2% కింద",
            hi: "2% से कम",
            ur: "2% سے کم",
            es: "Menor al 2%",
            fr: "Moins de 2%",
          },
          kett: {
            en: "24-26",
            te: "24-26",
            hi: "24-26",
            ur: "24-26",
            es: "24-26",
            fr: "24-26",
          },
        },
        description: {
          en: "High-quality Sona Masoori Steam Non-Basmati rice",
          te: "ఉత్తమ నాణ్యత గల సోనా మసూరి స్టీమ్ నాన్-బాస్మతి ధాన్యం",
          hi: "उच्च गुणवत्ता वाला सोना मसूरी स्टीम नॉन-बासमती चावल",
          ur: "ہائی کوالٹی سونہ مسوری سٹیم نان باسمتی چاول",
          es: "Arroz No Basmati Sona Masoori Vapor de alta calidad",
          fr: "Riz Non Basmati Sona Masoori Vapeur de haute qualité",
        },
        location: "West Bengal",
      },
      {
        id: 10,
        title: {
          en: "Kalizeera Steam Non-Basmati",
          te: "కలిజీరా స్టీమ్ నాన్-బాస్మతి",
          hi: "कलिजीरा स्टीम नॉन-बासमती",
          ur: "کلیجیرا سٹیم نان باسمتی",
          es: "Kalizeera Vapor No Basmati",
          fr: "Kalizeera Vapeur Non Basmati",
        },
        validity: "30/11/2025",
        status: "active",
        quantity: "10000 MT",
        packing: "50kg PP Bags",
        price: "₹137/kg FOB Mundra",
        posted: "05-10-2025 | 12:51 PM",
        specs: {
          length: {
            en: "5.50+ MM",
            te: "5.50+ మిమీ",
            hi: "5.50+ मिमी",
            ur: "5.50+ ملی میٹر",
            es: "5.50+ MM",
            fr: "5.50+ MM",
          },
          moisture: {
            en: "13.0%",
            te: "13.0%",
            hi: "13.0%",
            ur: "13.0%",
            es: "13.0%",
            fr: "13.0%",
          },
          broken: {
            en: "Under 2%",
            te: "2% కింద",
            hi: "2% से कम",
            ur: "2% سے کم",
            es: "Menor al 2%",
            fr: "Moins de 2%",
          },
          kett: {
            en: "24-26",
            te: "24-26",
            hi: "24-26",
            ur: "24-26",
            es: "24-26",
            fr: "24-26",
          },
        },
        description: {
          en: "High-quality Kalizeera Steam Non-Basmati rice",
          te: "ఉత్తమ నాణ్యత గల కలిజీరా స్టీమ్ నాన్-బాస్మతి ధాన్యం",
          hi: "उच्च गुणवत्ता वाला कलिजीरा स्टीम नॉन-बासमती चावल",
          ur: "ہائی کوالٹی کلیجیرا سٹیم نان باسمتی چاول",
          es: "Arroz No Basmati Kalizeera Vapor de alta calidad",
          fr: "Riz Non Basmati Kalizeera Vapeur de haute qualité",
        },
        location: "West Bengal",
      },
    ],
  };

  const [category, setCategory] = useState("basmati");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const { t, currentLang, setLanguage } = useLanguage(); // Verified destructuring

  const filteredProducts = products[category].filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  const handleShare = (product) => {
    const message = `Check out this rice product: ${product.title[currentLang] || product.title.en}\nPrice: ${product.price}\nQuantity: ${product.quantity}\nLocation: ${product.location}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="tw-min-h-screen tw-w-full tw-p-2 sm:tw-p-6">
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      {/* Language Selector */}
      <div className="tw-mb-4 tw-flex tw-justify-end">
        <select
          value={currentLang}
          onChange={(e) => setLanguage(e.target.value)}
          className="tw-bg-gray-900 tw-text-yellow-400 tw-border tw-border-yellow-600 tw-rounded tw-p-2 tw-transition-all tw-duration-300 hover:tw-bg-gray-800"
        >
          <option value="en">English</option>
          <option value="te">Telugu</option>
          <option value="hi">Hindi</option>
          <option value="ur">Urdu</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* Categories */}
      <div className="tw-flex tw-border-b tw-border-yellow-600 tw-mb-4">
        {["basmati", "non-basmati"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setSelected(null);
            }}
            className={`tw-px-4 sm:tw-px-6 tw-py-2 tw-font-semibold tw-border tw-border-yellow-600 tw-rounded-t-lg tw-mr-2 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105
              ${
                category === cat
                  ? "tw-bg-yellow-400 tw-text-black"
                  : "tw-bg-gray-900 tw-text-yellow-400 hover:tw-bg-gray-800 hover:tw-text-yellow-300"
              }`}
          >
            {t(cat === "basmati" ? "basmati_rice" : "non_basmati_rice")}
          </button>
        ))}
      </div>

      <div className="tw-grid md:tw-grid-cols-2 tw-gap-4 sm:tw-gap-6 tw-h-full">
        {/* Trade List */}
        <section className="tw-bg-gray-900 tw-shadow-lg tw-rounded-md tw-flex tw-flex-col">
          <div className="tw-bg-gradient-to-r tw-from-yellow-400 tw-to-yellow-600 tw-p-4 tw-flex tw-justify-between tw-items-center">
            <h2 className="tw-font-bold tw-text-black tw-text-base sm:tw-text-lg">
              {t("active_trade_listings")}
            </h2>
            <span className="tw-text-black">{filteredProducts.length} {t("items")}</span>
          </div>

          {/* Filters */}
          <div className="tw-flex tw-gap-2 tw-bg-gray-800 tw-p-3 tw-border-b tw-border-yellow-600">
            {["all", "active", "expired", "sold"].map((f) => (
              <button
                key={f}
                className={`tw-px-4 tw-py-1 tw-rounded-full tw-border tw-border-yellow-600 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105
                  ${
                    filter === f
                      ? "tw-bg-yellow-400 tw-text-black"
                      : "tw-bg-gray-900 tw-text-yellow-400 hover:tw-bg-gray-700 hover:tw-text-yellow-300"
                  }`}
                onClick={() => setFilter(f)}
              >
                {t(f.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="tw-max-h-[500px] tw-overflow-y-hidden no-scrollbar tw-flex-1">
            {filteredProducts.length === 0 ? (
              <div className="tw-text-center tw-p-6 tw-text-yellow-400">
                <span className="tw-text-3xl">📦</span>
                <p>{t("no_products_found")}</p>
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`tw-p-4 tw-border-b tw-border-yellow-600 tw-cursor-pointer tw-transition-all tw-duration-300 hover:tw-bg-gray-800 hover:tw-scale-105
                    ${selected?.id === p.id ? "tw-bg-yellow-900/20 tw-scale-105" : ""}`}
                >
                  <h3 className="tw-font-semibold tw-text-yellow-400 tw-text-base sm:tw-text-lg">{p.title[currentLang] || p.title.en}</h3>
                  <div className="tw-flex tw-justify-between tw-text-sm tw-text-yellow-400">
                    <span>{t("valid_till")}: {p.validity}</span>
                    <span className="tw-uppercase">{t(p.status)}</span>
                  </div>
                  <div className="tw-flex tw-justify-between tw-text-sm tw-text-yellow-400">
                    <span>{p.quantity}</span>
                    <span>{p.location}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Product Details */}
        <section className={`tw-bg-gray-900 tw-shadow-lg tw-rounded-md tw-p-4 tw-transition-all tw-duration-300 ${selected ? 'tw-opacity-100 tw-translate-y-0' : 'tw-opacity-50 tw-translate-y-2'} tw-flex tw-flex-col`}>
          {!selected ? (
            <div className="tw-text-center tw-text-yellow-400 tw-flex-1 tw-flex tw-items-center tw-justify-center">
              <div>
                <span className="tw-text-3xl">ℹ️</span>
                <p>{t("select_product_to_view")}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="tw-text-xl tw-font-bold tw-text-yellow-400">{selected.title[currentLang] || selected.title.en}</h2>
              <p className="tw-text-yellow-400">{selected.description[currentLang] || selected.description.en}</p>

              <div className="tw-bg-gray-800 tw-p-3 tw-my-3 tw-rounded tw-flex tw-items-center">
                <span className="tw-text-red-500 tw-mr-2">🕒</span>
                <span className="tw-text-yellow-400">{t("valid_till")}: {selected.validity}</span>
              </div>

              <div className="tw-bg-gradient-to-r tw-from-gray-800 tw-to-gray-700 tw-p-3 tw-rounded tw-mb-3">
                <span className="tw-text-yellow-400 tw-mr-2">🏷️</span>
                <span className="tw-font-semibold tw-text-yellow-400">{selected.price}</span>
                <p className="tw-text-sm tw-text-yellow-400">{t("minimum_order")}: {selected.quantity}</p>
              </div>

              <h3 className="tw-font-semibold tw-border-b tw-border-yellow-600 tw-mb-2 tw-text-yellow-400">
                {t("product_details")}
              </h3>
              <p className="tw-text-yellow-400">
                <strong>{t("packing")}:</strong> {selected.packing}
              </p>
              <p className="tw-text-yellow-400">
                <strong>{t("location")}:</strong> {selected.location}
              </p>
              <p className="tw-text-yellow-400">
                <strong>{t("posted")}:</strong> {selected.posted}
              </p>

              {/* Specs */}
              <h3 className="tw-font-semibold tw-border-b tw-border-yellow-600 tw-mt-4 tw-mb-2 tw-text-yellow-400">
                {t("specifications")}
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                {Object.entries(selected.specs).map(([key, val]) => (
                  <div key={key} className="tw-bg-gray-800 tw-p-2 tw-rounded">
                    <p className="tw-text-sm tw-text-yellow-400">{t(key)}</p>
                    <p className="tw-font-semibold tw-text-yellow-400">{val[currentLang] || val.en}</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="tw-grid tw-grid-cols-2 tw-gap-3 tw-mt-4">
                <a
                  href="tel:+919876543210"
                  className="tw-bg-yellow-400 tw-hover:bg-yellow-300 tw-text-black tw-py-2 tw-rounded tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 tw-text-center"
                >
                  {t("call_now")}
                </a>
                <button
                  onClick={() => handleShare(selected)}
                  className="tw-bg-yellow-400 tw-hover:bg-yellow-300 tw-text-black tw-py-2 tw-rounded tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105"
                >
                  {t("share_on_whatsapp")}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}