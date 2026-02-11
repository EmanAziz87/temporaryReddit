import express from "express";
import {
  CommentParamsData,
  CreateCommentData,
  type CommentParams,
  type CreateCommentInput,
} from "./commentSchema";
import commentServices from "../../services/cmmentServices/commentServices";
import { isAuthenticated } from "../../middleware/isAuthenticated";

const commentRouter = express.Router();

commentRouter.post(
  "/post/:postId/create",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );

      const validatedData: CreateCommentInput = CreateCommentData.parse(
        req.body,
      );

      const createdComment = await commentServices.createCommentService(
        validatedData,
        validatedParams.postId,
        Number(req.session.userId!),
      );

      res.status(201).json({
        status: "SUCCESSFULL",
        message: "Successfully created comment",
        createdComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.post(
  "/post/:postId/reply",
  isAuthenticated,
  async (req, res, next) => {
    try {
    } catch (err) {}
  },
);

export default commentRouter;
