// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { sanitizeUser } from "../utils/SanitizeUser.js";
// import { generateToken } from "../utils/GenerateToken.js";
// import Otp from "../models/Otp.js";
// import { generateOtp } from "../utils/GenerateOtp.js";
// import PasswordResetToken from "../models/PasswordResetToken.js";
// import { sendMail } from "../utils/Email.js";
// import Logger from "../utils/Logger.js";
// import { trackFailedLogin, resetFailedLogin } from "../utils/LoginLimiter.js";
// import { responseHandler } from "../middleware/ResponseHandler.js";
// import asyncHandler from "express-async-handler";
// import { Types } from "mongoose";

// const logger = Logger.getLogger("SponsorController");

// /**
//  * @desc Register Sponsor
//  * @route POST /sponsors/register
//  */
// export const registerSponsor = asyncHandler(async (req, res, next) => {
//   const { name, email, password, confirmPassword } = req.body;

//   // Basic validation
//   if (!name || !email || !password || !confirmPassword) {
//     return responseHandler(res, {
//       success: false,
//       message: "All fields are required.",
//       status: 400,
//     });
//   }

//   if (password !== confirmPassword) {
//     return responseHandler(res, {
//       success: false,
//       message: "Passwords do not match",
//       status: 400,
//     });
//   }

//   // Check if sponsor already exists
//   const existingSponsor = await Sponsor.findOne({ email });
//   if (existingSponsor) {
//     return responseHandler(res, {
//       success: false,
//       message: "User already exists, please login instead.",
//       status: 409,
//     });
//   }

//   try {
//     // Hash password and create sponsor
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newSponsor = new Sponsor({ name, email, password: hashedPassword });
//     await newSponsor.save();
//     logger.info(`Sponsor created: ${newSponsor.email}`);

//     // Generate and send OTP
//     const otp = generateOtp();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     await new Otp({
//       user: { id: newSponsor._id, userType: "Sponsor" },
//       otp: hashedOtp,
//       expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
//     }).save();
//     await sendMail(email, "OTP Verification Code", `Your OTP is: <b>${otp}</b>`);
//     logger.info(`OTP sent to ${email}`);

//     // Generate token
//     const token = generateToken(sanitizeUser(newSponsor));
//     res.cookie("token", token, {
//       sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
//       maxAge: parseInt(process.env.COOKIE_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000,
//       httpOnly: true,
//       secure: process.env.PRODUCTION === "true",
//     });

//     return responseHandler(res, {
//       success: true,
//       message: "Registration successful. OTP sent to your email.",
//       data: sanitizeUser(newSponsor),
//       status: 201,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// /**
//  * @desc Login Sponsor
//  * @route POST /sponsors/login
//  */
// export const loginSponsor = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return responseHandler(res, {
//       success: false,
//       message: "Email and password are required.",
//       status: 400,
//     });
//   }

//   const sponsor = await Sponsor.findOne({ email });

//   // Check if sponsor exists
//   if (!sponsor || !(await bcrypt.compare(password, sponsor.password))) {
//     const { locked, remainingTime } = trackFailedLogin(email);
//     if (locked) {
//       return responseHandler(res, {
//         success: false,
//         message: `Too many failed login attempts. Please try again in ${Math.ceil(remainingTime)} seconds.`,
//         status: 429,
//       });
//     }
//     return responseHandler(res, {
//       success: false,
//       message: "Invalid login credentials.",
//       status: 401,
//     });
//   }

//   try {
//     // Prevent login if sponsor is soft deleted
//     if (sponsor.isDeleted) {
//       return responseHandler(res, {
//         success: false,
//         message: "User account not found.",
//         status: 404,
//       });
//     }

//     // Reset failed login attempts on success
//     resetFailedLogin(email);

//     if (!sponsor.isVerified) {
//       return responseHandler(res, {
//         success: false,
//         message: "Email not verified. Please verify your email using OTP.",
//         status: 403,
//       });
//     }

//     // Generate token
//     const token = generateToken(sanitizeUser(sponsor));
//     res.cookie("token", token, {
//       sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
//       maxAge: parseInt(process.env.COOKIE_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000,
//       httpOnly: true,
//       secure: process.env.PRODUCTION === "true",
//     });

//     return responseHandler(res, {
//       success: true,
//       message: "Login successful!",
//       data: sanitizeUser(sponsor),
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// /**
//  * @desc Reset Password
//  * @route POST /sponsors/reset-password
//  */
// export const resetPassword = asyncHandler(async (req, res) => {
//   const { token, password } = req.body;

//   if (!token || !password) {
//     return responseHandler(res, {
//       success: false,
//       message: "Token and new password are required.",
//       status: 400,
//     });
//   }

//   try {
//     // Verify token
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.SECRET_KEY);
//     } catch (err) {
//       return responseHandler(res, {
//         success: false,
//         message: "Invalid or expired reset token.",
//         status: 400,
//       });
//     }

//     const sponsor = await Sponsor.findOne({ email: decoded.email });

//     if (!sponsor) {
//       return responseHandler(res, {
//         success: false,
//         message: "Sponsor profile does not exist.",
//         status: 404,
//       });
//     }

//     // Reset password
//     sponsor.password = await bcrypt.hash(password, 10);
//     await sponsor.save();

//     return responseHandler(res, {
//       success: true,
//       message: "Password updated successfully.",
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// /**
//  * @desc Soft Delete Sponsor
//  * @route DELETE /sponsors/delete/:id
//  */
// export const deleteSponsor = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const sponsor = await Sponsor.findById(id);

//   if (!sponsor) {
//     return responseHandler(res, {
//       success: false,
//       message: "User account not found.",
//       status: 404,
//     });
//   }

//     try {
//     sponsor.isDeleted = true;
//     await sponsor.save();
//     logger.info(`Sponsor soft deleted: ${id}`);

//     return responseHandler(res, {
//       success: true,
//       message: "Account deleted successfully.",
//     });
//   } catch(error) {
//     next(error);
//   }
// });

// /**
//  * @desc Update Sponsor Profile
//  * @route PUT /sponsors/update/:id
//  */
// export const updateSponsor = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     return responseHandler(res, {
//       success: false,
//       message: "Sponsor ID is required.",
//       status: 400,
//     });
//   }

//   try {
//     const updatedSponsor = await Sponsor.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedSponsor) {
//       return responseHandler(res, {
//         success: false,
//         message: "Sponsor profile not found.",
//         status: 404,
//       });
//     }

//     return responseHandler(res, {
//       success: true,
//       message: "Profile updated successfully.",
//       data: sanitizeUser(updatedSponsor),
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// /**
//  * @desc Get Single Sponsor
//  * @route GET /sponsors/:id
//  */
// export const getSingleSponsor = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     return responseHandler(res, {
//       success: false,
//       message: "Sponsor ID is required.",
//       status: 400,
//     });
//   }
//   try {
//     const sponsor = await Sponsor.findById(id);

//     if (!sponsor) {
//       return responseHandler(res, {
//         success: false,
//         message: "Sponsor not found.",
//         status: 404,
//       });
//     }

//     return responseHandler(res, {
//       success: true,
//       message: "Sponsor fetched successfully.",
//       data: sanitizeUser(sponsor),
//     });
//   } catch(error) {
//     next(error);
//   }
// });

// /**
//  * @desc Get All Sponsors
//  * @route GET /sponsors
//  */
// export const getAllSponsors = asyncHandler(async (req, res) => {
//   try {
//     let sponsors = await Sponsor.find();
//     sponsors = sponsors.map((sponsor) => sanitizeUser(sponsor));

//     return responseHandler(res, {
//       success: true,
//       message: "Sponsors fetched successfully.",
//       data: sponsors,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// /**
//  * @desc Verify OTP
//  * @route POST /sponsors/verify-otp
//  */
// export const verifyOtp = asyncHandler(async (req, res) => {
//   const sponsorId = new Types.ObjectId(req.user._id);
//   const { otp } = req.body;
//   logger.info(`SponsorId: ${sponsorId}`);

//   if (!otp) {
//     return responseHandler(res, {
//       success: false,
//       message: "OTP is required.",
//       status: 400,
//     });
//   }

//   try {
//     const sponsor = await Sponsor.findById(sponsorId);
//     if (!sponsor) {
//       return responseHandler(res, {
//         success: false,
//         message: "Sponsor not found.",
//         status: 404,
//       });
//     }

//     const existingOtp = await Otp.findOne({ user: { id: sponsorId, userType: "Sponsor" } });

//     if (!existingOtp) {
//       return responseHandler(res, {
//         success: false,
//         message: "OTP not found or already used.",
//         status: 404,
//       });
//     }

//     if (existingOtp.expiresAt < new Date()) {
//       await Otp.findByIdAndDelete(existingOtp._id);
//       return responseHandler(res, {
//         success: false,
//         message: "OTP has expired.",
//         status: 400,
//       });
//     }

//     if (await bcrypt.compare(otp, existingOtp.otp)) {
//       await Otp.findByIdAndDelete(existingOtp._id);
//       const verifiedSponsor = await Sponsor.findByIdAndUpdate(sponsorId, { isVerified: true }, { new: true });

//       return responseHandler(res, {
//         success: true,
//         message: "Email verified successfully.",
//         data: sanitizeUser(verifiedSponsor),
//       });
//     }

//     return responseHandler(res, {
//       success: false,
//       message: "Invalid OTP.",
//       status: 400,
//     });
//   } catch(error) {
//     next(error);
//   }
// });

// /**
//  * @desc Forgot Password
//  * @route POST /sponsors/forgot-password
//  */
// export const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return responseHandler(res, {
//       success: false,
//       message: "Email is required.",
//       status: 400,
//     });
//   }

//   const sponsor = await Sponsor.findOne({ email });

//   if (!sponsor) {
//     return responseHandler(res, {
//       success: false,
//       message: "Email not registered.",
//       status: 404,
//     });
//   }

//   await PasswordResetToken.deleteMany({ user: { id: sponsor._id, userType: "Sponsor" } });

//   const resetToken = generateToken(sanitizeUser(sponsor), true);
//   const hashedToken = await bcrypt.hash(resetToken, 10);

//   await new PasswordResetToken({
//     user: { id: sponsor._id, userType: "Sponsor" },
//     token: hashedToken,
//     expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
//   }).save();

//   await sendMail(
//     email,
//     "Password Reset Link",
//     `<p>Click the link below to reset your password:</p>
//      <p><a href="${process.env.ORIGIN}/reset-password/${sponsor._id}/${resetToken}" target="_blank">Reset Password</a></p>`
//   );

//   return responseHandler(res, {
//     success: true,
//     message: `Password reset link sent to ${email}.`,
//   });
// });

// /**
//  * @desc Resend OTP
//  * @route POST /sponsors/resend-otp
//  */
// export const resendOtp = asyncHandler(async (req, res) => {
//   const sponsorId = new Types.ObjectId(req.body.id);

//   if (!sponsorId) {
//     return responseHandler(res, {
//       success: false,
//       message: "Sponsor ID is required.",
//       status: 400,
//     });
//   }

//   const sponsor = await Sponsor.findById(sponsorId);

//   if (!sponsor) {
//     return responseHandler(res, {
//       success: false,
//       message: "User not found.",
//       status: 404,
//     });
//   }

//   await Otp.deleteMany({ user: { id: sponsorId, userType: "Sponsor" } });

//   const otp = generateOtp();
//   const hashedOtp = await bcrypt.hash(otp, 10);

//   await new Otp({
//     user: { id: sponsorId, userType: "Sponsor" },
//     otp: hashedOtp,
//     expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
//   }).save();
//   logger.info(`Otp: ${otp}`);

//   await sendMail(sponsor.email, "OTP Verification Code", `Your OTP is: <b>${otp}</b>`);

//   return responseHandler(res, {
//     success: true,
//     message: "OTP resent successfully.",
//   });
// });

// /**
//  * @desc Logout
//  * @route POST /sponsors/logout
//  */
// export const logout = asyncHandler(async (req, res) => {
//   res.cookie("token", "", {
//     maxAge: 0,
//     sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
//     httpOnly: true,
//     secure: process.env.PRODUCTION === "true",
//   });

//   return responseHandler(res, {
//     success: true,
//     message: "Logout successful!",
//   });
// });
