import { BadRequestError } from "../../shared/errors/index.ts";
import { sanitizeEmail } from "../../shared/utils/string.utils.ts";

/**
 * Validated payload structures for authentication endpoints.
 */

export interface SignupInput {
  email: string;
  password: string;
}
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Validation functions for authentication endpoints.
 */

export function validateSignupPayload(body: any): SignupInput {
  let { email, password } = body || {};
  if (!email || !password) {
    throw new BadRequestError("Email and password are required.");
  }
  email = sanitizeEmail(email);
  password = String(password).trim();
  if (password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters.");
  }
  return { email, password };
}

export function validateLoginPayload(body: any): LoginInput {
  let { email, password } = body || {};
  if (!email || !password) {
    throw new BadRequestError("Email and password are required.");
  }
  email = sanitizeEmail(email);
  password = String(password).trim();
  return { email, password };
}
