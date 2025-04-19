// import Logger from "../utils/Logger.js";

// // Create logger instance with context 'HttpLogger'
// const logger = Logger.getLogger("HttpLogger");

// const httpLogger = (req, res, next) => {
//   const startAt = process.hrtime();
//   const { ip, method, originalUrl } = req;
//   const userAgent = req.get("user-agent") || "";

//   // Listen for the 'finish' event when the response is sent
//   res.on("finish", () => {
//     const { statusCode } = res;
//     const contentLength = res.get("content-length") || 0;
//     const diff = process.hrtime(startAt);
//     const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

//     // Log the HTTP request details using the custom logger
//     const logMessage = `${method} ${originalUrl} ${statusCode} ${responseTime.toFixed(3)}ms ${contentLength}bytes - ${userAgent} ${ip}`;

//     if (statusCode >= 400) {
//       // Log error responses in red (or another distinct format)
//       logger.error(logMessage);
//     } else {
//       // Log normal requests (info level)
//       logger.info(logMessage);
//     }
//   });

//   // Call the next middleware or route handler
//   next();
// };

// export default httpLogger;
