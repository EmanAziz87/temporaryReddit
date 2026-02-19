import z from "zod";

export type ConversationParams = z.infer<typeof ConversationParamsData>;

export const ConversationParamsData = z
  .object({
    receiverId: z.coerce.number(),
  })
  .strict();
