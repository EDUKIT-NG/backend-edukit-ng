// // import winston from "winston";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import dotenv from "dotenv";

// dotenv.config();

// // Fix `__dirname` for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure logs directory exists
// const logDir = path.join(__dirname, "../logs");
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// // Define custom colors for log levels
// const customColors = {
//   info: "cyan",
//   warn: "yellow",
//   error: "red",
// };

// // winston.addColors(customColors);

// // Singleton Logger Class
// class LoggerFactory {
//   constructor() {
//     if (!LoggerFactory.instance) {
//       // Configure transports based on environment
//       const transports = [];

//       if (process.env.ENABLE_LOGGING === "true") {
//         transports.push(new winston.transports.Console());

//         if (process.env.NODE_ENV !== "development") {
//           transports.push(
//             new winston.transports.File({
//               level: "error",
//               filename: `${logDir}/logs`,
//               format: winston.format.uncolorize(),
//             })
//           );
//         }
//       }

//       // Create Winston logger instance
//       this.logger = winston.createLogger({
//         level: "info",
//         format: winston.format.combine(
//           winston.format.timestamp(),
//           winston.format.printf(({ timestamp, level, message, context }) => {
//             return `[${timestamp}] [${level.toUpperCase()}] [${
//               context || "App"
//             }]: ${message}`;
//           }),
//           winston.format.colorize({ all: true })
//         ),
//         transports,
//       });

//       LoggerFactory.instance = this;
//     }

//     return LoggerFactory.instance;
//   }

//   getLogger() {
//     return this.logger;
//   }

//   createLogger(context) {
//     return {
//       info: (message) => this.logger.info({ message, context }),
//       warn: (message) => this.logger.warn({ message, context }),
//       error: (message) => this.logger.error({ message, context }),
//     };
//   }
// }

// // Export a single instance
// const Logger = new LoggerFactory();
// export default Logger;
