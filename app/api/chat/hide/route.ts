import { UserType } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.chatID == undefined) {
      return NextResponse.json(
        { message: "Incorrect values passed" },
        { status: 400 }
      );
    }

    const headersList = headers();
    const user = JSON.parse(headersList.get("user") as string) as UserType;

    let chatIndex: any;

    if (
      !user.chats.some((chat, index) => {
        if (chat.id === body.chatID) {
          chatIndex = index;
          return true;
        }
        return false;
      })
    ) {
      return NextResponse.json({ message: "Chat not foubnd" }, { status: 404 });
    }

    user.chats[chatIndex].visible = false;

    await redis.hset(JSON.parse(headersList.get("key") as string), {
      chats: user.chats,
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
