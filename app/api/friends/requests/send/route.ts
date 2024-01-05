import { UserDetailsList, UserType } from "@/types/UserTypes";
import { getUserByName, redis } from "@/utils/redis";
import { trigger } from "@/utils/websocketsServer";
import { UUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const friendBeingAddedUsername = body.usernameBeingBefriended;

    const userDetailsList = (await redis.lrange(
      "User details",
      0,
      -1
    )) as UserDetailsList;

    if (!friendBeingAddedUsername) {
      return NextResponse.json(
        { message: "User being added was not passed" },
        { status: 400 }
      );
    }

    const friendBeingAddedResult = (await getUserByName(
      friendBeingAddedUsername,
      true
    )) as { user: UserType; key: UUID } | undefined;
    if (!friendBeingAddedResult) {
      return NextResponse.json(
        { message: "User doesn't exist" },
        { status: 400 }
      );
    }

    const requestHeaders = headers();
    const user = JSON.parse(String(requestHeaders.get("user"))) as UserType;

    if (user.username === friendBeingAddedUsername.toLowerCase()) {
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

    const friendBeingAddedID = userDetailsList.find(
      (usernameWIthID) =>
        usernameWIthID.name.toLowerCase() ===
        friendBeingAddedUsername.toLowerCase()
    )?.id;

    if (
      user.outgoingFriendRequests.some(
        (friendRequest) => friendRequest.toID === friendBeingAddedID
      )
    ) {
      return NextResponse.json(
        { message: "You've already sent this user a friend request" },
        { status: 400 }
      );
    }
    if (
      user.incomingFriendRequests.some(
        (friendRequest) => friendRequest.fromID === friendBeingAddedID
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
      fromID: JSON.parse(String(requestHeaders.get("key"))),
    });
    const currentOutgoingFriendRequests = [...user.outgoingFriendRequests];
    currentOutgoingFriendRequests.push({
      toID: friendBeingAddedResult.key,
    });
    trigger(key, "friend-request-sent", {
      newFriendRequest: {
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
