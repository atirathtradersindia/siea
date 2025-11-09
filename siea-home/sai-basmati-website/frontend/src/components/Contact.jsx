import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-16 tw-min-h-screen tw-flex tw-flex-col tw-justify-center">
      <h1 className="tw-text-5xl sm:tw-text-6xl tw-font-extrabold tw-text-center tw-text-yellow-400 tw-mb-12 tw-tracking-tight">
        {t("contact_us")}
      </h1>

      <div className="tw-max-w-2xl tw-mx-auto tw-bg-black/50 tw-backdrop-blur-lg tw-p-10 tw-rounded-2xl tw-shadow-2xl tw-text-white tw-border tw-border-yellow-500/20">
        <div className="tw-space-y-8">
          {/* Company Name */}
          <div>
            <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-3">
              {t("company_name")}
            </h2>
            <p className="tw-text-lg sm:tw-text-xl tw-font-medium tw-text-gray-200">
              {t("company_name_value")}
            </p>
          </div>

          {/* Phone */}
          <div>
            <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-3">
              {t("phone")}
            </h2>
            <p className="tw-text-lg sm:tw-text-xl tw-font-medium tw-text-gray-200">
              <a
                href="tel:+918595827184"
                className="tw-text-blue-300 hover:tw-text-blue-200 tw-underline tw-transition-all tw-duration-200"
              >
                +91 85958 27184
              </a>
            </p>
          </div>

          {/* Email */}
          <div>
            <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-3">
              {t("email")}
            </h2>
            <p className="tw-text-lg sm:tw-text-xl tw-font-medium tw-text-gray-200">
              <a
                href="mailto:saiimportexportagro0@gmail.com"
                className="tw-text-blue-300 hover:tw-text-blue-200 tw-underline tw-transition-all tw-duration-200"
              >
                saiimportexportagro0@gmail.com
              </a>
            </p>
          </div>

          {/* Address */}
          <div>
            <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-3">
              {t("address")}
            </h2>
            <p className="tw-text-lg sm:tw-text-xl tw-font-medium tw-text-gray-200 tw-leading-relaxed">
              {t("address_value")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}