import React from "react";
import { Smartphone } from "lucide-react";

const ChatsSettings = () => {
  return (
    <div className="w-[400px] text-black dark:text-white rounded-xl shadow-lg p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Chats</h2>
      </div>

      {/* Chat History */}
      <div>
        <h3 className="text-base  mb-2">Chat history</h3>
        <div className="flex items-center gap-2 text-black dark:text-white text-sm mb-4">
          <Smartphone size={16} />
          <span>Synced with your phone</span>
        </div>

        {/* Archive Button */}
        <button className="w-[50%] bg-black dark:bg-gray-300 text-white dark:text-black text-sm  rounded-md py-2 mb-2 mt-6 transition">
          Archive all chats
        </button>
        <p className="text-base  mb-5">
          You will still receive new messages from archived chats
        </p>
      </div>
    </div>
  );
};

export default ChatsSettings;
