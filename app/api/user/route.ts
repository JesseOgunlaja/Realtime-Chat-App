import { UserDetailsList } from "@/types/UserTypes";
import { encryptString } from "@/utils/encryption";
import { redis } from "@/utils/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requestHeaders = headers();
    const user = JSON.parse(String(requestHeaders.get("user")));
    const key = JSON.parse(String(requestHeaders.get("key")));
    const userDetailsList = (await redis.lrange(
      "User details",
      0,
      -1
    )) as UserDetailsList;
    const encryptedVersion = encryptString(
      JSON.stringify(userDetailsList),
      false
    );

    return NextResponse.json(
      { message: "Success", user, key, userDetailsList: encryptedVersion },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
