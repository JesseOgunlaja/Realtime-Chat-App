import { UserType } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { removeUndefinedFromObject } from "@/utils/utils";
import { trigger } from "@/utils/websocketsServer";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body.message !== "string" || typeof body.chatID !== "string") {
      return NextResponse.json(
        { message: "Invalid values passed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();

    const headersList = headers();
    const user = JSON.parse(headersList.get("user") as string) as UserType;

    const chatIndex = user.chats.findIndex((chat) => chat.id === body.chatID);

    if (chatIndex == -1) {
      return NextResponse.json({ message: "Chat not found" }, { status: 400 });
    }

    if (
      body.replyID !== undefined &&
      user.chats[chatIndex].messages.findIndex(
        (message) => message.id === body.replyID
      ) === -1
    ) {
      return NextResponse.json(
        { message: "Couldn't find message you were trying to reply to" },
        { status: 404 }
      );
    }

    const messageID = randomUUID();

    user.chats[chatIndex].messages.push(
      removeUndefinedFromObject({
        message: body.message.replaceAll("’", "'"),
        replyID: body.replyID,
        timestamp,
        fromYou: true,
        id: messageID,
      })
    );
    user.chats[chatIndex].visible = true;
    trigger(user.chats[chatIndex].withID, "new-message", {
      chatID: user.chats[chatIndex].id,
      message: removeUndefinedFromObject({
        message: body.message.replaceAll("’", "'"),
        timestamp,
        id: messageID,
        fromYou: false,
        replyID: body.replyID,
      }),
    });
    trigger(JSON.parse(headersList.get("key") as string), "new-message-sent", {
      chatID: user.chats[chatIndex].id,
      message: removeUndefinedFromObject({
        message: body.message.replaceAll("’", "'"),
        replyID: body.replyID,
        timestamp,
        id: messageID,
        fromYou: true,
      }),
    });

    const otherUser = (await redis.hgetall(
      user.chats[chatIndex].withID
    )) as UserType;
    const redisPipeline = redis.pipeline();
    redisPipeline.hset(JSON.parse(headersList.get("key") as string), {
      chats: user.chats,
    });

    otherUser.chats[
      otherUser.chats.findIndex((chat) => chat.id === body.chatID)
    ].messages.push(
      removeUndefinedFromObject({
        message: body.message.replaceAll("’", "'"),
        replyID: body.replyID,
        timestamp,
        fromYou: false,
        id: messageID,
      })
    );
    otherUser.chats[
      otherUser.chats.findIndex((chat) => chat.id === body.chatID)
    ].visible = true;
    redisPipeline.hset(user.chats[chatIndex].withID, {
      chats: otherUser.chats,
    });

    await redisPipeline.exec();

    return NextResponse.json(
      { message: "Success", messageID, timestamp },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
