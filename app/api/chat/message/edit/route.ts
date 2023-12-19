import { User, redis } from "@/utils/redis";
import { compareObjects } from "@/utils/utils";
import { trigger } from "@/utils/websocketsServer";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const headersList = headers();

    const user = JSON.parse(headersList.get("user") as string) as User;

    const chatIndex = user.chats.findIndex((chat) => chat.id === body.chatID);

    if (chatIndex === -1) {
      return NextResponse.json(
        { message: "Chat not found with that ID" },
        { status: 404 }
      );
    }

    const messageBeingEditedIndex = user.chats[chatIndex].messages.findIndex(
      (message) => compareObjects(message, body.message)
    );

    if (messageBeingEditedIndex === -1) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    user.chats[chatIndex].messages[messageBeingEditedIndex].message =
      body.newMessage.replaceAll("’", "'");

    const otherUser = (await redis.hgetall(
      user.chats[chatIndex].withID
    )) as User;

    const otherUserChatIndex = otherUser.chats.findIndex(
      (chat) => chat.id === body.chatID
    );

    otherUser.chats[otherUserChatIndex].messages[
      messageBeingEditedIndex
    ].message = body.newMessage.replaceAll("’", "'");

    trigger(user.chats[chatIndex].withID, "message-edited", {
      chats: otherUser.chats,
    });
    trigger(user.chats[chatIndex].withID, "message-edited-sent", {
      chatID: body.chatID,
      chats: otherUser.chats,
    });

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