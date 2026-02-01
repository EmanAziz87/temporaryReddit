import express from "express";
import type { NextFunction, Request, Response } from "express";
import { UserRegisterSchema } from "./users.schema";

const userRoute = express.Router();

userRoute.post("/create", (req: Request, res: Response, next: NextFunction) => {
  try {
    UserRegisterSchema.parse(req.body);
    const { username, email, password } = req.body;
  } catch (err) {
    next(err);
  }
});

export default userRoute;
