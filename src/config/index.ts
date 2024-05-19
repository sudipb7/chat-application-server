import dotenv from "dotenv";
import type { CorsOptions } from "cors";

dotenv.config({ path: "./.env" });

export const {
  PORT = 8000,
  NODE_ENV = "development",
  CLIENT_URL = "http://localhost:5173",
  NODEMAILER_EMAIL,
  NODEMAILER_SERVICE = "gmail",
  NODEMAILER_PASSWORD,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

export const corsOptions: CorsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};
