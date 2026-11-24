import { Schema, model, type Model } from "mongoose";
import type { IFollow, FollowTargetType } from "../../../shared/types/database.types.js";

export type { IFollow, FollowTargetType };

/**
 * Follow schema supporting social follows of members (USER) and startups (STARTUP).
 * Used for personalized feed curation, activity feeds, and campus discovery.
 */
export const followSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["USER", "STARTUP"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ followerId: 1, targetType: 1, targetId: 1 }, { unique: true });

export type FollowModel = Model<IFollow>;
export const Follow: FollowModel = model<IFollow>("Follow", followSchema);

export default Follow;
