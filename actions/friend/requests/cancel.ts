"use server";

import { UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";

export default async function cancelMyFriendRequestAction(
  userKey: UUID,
  user: UserType,
  friendRequestToID: UUID
) {
  trigger(friendRequestToID, "friend-request-canceled", {
    fromID: userKey,
    type: "incoming",
    sendToast: true,
  });

  trigger(userKey, "friend-request-canceled", {
    toID: friendRequestToID,
    type: "outgoing",
    sendToast: false,
  });

  const friendRequestBeingDeletedIndex = user.outgoingFriendRequests.findIndex(
    (friendRequest) => friendRequest.toID === friendRequestToID
  );

  user.outgoingFriendRequests.splice(friendRequestBeingDeletedIndex, 1);

  const otherUser = await getUserByID(friendRequestToID);
  const otherUserFriendRequestBeingDeclinedIndex =
    otherUser.incomingFriendRequests.findIndex(
      (friendRequest) => friendRequest.fromID === userKey
    );

  otherUser.incomingFriendRequests.splice(
    otherUserFriendRequestBeingDeclinedIndex,
    1
  );

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    outgoingFriendRequests: user.outgoingFriendRequests,
  });

  redisPipeline.hset(friendRequestToID, {
    incomingFriendRequests: otherUser.incomingFriendRequests,
  });

  await redisPipeline.exec();
}
