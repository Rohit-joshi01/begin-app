import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { Buffer } from "node:buffer";
import config from "../../config/env.js";

/**
 * Cryptographic utility functions for OTP generation, hashing, and verification.
 */

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const hashOTP = (otp: string): string => {
  return createHmac("sha256", config.otp.secret)
    .update(otp)
    .digest("hex");
};

export const verifyOTP = (otp: string, storedHash: string): boolean => {
  if (!otp || !storedHash) return false;

  const generatedHash = Buffer.from(hashOTP(otp), "hex");
  const savedHash = Buffer.from(storedHash, "hex");

  return (
    generatedHash.length === savedHash.length &&
    timingSafeEqual(generatedHash, savedHash)
  );
};
