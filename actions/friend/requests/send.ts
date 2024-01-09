"use server";

import { UserDetailsList, UserType } from "@/types/UserTypes";
import { getUserByUsername, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";

export default async function sendFriendRequest(
  userKey: UUID,
  user: UserType,
  userDetailsList: UserDetailsList,
  friendsUsername: string
) {
  const userDetails = userDetailsList.find(
    (userDetails) => userDetails.name === friendsUsername.toLowerCase()
  );

  if (!userDetails) {
    return { message: "User not found" } as const;
  }

  if (
    user.outgoingFriendRequests.find(
      (friendRequest) => friendRequest.toID === userDetails.id
    )
  ) {
    return {
      message: "You've already sent this user a friend request",
    } as const;
  }

  if (
    user.incomingFriendRequests.find(
      (friendRequest) => friendRequest.fromID === userDetails.id
    )
  ) {
    return {
      message: "This user has already sent you a friend request",
    } as const;
  }

  if (user.friends.find((friend) => friend.id === userDetails.id)) {
    return {
      message: "This user is already your friend",
    } as const;
  }

  trigger(userDetails.id, "friend-request-sent", {
    newIncomingFriendRequest: {
      fromID: userKey,
    },
  });

  trigger(userKey, "friend-request-sent", {
    newOutgoingFriendRequest: {
      toID: userDetails.id,
    },
  });

  const result = (await getUserByUsername(friendsUsername, true)) as {
    user: UserType;
    key: UUID;
  };

  const otherUser = result.user;
  const otherUserKey = result.key;
  otherUser.incomingFriendRequests.push({
    fromID: userKey,
  });

  user.outgoingFriendRequests.push({
    toID: otherUserKey,
  });

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(otherUserKey, {
    incomingFriendRequests: otherUser.incomingFriendRequests,
  });

  redisPipeline.hset(userKey, {
    outgoingFriendRequests: user.outgoingFriendRequests,
  });

  await redisPipeline.exec();

  return {
    message: "Success",
  } as const;
}
