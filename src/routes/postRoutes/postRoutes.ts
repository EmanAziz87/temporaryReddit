import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import uploads from "../../middleware/s3storage";
import {
  CreatePost,
  PostParamsData,
  type CreatePostInput,
  type MulterS3File,
  type PostParams,
} from "./postSchema";
import postServices from "../../services/postServices/postServices";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import s3Client from "../../util/s3client";
const postRouter = express.Router();

postRouter.post(
  "/community/:communityId/create",
  isAuthenticated,
  uploads.array("postImages", 10),
  async (req, res, next) => {
    const files = req.files as MulterS3File[];
    const uploadedImageKeys = files.map((file) => file.key);
    try {
      const validatedData: CreatePostInput = CreatePost.parse(req.body);
      const validatedParams: PostParams = PostParamsData.parse(req.params);

      const createdPost = await postServices.createPostService(
        validatedData,
        validatedParams.communityId,
        req.session.userId!,
        files ? files.map((file) => file.location) : null,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: "Post successfully created",
        createdPost,
      });
    } catch (err) {
      if (uploadedImageKeys.length > 0) {
        await Promise.all(
          uploadedImageKeys.map((key) =>
            s3Client.send(
              new DeleteObjectCommand({
                Bucket: process.env["AWS_BUCKET_NAME"],
                Key: key,
              }),
            ),
          ),
        );
        console.log(`Cleaned up ${uploadedImageKeys.length} orphaned images`);
      }
      next(err);
    }
  },
);

postRouter.get(
  "/community/:communityId/post/:postId",
  async (req, res, next) => {
    try {
      const validatedParams: PostParams = PostParamsData.parse(req.params);
      const fetchedPost = await postServices.getPostService(
        validatedParams.communityId,
        validatedParams.postId!,
      );

      res
        .status(200)
        .json({
          status: "SUCCESS",
          message: `Successfully grabbed post: ${fetchedPost.title}`,
          fetchedPost,
        });
    } catch (err) {
      next(err);
    }
  },
);

export default postRouter;
