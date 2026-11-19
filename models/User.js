import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["founder", "joiner", "both"],
      default: "joiner",
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
    skills: {
      type: [String],
      default: [],
    },
    lookingFor: {
      type: [String],
      default: [],
    },
    startupStage: {
      type: String,
      enum: ["Idea", "Building MVP", "Launched", "Has users"],
      default: "Idea",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
