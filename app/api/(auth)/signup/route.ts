import { decryptString } from "@/utils/encryption";
import { getUserByName, redis } from "@/utils/redis";
import { PasswordSchema, UsernameSchema } from "@/utils/zod";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.encrypted) {
      var displayName = decryptString(body.username, false);
      var username = displayName.toUpperCase();
      var password = decryptString(body.password, false);
    } else {
      var displayName = body.username;
      var username = displayName.toUpperCase();
      var password = body.password;
    }

    let result = UsernameSchema.safeParse(username);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

    result = PasswordSchema.safeParse(password);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

    if ((await getUserByName(username)) !== undefined)
      return NextResponse.json(
        { message: "Error", error: "Duplicate username" },
        { status: 400 }
      );

    const uuid = randomUUID();
    const uuid2 = randomUUID();

    await redis.hset(uuid, {
      username: username,
      displayName: displayName,
      password: await bcrypt.hash(password, 10),
      friends: [],
      chats: [],
      incomingFriendRequests: [],
      outgoingFriendRequests: [],
      uuid: uuid2,
    });

    await redis.rpush("Usernames", {
      name: username,
      id: uuid,
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
