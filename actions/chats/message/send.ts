"use server";

import { Message, UserType } from "@/types/UserTypes";
import { getUserByID, redis } from "@/utils/redis";
import { removeUndefinedFromObject } from "@/utils/utils";
import { trigger } from "@/utils/websockets";
import { UUID } from "crypto";

export async function sendMessageAction(
  userKey: UUID,
  chatID: UUID,
  user: UserType,
  message: Omit<Message, "fromYou">
) {
  const newMessage = removeUndefinedFromObject(message);
  const chatIndex = user.chats.findIndex((chat) => chat.id === chatID);
  const otherUserID = user.chats[chatIndex].withID;

  trigger(userKey, "message-sent", {
    chatID: user.chats[chatIndex].id,
    message: {
      ...newMessage,
      fromYou: true,
    },
  });

  trigger(otherUserID, "message-sent", {
    chatID: user.chats[chatIndex].id,
    message: {
      ...newMessage,
      fromYou: false,
    },
  });

  user.chats[chatIndex].messages.push({
    ...newMessage,
    fromYou: true,
  });
  user.chats[chatIndex].visible = true;

  const otherUser = await getUserByID(otherUserID);

  const otherUserChatIndex = otherUser.chats.findIndex(
    (chat) => chat.id === chatID
  );

  otherUser.chats[otherUserChatIndex]?.messages.push({
    ...newMessage,
    fromYou: false,
  });

  const redisPipeline = redis.pipeline();

  redisPipeline.hset(userKey, {
    chats: user.chats,
  });

  redisPipeline.hset(otherUserID, {
    chats: otherUser.chats,
  });

  await redisPipeline.exec();
}
