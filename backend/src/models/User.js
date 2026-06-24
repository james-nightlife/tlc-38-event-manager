import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    register: [],
    boot: [],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
