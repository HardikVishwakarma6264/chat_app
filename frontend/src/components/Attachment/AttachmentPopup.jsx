import React, { useEffect, useRef, useState } from "react";
import { Image, Camera, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CameraCapture from "./CameraCapture"; // ✅ import new component

const AttachmentPopup = ({ onClose, onSelect }) => {
  const popupRef = useRef(null);
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false); // ✅ new state

  useEffect(() => {
    if (showCamera) return; // ⭐ Camera open → DO NOT close popup

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, showCamera]);

  const handleFileSelect = (e, type) => {
    const files = e.target.files;
    if (files?.length > 0) {
      onSelect(type, files);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute bottom-[73px] left-14 bg-white dark:bg-black rounded-lg shadow-lg py-2 w-48 z-50 border border-[#2a3942]"
        >
          <div
            onClick={() => photoInputRef.current.click()}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-800 cursor-pointer  "
          >
            <Image size={18} className="text-cyan-500" />
            <span className="text-sm">Photos & Videos</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              ref={photoInputRef}
              className="hidden"
              onChange={(e) => handleFileSelect(e, "media")}
            />
          </div>

          {/* ✅ CAMERA OPTION */}
          <div
            onClick={() => {
              setShowCamera(true);
            }}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-800 cursor-pointer "
          >
            <Camera size={18} className="text-cyan-500" />
            <span className="text-sm">Camera</span>
          </div>

          <div
            onClick={() => docInputRef.current.click()}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-800 cursor-pointer "
          >
            <FileText size={18} className="text-cyan-500" />
            <span className="text-sm">Document</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
              multiple
              ref={docInputRef}
              className="hidden"
              onChange={(e) => handleFileSelect(e, "document")}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ✅ Show camera popup */}
      {showCamera && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onCapture={(file) => {
            console.log("📩 CameraCapture: captured file =>", file);
            onSelect("camera", [file]);
          }}
        />
      )}
    </>
  );
};

export default AttachmentPopup;
