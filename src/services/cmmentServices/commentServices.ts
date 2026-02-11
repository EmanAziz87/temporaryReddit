import prisma from "../../lib/prisma";
import { postFoundOrThrow } from "../../lib/prismaHelpers";
import type { CreateCommentInput } from "../../routes/commentRoutes/commentSchema";

const createCommentService = async (
  commentInput: CreateCommentInput,
  postId: number,
  userId: number,
) => {
  postFoundOrThrow(postId);
  return prisma.comments.create({
    data: {
      content: commentInput.content,
      postId: postId,
      authorId: userId,
    },
  });
};

export default { createCommentService };
