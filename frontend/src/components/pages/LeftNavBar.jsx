import React, { useState } from "react";
import loo from "../images/logo-removebg-preview.png";
import PopupPanel from "../Extrawork/PopupPanel.jsx";
import {
  MessageSquare,
  Phone,
  Settings,
  Menu as MenuIcon,
  Archive,
} from "lucide-react";
import { useSelector } from "react-redux";

// 🔹 Reusable Icon Button Component
const NavItem = ({ Icon, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`relative flex items-center justify-center h-12 w-12 mx-auto my-3 cursor-pointer transition-all duration-200 ${
      isSelected
        ? " rounded-lg  shadow-[0_0_15px_#00a884]"
        : " rounded-lg hover:shadow-[0_0_15px_#00a88480]"
    }`}
  >
    {isSelected && (
      <div className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-500 rounded-l-md"></div>
    )}
    <Icon size={24} className="z-10" />
  </div>
);

const LeftNavBar = ({
  onSelectPanel,
  setChatWallpaper,
  isMenuOpen,
  setIsMenuOpen,
  isMobile,
  setTheme,
}) => {
  const [selected, setSelected] = useState("chats");
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState("Profile"); // 👈 NEW — control which tab opens first
  const { user } = useSelector((state) => state.auth);

  const handleMenuClick = () => setIsMenuOpen((prev) => !prev);

  const handleSelect = (panel) => {
    setSelected(panel);
    onSelectPanel(panel);
  };

  return (
    <>
      {/* Left NavBar */}
      {/* <div className="flex flex-col h-full justify-between bg-gray-100 dark:bg-[#1d1c1c]  z-50"> */}
      <div
  className="
    fixed md:relative
    left-0
    top-0 md:top-auto
    h-[100dvh] md:h-full
    w-14
    flex flex-col justify-between
    bg-gray-100 dark:bg-[#1d1c1c]
    z-50
  "
>


        {/* 🔹 Top Section */}
        <div className="">
          {/* <NavItem Icon={MenuIcon} onClick={handleMenuClick} /> */}

          <NavItem
            Icon={MessageSquare}
            isSelected={selected === "chats"}
            onClick={() => handleSelect("chats")}
          />
          <NavItem
            Icon={Phone}
            isSelected={selected === "calls"}
            onClick={() => handleSelect("calls")}
          />
          <NavItem
            Icon={Archive}
            isSelected={selected === "archive"}
            onClick={() => handleSelect("archive")}
          />
        </div>

        {/* 🔹 Bottom Section */}
        <div className="mb-3 flex flex-col items-center">
          {/* ⚙️ Settings opens popup → General tab by default */}
          <NavItem
            Icon={Settings}
            // isSelected={selected === "settings"}
            isSelected={false}
            onClick={() => {
              // setSelected("chats");
              setDefaultTab("General"); // 👈 open General tab
              setIsProfileOpen(true);
            }}
          />

          {/* 👤 Profile Avatar → opens popup → Profile tab by default */}
          <div
            onClick={() => {
              // setSelected("chats");
              setDefaultTab("Profile"); // 👈 open Profile tab
              setIsProfileOpen(true);
            }}
            className={`w-10 h-10 rounded-full mx-auto mt-3 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200  ${
              selected === "profile"
                ? "  shadow-[0_0_10px_#00a884]"
                : "  hover:shadow-[0_0_8px_#00a88480]"
            }`}
          >
            <img
              src={user?.image}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 🔹 Shared Popup Panel for Settings & Profile */}
          <PopupPanel
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            defaultTab={defaultTab}
            setChatWallpaper={setChatWallpaper}
            onThemeChange={setTheme}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Close sidebar when clicking outside */}
      {isMobile && isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        ></div>
      )}
    </>
  );
};

export default LeftNavBar;
