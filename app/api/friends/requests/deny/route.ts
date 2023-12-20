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

    const friendRequestBeingDeclined: IncomingFriendRequest =
      body.friendRequestBeingDeclined;
    if (
      typeof friendRequestBeingDeclined.from !== "string" ||
      typeof friendRequestBeingDeclined.fromDisplayName !== "string" ||
      typeof friendRequestBeingDeclined.fromID !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid friend request" },
        { status: 400 }
      );
    }

    const requestHeaders = headers();
    let user = JSON.parse(String(requestHeaders.get("user"))) as User;

    if (
      user.incomingFriendRequests.every(
        (val) => !compareObjects(val, friendRequestBeingDeclined)
      )
    ) {
      return NextResponse.json(
        { message: "Friend request not found" },
        { status: 400 }
      );
    }

    user.incomingFriendRequests = user.incomingFriendRequests.filter(
      (val) => !compareObjects(val, friendRequestBeingDeclined)
    );
    let outgoingRequestsFromOtherUser = (await redis.hget(
      friendRequestBeingDeclined.fromID,
      "outgoingFriendRequests"
    )) as OutgoingFriendRequest[];
    outgoingRequestsFromOtherUser = outgoingRequestsFromOtherUser.filter(
      (val) => val.toID !== JSON.parse(String(requestHeaders.get("key")))
    ) as OutgoingFriendRequest[];
    const socket = getSocket();
    trigger(
      socket,
      friendRequestBeingDeclined.fromID,
      "friend-request-declined",
      {
        outgoingFriendRequests: outgoingRequestsFromOtherUser,
      }
    );
    socket.disconnect();

    const redisPipeline = redis.pipeline();
    redisPipeline.hset(JSON.parse(String(requestHeaders.get("key"))), {
      incomingFriendRequests: user.incomingFriendRequests,
    });

    redisPipeline.hset(friendRequestBeingDeclined.fromID, {
      outgoingFriendRequests: outgoingRequestsFromOtherUser,
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
