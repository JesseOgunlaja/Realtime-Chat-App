"use server";

import { UserDetailsList } from "@/types/UserTypes";
import { compare as comparePasswords, hash as hashPassword } from "bcrypt";
import { UUID } from "crypto";
import { redis } from "../utils/redis";

export async function setProfilePicture(
  key: UUID,
  usernamesList: UserDetailsList,
  profilePictureURL: string
) {
  const redisPipeline = redis.pipeline();

  redisPipeline.hset(key, { profilePicture: profilePictureURL });

  const usernameListIndex = usernamesList.findIndex((val) => val.id === key);
  redisPipeline.lset("User details", usernameListIndex, {
    ...usernamesList[usernameListIndex],
    profilePicture: profilePictureURL,
  });

  await redisPipeline.exec();
}

export async function setUsername(
  key: UUID,
  usernamesList: UserDetailsList,
  username: string
) {
  const redisPipeline = redis.pipeline();

  redisPipeline.hset(key, { username });

  const usernameListIndex = usernamesList.findIndex((val) => val.id === key);
  const newUsernamesList = [...usernamesList];
  newUsernamesList[usernameListIndex] = {
    ...usernamesList[usernameListIndex],
    name: username,
  };

  redisPipeline.lset(
    "User details",
    usernameListIndex,
    newUsernamesList[usernameListIndex]
  );

  await redisPipeline.exec();
  return { newUsernamesList };
}

export async function setPassword(
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
