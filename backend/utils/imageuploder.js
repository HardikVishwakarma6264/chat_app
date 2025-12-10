const cloudinary = require("cloudinary").v2;

exports.uploadToCloudinary = async (file, folder, type = "image", height, quality) => {
  const options = { folder, resource_type: type }; // type = 'video' or 'image'

  if (height) options.height = height;
  if (quality) options.quality = quality;

  // Make sure the file path exists
  if (!file.tempFilePath) throw new Error("Temp file path is missing");

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};