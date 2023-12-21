import { IncomingFriendRequest, User, redis } from "@/utils/redis";
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
    if (
      typeof friendRequestBeingAccepted.from !== "string" ||
      typeof friendRequestBeingAccepted.fromDisplayName !== "string" ||
      typeof friendRequestBeingAccepted.fromID !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid friend request" },
        { status: 400 }
      );
    }

    const requestHeaders = headers();
    let user = JSON.parse(requestHeaders.get("user") as string) as User;

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
    )) as User;

    const originalOtherUser = JSON.parse(JSON.stringify(otherUser)) as User;

    const chatID = randomUUID();

    user.incomingFriendRequests = user.incomingFriendRequests.filter(
      (val) => !compareObjects(val, friendRequestBeingAccepted)
    );
    user.chats.push({
      id: chatID,
      messages: [],
      with: otherUser.displayName,
      withID: friendRequestBeingAccepted.fromID,
      visible: true,
    });
    user.friends.push({
      username: otherUser.username,
      alias: otherUser.displayName,
      id: friendRequestBeingAccepted.fromID,
    });

    otherUser.outgoingFriendRequests = otherUser.outgoingFriendRequests.filter(
      (val) =>
        !compareObjects(val, {
          to: user.username,
          toID: JSON.parse(requestHeaders.get("key") as string),
          toDisplayName: user.displayName,
        })
    );
    otherUser.chats.push({
      id: chatID,
      messages: [],
      with: user.displayName,
      withID: JSON.parse(requestHeaders.get("key") as string) as UUID,
      visible: true,
    });
    otherUser.friends.push({
      username: user.username,
      alias: user.displayName,
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
