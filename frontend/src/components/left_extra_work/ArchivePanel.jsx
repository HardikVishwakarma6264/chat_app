
import { Search, ArrowLeft } from "lucide-react";
import React, { useEffect, useRef } from "react";


const ArchivePanel = ({ onBack, isMobile }) => {
const inputRef = useRef(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);


  return (
    <div className="flex flex-col h-full w-full">

   


      {/* 🔹 Header */}
      <div className="px-4 py-3  flex items-center gap-3">

        {/* 🔥 BACK ARROW ONLY ON MOBILE */}
        {isMobile && (
          <ArrowLeft
            size={22}
            className=" cursor-pointer"
            onClick={onBack}
          />
        )}

        <h2 className="text-2xl font-semibold">Archived</h2>
      </div>

      {/* 🔹 Search Box */}
      <div className="px-3 py-2 ">
        <div className="relative">
          <input
            type="text"
            ref={inputRef}

            placeholder="Search or start a new chat"
            className="
              w-full py-3 pl-10 pr-4 rounded-lg
               text-sm text-black
              placeholder-gray-400 outline-none
              border-b border-white/50  focus:border-cyan-500
              transition-all
            "
          />

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
          />
        </div>
      </div>

      {/* 🔹 Empty State */}
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-gray-400 text-sm">No results</p>
      </div>
    </div>
  );
};

export default ArchivePanel;
