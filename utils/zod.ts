import { z } from "zod";

export const UsernameSchema = z
  .string()
  .min(1, {
    message: "Username required",
  })
  .min(4, {
    message: "Username must be more than 4 characters",
  })
  .max(20, {
    message: "Username must be less than 20 characters",
  })
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "No symbols or spaces allowed",
  });

export const PasswordSchema = z
  .string()
  .min(1, {
    message: "Password required",
  })
  .min(8, {
    message: "Password must be more than 8 characters",
  })
  .max(64, {
    message: "Password must be less than 64 characters",
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
