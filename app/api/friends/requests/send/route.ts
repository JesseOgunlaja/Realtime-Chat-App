import { User, getUserByName, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const friendBeingAddedUsername = body.usernameBeingBefriended;

    if (!friendBeingAddedUsername) {
      return NextResponse.json(
        { message: "User being added was not passed" },
        { status: 400 }
      );
    }

    const friendBeingAddedResult = (await getUserByName(
      friendBeingAddedUsername,
      true
    )) as { user: User; key: UUID };
    if (!friendBeingAddedResult) {
      return NextResponse.json(
        { message: "User doesn't exist" },
        { status: 400 }
      );
    }

    const requestHeaders = headers();
    const user = JSON.parse(String(requestHeaders.get("user"))) as User;

    if (user.username === friendBeingAddedUsername.toUpperCase()) {
      return NextResponse.json(
        { message: "You can't friend yourself" },
        { status: 400 }
      );
    }

    if (
      user.friends.length !== 0 &&
      user.friends.findIndex((friend) => {
        return friend.id === friendBeingAddedResult.key;
      }) !== -1
    ) {
      return NextResponse.json(
        { message: "You've already added this user as a friend" },
        { status: 400 }
      );
    }

    if (
      user.outgoingFriendRequests.some(
        (friendRequest) =>
          friendRequest.to === friendBeingAddedUsername.toUpperCase()
      )
    ) {
      return NextResponse.json(
        { message: "You've already sent this user a friend request" },
        { status: 400 }
      );
    }
    if (
      user.incomingFriendRequests.some(
        (friendRequest) =>
          friendRequest.from === friendBeingAddedUsername.toUpperCase()
      )
    ) {
      return NextResponse.json(
        { message: "This user has sent you a friend request" },
        { status: 400 }
      );
    }

    const key = friendBeingAddedResult.key;
    const currentIncomingFriendRequests = [
      ...friendBeingAddedResult.user.incomingFriendRequests,
    ];
    currentIncomingFriendRequests.push({
      from: user.username,
      fromDisplayName: user.displayName,
      fromID: JSON.parse(String(requestHeaders.get("key"))),
    });
    const currentOutgoingFriendRequests = [...user.outgoingFriendRequests];
    currentOutgoingFriendRequests.push({
      to: friendBeingAddedResult.user.username,
      toDisplayName: friendBeingAddedResult.user.displayName,
      toID: friendBeingAddedResult.key,
    });
    trigger(key, "friend-request-sent", {
      newFriendRequest: {
        from: user.username,
        fromDisplayName: user.displayName,
        fromID: JSON.parse(String(requestHeaders.get("key"))),
      },
    });

    const redisPipeline = redis.pipeline();
    redisPipeline.hset(key, {
      incomingFriendRequests: currentIncomingFriendRequests,
    });
    redisPipeline.hset(JSON.parse(String(requestHeaders.get("key"))), {
      outgoingFriendRequests: currentOutgoingFriendRequests,
    });
    await redisPipeline.exec();

    return NextResponse.json(
      {
        message: "Success",
        newOutgoingFriendRequests: currentOutgoingFriendRequests,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
