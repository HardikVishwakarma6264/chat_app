import React, { useState } from "react";
import { useSelector } from "react-redux";
import { LuUpload } from "react-icons/lu";

export default function ImageUploader({ handleImageUpload }) {
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(user?.image || null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-800 p-6 rounded-2xl w-full">
      {/* Profile Image */}
      <div
        className="rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-white shadow-lg shadow-yellow-400/50"
        style={{ width: "94px", height: "94px" }}
      >
        {preview ? (
          <img
            src={preview}
            alt="profile"
            className="object-cover w-full h-full"
          />
        ) : (
          (user?.firstname?.[0] || "U") + (user?.lastname?.[0] || "")
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col space-y-4 w-full md:w-auto">
        <p className="font-semibold text-lg">Change Profile Picture</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="imageInput"
        />
        <div className="flex gap-4">
          <label
            htmlFor="imageInput"
            className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 transition"
          >
            Select
          </label>
          <button
            onClick={() => handleImageUpload(selectedImage)}
            className={`${
              selectedImage
                ? "bg-yellow-400 hover:bg-yellow-500"
                : "bg-gray-500 cursor-not-allowed"
            } text-black px-4 py-2 rounded transition`}
            disabled={!selectedImage}
          >
            <div className="flex items-center gap-2">
              Upload <LuUpload />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
