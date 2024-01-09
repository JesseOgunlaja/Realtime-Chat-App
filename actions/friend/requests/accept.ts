"use server";

import { UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID, randomUUID } from "crypto";

export default async function acceptFriendRequestAction(
  userKey: UUID,
  user: UserType,
  friendRequestID: UUID
) {
  const newChat = {
    id: randomUUID(),
    messages: [],
    visible: true,
  };

  trigger(friendRequestID, "friend-request-accepted", {
    sendToast: true,
    friendRequestID: userKey,
    newChat: {
      ...newChat,
      withID: userKey,
    },
  });

  trigger(userKey, "friend-request-accepted", {
    friendRequestID,
    newChat: {
      ...newChat,
      withID: friendRequestID,
    },
  });

  user.friends.push({ id: friendRequestID });
  user.chats.push({ ...newChat, withID: friendRequestID });
  user.incomingFriendRequests = user.incomingFriendRequests.filter(
    (friendRequest) => friendRequest.fromID !== friendRequestID
  );

  const otherUser = await getUserByID(friendRequestID);

  otherUser.friends.push({ id: userKey });
  otherUser.chats.push({ ...newChat, withID: userKey });
  otherUser.outgoingFriendRequests = otherUser.outgoingFriendRequests.filter(
    (friendRequest) => friendRequest.toID !== userKey
  );

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    friends: user.friends,
    chats: user.chats,
    incomingFriendRequests: user.incomingFriendRequests,
  });

  redisPipeline.hset(friendRequestID, {
    friends: otherUser.friends,
    chats: otherUser.chats,
    outgoingFriendRequests: otherUser.outgoingFriendRequests,
  });

  await redisPipeline.exec();
}
