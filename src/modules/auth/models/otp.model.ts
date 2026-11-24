import { Schema, model, type Model } from "mongoose";
import type { IEmailOTP, OTPPurpose } from "../../../shared/types/database.types.js";

export type { IEmailOTP, OTPPurpose };

/**
 * Email OTP schema managing time-limited verification codes
 * for passwordless sign-in and account registration.
 */
export const emailOTPSchema = new Schema<IEmailOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["SIGNUP", "LOGIN"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired OTP records via MongoDB TTL
emailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailOTPModel = Model<IEmailOTP>;
export const EmailOTP: EmailOTPModel = model<IEmailOTP>("EmailOTP", emailOTPSchema);

export default EmailOTP;
