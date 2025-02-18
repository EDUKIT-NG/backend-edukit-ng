import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import studentRouter from "./routes/Student.js";
import adminRouter from "./routes/Admin.js";

const app = express();

const port = process.env.PORT;
const db = process.env.MONGO_URI;

// connect to database
mongoose
  .connect(db, {})
  .then(() => {
    console.log("Connected to db");
  })
  .catch((error) => {
    console.error(error);
  });

// middleware
app.use(express.json());
app.use(morgan("dev"));

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
        console.error(err);
      } else {
        res.clearCookie("session");
        res.redirect("/login");
      }
    });
  } else {
    next();
  }
});

// allow all API calls coming from the frontend to get to the server
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

app.use("/students", studentRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Running");
});

app.listen(port, () => {
  console.log("Server running on port 5000");
});
