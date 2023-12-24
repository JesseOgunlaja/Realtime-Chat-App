import { User, getUserByName, redis } from "@/utils/redis";
import { UsernameSchema } from "@/utils/zod";
import { UUID } from "crypto";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.newUsername) {
      return NextResponse.json(
        { message: "You need to pass a new username" },
        { status: 400 }
      );
    }

    const newUsername = body.newUsername.toUpperCase() as string;

    const headersList = headers();
    const user = JSON.parse(headersList.get("user") as string) as User;
    const key = JSON.parse(String(headersList.get("key"))) as UUID;

    if (user.username.toUpperCase() === newUsername) {
      return NextResponse.json(
        { message: "This is already your username" },
        { status: 400 }
      );
    }

    let result = UsernameSchema.safeParse(newUsername);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

    const doesUserExist =
      ((await getUserByName(newUsername)) as User | undefined) !== undefined;

    if (doesUserExist) {
      return NextResponse.json(
        { message: "This username is already taken" },
        { status: 400 }
      );
    }

    const usernames = (
      (await redis.lrange("Usernames", 0, -1)) as {
        name: string;
        displayName: string;
        id: UUID;
      }[]
    ).map((val) => val.name);

    const redisPipeline = redis.pipeline();

    redisPipeline.hset(key, {
      username: newUsername,
    });
    redisPipeline.lset(
      "Usernames",
      usernames.indexOf(user.username),
      JSON.stringify({
        name: newUsername,
        displayName: user.displayName,
        id: key,
      })
    );

    await redisPipeline.exec();

    const payload = {
      iat: Date.now(),
      exp: Math.floor((new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000),
      username: newUsername,
      key,
      uuid: user.uuid,
    };

    const token = jwt.sign(payload, process.env.SIGNING_KEY);
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + 2592000);
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expirationDate,
    });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
