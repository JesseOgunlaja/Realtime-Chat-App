import { UserType } from "@/types/UserTypes";
import { decodeJWT, signJWT } from "@/utils/auth";
import { getUserByName, redis } from "@/utils/redis";
import { UserJWTSchema, UsernameSchema } from "@/utils/zod";
import { UUID } from "crypto";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const user = JSON.parse(headersList.get("user") as string) as UserType;
    const key = JSON.parse(String(headersList.get("key"))) as UUID;

    if (user.username.toUpperCase() === newUsername) {
      return NextResponse.json(
        { message: "This is already your username" },
        { status: 400 }
      );
    }

    const result = UsernameSchema.safeParse(newUsername);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

    const doesUserExist =
      ((await getUserByName(newUsername)) as UserType | undefined) !==
      undefined;

    if (doesUserExist) {
      return NextResponse.json(
        { message: "This username is already taken" },
        { status: 400 }
      );
    }

    const ids = (
      (await redis.lrange("Usernames", 0, -1)) as {
        name: string;
        displayName: string;
        profilePicture: string;
        id: UUID;
      }[]
    ).map((val) => val.id);

    const redisPipeline = redis.pipeline();

    redisPipeline.hset(key, {
      username: newUsername,
    });
    redisPipeline.lset(
      "Usernames",
      ids.indexOf(key),
      JSON.stringify({
        name: newUsername,
        displayName: user.displayName,
        id: key,
      })
    );

    await redisPipeline.exec();

    const payload = {
      username: newUsername,
      key,
      uuid: user.uuid,
    };

    const expirationDate = (
      (await decodeJWT(cookies().get("token")?.value as string))
        ?.payload as z.infer<typeof UserJWTSchema>
    ).exp;

    const token = await signJWT(payload, expirationDate);
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(expirationDate * 1000),
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
