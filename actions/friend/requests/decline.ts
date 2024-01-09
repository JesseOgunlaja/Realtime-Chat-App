"use server";

import { UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";

export default async function declineFriendRequestAction(
  userKey: UUID,
  user: UserType,
  friendRequestFromID: UUID
) {
  trigger(friendRequestFromID, "friend-request-deleted", {
    toID: userKey,
    type: "outgoing",
    sendToast: true,
  });

  trigger(userKey, "friend-request-deleted", {
    fromID: friendRequestFromID,
    type: "incoming",
    sendToast: false,
  });

  const friendRequestBeingDeclinedIndex = user.incomingFriendRequests.findIndex(
    (friendRequest) => friendRequest.fromID === friendRequestFromID
  );

  user.incomingFriendRequests.splice(friendRequestBeingDeclinedIndex, 1);

  const otherUser = await getUserByID(friendRequestFromID);
  const otherUserFriendRequestBeingDeclinedIndex =
    otherUser.outgoingFriendRequests.findIndex(
      (friendRequest) => friendRequest.toID === friendRequestFromID
    );

  otherUser.outgoingFriendRequests.splice(
    otherUserFriendRequestBeingDeclinedIndex,
    1
  );

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    incomingFriendRequests: user.incomingFriendRequests,
  });

  redisPipeline.hset(friendRequestFromID, {
    outgoingFriendRequests: otherUser.outgoingFriendRequests,
  });

  await redisPipeline.exec();
}
