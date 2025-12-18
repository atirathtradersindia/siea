import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="tw-w-full tw-max-w-7xl tw-mx-auto tw-py-6 tw-px-4 xs:tw-py-8 xs:tw-px-6 sm:tw-py-10 sm:tw-px-8 md:tw-py-12 md:tw-px-12 lg:tw-px-16 tw-bg-black/50">
      <h1 className="tw-text-lg xs:tw-text-xl sm:tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-400 tw-mb-3 sm:tw-mb-4 tw-text-center xs:tw-text-left">
        {t("about_title")}
      </h1>
      <p className="tw-text-xs xs:tw-text-sm sm:tw-text-base md:tw-text-lg tw-text-yellow-400 tw-leading-6 xs:tw-leading-7 sm:tw-leading-8 tw-text-justify">
        {t("about_description")}
      </p>
      <ul className="tw-list-disc tw-list-outside tw-ml-5 xs:tw-ml-6 sm:tw-ml-8 tw-mt-3 sm:tw-mt-4 tw-space-y-2">
        <li className="tw-text-2xs xs:tw-text-xs sm:tw-text-sm md:tw-text-base tw-text-yellow-400 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 hover:tw-text-yellow-300">
          {t("about_feature1")}
        </li>
        <li className="tw-text-2xs xs:tw-text-xs sm:tw-text-sm md:tw-text-base tw-text-yellow-400 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 hover:tw-text-yellow-300">
          {t("about_feature2")}
        </li>
        <li className="tw-text-2xs xs:tw-text-xs sm:tw-text-sm md:tw-text-base tw-text-yellow-400 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 hover:tw-text-yellow-300">
          {t("about_feature3")}
        </li>
      </ul>
      <style>
        {`
          ul > li::marker {
            color: #facc15; /* Tailwind yellow-400 */
          }
        `}
      </style>
    </div>
  );
}
