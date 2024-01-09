"use server";

import { redis } from "@/utils/redis";
import { compare as comparePasswords, hash as hashPassword } from "bcrypt";
import { UUID } from "crypto";

export default async function setPassword(
  key: UUID,
  oldPassword: string,
  hashedOldPassword: string,
  newPassword: string
) {
  if (!(await comparePasswords(oldPassword, hashedOldPassword))) {
    return { message: "Incorrect password" } as const;
  }

  const hashedPassword = await hashPassword(newPassword, 10);
  await redis.hset(key, { password: hashedPassword });
  return { message: "Success", hashedPassword } as const;
}
