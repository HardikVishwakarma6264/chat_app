import React from "react";
import ProfilePanel from "./ProfilePanel";
import HelpPanel from "./HelpPanel";
import Shortcuts from "./Shortcuts";
import StoragePanel from "./StoragePanel";
import PersonalizationPanel from "./PersonalizationPanel";
import NotificationPanel from "./NotificationPanel";
import ChatsPanel from "./ChatsPanel";
import AccountPanel from "./AccountPanel";
import GeneralPanel from "./GeneralPanel";
import Video_voicePanel from "./Video_voicePanel";

const RightPanel = ({
  activeTab,
  onClose,
  onWallpaperChange,
  onThemeChange,
  isMobile,
}) => {
  return (
    <div className="w-[71%] bg-gray-100 dark:bg-black h-full p-2  overflow-hidden dark:border-r dark:border-white border-black md:border-r-0">
      <div className="flex justify-between items-center mb-1">
        {/* Header if any */}
        {isMobile && (
          <button
            onClick={onClose}
            className=" mb-4 px-2 py-1 text-black dark:text-white rounded-md"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Scrollable content with hidden scrollbar */}
      <div className="h-full overflow-y-scroll scrollbar-hide pr-2">
        {activeTab === "Profile" && <ProfilePanel />}
        {activeTab === "Account" && <AccountPanel />}
        {activeTab === "Help" && <HelpPanel />}
        {activeTab === "Shortcuts" && <Shortcuts />}
        {activeTab === "Storage" && <StoragePanel />}
        {activeTab === "Personalization" && (
          <PersonalizationPanel
            onWallpaperChange={onWallpaperChange}
            onThemeChange={onThemeChange}
          />
        )}

        {activeTab === "Notifications" && <NotificationPanel />}
        {activeTab === "Chats" && <ChatsPanel />}
        {activeTab === "General" && <GeneralPanel />}
        {activeTab === "Video & voice" && (
          <Video_voicePanel key="video-voice" />
        )}
      </div>
    </div>
  );
};

export default RightPanel;
