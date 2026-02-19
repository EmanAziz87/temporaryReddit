import type { Conversations } from "../../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { userExistsOrThrow } from "../../lib/prismaHelpers";

const createConversationService = async (
  receiverId: number,
  userId: number,
): Promise<Conversations> => {
  const receiver = await userExistsOrThrow(receiverId);
  return prisma.$transaction(async (tx) => {
    const createdConversation = await tx.conversations.create({});

    await tx.conversationParticipant.createMany({
      data: [
        {
          userId: userId,
          conversationId: createdConversation.id,
        },
        {
          userId: receiver.id,
          conversationId: createdConversation.id,
        },
      ],
    });

    return createdConversation;
  });
};

export default { createConversationService };
