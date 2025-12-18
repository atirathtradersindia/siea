import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, set } from "firebase/database";
import { useLanguage } from "../contexts/LanguageContext";

// Country phone digit limits
const countryDigitLimits = {
  "India": 10,
  "USA/Canada": 10,
  "UK": 10,
  "UAE": 9,
  "Saudi Arabia": 9,
  "Pakistan": 10,
  "Bangladesh": 10,
  "Sri Lanka": 9,
  "Nepal": 10,
  "Afghanistan": 9,
  "Other": 15
};

// Common countries for dropdown
const countries = [
  "India",
  "USA/Canada",
  "UK", 
  "UAE",
  "Saudi Arabia",
  "Pakistan",
  "Bangladesh",
  "Sri Lanka",
  "Nepal",
  "Afghanistan",
  "Other"
];

export default function Feedback() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India", // Default country
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [maxPhoneDigits, setMaxPhoneDigits] = useState(10); // Default for India

  // Update max digits when country changes
  useEffect(() => {
    const limit = countryDigitLimits[formData.country] || 15;
    setMaxPhoneDigits(limit);
    
    // Trim phone if it exceeds new limit
    if (formData.phone.replace(/\D/g, "").length > limit) {
      const digits = formData.phone.replace(/\D/g, "").slice(0, limit);
      setFormData(prev => ({
        ...prev,
        phone: digits
      }));
    }
  }, [formData.country]);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Remove all non-digits
      const digits = value.replace(/\D/g, "");
      
      // Limit to max digits for selected country
      if (digits.length <= maxPhoneDigits) {
        setFormData({ ...formData, [name]: digits });
      }
    } else if (name === "country") {
      // Update country and keep current phone (it will be trimmed if needed)
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Validate phone length
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > maxPhoneDigits) {
      alert(`Please enter a valid phone number for ${formData.country} (${maxPhoneDigits} digits)`);
      setLoading(false);
      return;
    }

    try {
      const feedbackRef = push(ref(db, "feedbacks"));
      await set(feedbackRef, {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        country: "India", 
        requirements: "" 
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Error saving feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="contact"
      className="tw-min-h-screen tw-w-full tw-py-12 sm:tw-py-16 tw-px-4 sm:tw-px-6 tw-flex tw-flex-col tw-justify-center"
    >
      {/* Header */}
      <div className="tw-text-center tw-mb-10 sm:tw-mb-12">
        <h1 className="tw-text-4xl sm:tw-text-5xl tw-font-extrabold tw-text-yellow-400 tw-tracking-tight">
          {t("feedback")}
        </h1>
        <p className="tw-mt-3 tw-text-lg sm:tw-text-xl tw-text-yellow-300 tw-font-medium">
          {t("share_requirements")}
        </p>
      </div>

      {/* Form Card */}
      <div className="tw-max-w-4xl tw-mx-auto">
        <div className="tw-bg-black/60 tw-backdrop-blur-xl tw-p-8 sm:tw-p-10 tw-rounded-2xl tw-shadow-2xl tw-border tw-border-yellow-500/30">
          <form onSubmit={handleSubmit} className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
              {/* Name */}
              <div>
                <label className="tw-block tw-text-lg sm:tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2">
                  {t("your_name")}
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="tw-w-full tw-px-5 tw-py-3 tw-bg-gray-900/80 tw-text-yellow-300 tw-placeholder-yellow-500/50 tw-border tw-border-yellow-600 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-medium tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-yellow-400 focus:tw-border-transparent"
                  placeholder={t("full_name_placeholder")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="tw-block tw-text-lg sm:tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="tw-w-full tw-px-5 tw-py-3 tw-bg-gray-900/80 tw-text-yellow-300 tw-placeholder-yellow-500/50 tw-border tw-border-yellow-600 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-medium tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-yellow-400 focus:tw-border-transparent"
                  placeholder={t("email_placeholder")}
                />
              </div>

              {/* Country Selection FIRST */}
              <div>
                <label className="tw-block tw-text-lg sm:tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2">
                  {t("destination_country")} *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="tw-w-full tw-px-5 tw-py-3 tw-bg-gray-900/80 tw-text-yellow-300 tw-border tw-border-yellow-600 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-medium tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-yellow-400 focus:tw-border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country} ({countryDigitLimits[country]} digits)
                    </option>
                  ))}
                </select>
                <div className="tw-mt-1 tw-text-sm tw-text-yellow-400">
                  Selected: {formData.country} - Max {maxPhoneDigits} digits
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="tw-block tw-text-lg sm:tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2">
                  {t("phone_whatsapp")} *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={maxPhoneDigits}
                  pattern="[0-9]*"
                  className="tw-w-full tw-px-5 tw-py-3 tw-bg-gray-900/80 tw-text-yellow-300 tw-placeholder-yellow-500/50 tw-border tw-border-yellow-600 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-medium tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-yellow-400 focus:tw-border-transparent"
                  placeholder={`Enter ${maxPhoneDigits} digit phone`}
                  title={`Enter ${maxPhoneDigits} digit phone number for ${formData.country}`}
                />
                <div className="tw-mt-1 tw-text-sm tw-text-yellow-400">
                  Enter {formData.phone.length}/{maxPhoneDigits} digits
                </div>
              </div>

              {/* Requirements */}
              <div className="md:tw-col-span-2">
                <label className="tw-block tw-text-lg sm:tw-text-xl tw-font-bold tw-text-yellow-400 tw-mb-2">
                  {t("requirements")}
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={5}
                  className="tw-w-full tw-px-5 tw-py-3 tw-bg-gray-900/80 tw-text-yellow-300 tw-placeholder-yellow500/50 tw-border tw-border-yellow-600 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-medium tw-resize-none tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-yellow-400 focus:tw-border-transparent"
                  placeholder={t("requirements_placeholder")}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="tw-flex tw-justify-center sm:tw-justify-start">
              <button
                type="submit"
                disabled={loading || formData.phone.length < 10}
                className="tw-px-8 tw-py-3 tw-bg-yellow-400 tw-text-black tw-font-bold tw-text-lg sm:tw-text-xl tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-bg-yellow-300 hover:tw-scale-105 hover:tw-shadow-yellow-400/50 disabled:tw-opacity-70 disabled:tw-cursor-not-allowed disabled:tw-scale-100"
              >
                {loading ? (
                  <span className="tw-flex tw-items-center tw-gap-2">
                    <svg className="tw-w-5 tw-h-5 tw-animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {t("submitting")}
                  </span>
                ) : (
                  t("submit_feedback")
                )}
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="tw-mt-6 tw-p-4 tw-bg-green-900/50 tw-border tw-border-green-500 tw-rounded-xl tw-text-green-300 tw-text-center tw-text-lg tw-font-semibold tw-animate-pulse">
                {t("feedback_success")}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}