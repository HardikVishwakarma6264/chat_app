import { Search, ArrowLeft } from "lucide-react";
import React, { useEffect, useRef } from "react";

const Settingjipanel = ({ onBack, isMobile }) => {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="
        flex flex-col
        h-full
        w-full
       
       
        overflow-y-auto
      "
    >
      {/* 🔹 Header */}
      <div
        className="
          flex items-center 
          gap-3 
          px-4 
          py-3 
         
          
          min-h-[55px]
         
        "
      >
        {/* BACK ARROW (mobile only) */}
        {isMobile && (
          <ArrowLeft size={22} className=" cursor-pointer" onClick={onBack} />
        )}

        <h2 className="text-2xl font-semibold">Call's</h2>
      </div>

      {/* 🔹 Search Box (same width as chat search bar) */}
      <div className="px-3 py-2 ">
        <div className="relative w-full">
          <input
            type="text"
            ref={inputRef}
            placeholder="Search or start a new chat"
            className="
              w-full
              py-3 
              pl-10 
              pr-4 
              rounded-lg 
            text-black
              text-sm
              placeholder-gray-400
              outline-none
              border-b border-white/40
              focus:border-cyan-400
              transition-all
            "
          />

          <Search
            size={16}
            className="
              absolute left-3 
              top-1/2 -translate-y-1/2 
              text-black
            "
          />
        </div>
      </div>

      {/* 🔹 Body (centered text) */}
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-gray-400 text-sm">Work in progress, wait...</p>
      </div>
    </div>
  );
};

export default Settingjipanel;
