import React, { useState } from "react";
import { Globe, Smile } from "lucide-react";

const SettingsPanel = () => {
  const [startAtLogin, setStartAtLogin] = useState(true);
  const [emojiReplace, setEmojiReplace] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [language, setLanguage] = useState("System default");

  const handleSelect = (value) => {
    setLanguage(value);
    setOpenDropdown(false);
  };

  return (
    <div className="  flex justify-center md:py-5 md:px-4 px-2 h-full overflow-hidden">
      <div className="w-[400px] space-y-8 overflow-y-auto no-scrollbar h-full ">
        {/* General Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold md:mb-3 mb-1 dark:text-white text-black ">
            General
          </h2>

          {/* Login */}
          <div className="flex items-center justify-between py-2">
            <span className=" text-base dark:text-white text-black">
              Start Samvaad at login
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={startAtLogin}
                onChange={() => setStartAtLogin(!startAtLogin)}
              />
              <div className="w-11 h-6   rounded-full peer peer-checked:bg-cyan-500 transition-all duration-300"></div>
              <span
                className={`absolute left-[2px] top-[2px] bg-white  w-5 h-5 rounded-full transition-transform duration-300 ${
                  startAtLogin ? "translate-x-5" : ""
                }`}
              ></span>
            </label>
          </div>

          {/* Language Dropdown */}
          <div className="mt-2 md:mt-5 relative">
            <p className="dark:text-white text-black  text-base mb-2">
              Language
            </p>

            <div
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center w-[60%] justify-between bg-white px-3 py-2 rounded-md border border-[#3a3a3a] cursor-pointer "
            >
              <div className="flex items-center gap-2 dark:text-black text-black text-sm">
                <Globe size={16} />
                <span>{language}</span>
              </div>
              <span
                className={`dark:text-black text-black text-xs transition-transform duration-200 ${
                  openDropdown ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {openDropdown && (
              <div className="absolute mt-1 w-[60%] bg-[black] dark:bg-white  rounded-md shadow-md z-10">
                <div
                  onClick={() => handleSelect("English")}
                  className="px-3 py-2 text-sm text-white dark:text-black hover:bg-gray-400 cursor-pointer rounded-md"
                >
                  English
                </div>
              </div>
            )}
          </div>

          {/* Typing */}
          <div className="mt-4 md:mt-7">
            <p className="dark:text-white text-black text-base font-medium">
              Typing
            </p>
            <p className="dark:text-white text-black text-sm mt-3">
              Change typing settings for autocorrect and misspelled highlight
              from <a className="text-cyan-400 hover:underline">Settings</a>.
            </p>
          </div>

          {/* Replace with emoji */}
          <div className="mt-4 md:mt-8 flex items-center justify-between">
            <div>
              <p className="dark:text-white text-black text-base font-medium">
                Replace text with emoji
              </p>
              <p className="dark:text-white text-black text-sm">
                Emoji will replace specific text as you type.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Smile size={18} />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emojiReplace}
                  onChange={() => setEmojiReplace(!emojiReplace)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-cyan-500 transition-all duration-300"></div>
                <span
                  className={`absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform duration-300 ${
                    emojiReplace ? "translate-x-5" : ""
                  }`}
                ></span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#333] mt-1 md:mt-6 pt-4">
            <p className="dark:text-white text-black text-xs">
              To log out of Samvaad on this computer go to your{" "}
              <a className="text-cyan-500 hover:underline">Profile</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
