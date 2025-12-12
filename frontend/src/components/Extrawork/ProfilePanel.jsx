import React, { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  handleImageUpload,
  handleAboutUpdate,
  handleContactUpdate,
  logoutUser,
  updateUsername,
} from "../services/operation/authapi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfilePanel = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Edit states
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isImageEditing, setIsImageEditing] = useState(false);

  // Editable values
  const [about, setAbout] = useState(
    user?.additionaldetail?.about || "Everything is happen for a Reason"
  );
  const [phone, setPhone] = useState(
    user?.additionaldetail?.contactnumber || "+91 ---------------"
  );
  const [username, setUsername] = useState(
    user?.additionaldetail?.username || "~Hardik_Vishwakarma_"
  );
  const [preview, setPreview] = useState(user?.image || "");
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(user?.image || "");
  }, [user?.image]);

  // ------------------- IMAGE HANDLING -------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setIsImageEditing(true);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return toast.error("Please select an image first");

    try {
      await dispatch(handleImageUpload(selectedImage));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsImageEditing(false);
      setSelectedImage(null);
    }
  };

  const handleCancelImage = () => {
    setPreview(user?.image || "");
    setIsImageEditing(false);
    setSelectedImage(null);
  };

  // ------------------- COMPONENT UI -------------------
  return (
    <div className="flex flex-col items-center w-full h-full px-10 py-8 text-black dark:text-white overflow-hidden">
      {/* Profile Image */}
      <div className="relative">
        <img
          src={
            preview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover shadow-lg"
        />
        <div
          className="absolute bottom-1 right-1 bg-[#2c2c2c] p-1.5 rounded-full cursor-pointer hover:bg-[#3a3a3a] transition"
          onClick={() => fileInputRef.current.click()}
        >
          <Pencil size={15} className="text-gray-400" />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {isImageEditing && (
        <div className="flex gap-3 mt-3">
          <button
            onClick={handleSaveImage}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded transition-all"
          >
            Save
          </button>
          <button
            onClick={handleCancelImage}
            className="bg-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-1.5 rounded transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Username Section */}
      <div className="flex flex-col items-center mt-6 w-full max-w-sm">
        <div className="flex justify-between items-center w-full mb-1">
          <h3 className="text-sm ">Username</h3>
          <Pencil
            size={15}
            onClick={() => setIsEditingUsername(!isEditingUsername)}
            className=" cursor-pointer  transition"
          />
        </div>

        {isEditingUsername ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                // Remove spaces + force lowercase
                const newValue = e.target.value
                  .replace(/\s/g, "")
                  .toLowerCase();
                if (e.target.value.includes(" ")) {
                  toast.error("Spaces are not allowed in username");
                }
                setUsername(newValue);
              }}
              className="w-full bg-transparent  text-[15px] focus:outline-none border-b border-gray-600 focus:border-cyan-500 pb-1 transition"
              autoFocus
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={async () => {
                  const result = await updateUsername(
                    username,
                    token,
                    dispatch
                  );
                  if (result.success) setIsEditingUsername(false);
                }}
                className="bg-cyan-600 text-white hover:bg-cyan-700  px-4 py-1.5 rounded transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setUsername(
                    user?.additionaldetail?.username || "~Hardik_Vishwakarma_"
                  );
                  setIsEditingUsername(false);
                }}
                className="bg-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-1.5 rounded transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <h2 className="text-lg font-semibold ">{username}</h2>
        )}
      </div>

      {/* About Section */}
      <div className="mt-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm">About</h3>
          <Pencil
            size={15}
            onClick={() => setIsEditingAbout(!isEditingAbout)}
            className=" cursor-pointer  transition"
          />
        </div>

        {isEditingAbout ? (
          <>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full bg-transparent  text-[15px] focus:outline-none border-b border-gray-600 focus:border-cyan-500 pb-1 transition"
              autoFocus
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={async () => {
                  const result = await handleAboutUpdate(
                    about,
                    token,
                    dispatch
                  );
                  if (result.success) setIsEditingAbout(false);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setAbout(user?.about || "Everything is happen for a Reason");
                  setIsEditingAbout(false);
                }}
                className="bg-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-1.5 rounded transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-[15px]  leading-6">{about}</p>
        )}
      </div>

      {/* Phone Section */}
      <div className="mt-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm ">Phone number</h3>
          <Pencil
            size={15}
            onClick={() => setIsEditingPhone(!isEditingPhone)}
            className=" cursor-pointer  transition"
          />
        </div>

        {isEditingPhone ? (
          <>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent  text-[15px] focus:outline-none border-b border-gray-600 focus:border-cyan-500 pb-1 transition"
              autoFocus
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={async () => {
                  const result = await handleContactUpdate(
                    phone,
                    token,
                    dispatch
                  );
                  if (result.success) setIsEditingPhone(false);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setPhone(
                    user?.additionaldetail?.contactnumber ||
                      "+91 ---------------"
                  );
                  setIsEditingPhone(false);
                }}
                className="bg-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-1.5 rounded transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-[15px]">{phone}</p>
        )}
      </div>

      {/* Logout Section */}
      <hr className="w-full max-w-sm border-[#2e2e2e] my-8" />
      <div className="w-full max-w-sm flex justify-start">
        <button
          onClick={() => logoutUser(navigate)}
          className="border-black dark:border-white border bg-gray-900 text-red-500 hover:bg-gray-700 font-medium py-2.5 px-6 rounded-md transition-all"
        >
          Log out
        </button>
      </div>

      <p className="text-[12px]  mt-3 text-center leading-5 max-w-sm">
        Chat history on this computer will be cleared when you log out.
      </p>
    </div>
  );
};

export default ProfilePanel;
