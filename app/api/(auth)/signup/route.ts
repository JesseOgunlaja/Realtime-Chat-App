import { decryptString } from "@/utils/encryption";
import { getUserByName, redis } from "@/utils/redis";
import { PasswordSchema, UsernameSchema } from "@/utils/zod";
import { randomUUID } from "crypto";
import { promises as fsPromises } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getContrast } from "polished";
const sharp = require("sharp");
const bcrypt = require("bcrypt");

const filestackClient = require("filestack-js").init(
  process.env.FILESTACK_API_KEY
);

function generateRandomColor(): string {
  const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256
  )}, ${Math.floor(Math.random() * 256)})`;
  const contrast = getContrast(randomColor, "white");

  return contrast >= 4.5 ? randomColor : generateRandomColor();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.encrypted) {
      var displayName = decryptString(body.username, false);
      var username = displayName.toUpperCase();
      var password = decryptString(body.password, false);
    } else {
      var displayName = body.username;
      var username = displayName.toUpperCase();
      var password = body.password;
    }

    let result = UsernameSchema.safeParse(username);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

    result = PasswordSchema.safeParse(password);
    if (!result.success)
      return NextResponse.json(
        { message: "Error", error: result.error.format()._errors },
        { status: 400 }
      );

    if ((await getUserByName(username)) !== undefined)
      return NextResponse.json(
        { message: "Error", error: "Duplicate username" },
        { status: 400 }
      );

    const uuid = randomUUID();
    const uuid2 = randomUUID();

    const imageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="${generateRandomColor()}"/></svg>`
          ),
          top: 0,
          left: 0,
        },
        {
          input: Buffer.from(
            `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="65" font-family="Arial" font-size="45" fill="white" text-anchor="middle" dominant-baseline="middle">${username[0]}</text></svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .png() // Convert to PNG format
      .toBuffer();

    const tempFilePath = "temp_logo.png";
    await fsPromises.writeFile(tempFilePath, imageBuffer);

    const profilePictureURL = (await filestackClient.upload(tempFilePath)).url;

    await fsPromises.unlink(tempFilePath);

    const redisPipeline = redis.pipeline();

    redisPipeline.hset(uuid, {
      username: username,
      displayName: displayName,
      password: await bcrypt.hash(password, 10),
      friends: [],
      chats: [],
      profilePicture: profilePictureURL,
      incomingFriendRequests: [],
      outgoingFriendRequests: [],
      uuid: uuid2,
    });

    redisPipeline.rpush("Usernames", {
      name: username,
      displayName,
      id: uuid,
      profilePicture: profilePictureURL,
    });

    await redisPipeline.exec();

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
