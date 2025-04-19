import asyncHandler from "express-async-handler";
// import Logger from "../utils/Logger.js";

// const logger = Logger.getLogger("AuthorizeRole");

// Role-based access middleware
export const authorizeRoles = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user; // Extract user from request

    // If user role is not in the allowed list, deny access
    if (!allowedRoles.includes(user.role)) {
      logger.warn(
        `Unauthorized access attempt: ${
          user.email
        }(${user.role.toUpperCase()}) tried to access ${req.originalUrl}`
      );
      return res
        .status(403)
        .json({
          message: "Forbidden: You do not have access to this resource.",
        });
    }

    next();
  });
};
