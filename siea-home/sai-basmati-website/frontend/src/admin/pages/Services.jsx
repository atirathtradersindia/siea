// src/admin/Services.jsx - RESPONSIVE
import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function Services() {
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    const servicesRef = ref(db, "services");
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setServices(data);
        const firstCategory = Object.keys(data)[0];
        setActiveTab(firstCategory || "");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = Object.keys(services);
  const activeItems = activeTab ? services[activeTab] || [] : [];
  const filteredItems = activeItems.filter((item) =>
    Object.values(item || {})
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="
      tw-text-center 
      tw-py-10 md:tw-py-20 
      tw-text-yellow-500 
      tw-text-xl md:tw-text-2xl
    ">
      Loading...
    </div>
  );

  return (
    <div className="
      tw-min-h-screen 
      tw-bg-black 
      tw-text-white 
      tw-py-4 sm:tw-py-6 md:tw-py-8 
      tw-px-3 sm:tw-px-4
      tw-overflow-x-hidden
    ">
      <div className="tw-max-w-7xl tw-mx-auto">

        {/* Title */}
        <h1 className="
          tw-text-center 
          tw-font-bold 
          tw-bg-gradient-to-r tw-from-yellow-600 tw-to-yellow-400 
          tw-bg-clip-text tw-text-transparent 
          tw-mb-3 sm:tw-mb-4
          tw-text-2xl sm:tw-text-3xl md:tw-text-4xl lg:tw-text-5xl
        ">
          Services Directory
        </h1>
        <p className="
          tw-text-center 
          tw-text-gray-400 
          tw-mb-6 sm:tw-mb-8 md:tw-mb-10
          tw-text-sm sm:tw-text-base
        ">
          Find trusted partners across all categories
        </p>

        {/* Search */}
        <div className="tw-max-w-2xl tw-mx-auto tw-mb-6 sm:tw-mb-8 md:tw-mb-10">
          <input
            type="text"
            placeholder="Search by name, city, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              tw-w-full 
              tw-px-4 sm:tw-px-6 md:tw-px-8 
              tw-py-3 sm:tw-py-4 md:tw-py-5
              tw-bg-gray-900 
              tw-border tw-border-yellow-600/30 
              tw-rounded-full 
              tw-text-white placeholder:tw-text-gray-500 
              focus:tw-outline-none focus:tw-ring-2 sm:focus:tw-ring-4 focus:tw-ring-yellow-500/50
              tw-text-sm sm:tw-text-base
            "
          />
        </div>

        {/* SINGLE LINE TABS — RESPONSIVE */}
        <div className="
          tw-flex 
          tw-flex-wrap 
          tw-justify-center 
          tw-gap-2 sm:tw-gap-3 
          tw-mb-6 sm:tw-mb-8 md:tw-mb-12
          tw-overflow-x-auto 
          tw-pb-2
          tw-max-w-full
        ">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`
                tw-transition-all tw-duration-300 
                tw-rounded-full 
                tw-font-medium 
                tw-border-2 
                tw-whitespace-nowrap
                tw-flex-shrink-0
                ${activeTab === category
                  ? "tw-bg-yellow-500 tw-text-black tw-border-yellow-500 tw-shadow-lg tw-shadow-yellow-500/50"
                  : "tw-bg-gray-900 tw-text-yellow-400 tw-border-yellow-600/40 hover:tw-bg-yellow-500/90 hover:tw-text-black"
                }
                tw-px-3 tw-py-1.5 tw-text-xs
                sm:tw-px-4 sm:tw-py-2 tw-text-sm
                md:tw-px-5 md:tw-py-2.5 md:tw-text-base
                lg:tw-px-6 lg:tw-py-3
              `}
            >
              {category} ({services[category].length})
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab && (
          <div className="tw-animate-fadeIn">
            <h2 className="
              tw-text-center 
              tw-font-bold 
              tw-text-yellow-500 
              tw-mb-3 sm:tw-mb-4
              tw-text-xl sm:tw-text-2xl md:tw-text-3xl lg:tw-text-4xl
            ">
              {activeTab}
            </h2>
            <p className="
              tw-text-center 
              tw-text-gray-400 
              tw-mb-6 sm:tw-mb-8 md:tw-mb-10
              tw-text-sm sm:tw-text-base
            ">
              {filteredItems.length} result{filteredItems.length !== 1 && "s"} found
            </p>

            {filteredItems.length > 0 ? (
              <div className="
                tw-grid 
                tw-gap-4 sm:tw-gap-6 
                tw-grid-cols-1 
                sm:tw-grid-cols-2 
                lg:tw-grid-cols-3 
                xl:tw-grid-cols-4
              ">
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="
                      tw-bg-gradient-to-br tw-from-gray-900 tw-to-gray-800 
                      tw-rounded-xl sm:tw-rounded-2xl 
                      tw-p-4 sm:tw-p-6
                      tw-border tw-border-yellow-600/20 
                      hover:tw-border-yellow-500 
                      hover:tw-scale-105 
                      tw-transition-all tw-duration-300 
                      tw-shadow-lg
                      tw-h-full
                    "
                  >
                    <div className="tw-flex tw-justify-between tw-items-start tw-mb-3 sm:tw-mb-4">
                      <span className="
                        tw-text-xs 
                        tw-bg-yellow-500 tw-text-black 
                        tw-font-bold 
                        tw-px-2 sm:tw-px-3 
                        tw-py-1 
                        tw-rounded-full
                      ">
                        #{item.serialNo || "N/A"}
                      </span>
                      <span className="
                        tw-text-xs 
                        tw-text-yellow-400 
                        tw-bg-black/50 
                        tw-px-2 sm:tw-px-3 
                        tw-py-1 
                        tw-rounded-full
                      ">
                        {item.product || "Service"}
                      </span>
                    </div>

                    <h3 className="
                      tw-text-lg sm:tw-text-xl md:tw-text-2xl 
                      tw-font-bold 
                      tw-text-yellow-400 
                      tw-mb-3
                      tw-break-words
                    ">
                      {item.partyName}
                    </h3>

                    <div className="tw-space-y-2 tw-text-sm sm:tw-text-base">
                      {item.contactPerson && (
                        <p className="tw-text-gray-300">
                          <span className="tw-text-gray-400">Contact:</span> {item.contactPerson}
                        </p>
                      )}
                      {item.address && (
                        <p className="
                          tw-text-gray-400 
                          tw-text-xs sm:tw-text-sm
                          tw-break-words
                          tw-line-clamp-2
                        ">
                          {item.address}
                        </p>
                      )}
                      {item.email && item.email !== "N/A" && (
                        <a
                          href={`mailto:${item.email}`}
                          className="
                            tw-block 
                            tw-text-blue-400 
                            hover:tw-underline
                            tw-break-words
                            tw-text-sm sm:tw-text-base
                          "
                        >
                          {item.email}
                        </a>
                      )}
                      {item.contactNo && item.contactNo !== "N/A" && (
                        <a
                          href={`tel:${String(item.contactNo).replace(/[^0-9+]/g, "")}`}
                          className="
                          tw-block 
                          tw-text-green-400 
                          tw-font-semibold
                          tw-text-sm sm:tw-text-base
                        "
                        >
                          {item.contactNo}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="
                tw-text-center 
                tw-py-10 sm:tw-py-16 md:tw-py-20 
                tw-text-lg sm:tw-text-xl md:tw-text-2xl 
                tw-text-gray-500
              ">
                No results found
              </div>
            )}
          </div>
        )}

        {/* Responsive Spacing for Mobile */}
        <div className="tw-h-4 sm:tw-h-6"></div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tw-animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        
        /* Custom line clamp for better text truncation */
        .tw-line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}