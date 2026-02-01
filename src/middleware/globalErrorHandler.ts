import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appErrors";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "FAILED",
      message: err.issues,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "FAILED",
      message: err.message,
    });
  }

  console.error("UNKNOWN ERROR: ", err);
  return res.status(500).json({ message: "Internal Server Error" });
};
