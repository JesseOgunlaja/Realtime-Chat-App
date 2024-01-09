"use server";

import { UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";

export default async function removeFriendAction(
  userKey: UUID,
  user: UserType,
  friendID: UUID
) {
  trigger(friendID, "friend-removed", {
    friendID: userKey,
    sendToast: true,
  });

  trigger(userKey, "friend-removed", {
    friendID,
    sendToast: false,
  });

  const friendIndex = user.friends.findIndex(
    (friend) => friend.id === friendID
  );

  user.friends.splice(friendIndex, 1);
  user.chats = user.chats.filter((chat) => chat.withID !== friendID);

  const otherUser = await getUserByID(friendID);

  const otherUserFriendIndex = otherUser.friends.findIndex(
    (friend) => friend.id === userKey
  );

  otherUser.friends.splice(otherUserFriendIndex, 1);
  otherUser.chats = otherUser.chats.filter((chat) => chat.withID !== userKey);

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    friends: user.friends,
    chats: user.chats,
  });

  redisPipeline.hset(friendID, {
    friends: otherUser.friends,
    chats: otherUser.chats,
  });

  await redisPipeline.exec();
}
