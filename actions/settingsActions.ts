"use server";

import { UserDetailsList } from "@/types/UserTypes";
import { compare as comparePasswords, hash as hashPassword } from "bcrypt";
import { UUID } from "crypto";
import { redis } from "../utils/redis";

export async function setProfilePicture(
  key: UUID,
  userDetailsList: UserDetailsList,
  profilePictureURL: string
) {
  const redisPipeline = redis.pipeline();

  redisPipeline.hset(key, { profilePicture: profilePictureURL });

  const userDetailsIndex = userDetailsList.findIndex((val) => val.id === key);
  redisPipeline.lset("User details", userDetailsIndex, {
    ...userDetailsList[userDetailsIndex],
    profilePicture: profilePictureURL,
  });

  await redisPipeline.exec();
}

export async function setUsername(
  key: UUID,
  userDetailsList: UserDetailsList,
  username: string
) {
  const redisPipeline = redis.pipeline();

  redisPipeline.hset(key, { username });

  const userDetailsIndex = userDetailsList.findIndex((val) => val.id === key);
  const newUsernamesList = [...userDetailsList];
  newUsernamesList[userDetailsIndex] = {
    ...userDetailsList[userDetailsIndex],
    name: username,
  };

  redisPipeline.lset(
    "User details",
    userDetailsIndex,
    newUsernamesList[userDetailsIndex]
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
