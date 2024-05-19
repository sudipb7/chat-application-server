import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

import { cloudinaryOptions } from "../config";

cloudinary.config(cloudinaryOptions);

export const uploadFile = async (
  filePath: string,
  folder: "attachment" | "avatar" | "chat-avatar"
) => {
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

export const deleteFile = async (url: string, folder: "attachment" | "avatar" | "chat-avatar") => {
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
