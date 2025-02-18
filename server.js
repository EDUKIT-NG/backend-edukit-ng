import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Logger from "./utils/Logger.js";
import httpLogger from "./middleware/httpLogger.js";
import studentRouter from "./routes/Student.js";
import sponsorRouter from "./routes/Sponsor.js";
import { verifyToken } from "./middleware/VerifyToken.js";
import { authorizeRoles } from "./middleware/AuthorizeRole.js";

dotenv.config();
const app = express();

const port = process.env.PORT;
const db = process.env.MONGO_URI;

const logger = Logger('Main');

// connect to database
mongoose
  .connect(db, {})
  .then(() => {
    logger.info('Connected to database.');
  })
  .catch((error) => {
    logger.error(`Error connecting to database: ${error.message}`);
  });

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);
// app.use(morgan("dev"));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
  })
);

// clears the session cookie after 1 hr of inactivity
app.use((req, res, next) => {
  if (req.session.cookie.expires < Date.now()) {
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Error destroying session: ${err.message}`);
      } else {
        res.clearCookie("session");
        res.redirect("/login");
      }
    });
  } else {
    next();
  }
});

// Public routes (excluded from authentication)
const publicPaths = ["/login", "/register", "/forgot-password"];

// Apply authentication middleware globally, but exclude public routes
app.use((req, res, next) => {
  // Check if the request path ends with a public path
  const isPublicRoute = publicPaths.some((route) => req.path.endsWith(route));

  if (isPublicRoute) {
    return next(); // Skip authentication for public routes
  }
  verifyToken(req, res, next);
});

// Apply RBAC globally after authentication
app.use((req, res, next) => {
  if (req.user) {
    // Apply different roles for different base routes
    if (req.path.startsWith("/students")) {
      return authorizeRoles("student", "admin")(req, res, next);
    }
    if (req.path.startsWith("/sponsors")) {
      return authorizeRoles("sponsor", "admin")(req, res, next);
    }
    if (req.path.startsWith("/volunteers")) {
      return authorizeRoles("volunteer", "admin")(req, res, next);
    }
    if (req.path.startsWith("/schools")) {
      return authorizeRoles("school", "admin")(req, res, next);
    }
  }
  next();
});

// allow all API calls coming from the frontend to get to the server
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

app.use("/students", studentRouter);
app.use("/sponsors", sponsorRouter);

app.get("/", (req, res) => {
  res.send("Running");
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
