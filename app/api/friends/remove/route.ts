import { User, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { message: "Index not passed" },
        { status: 400 }
      );
    }
    const friendID = body.id as UUID;

    const requestHeaders = headers();

    const user = JSON.parse(String(requestHeaders.get("user"))) as User;
    const key = JSON.parse(String(requestHeaders.get("key"))) as UUID;

    if (!user.friends.find((friend) => friend.id === friendID)) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const chatID = user.chats.find((chat) => chat.withID === friendID)?.id;

    user.chats.splice(
      user.chats.findIndex((chat) => chat.id === chatID),
      1
    );
    user.friends.splice(
      user.friends.findIndex((friend) => friend.id === friendID),
      1
    );

    const otherUser = (await redis.hgetall(friendID)) as User;

    otherUser.friends.splice(
      otherUser.friends.findIndex((friend) => friend.id === key),
      1
    );
    otherUser.chats.splice(
      otherUser.chats.findIndex((chat) => chat.withID === chatID)
    );

    trigger(friendID, "friend-removed", {
      newUser: otherUser,
      friendDeletedID: key,
    });

    const redisPipeline = redis.pipeline();

    redisPipeline.hset(key, {
      chats: user.chats,
      friends: user.friends,
    });

    redisPipeline.hset(friendID, {
      chats: otherUser.chats,
      friends: otherUser.friends,
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
