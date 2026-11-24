import { Schema, model, type Model } from "mongoose";
import type {
  IStartup,
  ITeamMember,
  IStartupInvitation,
  IStartupMilestone,
  IOpenRole,
  StartupStage,
  StartupVisibility,
  InvitationStatus,
  MilestoneType,
  OpenRoleType,
  OpenRoleStatus,
  IStartupLinks,
} from "../../../shared/types/database.types.ts";

export type {
  IStartup,
  ITeamMember,
  IStartupInvitation,
  IStartupMilestone,
  IOpenRole,
  StartupStage,
  StartupVisibility,
  InvitationStatus,
  MilestoneType,
  OpenRoleType,
  OpenRoleStatus,
  IStartupLinks,
};

/**
 * Embedded schema representing confirmed startup team members.
 */
export const teamMemberSchema = new Schema<ITeamMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    role: {
      type: String,
      trim: true,
      default: "Team Member",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Embedded schema managing pending and resolved team invitations.
 */
export const startupInvitationSchema = new Schema<IStartupInvitation>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      trim: true,
      default: "Team Member",
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED"],
      default: "PENDING",
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Embedded schema tracking startup progress milestones and timeline highlights.
 */
export const startupMilestoneSchema = new Schema<IStartupMilestone>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    milestoneType: {
      type: String,
      enum: [
        "Idea validated",
        "Prototype ready",
        "First users",
        "Launched",
        "Won event",
        "Custom update",
      ],
      default: "Custom update",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    completedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, timestamps: true }
);

/**
 * Embedded schema tracking open roles, recruitment requirements, and commitments.
 */
export const openRoleSchema = new Schema<IOpenRole>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    skillsNeeded: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    commitmentHours: {
      type: Number,
      min: 0,
      max: 168,
      default: 0,
    },
    roleType: {
      type: String,
      enum: ["co-founder", "teammate", "short-term collaboration"],
      default: "teammate",
    },
    equityOrCreditNote: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["OPEN", "FILLED", "CLOSED"],
      default: "OPEN",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Core startup schema managing campus ventures, pitches, industry tags,
 * stealth visibility, recruitment postings, and team membership.
 */
export const startupSchema = new Schema<IStartup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },

    pitch: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    problem: {
      type: String,
      trim: true,
      default: "",
    },

    solution: {
      type: String,
      trim: true,
      default: "",
    },

    industryTags: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    stage: {
      type: String,
      enum: ["Idea", "Building MVP", "Launched", "Has users"],
      default: "Idea",
    },

    visibility: {
      type: String,
      enum: ["PUBLIC", "STEALTH"],
      default: "PUBLIC",
    },

    links: {
      website: { type: String, trim: true, default: "" },
      demo: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      pitchDeck: { type: String, trim: true, default: "" },
    },

    teamMembers: {
      type: [teamMemberSchema],
      default: [],
    },

    invitations: {
      type: [startupInvitationSchema],
      default: [],
    },

    openRoles: {
      type: [openRoleSchema],
      default: [],
    },

    milestones: {
      type: [startupMilestoneSchema],
      default: [],
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

startupSchema.index({ name: "text", pitch: "text", industryTags: "text" });

export type StartupModel = Model<IStartup>;
export const Startup: StartupModel = model<IStartup>("Startup", startupSchema);

export default Startup;
