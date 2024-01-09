"use server";

import { UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";

export async function deleteMessageAction(
  userKey: UUID,
  chatID: UUID,
  messageID: UUID,
  user: UserType
) {
  const chatIndex = user.chats.findIndex((chat) => chat.id === chatID);
  const messageIndex = user.chats[chatIndex].messages.findIndex(
    (message) => message.id === messageID
  );
  const otherUserID = user.chats[chatIndex].withID;

  trigger(userKey, "message-deleted", {
    chatID,
    messageID,
  });

  trigger(otherUserID, "message-deleted", {
    chatID,
    messageID,
  });

  user.chats[chatIndex].messages.splice(messageIndex, 1);

  const otherUser = await getUserByID(otherUserID);
  const otherUserChatIndex = otherUser.chats.findIndex(
    (chat) => chat.id === chatID
  );
  const otherUserMessageIndex = otherUser.chats[
    otherUserChatIndex
  ].messages.findIndex((message) => message.id === messageID);

  otherUser.chats[otherUserChatIndex].messages.splice(otherUserMessageIndex, 1);

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    chats: user.chats,
  });

  redisPipeline.hset(otherUserID, {
    chats: otherUser.chats,
  });

  await redisPipeline.exec();
}
