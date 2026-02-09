import {
  ReactionType,
  type Communities,
  type Posts,
} from "../../generated/prisma/client";
import type {
  LikedPostsWithRelations,
  PostsWithRelations,
} from "../services/postServices/typesPostServices";
import { ConflictError, NotFoundError } from "./appErrors";
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

export const postMadeByUserOrThrow = async (
  postId: number,
  userId: number,
): Promise<Posts> => {
  const foundUserMadePost = await prisma.posts.findFirst({
    where: {
      id: postId,
      authorId: userId,
    },
  });

  if (!foundUserMadePost) {
    throw new NotFoundError("The user did not create that post");
  }

  return foundUserMadePost;
};

export const postLikedAlreadyOrThrow = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const postLikedAlready = await prisma.postReaction.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
  });

  if (postLikedAlready) {
    throw new ConflictError("The user already liked that post");
  }
};

export const postDislikedAlreadyOrThrow = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const postDislikedAlready = await prisma.postReaction.findFirst({
    where: {
      userId: userId,
      postId: postId,
      type: ReactionType.DISLIKE,
    },
  });

  if (postDislikedAlready) {
    throw new ConflictError("The user already disliked that post");
  }
};

export const postFavoritedAlready = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const favoritedAlready = await prisma.favoritedPosts.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
  });

  if (favoritedAlready) {
    throw new ConflictError("Post already favorited");
  }
};
