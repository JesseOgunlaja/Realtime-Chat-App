import { UserType } from "@/types/UserTypes";
import { signJWT } from "@/utils/auth";
import { decryptString } from "@/utils/encryption";
import { getUserByUsername } from "@/utils/redis";
import { compare as comparePasswords } from "bcrypt";
import { UUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = body.encrypted
      ? decryptString(body.username, false)
      : body.username;
    const password = body.encrypted
      ? decryptString(body.password, false)
      : body.password;

    if (
      username === "" &&
      password === "" &&
      username == undefined &&
      password == undefined
    ) {
      return NextResponse.json(
        { message: "Error", error: "Username and or password wasn't passed" },
        { status: 400 }
      );
    }
    const result = (await getUserByUsername(username, true)) as
      | {
          user: UserType;
          key: UUID;
        }
      | undefined;
    if (result == undefined) {
      return NextResponse.json(
        { message: "Error", error: "User not found" },
        { status: 400 }
      );
    }
    const user = result.user;
    const key = result.key;
    if (!(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { message: "Error", error: "Invalid credentials" },
        { status: 400 }
      );
    }
    const payload = {
      username: user.username,
      key,
      uuid: user.uuid,
    };
    const token = await signJWT(payload, "7d");
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + 60 * 60 * 24 * 7);
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
