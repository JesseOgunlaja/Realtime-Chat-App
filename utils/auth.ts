import { UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { redis } from "./redis";
import { containsEmoji } from "./utils";
import { UserJWTSchema } from "./zod";

export async function decodeJWT(jwt: string, client?: boolean) {
  try {
    const verified = await jwtVerify(
      jwt,
      new TextEncoder().encode(
        client ? process.env.NEXT_PUBLIC_SIGNING_KEY : process.env.SIGNING_KEY
      )
    );
    return verified;
  } catch (error) {
    return undefined;
  }
}

export async function signJWT(
  payload: Record<string, unknown>,
  duration: string | number
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_SIGNING_KEY));
}

function customStringify(obj: UserType) {
  return JSON.stringify(obj, function (key, value) {
    if (key === "message" && typeof value === "string") {
      if (containsEmoji(JSON.stringify(value))) {
        return value.replace(/[\u007f-\uffff]/g, function (chr) {
          return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      return value;
    }
    return value;
  });
}

export async function checkSignedIn(
  requestOrToken: NextRequest | string,
  returnUser?: boolean,
  plainToken?: boolean
): Promise<
  | boolean
  | { isSignedIn: true; user: UserType; key: UUID }
  | { isSignedIn: false }
> {
  const token = plainToken
    ? (requestOrToken as string)
    : (requestOrToken as NextRequest).cookies.get("token")?.value;
  if (token == undefined) {
    if (returnUser) return { isSignedIn: false };
    return false;
  }
  const decodedToken = await decodeJWT(token, false);
  if (decodedToken == undefined) {
    if (returnUser) return { isSignedIn: false };
    return false;
  }
  const decodedPayload = decodedToken.payload as z.infer<typeof UserJWTSchema>;
  if (UserJWTSchema.safeParse(decodedPayload).success === false) {
    if (returnUser) return { isSignedIn: false };
    return false;
  }
  const user = (await redis.hgetall(decodedPayload.key)) as
    | UserType
    | undefined;
  if (user == undefined) {
    if (returnUser) return { isSignedIn: false };
    return false;
  }
  if (user.uuid !== decodedPayload.uuid) {
    if (returnUser) return { isSignedIn: false };
    return false;
  }
  if (returnUser)
    return { isSignedIn: true, user: user, key: decodedPayload.key as UUID };
  return true;
}

export async function protectedRouteForwarder(request: NextRequest) {
  try {
    const result = (await checkSignedIn(request, true)) as {
      isSignedIn: boolean;
      user: UserType;
      key: UUID;
    };
    if (!result.isSignedIn)
      return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("user", customStringify(result.user));
    requestHeaders.set("key", JSON.stringify(result.key));
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
