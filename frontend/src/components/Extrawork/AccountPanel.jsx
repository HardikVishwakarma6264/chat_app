import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../slices/authSlice";
import { toast } from "react-hot-toast";
const WhatsAppPrivacySecurity = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = "samvaad.help@gmail.com";

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/auth/delete-account`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Clear Redux + LocalStorage
      dispatch(setToken(null));
      dispatch(setUser(null));
      localStorage.clear();

      toast.success("Account deleted successfully");

      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Failed to delete account");
    }
  };

  return (
    <div className=" dark:text-white text-black w-full min-h-full flex justify-center items-start">
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">
              Are you sure you want to delete your account?
            </h2>

            <p className="text-sm mb-5 text-gray-300">
              This will permanently remove your account and all your data.
            </p>

            <div className="flex justify-around">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 rounded bg-gray-900 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable area */}
      <div className="w-full max-w-md h-full overflow-y-scroll scrollbar-hide p-3 md:p-6 space-y-6  mb-8 md:mb-0">
        {/* Account Section */}
        <div>
          <h1 className="text-2xl font-semibold mb-4">Account</h1>

          {/* Privacy Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <SettingItem
                title="Last seen and online"
                value="Nobody"
                description="If you don't share your Last Seen, you won't be able to see other people's Last Seen."
              />
              <SettingItem title="Profile photo" value="My contacts" />
              <SettingItem title="About" value="My contacts" />

              <SettingItem
                title="Protect IP address in calls"
                value="On"
                description="To make it harder for people to infer your location, calls on this device will be securely relayed through WhatsApp servers. This will reduce call quality."
                linkText="Learn more"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p className=" text-sm mb-3">
            End-to-end encryption keeps your personal messages and calls between
            you and the people you choose. No one outside of the chat, not even
            WhatsApp, can read, listen to, or share them. This includes your:
          </p>

          <ul className="list-none space-y-1  text-sm">
            <li>💬 Text and voice messages</li>
            <li>📞 Audio and video calls</li>
            <li>📎 Photos, videos and documents</li>
            <li>📍 Location sharing</li>
            <li>🌀 Status updates</li>
          </ul>

          <p className=" text-sm mt-3">
            Get notified when your security code changes for a contact's phone.
            If you have multiple devices, this setting must be enabled on each
            device where you want to get notifications.
          </p>

          <a href={`mailto:${email}`}>
            <button className="text-cyan-500 hover:underline text-left">
              Learn More
            </button>
          </a>
        </div>

        {/* Delete Account */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowDeletePopup(true)}
            className="bg-transparent text-red-400 border border-red-500 px-4 py-2 rounded-full 
               hover:bg-red-500 hover:text-white transition-all duration-300 
               font-medium shadow-sm"
          >
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ title, value, description, linkText }) => {
  const email = "samvaad.help@gmail.com";
  return (
    <div className="border-b border-gray-600 dark:border-gray-400 pb-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{title}</span>
        <span className="">{value}</span>
      </div>
      {description && (
        <p className=" text-xs mt-1">
          {description}
          {linkText && (
            <a
              href={`mailto:${email}`}
              className="text-cyan-400 ml-1 hover:underline"
            >
              {linkText}
            </a>
          )}
        </p>
      )}
    </div>
  );
};

export default WhatsAppPrivacySecurity;
