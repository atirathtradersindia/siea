import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PriceTable = ({ products, t, compact, goldText = false }) => {
  const { currentLang } = useLanguage();
  const translate = t || useLanguage().t;

  if (!products || !Array.isArray(products)) {
    return <div className={`tw-text-center tw-py-4 ${goldText ? 'tw-text-yellow-400' : 'tw-text-red-500'}`}>Error: No products data available.</div>;
  }

  return (
    <div className="tw-w-full tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-overflow-hidden">
      <table className="tw-w-full tw-text-left">
        <thead>
          <tr className="tw-bg-gray-900">
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('variety')}</th>
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('grade')}</th>
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('price')}</th>
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('moq')}</th>
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('origin')}</th>
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('harvest')}</th>
            <th className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>{translate('stock')}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={index}
              className="tw-border-t tw-border-gray-700 tw-transition-all tw-duration-200 hover:tw-bg-gray-700"
            >
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.variety?.[currentLang] || product.variety?.en || product.product}
              </td>
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.grade?.[currentLang] || product.grade?.en || product.specification}
              </td>
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.price_inr ? `${product.price_inr} INR` : product.price}
              </td>
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.moq || '-'}
              </td>
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.origin?.[currentLang] || product.origin?.en || '-'}
              </td>
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.harvest || '-'}
              </td>
              <td className={`tw-px-4 tw-py-2 ${goldText ? 'tw-text-yellow-400' : 'tw-text-white'}`}>
                {product.stock?.[currentLang] || product.stock?.en || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;