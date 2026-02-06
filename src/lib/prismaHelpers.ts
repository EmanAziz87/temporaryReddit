import type { Communities } from "../../generated/prisma/client";
import type { PostsWithRelations } from "../services/postServices/typesPostServices";
import { NotFoundError } from "./appErrors";
import prisma from "./prisma";

export const communityFoundOrThrow = async (
  communityId: number,
): Promise<Communities> => {
  const foundCommunity = await prisma.communities.findUnique({
    where: {
      id: communityId,
    },
  });

  if (!foundCommunity) {
    throw new NotFoundError("That community was not found");
  }

  return foundCommunity;
};

export const postFoundOrThrow = async (
  communityId: number,
  postId: number,
): Promise<PostsWithRelations> => {
  const foundCommunity = await communityFoundOrThrow(communityId);

  const foundPost = await prisma.posts.findFirst({
    where: {
      id: postId,
    },
    include: {
      community: true,
      comments: true,

      author: {
        select: {
          id: true,
          username: true,
          admin: true,
        },
      },
    },
  });

  if (!foundPost) {
    throw new NotFoundError("That post was not found");
  }

  if (foundCommunity.id !== foundPost?.communityId) {
    throw new NotFoundError("Post not found in this community");
  }

  return foundPost;
};
