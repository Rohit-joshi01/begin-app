import { Schema, model, type Model } from "mongoose";
import type { IPost, PostType } from "../../../shared/types/database.types.ts";

export type { IPost, PostType };

/**
 * Feed post schema supporting campus milestones, venture progress updates,
 * and collaboration announcements.
 */
export const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    postType: {
      type: String,
      enum: ["Update", "Milestone", "Looking For"],
      default: "Update",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    CoverImageUrl: {
      type: String,
      required: false,
    },
    profileImageUrl: {
      type: String,
      required: true,
    },
    StartupName: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      required: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type PostModel = Model<IPost>;
export const Post: PostModel = model<IPost>("post", postSchema);

export default Post;
