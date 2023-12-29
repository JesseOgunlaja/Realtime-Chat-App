import { UserType } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const headersList = headers();

    const user = JSON.parse(headersList.get("user") as string) as UserType;

    const chatIndex = user.chats.findIndex((chat) => chat.id === body.chatID);

    if (chatIndex === -1) {
      return NextResponse.json(
        { message: "Can't find chat with that ID" },
        { status: 404 }
      );
    }

    const messageIndex = user.chats[chatIndex].messages.findIndex(
      (message) => message.id === body.messageID
    );

    if (messageIndex === -1) {
      return NextResponse.json(
        { message: "Can't find message with that ID" },
        { status: 404 }
      );
    }

    trigger(user.chats[chatIndex].withID, "deleted-message", {
      chatID: body.chatID,
      messageID: body.messageID,
    });

    user.chats[chatIndex].messages.splice(messageIndex, 1);

    trigger(JSON.parse(headersList.get("key") as string), "message-deleted", {
      newUser: user,
      chatID: body.chatID,
      messageID: body.messageID,
    });

    const otherUser = (await redis.hgetall(
      user.chats[chatIndex].withID
    )) as UserType;

    const otherUserChatIndex = otherUser.chats.findIndex(
      (chat) => chat.id === body.chatID
    );
    const otherUserMessageIndex = otherUser.chats[
      otherUserChatIndex
    ].messages.findIndex((message) => message.id === body.messageID);

    otherUser.chats[otherUserChatIndex].messages.splice(
      otherUserMessageIndex,
      1
    );

    const redisPipeline = redis.pipeline();

    redisPipeline.hset(JSON.parse(headersList.get("key") as string), {
      chats: user.chats,
    });

    redisPipeline.hset(user.chats[chatIndex].withID, {
      chats: otherUser.chats,
    });

    await redisPipeline.exec();

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
