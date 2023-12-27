import { decryptString } from "@/utils/encryption";
import { getUserByName, redis } from "@/utils/redis";
import { PasswordSchema, UsernameSchema } from "@/utils/zod";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getContrast } from "polished";
const { createCanvas } = require("canvas");
const bcrypt = require("bcrypt");

async function uploadImage(image: string) {
  const blob = await fetch(image).then((res) => res.blob());
  const res = await fetch(
    `https://www.filestackapi.com/api/store/S3?key=${process.env.FILESTACK_API_KEY}`,
    {
      method: "POST",
      body: blob,
    }
  );
  const data = await res.json();
  return data.url;
}

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

    const canvas = createCanvas(200, 200);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = generateRandomColor();
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.font = "100px Arial";
    const text = username[0];
    const textWidth = ctx.measureText(text).width;
    ctx.textAlign = "left"; // Set text alignment to 'left'
    ctx.textBaseline = "middle";
    ctx.fillText(text, (canvas.width - textWidth) / 2, 105);
    const dataURL = canvas.toDataURL("image/png");
    const profilePictureURL = await uploadImage(dataURL);

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
