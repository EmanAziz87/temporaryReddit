import type { Prisma } from "../../../generated/prisma/client";

export type PostsWithRelations = Prisma.PostsGetPayload<{
  include: {
    community: true;
    comments: true;
    author: { select: { username: true; admin: true } };
  };
}>;
