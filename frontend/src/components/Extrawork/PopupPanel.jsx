import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

const PopupPanel = ({
  isOpen,
  onClose,
  defaultTab = "Profile",
  setChatWallpaper,
  isMobile,
  onThemeChange,
}) => {
  const panelRef = useRef(null);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // 🟢 Update whenever popup opens or defaultTab changes
  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  // 🟢 Mobile me always Menu open hona chahiye
  useEffect(() => {
    if (isMobile) {
      setActiveTab("Menu");
    } else {
      setActiveTab(defaultTab);
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isMobile || activeTab !== "Menu") return;

    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose(); // left panel close
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMobile, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={`
    fixed bottom-0 left-0 right-0 z-[9999]  text-white shadow-xl
    ${
      isMobile
        ? "h-[55vh] w-full rounded-t-2xl"
        : "h-[650px] w-[600px] rounded-t-2xl"
    }
  `}
        >
          {isMobile ? (
            <div ref={panelRef} className="h-full w-full">
              {activeTab === "Menu" ? (
                <LeftPanel
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isMobile={isMobile}
                />
              ) : (
                <RightPanel
                  activeTab={activeTab}
                  onClose={() => setActiveTab("Menu")}
                  onWallpaperChange={setChatWallpaper}
                  onThemeChange={onThemeChange}
                  isMobile={isMobile}
                />
              )}
            </div>
          ) : (
            <div className="flex h-full">
              <LeftPanel activeTab={activeTab} setActiveTab={setActiveTab} />
              <RightPanel
                activeTab={activeTab}
                onClose={onClose}
                onWallpaperChange={setChatWallpaper}
                onThemeChange={onThemeChange}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupPanel;
