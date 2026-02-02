import express from "express";
import type { NextFunction, Request, Response } from "express";
import { UserRegisterSchema } from "./users.schema";
import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import type { UserRegisterInput } from "./users.schema";
import { setSession } from "../../lib/setSession";

const userRoute = express.Router();

userRoute.post("/create", async (req, res, next) => {
  try {
    const validatedData: UserRegisterInput = UserRegisterSchema.parse(req.body);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds,
    );
    const user = await prisma.users.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        username: validatedData.username,
        birthdate: validatedData.birthdate,
      },
    });

    await setSession(req, String(user.id));
    res
      .status(200)
      .json({ status: "SUCCESS", message: "Registered and Logged in" });
  } catch (err) {
    next(err);
  }
});

export default userRoute;
