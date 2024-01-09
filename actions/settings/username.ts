"use server";

import { UserDetailsList } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { UUID } from "crypto";

export default async function setUsername(
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
