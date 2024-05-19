import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadFile = async (filePath: string, folder: "attachment" | "avatar") => {
  try {
    const response = await cloudinary.uploader.upload(filePath, { folder });
    fs.unlinkSync(filePath);
    return response.secure_url;
  } catch (error) {
    console.log("UPLOAD_FILE", error);
    fs.unlinkSync(filePath);
    return null;
  }
};

export const deleteFile = async (url: string, folder: "attachment" | "avatar") => {
  try {
    const path = url.split("/").pop()?.split(".")[0];
    const publicId = `${folder}/${path}`;
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.log("CLOUDINARY_DELETE_ERROR", error);
    return false;
  }
};
