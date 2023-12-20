import {
  IncomingFriendRequest,
  OutgoingFriendRequest,
  User,
  redis,
} from "@/utils/redis";
import { compareObjects } from "@/utils/utils";
import { getSocket, trigger } from "@/utils/websocketsServer";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const friendRequestBeingDeleted: OutgoingFriendRequest =
      body.friendRequestBeingDeleted;
    if (
      typeof friendRequestBeingDeleted.to !== "string" ||
      typeof friendRequestBeingDeleted.toDisplayName !== "string" ||
      typeof friendRequestBeingDeleted.toID !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid friend request" },
        { status: 400 }
      );
    }

    const requestHeaders = headers();
    let user = JSON.parse(String(requestHeaders.get("user"))) as User;

    if (
      user.outgoingFriendRequests.every(
        (val) => !compareObjects(val, friendRequestBeingDeleted)
      )
    ) {
      return NextResponse.json(
        { message: "Friend request not found" },
        { status: 400 }
      );
    }

    user.outgoingFriendRequests = user.outgoingFriendRequests.filter(
      (val) => !compareObjects(val, friendRequestBeingDeleted)
    );

    let otherUser = (await redis.hgetall(
      friendRequestBeingDeleted.toID
    )) as User;
    let incomingRequestsFromOtherUser =
      otherUser.incomingFriendRequests as IncomingFriendRequest[];

    incomingRequestsFromOtherUser = incomingRequestsFromOtherUser.filter(
      (val) => val.fromID !== JSON.parse(String(requestHeaders.get("key")))
    );
    const socket = getSocket();
    trigger(socket, friendRequestBeingDeleted.toID, "friend-request-deleted", {
      incomingFriendRequests: incomingRequestsFromOtherUser,
      user: otherUser,
    });

    const redisPipeline = redis.pipeline();
    redisPipeline.hset(JSON.parse(String(requestHeaders.get("key"))), {
      outgoingFriendRequests: user.outgoingFriendRequests,
    });

    redisPipeline.hset(friendRequestBeingDeleted.toID, {
      incomingFriendRequests: incomingRequestsFromOtherUser,
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
