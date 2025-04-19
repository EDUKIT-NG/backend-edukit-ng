import expressAsyncHandler from "express-async-handler";
import { generateToken } from "../../utils/GenerateToken.js";
import { sanitizeUser } from "../../utils/SanitizeUser.js";
import User from "../../models/User.model.js";
import bcrypt from "bcrypt";
import logInSchema from "../../Validation/User/loginValidation.js";
import mongoose from "mongoose";

const loginUser = expressAsyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await logInSchema.validateAsync(req.body);
    const { username, email, password } = result;

    const existingUser = await User.findOne({ email });
    console.log("existing", existingUser);

    if (!existingUser) {
      await session.abortTransaction();
      return res.status(404).json({
        message: `User with email ${email} not found! Would you like to register?`,
      });
    }

    const hashedPassword = existingUser.password;
    console.log(hashedPassword);

    if (!hashedPassword) {
      await session.abortTransaction();
      res.status(404).json({ message: "User password not found " });
      return;
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      console.log(password);

      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Invalid email or password. Please try again. " });
    }
    if (!existingUser.isVerified) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Kindly verify your email" });
    }

    const secureInfo = sanitizeUser(existingUser);
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
    return res.status(200).json({
      message: "Login successful. ",
      user: sanitizeUser(existingUser),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export default loginUser;
