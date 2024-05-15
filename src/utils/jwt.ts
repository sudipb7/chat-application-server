import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, EMAIL_VERIFICATION_SECRET, REFRESH_TOKEN_SECRET } from "../config";

const secretMap = {
  refreshToken: { secret: REFRESH_TOKEN_SECRET!, expiresIn: "7d" },
  accessToken: { secret: ACCESS_TOKEN_SECRET!, expiresIn: "15m" },
  emailVerification: { secret: EMAIL_VERIFICATION_SECRET!, expiresIn: "5m" },
};

export const generateToken = (
  type: keyof typeof secretMap,
  payload: Record<string, string>
): string | null => {
  try {
    return jwt.sign(payload, secretMap[type].secret, { expiresIn: secretMap[type].expiresIn });
  } catch (error) {
    return null;
  }
};

export const decodeToken = (
  type: keyof typeof secretMap,
  token: string
): string | jwt.JwtPayload | null => {
  try {
    return jwt.verify(token, secretMap[type].secret);
  } catch (error) {
    return null;
  }
};
