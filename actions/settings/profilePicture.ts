"use server";

import { UserDetailsList } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { UUID } from "crypto";

export default async function setProfilePicture(
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
