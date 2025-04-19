import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "school", "volunteer", "admin", "partner"],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    grade: {
      type: String,
    },

    studentSchool: {
      type: String,
    },

    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
