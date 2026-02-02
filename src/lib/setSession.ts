import type { Request } from "express";

export const setSession = (req: Request, userId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.userId = String(userId);

    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
