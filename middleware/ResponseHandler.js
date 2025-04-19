// import Logger from "../utils/Logger.js";

// const logger = Logger.getLogger("ResponseHandler");

export const responseHandler = (
  res,
  {
    success = true,
    message,
    data = null,
    error = null,
    status = 200,
    pagination = null,
  }
) => {
  // Automatically log errors if they exist
  if (!success && error) {
    logger.error(`Error: ${message} | Details: ${error}`);
  }

  // Construct the response object
  const response = { success, message, status };

  if (data) response.data = data;
  if (error) response.error = error;
  if (pagination) response.pagination = pagination;

  return res.status(status).json({ ...response });
};

// Middleware for handling uncaught errors
export const errorHandler = (err, req, res, next) => {
  // Prevent undefined req
  const requestUrl = req?.originalUrl || "Unknown Route";
  logger.error(
    `Unhandled Error at ${req.originalUrl}: ${err.message}\n${err.stack}`
  );

  return responseHandler(res, {
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    status: err.statusCode || 500,
  });
};
