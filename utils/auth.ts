import { UUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { User, redis } from "./redis";
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

function customStringify(obj: any) {
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

export async function signJWT(
  payload: Record<string, unknown>,
  duration: string
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_SIGNING_KEY));
}

export async function checkSignedIn(
  requestOrToken: NextRequest | string,
  isApiEndpoint: boolean,
  plainToken?: boolean
): Promise<
  | boolean
  | { isSignedIn: boolean; user: User; key: UUID }
  | { isSignedIn: boolean }
> {
  const token = plainToken
    ? (requestOrToken as string)
    : (requestOrToken as NextRequest).cookies.get("token")?.value;
  if (token == undefined) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  const decodedToken = await decodeJWT(token, false);
  if (decodedToken == undefined) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  const decodedPayload = decodedToken.payload as z.infer<typeof UserJWTSchema>;
  if (UserJWTSchema.safeParse(decodedPayload).success === false) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  const user = (await redis.hgetall(decodedPayload.key)) as User;
  if (user == undefined) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  if (user.uuid !== decodedPayload.uuid) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  if (isApiEndpoint)
    return { isSignedIn: true, user: user, key: decodedPayload.key as UUID };
  return true;
}

export async function protectedRouteForwarder(request: NextRequest) {
  try {
    const result = (await checkSignedIn(request, true)) as {
      isSignedIn: boolean;
      user: User;
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
    console.log(err);
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
