import { Router } from "express";

import { registerUser } from "../controllers/User/registerUser.js";
import { verifyOtp } from "../controllers/User/verifyUser.js";
import resendOtp from "../controllers/User/resendOtp.js";
import loginUser from "../controllers/User/loginUser.js";
import resetPassword from "../controllers/User/resetPassword.js";
import logout from "../controllers/User/logout.js";
import { getAllUsers, getASingleUser } from "../controllers/User/getUser.js";
import { deleteUser } from "../controllers/User/deleteUser.js";
import { createProfileSchool } from "../controllers/User/SchoolProfile.js";
import createStudentProfile from "../controllers/User/studentProfile.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyToken, verifyOtp);
router.post("/resend-otp", verifyToken, resendOtp);
router.post("/reset-password", verifyToken, resetPassword);
router.get("/", getAllUsers);
router.get("/:id", getASingleUser);

router.delete("/:id", deleteUser);
router.post("/logout", logout);
router.put("/create-school-profile/:id", createProfileSchool);
router.put("/create-student-profile/:id", createStudentProfile);

export default router;
