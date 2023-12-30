import { IncomingFriendRequest, UserType } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { compareObjects } from "@/utils/utils";
import { trigger } from "@/utils/websocketsServer";
import { UUID, randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const friendRequestBeingAccepted: IncomingFriendRequest =
      body.friendRequestBeingAccepted;
    if (typeof friendRequestBeingAccepted.fromID !== "string") {
      return NextResponse.json(
        { message: "Invalid friend request" },
        { status: 400 }
      );
    }

    const requestHeaders = headers();
    const user = JSON.parse(requestHeaders.get("user") as string) as UserType;

    if (
      user.incomingFriendRequests.every(
        (val) => !compareObjects(val, friendRequestBeingAccepted)
      )
    ) {
      return NextResponse.json(
        { message: "Friend request not found" },
        { status: 400 }
      );
    }

    const otherUser = (await redis.hgetall(
      friendRequestBeingAccepted.fromID
    )) as UserType;

    const chatID = randomUUID();

    user.incomingFriendRequests = user.incomingFriendRequests.filter(
      (val) => !compareObjects(val, friendRequestBeingAccepted)
    );
    user.chats.push({
      id: chatID,
      messages: [],
      withID: friendRequestBeingAccepted.fromID,
      visible: false,
    });
    user.friends.push({
      id: friendRequestBeingAccepted.fromID,
    });

    otherUser.outgoingFriendRequests = otherUser.outgoingFriendRequests.filter(
      (val) => val.toID !== JSON.parse(requestHeaders.get("key") as string)
    );
    otherUser.chats.push({
      id: chatID,
      messages: [],
      withID: JSON.parse(requestHeaders.get("key") as string) as UUID,
      visible: false,
    });
    otherUser.friends.push({
      id: JSON.parse(requestHeaders.get("key") as string),
    });

    trigger(friendRequestBeingAccepted.fromID, "friend-request-accepted", {
      outgoingFriendRequests: otherUser.outgoingFriendRequests,
      friends: otherUser.friends,
      chats: otherUser.chats,
    });
    const redisPipeline = redis.pipeline();

    redisPipeline.hset(JSON.parse(requestHeaders.get("key") as string), {
      incomingFriendRequests: user.incomingFriendRequests,
      friends: user.friends,
      chats: user.chats,
    });
    redisPipeline.hset(friendRequestBeingAccepted.fromID, {
      outgoingFriendRequests: otherUser.outgoingFriendRequests,
      friends: otherUser.friends,
      chats: otherUser.chats,
    });
    await redisPipeline.exec();

    return NextResponse.json({ message: "Success", user }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
