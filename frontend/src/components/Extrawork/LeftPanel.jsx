import React from "react";
import {
  User,
  Settings,
  MessageSquare,
  Bell,
  Video,
  Palette,
  HardDrive,
  Keyboard,
  Info,
  X,
} from "lucide-react";

const menuItems = [
  { id: "General", label: "General", icon: <Settings size={18} /> },
  { id: "Account", label: "Account", icon: <User size={18} /> },
  { id: "Chats", label: "Chats", icon: <MessageSquare size={18} /> },
  { id: "Video & voice", label: "Video & voice", icon: <Video size={18} /> },
  { id: "Notifications", label: "Notifications", icon: <Bell size={18} /> },
  {
    id: "Personalization",
    label: "Personalization",
    icon: <Palette size={18} />,
  },
  { id: "Storage", label: "Storage", icon: <HardDrive size={18} /> },
  { id: "Shortcuts", label: "Shortcuts", icon: <Keyboard size={18} /> },
  { id: "Help", label: "Help", icon: <Info size={18} /> },
];

const LeftPanel = ({ activeTab, setActiveTab, isMobile, onClose }) => {
  return (
    <div
      className={`${isMobile ? "w-[180px]" : "w-[33%]"}
      flex flex-col justify-between h-full border-r border-black dark:border-white md:border-r-0
      
      bg-gray-100 text-black 
      dark:bg-black dark:text-white 
      transition-colors duration-300`}
    >

{/* 🔴 MOBILE CLOSE BUTTON */}
{isMobile && (
  <div className="flex justify-end px-1 ">
    <button
      onClick={onClose}
      className="
        p-1 rounded-full
        hover:bg-gray-300 dark:hover:bg-gray-700
        transition
      "
    >
      <X size={22} />
    </button>
  </div>
)}


      {/* Top Section */}
      <div className="flex flex-col  md:mt-3 md:space-y-[5px]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group relative flex items-center gap-3 px-5  py-2.5 text-[15px] rounded-md font-medium tracking-wide transition-all duration-300
              ${
                activeTab === item.id
                  ? "bg-[#291f1f] dark:bg-gray-700 text-white "
                  : "dark:hover:bg-gray-800 hover:bg-gray-700 hover:text-white "
              }`}
          >
            {/* Active indicator (bar) */}
            <span
              className={`absolute left-0 top-0 h-full w-[3px] rounded-r-md transition-all duration-300 ${
                activeTab === item.id ? "bg-cyan-500 opacity-100" : "opacity-0"
              }`}
            ></span>

            <span
              className={`transition-transform duration-300 ${
                activeTab === item.id
                  ? "scale-110 text-cyan-400"
                  : "group-hover:text-cyan-400"
              }`}
            >
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Profile Button */}
      <div className="md:p-4  ">
        <button
          onClick={() => setActiveTab("Profile")}
          className={`group relative flex items-center gap-3 px-5 py-2.5 w-full rounded-md text-[15px] font-medium tracking-wide transition-all duration-300
            ${
              activeTab === "Profile"
                ? "bg-[#181818] dark:bg-gray-700 text-white "
                : "dark:hover:bg-gray-800 hover:text-white hover:bg-gray-700 "
            }`}
        >
          <span
            className={`absolute left-0 top-0 h-full w-[3px] rounded-r-md transition-all duration-300 ${
              activeTab === "Profile" ? "bg-cyan-500 opacity-100" : "opacity-0"
            }`}
          ></span>

          <span
            className={`transition-transform duration-300 ${
              activeTab === "Profile"
                ? "scale-110 text-cyan-400"
                : "group-hover:text-cyan-400"
            }`}
          >
            <User size={18} />
          </span>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;
