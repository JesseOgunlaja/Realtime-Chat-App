"use server";

import { UserDetailsList } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { UUID } from "crypto";

export default async function setDisplayname(
  key: UUID,
  userDetailsList: UserDetailsList,
  displayName: string
) {
  const redisPipeline = redis.pipeline();

  redisPipeline.hset(key, {
    displayName,
  });

  const userDetailsIndex = userDetailsList.findIndex((val) => val.id === key);
  const newUsernamesList = [...userDetailsList];
  newUsernamesList[userDetailsIndex] = {
    ...userDetailsList[userDetailsIndex],
    displayName,
  };

  redisPipeline.lset(
    "User details",
    userDetailsIndex,
    newUsernamesList[userDetailsIndex]
  );

  await redisPipeline.exec();
  return { newUsernamesList };
}
