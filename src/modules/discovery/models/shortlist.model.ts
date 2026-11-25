import { Schema, model, type Model } from "mongoose";
import type { IShortlist, ShortlistItemType } from "../../../shared/types/database.types.ts";

export type { IShortlist, ShortlistItemType };

/**
 * Shortlist schema allowing builders and founders to save prospective co-founders,
 * teammates, or startups to a private bookmark list with optional personal notes.
 */
export const shortlistSchema = new Schema<IShortlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["USER", "STARTUP"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    note: {
      type: String,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

shortlistSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export type ShortlistModel = Model<IShortlist>;
export const Shortlist: ShortlistModel = model<IShortlist>("Shortlist", shortlistSchema);

export default Shortlist;
