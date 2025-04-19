// import express from "express";
// import {
//   getAllSponsors,
//   deleteSponsor,
//   getSingleSponsor,
//   updateSponsor,
//   logout,
//   verifyOtp,
//   resendOtp,
//   forgotPassword,
//   resetPassword,
//   registerSponsor,
//   loginSponsor,
// } from "../controllers/Sponsor.js";
// import { isOwner } from "../middleware/IsOwner.js";

// const router = express.Router();

// router
//   .post("/register", registerSponsor)
//   .post("/login", loginSponsor)
//   .post("/verify-otp", verifyOtp)
//   .post("/resend-otp", resendOtp)
//   .post("/forgot-password", forgotPassword)
//   .post("/reset-password", resetPassword)
//   .post("/logout", logout)
//   .delete("/delete/:id", isOwner,deleteSponsor)
//   .get("/", getAllSponsors)
//   .get("/:id", isOwner, getSingleSponsor)
//   .patch("/update/:id", isOwner, updateSponsor);

// export default router;
