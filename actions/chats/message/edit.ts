"use server";

import { UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { trigger } from "@/utils/websockets";
import { UUID } from "crypto";

export async function editMessageAction(
  userKey: UUID,
  chatID: UUID,
  messageID: UUID,
  newMessageText: string,
  user: UserType
) {
  const chatIndex = user.chats.findIndex((chat) => chat.id === chatID);
  const messageIndex = user.chats[chatIndex].messages.findIndex(
    (message) => message.id === messageID
  );
  const otherUserID = user.chats[chatIndex].withID;

  user.chats[chatIndex].messages[messageIndex].message = newMessageText;
  user.chats[chatIndex].visible = true;

  trigger(userKey, "message-edited", {
    messageID,
    chatID,
    newMessageText,
  });

  trigger(otherUserID, "message-edited", {
    messageID,
    chatID,
    newMessageText,
  });

  const otherUser = await getUserByID(otherUserID);
  const otherUserChatIndex = otherUser.chats.findIndex(
    (chat) => chat.id === chatID
  );
  const otherUserMessageIndex = otherUser.chats[
    otherUserChatIndex
  ].messages.findIndex((message) => message.id === messageID);
  otherUser.chats[otherUserChatIndex].visible = true;

  otherUser.chats[otherUserChatIndex].messages[otherUserMessageIndex].message =
    newMessageText;

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    chats: user.chats,
  });

  redisPipeline.hset(otherUserID, {
    chats: otherUser.chats,
  });

  await redisPipeline.exec();
}
