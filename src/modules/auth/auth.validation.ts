import { BadRequestError } from "../../shared/errors/index.js";
import { sanitizeEmail } from "../../shared/utils/string.utils.js";
import type { OTPPurpose } from "../../shared/types/database.types.js";

/**
 * Validated payload structures for authentication endpoints.
 */

export interface RequestOTPInput {
  email: string;
  purpose: OTPPurpose;
}

export interface VerifyOTPInput {
  email: string;
  otp: string;
  purpose: OTPPurpose;
}

/**
 * Validation functions for authentication endpoints.
 */

export function validateRequestOTPPayload(body: any): RequestOTPInput {
  let { email, purpose } = body || {};

  if (!email || !purpose) {
    throw new BadRequestError("Email and purpose are required.");
  }

  email = sanitizeEmail(email);
  purpose = String(purpose).toUpperCase().trim();

  if (!["SIGNUP", "LOGIN"].includes(purpose)) {
    throw new BadRequestError("Invalid purpose.");
  }

  return { email, purpose: purpose as OTPPurpose };
}

export function validateVerifyOTPPayload(body: any): VerifyOTPInput {
  let { email, otp, purpose } = body || {};

  if (!email || !otp || !purpose) {
    throw new BadRequestError("Email, OTP and purpose are required.");
  }

  email = sanitizeEmail(email);
  purpose = String(purpose).toUpperCase().trim();
  otp = String(otp).trim();

  if (!["SIGNUP", "LOGIN"].includes(purpose)) {
    throw new BadRequestError("Invalid purpose.");
  }

  return { email, otp, purpose: purpose as OTPPurpose };
}
