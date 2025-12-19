import React, { useState, useEffect } from "react";

const StorageSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("storageSettings");
    return saved
      ? JSON.parse(saved)
      : {
          photos: true,
          audio: true,
          videos: true,
          documents: true,
        };
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    localStorage.setItem("storageSettings", JSON.stringify(settings));
  }, [settings]);

  const items = [
    { key: "photos", label: "Photos" },
    { key: "audio", label: "Audio" },
    { key: "videos", label: "Videos" },
    { key: "documents", label: "Documents" },
  ];

  return (
    <div className=" text-black dark:text-white w-[320px] p-3 rounded-lg  font-sans">
      <h2 className="text-xl md:text-2xl font-semibold mb-5">Storage</h2>
      <p className="text-xl  mb-6 leading-5">
        Automatic downloads <br />
      </p>
      <p className="mb-8">
        Choose which media will be automatically downloaded from the messages
        you receive
      </p>

      <div className="flex flex-col gap-4">
        {items.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleSetting(key)}
            className="flex items-center justify-start gap-3 text-[15px] group"
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                settings[key]
                  ? "bg-cyan-600 border-cyan-600"
                  : "border-gray-600 bg-transparent"
              }`}
            >
              {settings[key] && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="white"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="  transition">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StorageSettings;
