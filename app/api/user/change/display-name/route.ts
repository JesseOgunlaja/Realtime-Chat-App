import { UserType } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { DisplayNameSchema } from "@/utils/zod";
import { UUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.newDisplayName) {
      return NextResponse.json(
        { message: "You need to pass a new display name" },
        { status: 400 }
      );
    }

    const newDisplayName = body.newDisplayName as string;

    const headersList = headers();
    const user = JSON.parse(headersList.get("user") as string) as UserType;
    const key = JSON.parse(String(headersList.get("key"))) as UUID;

    if (user.displayName === newDisplayName) {
      return NextResponse.json(
        { message: "This is already your display name" },
        { status: 400 }
      );
    }

    let result = DisplayNameSchema.safeParse(newDisplayName);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

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
      displayName: newDisplayName,
    });
    redisPipeline.lset(
      "Usernames",
      ids.indexOf(key),
      JSON.stringify({
        name: user.username,
        displayName: newDisplayName,
        id: key,
      })
    );

    await redisPipeline.exec();

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
