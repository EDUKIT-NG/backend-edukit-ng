import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// import Logger from "./utils/Logger.js";
// import httpLogger from "./middleware/httpLogger.js";
// import studentRouter from "./routes/Student.js";
// import sponsorRouter from "./routes/Sponsor.js";

import { authorizeRoles } from "./middleware/AuthorizeRole.js";
import { errorHandler } from "./middleware/ResponseHandler.js";
import morgan from "morgan";

dotenv.config();

import userRouter from "./routes/User.js";
import errorHandling from "./middleware/errorHandling.js";

const app = express();

const port = process.env.PORT;
const db = process.env.MONGO_URI;

const morganFormat = ":method :url :status:";
// const logger = Logger.createLogger("Main");

// connect to database
mongoose
  .connect(db, {})
  .then(() => {
    // logger.info("Connected to database.");
    console.log("Connected to database.");
  })
  .catch((error) => {
    // logger.error(`Error connecting to database: ${error.message}`);
    console.log(`Error connecting to database: ${error.message}`);
  });

// middleware
app.use(express.json());
app.use(cookieParser());
// app.use(httpLogger);
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
        };
        // logger.info(JSON.stringify(logObject));
        console.log(JSON.stringify(logObject));
      },
    },
  })
);

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000 * 24,
    },
  })
);

// clears the session cookie after 1 hr of inactivity
app.use((req, res, next) => {
  if (req.session.cookie.expires < Date.now()) {
    req.session.destroy((err) => {
      if (err) {
        // logger.error(`Error destroying session: ${err.message}`);
        console.log(`Error destroying session: ${err.message}`);
      } else {
        res.clearCookie("session");
        res.redirect("/login");
      }
    });
  } else {
    next();
  }
});

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

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Running");
});

app.use(errorHandling);
app.listen(port, () => {
  // logger.info(`Server is running on port ${port}`);
  `Server is running on port ${port}`;
});
