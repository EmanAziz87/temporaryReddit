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

const replyCommentService = async (
  postId: number,
  parentId: number,
  commentInput: CreateCommentInput,
  userId: number,
) => {
  postFoundOrThrow(postId);
  return prisma.comments.create({
    data: {
      postId: postId,
      parentId: parentId,
      content: commentInput.content,
      authorId: userId,
    },
  });
};

// All comments fetched as flat list. Create tree structure on server side
// for parent/child comment relationship
const getAllCommentsForPostService = async (postId: number) => {
  postFoundOrThrow(postId);
  return prisma.comments.findMany({
    where: {
      postId: postId,
    },
  });
};

export default {
  createCommentService,
  replyCommentService,
  getAllCommentsForPostService,
};
