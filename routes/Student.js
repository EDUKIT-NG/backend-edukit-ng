// import express from "express";
// import {
//   getAllStudents,
//   deleteStudent,
//   getSingleStudent,
//   updateStudent,
//   logout,
//   verifyOtp,
//   resendOtp,
//   forgotPassword,
//   resetPassword,
//   loginStudent,
//   registerStudent,
// } from "../controllers/Student.js";
// import { isOwner } from "../middleware/IsOwner.js";

// const router = express.Router();

// router
//   .post("/register", registerStudent)
//   .post("/login", loginStudent)
//   .post("/verify-otp", verifyOtp)
//   .post("/resend-otp", resendOtp)
//   .post("/forgot-password", forgotPassword)
//   .post("/reset-password", resetPassword)
//   .post("/logout", logout)
//   .delete("/delete/:id", isOwner, deleteStudent)
//   .get("/", getAllStudents)
//   .get("/:id", isOwner, getSingleStudent)
//   .put("/update/:id", isOwner, updateStudent);

// export default router;
