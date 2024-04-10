import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, { message: "username must be alteast 3 characters" })
  .max(20, { message: "username must be less than 20 characters" })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "username must not nit contauin specila character",
  });
export const signUpSchema = z.object({
  email: z.string().email({ message: "email must be valid" }),
  password: z
    .string()
    .min(6 ,{ message: "password must be alteast 6 characters" })
    .max(1000, { message: "password must be less than 1000 characters" }),
  username: usernameValidation,
});
