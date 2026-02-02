import type { Request } from "express";

export const setSession = (req: Request, userId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.userId = userId;

    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
