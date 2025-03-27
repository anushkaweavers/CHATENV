require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, mimeType) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimeType.startsWith("image") ? "image" : "auto";

    cloudinary.uploader
      .upload_stream({ resource_type: resourceType }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(fileBuffer);
  });
};

module.exports = { uploadToCloudinary };
