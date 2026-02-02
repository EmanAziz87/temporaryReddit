import express from "express";
import cors from "cors";
import postRoutes from "./routes/postRoutes/postRoutes.js";
import userRoutes from "./routes/userRoutes/userRoutes.js";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "./lib/prisma.js";
import dotenv from "dotenv";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import { SESSION_COOKIE_NAME } from "./util/sessionName.js";

dotenv.config();

const PORT = 3000;
const app = express();

if (!process.env["SESSION_SECRET"]) {
  throw new Error("SESSION_SECRET must be defined in .env file");
}

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax",
    },
    name: SESSION_COOKIE_NAME,
    secret: process.env["SESSION_SECRET"],
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
