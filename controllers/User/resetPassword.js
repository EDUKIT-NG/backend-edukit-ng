import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/GenerateToken.js";
import User from "../../models/User.model.js";
import mongoose from "mongoose";
import passwordResetSchema from "../../Validation/User/passwordValidation.js";

const resetPassword = expressAsyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.user._id;
    const result = await passwordResetSchema.validateAsync(req.body);
    const { password } = result;

    const user = await User.findById(id);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserPassword = await User.findByIdAndUpdate(id, {
      password: hashedPassword,
    });
    const secureInfo = { id: user._id, userType: user.role };

    const token = generateToken(secureInfo);
    const cookieExpirationDays = parseInt(process.env.COOKIE_EXPIRATION_DAYS);
    if (isNaN(cookieExpirationDays)) {
      throw new Error("COOKIE_EXPIRATION_DAYS must be a valid number.");
    }

    res.cookie("token", token, {
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      maxAge: cookieExpirationDays * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.PRODUCTION === "true",
    });
    await session.commitTransaction();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export default resetPassword;
