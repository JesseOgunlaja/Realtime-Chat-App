import { encryptString } from "@/utils/encryption";
import { redis } from "@/utils/redis";
import { UUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requestHeaders = headers();
    const user = JSON.parse(String(requestHeaders.get("user")));
    const key = JSON.parse(String(requestHeaders.get("key")));
    const usernamesWithIDs = (await redis.lrange("Usernames", 0, -1)) as {
      name: string;
      displayName: string;
      id: UUID;
    }[];
    const encryptedVersion = encryptString(
      JSON.stringify(usernamesWithIDs),
      false
    );

    return NextResponse.json(
      { message: "Success", user, key, usernamesWithIDs: encryptedVersion },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
