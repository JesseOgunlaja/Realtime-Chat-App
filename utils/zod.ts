import { z } from "zod";

export const UsernameSchema = z
  .string()
  .min(1, {
    message: "Username required",
  })
  .min(4, {
    message: "Username must be 4 or more characters",
  })
  .max(20, {
    message: "Username can't be more than 20 characters",
  })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "No symbols or spaces allowed",
  });

export const DisplayNameSchema = z
  .string()
  .min(1, {
    message: "Username required",
  })
  .min(2, {
    message: "Username must be 2 or more characters",
  })
  .max(20, {
    message: "Username can't be more than 20 characters",
  });

export const PasswordSchema = z
  .string()
  .min(1, {
    message: "Password required",
  })
  .min(8, {
    message: "Password must be 8 or more characters",
  })
  .max(64, {
    message: "Password can't be more than 64 characters",
  })
  .regex(/^(?=.*[\W_])[a-zA-Z0-9\W_]+$/, {
    message: "Password must contain a symbol.",
  });

export const UserJWTSchema = z
  .object({
    iat: z.number(),
    exp: z.number(),
    username: z.string(),
    key: z.string(),
    uuid: z.string(),
  })
  .strict();
