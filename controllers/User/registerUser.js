import bcrypt from "bcrypt";
import { generateOtp } from "../../utils/GenerateOtp.js";
import Otp from "../../models/Otp.js";
import { sendMail } from "../../utils/Email.js";
import { sanitizeUser } from "../../utils/SanitizeUser.js";
import { generateToken } from "../../utils/GenerateToken.js";
import RegisterSchema from "../../Validation/User/registerValidator.js";
import User from "../../models/User.model.js";
import mongoose from "mongoose";
import expressAsyncHandler from "express-async-handler";

export const registerUser = expressAsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await RegisterSchema.validateAsync(req.body);
    const { name, username, email, password, role, phoneNumber, address } =
      user;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: `Email ${email} already exists,Kindly login` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      role,
      password: hashedPassword,
      phoneNumber,
      address,
    });

    const savedUser = await newUser.save();
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const newOtp = new Otp({
      user: { id: savedUser._id, userType: role },
      otp: hashedOtp,
      expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
    });

    await newOtp.save();

    // send otp to email
    await sendMail(
      email,
      "OTP Verification Code",
      `Your OTP is: <b>${otp}</b>`
    );

    const secureInfo = sanitizeUser(savedUser);
    const token = generateToken(savedUser._id);
    console.log(token);
    const cookieExpirationDays = parseInt(process.env.COOKIE_EXPIRATION_DAYS);
    if (isNaN(cookieExpirationDays)) {
      throw new Error("COOKIE_EXPIRATION_DAYS must be a valid number.");
    }
    // sends JWT token in the response cookies
    res.cookie("token", token, {
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      maxAge: cookieExpirationDays * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.PRODUCTION === "true",
    });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: sanitizeUser(savedUser),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
