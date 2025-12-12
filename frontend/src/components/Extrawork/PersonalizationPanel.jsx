import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon, Palette, ChevronDown } from "lucide-react";

const chatWallpapers = [
  "linear-gradient(135deg, #000000, #1a1a1a)",
  "linear-gradient(135deg, #ffffff, #f2f2f2)",
  "linear-gradient(135deg, #1f1c2c, #928dab)",
  "linear-gradient(135deg, #232526, #414345)",
  "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
  "linear-gradient(135deg, #2b5876, #4e4376)",
  "linear-gradient(135deg, #134e5e, #71b280)",
  "linear-gradient(135deg, #373b44, #4286f4)",
  "linear-gradient(135deg, #8360c3, #2ebf91)",
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  "linear-gradient(135deg, #4568dc, #b06ab3)",
  "linear-gradient(135deg, #c33764, #1d2671)",
  "linear-gradient(135deg, #141e30, #243b55)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
  "linear-gradient(135deg, #1e3c72, #2a5298)",
  "linear-gradient(135deg, #4b79a1, #283e51)",
  "linear-gradient(135deg, #00416a, #e4e5e6)",
  "linear-gradient(135deg, #42275a, #734b6d)",

  "linear-gradient(135deg, #00c6ff, #0072ff)", // Ocean Blue Flow
  "linear-gradient(135deg, #fc466b, #3f5efb)", // Pink → Blue               // Warm Golden Wave
];

const PersonalizationPanel = ({ onWallpaperChange, onThemeChange }) => {
  // const [selectedTheme, setSelectedTheme] = useState("system");
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem("appTheme") ?? "dark";
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // useEffect(() => {
  //   document.documentElement.classList.toggle("dark", selectedTheme === "dark");
  // }, [selectedTheme]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedColor, setSelectedColor] = useState(() => {
    return localStorage.getItem("chatWallpaper") ?? chatWallpapers[0];
  });

  useEffect(() => {
    localStorage.setItem("chatWallpaper", selectedColor);
    onWallpaperChange?.(selectedColor);
  }, [selectedColor]);

  useEffect(() => {
    localStorage.setItem("appTheme", selectedTheme);
    onThemeChange?.(selectedTheme);
  }, [selectedTheme]);

  return (
    <div className="p-3 text-black dark:text-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-8">Personalization</h2>

      {/* Theme Section */}
      <div className="mb-6" ref={dropdownRef}>
        <p className="text-base mb-1"> Color theme</p>
        <div className="relative w-[50%]">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between w-full border dark:border-white border-black px-3 py-2 rounded-lg text-sm focus:outline-none transition"
          >
            <span className="flex items-center gap-2">
              {selectedTheme === "system" && <Palette size={16} />}
              {selectedTheme === "light" && <Sun size={16} />}
              {selectedTheme === "dark" && <Moon size={16} />}
              {selectedTheme === "system" && "System default"}
              {selectedTheme === "light" && "Light"}
              {selectedTheme === "dark" && "Dark"}
            </span>

            {/* 🔽 Arrow icon */}
            <ChevronDown
              size={18}
              className={`ml-2 transition-transform ${
                dropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full border border-black dark:border-white  bg-gray-500 text-white rounded-lg text-sm dark:bg-black">
              <div
                onClick={() => {
                  setSelectedTheme("light");
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 cursor-pointer border-b border-gray-600"
              >
                <Sun size={16} /> Light
              </div>
              <div
                onClick={() => {
                  setSelectedTheme("dark");
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 cursor-pointer"
              >
                <Moon size={16} /> Dark
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Wallpaper */}
      <div className="mt-6">
        <p className="text-xl mt-12 mb-2">Chat wallpaper</p>
        <div className="grid grid-cols-4 gap-2 mt-8">
          {chatWallpapers.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-14 h-14 rounded-md cursor-pointer transition border-4 ${
                selectedColor === color
                  ? "border-cyan-500"
                  : "border-transparent hover:border-white"
              }`}
              style={{ background: color }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPanel;
