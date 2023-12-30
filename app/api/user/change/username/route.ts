import { UserType } from "@/types/UserTypes";
import { decodeJWT, signJWT } from "@/utils/auth";
import { encryptString } from "@/utils/encryption";
import { getUserByName, redis } from "@/utils/redis";
import {
  CredentialsJWTSchema,
  UserJWTSchema,
  UsernameSchema,
} from "@/utils/zod";
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

    const oldCredentialsCookie = cookies().get("credentials")?.value;

    if (oldCredentialsCookie) {
      try {
        const oldCredentials = await decodeJWT(oldCredentialsCookie);

        const schemaResult = CredentialsJWTSchema.safeParse(
          oldCredentials?.payload
        );

        if (!schemaResult.success) {
          return NextResponse.json({ message: "Success" }, { status: 200 });
        }

        const payload = {
          username: encryptString(newUsername, false),
          password: encryptString(user.password, false),
        };

        const credentialsJwtExpirationDate = (
          oldCredentials?.payload as z.infer<typeof CredentialsJWTSchema>
        ).exp;

        const credentialsJWT = await signJWT(
          payload,
          credentialsJwtExpirationDate
        );

        cookies().set({
          name: "credentials",
          value: credentialsJWT,
          httpOnly: true,
          sameSite: true,
          secure: true,
          expires: new Date(credentialsJwtExpirationDate * 1000),
        });

        const payload2 = {
          username: newUsername,
          key,
          uuid: user.uuid,
        };

        const tokenExpirationDate = (
          (await decodeJWT(cookies().get("token")?.value as string))
            ?.payload as z.infer<typeof UserJWTSchema>
        ).exp;

        const token = await signJWT(payload2, tokenExpirationDate);
        cookies().set({
          name: "token",
          value: token,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          expires: new Date(tokenExpirationDate * 1000),
        });
      } catch {
        return NextResponse.json({ message: "Success" }, { status: 200 });
      }
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
