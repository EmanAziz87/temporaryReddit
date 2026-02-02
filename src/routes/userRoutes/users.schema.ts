import z from "zod";

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

export const UserRegisterSchema = z.object({
  username: z.string().min(4),
  email: z.email(),
  password: z.string().min(8),
  birthdate: z.date(),
});
