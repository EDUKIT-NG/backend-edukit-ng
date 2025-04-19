import Otp from "../../models/Otp.js";
import { generateOtp } from "../../utils/GenerateOtp.js";
import bcrypt from "bcrypt";
import { sendMail } from "../../utils/Email.js";
import mongoose from "mongoose";
import User from "../../models/User.model.js";
import expressAsyncHandler from "express-async-handler";

const resendOtp = expressAsyncHandler(async (req, res) => {
  console.log("start 1");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("start");

    console.log(req.user);

    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) {
      session.abortTransaction();
      return res.status(400).json({ message: "User not found" });
    }

    const otp = await Otp.findOne({ "user.id": id });
    if (otp) {
      await Otp.findByIdAndDelete(otp._id);
    }

    let new_otp = generateOtp();
    let hashedOtp = await bcrypt.hash(new_otp, 10);
    const newOtp = new Otp({
      user: { id: id, userType: user.role },
      otp: hashedOtp,
      expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
    });
    await newOtp.save();

    await sendMail(
      user.email,
      "OTP Verification Code",
      `Your OTP is: <b>${new_otp}</b>`
    );
    await session.commitTransaction();
    return res.status(200).json("Code sent successfully");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export default resendOtp;
