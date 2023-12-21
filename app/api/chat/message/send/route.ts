import { User, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      typeof body.message !== "string" ||
      typeof body.timestamp !== "number" ||
      typeof body.chatID !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid values passed" },
        { status: 400 }
      );
    }

    const headersList = headers();
    const user = JSON.parse(headersList.get("user") as string) as User;

    let chatIndex: number | undefined = undefined;

    if (
      !user.chats.some((val, index) => {
        if (val.id === body.chatID) {
          chatIndex = index;
          return true;
        }
        return false;
      }) ||
      chatIndex == undefined
    ) {
      return NextResponse.json({ message: "Chat not found" }, { status: 400 });
    }

    const messageUUID = randomUUID();

    user.chats[chatIndex].messages.push({
      message: body.message.replaceAll("’", "'"),
      timestamp: body.timestamp,
      fromYou: true,
      uuid: messageUUID,
    });
    user.chats[chatIndex].visible = true;
    console.time("Start websocket event");
    trigger(user.chats[chatIndex].withID, "new-message", {
      chatID: user.chats[chatIndex].id,
      message: {
        message: body.message.replaceAll("’", "'"),
        timestamp: body.timestamp,
        uuid: messageUUID,
        fromYou: false,
      },
    });
    trigger(JSON.parse(headersList.get("key") as string), "new-message-sent", {
      chatID: user.chats[chatIndex].id,
      message: {
        message: body.message.replaceAll("’", "'"),
        timestamp: body.timestamp,
        uuid: messageUUID,
        fromYou: true,
      },
    });
    console.timeEnd("Start websocket event");

    console.time("Redis stuff");
    const otherUser = (await redis.hgetall(
      user.chats[chatIndex].withID
    )) as User;
    const redisPipeline = redis.pipeline();
    redisPipeline.hset(JSON.parse(headersList.get("key") as string), {
      chats: user.chats,
    });

    otherUser.chats[
      otherUser.chats.findIndex((chat) => chat.id === body.chatID)
    ].messages.push({
      message: body.message.replaceAll("’", "'"),
      timestamp: body.timestamp,
      fromYou: false,
      uuid: messageUUID,
    });
    otherUser.chats[
      otherUser.chats.findIndex((chat) => chat.id === body.chatID)
    ].visible = true;
    redisPipeline.hset(user.chats[chatIndex].withID, {
      chats: otherUser.chats,
    });

    await redisPipeline.exec();
    console.timeEnd("Redis stuff");

    return NextResponse.json(
      { message: "Success", messageID: messageUUID },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
