import { decryptString } from "@/utils/encryption";
import { User, getUserByName } from "@/utils/redis";
import { UUID } from "crypto";
import { cookies } from "next/headers";
const jwt = require("jsonwebtoken");
import { NextRequest, NextResponse } from "next/server";
const bcrypt = require("bcrypt");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.encrypted) {
      var username = decryptString(body.username, false);
      var password = decryptString(body.password, false);
    } else {
      var username = body.username;
      var password = body.password;
    }

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
    const result = (await getUserByName(username, true)) as {
      user: User;
      key: UUID;
    };
    if (result == undefined) {
      return NextResponse.json(
        { message: "Error", error: "User not found" },
        { status: 400 }
      );
    }
    const user = result.user;
    const key = result.key;
    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Error", error: "Invalid credentials" },
        { status: 400 }
      );
    }
    const payload = {
      iat: Date.now(),
      exp: Math.floor((new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000),
      username: user?.username,
      key,
      uuid: user?.uuid,
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
