import { Schema, model, type Model } from "mongoose";
import type { IAuth, UserRole } from "../../../shared/types/database.types.js";

export type { IAuth, UserRole };

/**
 * Authentication schema representing account credentials, social identities,
 * verification milestones, and system authorization roles.
 */
export const authSchema = new Schema<IAuth>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    googleId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    profileImageUrl: {
      type: String,
      default: "/images/default.svg",
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export type AuthModel = Model<IAuth>;
export const Auth: AuthModel = model<IAuth>("Auth", authSchema);

export default Auth;
