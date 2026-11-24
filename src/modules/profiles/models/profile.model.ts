import { Schema, model, type Model } from "mongoose";
import { calculateProfileCompletion } from "../../../shared/helpers/profileCompletion.helper.ts";
import type {
  IProfile,
  IPastWork,
  ILinkedStartup,
  ProfileRole,
  AvailabilityStatus,
  PastWorkLinkType,
  ISocialLinks,
  IPrivacySettings,
  IFounderDetails,
  IJoinerDetails,
} from "../../../shared/types/database.types.js";

export type {
  IProfile,
  IPastWork,
  ILinkedStartup,
  ProfileRole,
  AvailabilityStatus,
  PastWorkLinkType,
  ISocialLinks,
  IPrivacySettings,
  IFounderDetails,
  IJoinerDetails,
};

/**
 * Embedded schema representing verified student projects and portfolio links.
 */
export const pastWorkSchema = new Schema<IPastWork>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    linkType: {
      type: String,
      enum: ["GitHub", "Behance", "Portfolio", "Figma", "Live Demo", "Other"],
      default: "Portfolio",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
  },
  { _id: true, timestamps: true }
);

/**
 * Embedded schema tracking external or campus venture associations.
 */
export const linkedStartupSchema = new Schema<ILinkedStartup>(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    stage: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      trim: true,
      default: "Founder",
    },
    startupId: {
      type: Schema.Types.ObjectId,
      ref: "Startup",
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

/**
 * Main builder profile schema tracking student background, portfolio items,
 * weekly availability, privacy toggles, and builder badge accomplishments.
 */
export const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    college: {
      type: String,
      trim: true,
      default: "",
    },

    year: {
      type: String,
      trim: true,
      default: "",
    },

    branch: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 280,
      default: "",
    },

    avatarUrl: {
      type: String,
      default: "/images/default.svg",
    },

    role: {
      type: String,
      enum: ["FOUNDER", "JOINER", "BOTH"],
      default: null,
    },

    skills: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    interests: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    lookingFor: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    pastWork: {
      type: [pastWorkSchema],
      default: [],
    },

    linkedStartups: {
      type: [linkedStartupSchema],
      default: [],
    },

    availabilityStatus: {
      type: String,
      enum: ["Open to join", "Looking for co-founder", "Just exploring"],
      default: "Just exploring",
    },

    weeklyHoursAvailable: {
      type: Number,
      min: 0,
      max: 168,
      default: 0,
    },

    isBuilder: {
      type: Boolean,
      default: false,
    },

    builderBadgeAwardedAt: {
      type: Date,
      default: null,
    },

    profileCompletionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    socialLinks: {
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
    },

    privacy: {
      hideYear: { type: Boolean, default: false },
      hideBranch: { type: Boolean, default: false },
      allowIntroRequests: { type: Boolean, default: true },
    },

    reputationCount: {
      type: Number,
      default: 0,
    },

    weeklyStreak: {
      type: Number,
      default: 0,
    },

    founderDetails: {
      startupName: { type: String, default: "" },
      stage: { type: String, default: "" },
    },

    joinerDetails: {
      skills: [{ type: String, trim: true }],
      graduationYear: { type: Number },
    },

    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose asynchronous pre-save hook recalculating profile completion & badges
profileSchema.pre("save", async function (this: any) {
  const result = calculateProfileCompletion(this);
  this.profileCompletionPercentage = result.completionPercentage;

  if (result.isBuilder) {
    if (!this.isBuilder) {
      this.isBuilder = true;
      this.builderBadgeAwardedAt = new Date();
    }
  } else {
    this.isBuilder = false;
  }
});

export type ProfileModel = Model<IProfile>;
export const Profile: ProfileModel = model<IProfile>("Profile", profileSchema);

export default Profile;
