import { ReactionType, type Posts } from "../../../generated/prisma/client";
import { InvalidRequestError, NotFoundError } from "../../lib/appErrors";
import prisma from "../../lib/prisma";
import {
  communityFoundOrThrow,
  postDislikedAlreadyOrThrow,
  postFavoritedAlready,
  postFoundOrThrow,
  postLikedAlreadyOrThrow,
  postMadeByUserOrThrow,
} from "../../lib/prismaHelpers";
import type { CreatePostInput } from "../../routes/postRoutes/postSchema";
import type { UserNoSensitiveInfo } from "../../types/express-session";
import type {
  FavoritedPostWithRelations,
  FollowedCommunitiesWithRelations,
  LikedPostsWithRelations,
  PostsWithRelations,
} from "./typesPostServices";

const createPostService = async (
  postInputData: CreatePostInput,
  communityId: number,
  userId: string,
  imageLocationUrls: string[] | null,
) => {
  const userIdNumber = Number(userId);

  await communityFoundOrThrow(communityId);

  return prisma.posts.create({
    data: {
      title: postInputData.title,
      content: postInputData.content,
      mediaUrl: imageLocationUrls ? imageLocationUrls.map((url) => url) : [],
      authorId: userIdNumber,
      communityId: communityId,
    },
    include: {
      community: true,
      comments: true,
    },
  });
};

const getPostService = async (
  communityId: number,
  postId: number,
): Promise<PostsWithRelations> => {
  return await postFoundOrThrow(communityId, postId);
};

const getAllPostsService = async (
  communityId: number,
): Promise<[PostsWithRelations[], string]> => {
  const foundCommunity = await communityFoundOrThrow(communityId);

  const allPosts = await prisma.posts.findMany({
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

  return [allPosts, foundCommunity.name];
};

const getAllPostsFollowedService = async (
  user: UserNoSensitiveInfo,
): Promise<FollowedCommunitiesWithRelations[]> => {
  const userIdNumber = Number(user.id);

  if (user.followingCount === 0) {
    throw new InvalidRequestError(
      "You are not following any communities to grab posts from",
    );
  }

  return prisma.followedCommunities.findMany({
    where: {
      userId: userIdNumber,
    },
    include: {
      community: {
        include: {
          posts: {
            include: {
              author: {
                select: {
                  username: true,
                  admin: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const editPostService = async (
  newContent: string,
  communityId: number,
  postId: number,
  userId: string,
): Promise<PostsWithRelations> => {
  const userIdNumber = Number(userId);

  await postFoundOrThrow(communityId, postId);
  await postMadeByUserOrThrow(postId, userIdNumber);

  return prisma.posts.update({
    where: {
      id: postId,
    },
    data: {
      content: newContent,
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
};

const likePostService = async (
  communityId: number,
  postId: number,
  userId: string,
): Promise<LikedPostsWithRelations> => {
  const userIdNumber = Number(userId);
  await postFoundOrThrow(communityId, postId);
  await postLikedAlreadyOrThrow(postId, userIdNumber);

  return prisma.$transaction(async (tx) => {
    await tx.posts.update({
      where: {
        id: postId,
      },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return await tx.postReaction.create({
      data: {
        postId: postId,
        userId: userIdNumber,
        type: ReactionType.LIKE,
      },
      include: {
        post: {
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
        },
        user: {
          select: {
            id: true,
            username: true,
            admin: true,
          },
        },
      },
    });
  });
};

const unlikePostService = async (
  communityId: number,
  postId: number,
  userId: string,
): Promise<PostsWithRelations> => {
  const userIdNumber = Number(userId);
  await postFoundOrThrow(communityId, postId);
  await postDislikedAlreadyOrThrow(postId, userIdNumber);

  const postReactionExists = await prisma.postReaction.findUnique({
    where: {
      userId_postId: {
        userId: userIdNumber,
        postId: postId,
      },
    },
  });

  return prisma.$transaction(async (tx) => {
    const unlikedPost = await tx.posts.update({
      where: {
        id: postId,
      },
      data: {
        likes: {
          decrement: 1,
        },
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

    if (!postReactionExists) {
      await tx.postReaction.create({
        data: {
          userId: userIdNumber,
          postId: postId,
          type: ReactionType.DISLIKE,
        },
      });
      return unlikedPost;
    }

    if (postReactionExists) {
      await tx.postReaction.delete({
        where: {
          userId_postId: {
            postId: postId,
            userId: userIdNumber,
          },
        },
      });
    }
    return unlikedPost;
  });
};

const favoritePostService = async (
  communityId: number,
  postId: number,
  userId: string,
): Promise<FavoritedPostWithRelations> => {
  const userIdNumber = Number(userId);
  await postFoundOrThrow(communityId, postId);
  await postFavoritedAlready(postId, userIdNumber);

  return prisma.$transaction(async (tx) => {
    return await tx.favoritedPosts.create({
      data: {
        postId: postId,
        userId: userIdNumber,
      },
      include: {
        post: true,
        user: {
          select: {
            id: true,
            username: true,
            admin: true,
          },
        },
      },
    });
  });
};

const unfavoritePostService = async (
  communityId: number,
  postId: number,
  userId: string,
): Promise<void> => {
  const userIdNumber = Number(userId);
  postFoundOrThrow(communityId, postId);

  await prisma.favoritedPosts.delete({
    where: {
      userId_postId: {
        postId: postId,
        userId: userIdNumber,
      },
    },
  });
};

export default {
  createPostService,
  getPostService,
  getAllPostsService,
  getAllPostsFollowedService,
  editPostService,
  likePostService,
  unlikePostService,
  favoritePostService,
  unfavoritePostService,
};
