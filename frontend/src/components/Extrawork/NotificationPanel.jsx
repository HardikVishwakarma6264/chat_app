import { useEffect, useState } from "react";

const NotificationSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("notificationSettings");
    return saved
      ? JSON.parse(saved)
      : {
          messages: true,
          calls: false,
          reactions: true,
          statusReactions: false,
          textPreview: true,
          mediaPreview: false,
        };
  });

  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderToggle = (label, description, key) => (
    <div className="flex justify-between items-center py-2">
      <div>
        <p className="text-sm ">{label}</p>
        {description && <p className="text-xs  mt-1">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings[key]}
          onChange={() => toggleSetting(key)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-cyan-500 transition-colors duration-200"></div>
        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-transform duration-200"></div>
      </label>
    </div>
  );

  return (
    <div className="  text-black dark:text-white rounded-xl p-2  md:p-6 space-y-2 mb-8 md:mb-0">
      <p className="font-semibold text-xl md:text-2xl">Notification</p>
      {renderToggle("Messages", null, "messages")}
      {renderToggle("Calls", null, "calls")}

      <div className="border-t border-gray-700 my-3" />

      {renderToggle(
        "Reactions",
        "Show notifications for reactions to messages you send",
        "reactions"
      )}
      {renderToggle(
        "Call reactions",
        "Show notifications when you get likes on a call",
        "statusReactions"
      )}

      <div className="border-t border-gray-700 my-3" />

      {renderToggle(
        "Text preview",
        "Show message preview text inside new message notifications",
        "textPreview"
      )}
      {renderToggle(
        "Media preview",
        "Show media preview images inside new message notifications",
        "mediaPreview"
      )}
    </div>
  );
};

export default NotificationSettings;
