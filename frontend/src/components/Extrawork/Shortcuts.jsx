import React from "react";

const shortcuts = [
  { action: "New chat", keys: ["Ctrl", "N"] },
  { action: "Close chat", keys: ["Ctrl", "W"] },
  { action: "Close chat", keys: ["Ctrl", "F4"] },
  { action: "Close application", keys: ["Alt", "F4"] },
  { action: "New group", keys: ["Ctrl", "Shift", "N"] },
  { action: "Search", keys: ["Ctrl", "F"] },
  { action: "Search in chat", keys: ["Ctrl", "Shift", "F"] },
  { action: "Profile", keys: ["Ctrl", "P"] },
  { action: "Mute chat", keys: ["Ctrl", "Shift", "M"] },
  { action: "Toggle read", keys: ["Ctrl", "Shift", "U"] },
  { action: "Emoji panel", keys: ["Ctrl", "Shift", "E"] },
  { action: "Sticker panel", keys: ["Ctrl", "Shift", "S"] },
  { action: "Previous chat", keys: ["Ctrl", "Shift", "["] },
  { action: "Next chat", keys: ["Ctrl", "Shift", "]"] },
  { action: "Previous chat", keys: ["Ctrl", "Shift", "Tab"] },
  { action: "Next chat", keys: ["Ctrl", "Tab"] },
  { action: "Open chat", keys: ["Ctrl", "1..9"] },
  { action: "Edit last message", keys: ["Ctrl", "↑"] },
  { action: "Decrease text size", keys: ["Ctrl", "-"] },
  { action: "Increase text size", keys: ["Ctrl", "+"] },
  { action: "Reset text size", keys: ["Ctrl", "0"] },
];

const Shortcuts = () => {
  return (
    <div className="flex flex-col text-black dark:text-white items-start justify-start w-full h-full px-5 py-4  overflow-y-auto scrollbar-hide">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-6">Shortcuts</h2>

      {/* Subheader */}
      <p className="text-base  mb-6">Keyboard shortcuts</p>

      {/* Shortcut list */}
      <div className="w-full flex flex-col gap-4">
        {shortcuts.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full text-sm "
          >
            <span>{item.action}</span>
            <div className="flex gap-2">
              {item.keys.map((key, i) => (
                <span
                  key={i}
                  className="bg-[#2e2e2e] text-gray-300 px-2 py-1 rounded-md text-xs font-semibold border border-[#3a3a3a]"
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shortcuts;
