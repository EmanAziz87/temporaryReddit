import express from "express";

const postRoutes = express.Router();

postRoutes.post("/community/:communityId/create", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

export default postRoutes;
