import dotenv from "dotenv";
import type { CorsOptions } from "cors";

dotenv.config({ path: "./.env" });

export const {
  PORT = 8000,
  NODE_ENV = "development",
  CLIENT_URL = "http://localhost:5173",
} = process.env;

export const corsOptions: CorsOptions = {
  origin: [CLIENT_URL || "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};