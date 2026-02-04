import type { Communities } from "../../../generated/prisma/client";
import { ForbiddenContentError, NotFoundError } from "../../lib/appErrors";
import prisma from "../../lib/prisma";
import type {
  CommunityIdParams,
  CreateCommunityInput,
  EditCommunityInput,
} from "../../routes/communityRoutes/communitySchema";

const createCommunityService = async (
  communityInputData: CreateCommunityInput,
  userId: string,
): Promise<Communities> => {
  const userIdNumber = Number(userId);
  return prisma.communities.create({
    data: {
      name: communityInputData.name,
      description: communityInputData.description,
      public: communityInputData.public,
      creator: {
        connect: { id: userIdNumber },
      },
    },
  });
};

const editCommunityService = async (
  editedCommunityInputData: EditCommunityInput,
  params: CommunityIdParams,
  userId: string,
): Promise<Communities> => {
  const foundCommunity = await prisma.communities.findUnique({
    where: {
      id: Number(params.id),
    },
  });

  if (!foundCommunity) {
    throw new NotFoundError("That community was not found");
  }

  if (foundCommunity.creatorId !== Number(userId)) {
    throw new ForbiddenContentError(
      "A community can only be edited by the creator or an admin",
    );
  }

  return await prisma.communities.update({
    where: {
      id: foundCommunity.id,
    },
    data: {
      description: editedCommunityInputData.description,
      public: editedCommunityInputData.public,
    },
  });
};

const getCommunityService = async (communityId: number) => {
  const fetchedCommunity = await prisma.communities.findUnique({
    where: {
      id: communityId,
    },
  });

  if (!fetchedCommunity) {
    throw new NotFoundError("That community was not found");
  }

  return fetchedCommunity;
};

const getAllCommunitiesService = async () => {
  return prisma.communities.findMany({});
};

const 

export default {
  createCommunityService,
  editCommunityService,
  getCommunityService,
  getAllCommunitiesService,
};
