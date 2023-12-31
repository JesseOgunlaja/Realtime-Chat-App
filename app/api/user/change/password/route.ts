import { UserType } from "@/types/UserTypes";
import { decryptString } from "@/utils/encryption";
import { redis } from "@/utils/redis";
import { PasswordSchema } from "@/utils/zod";
import { compare as comparePasswords, hash as hashPassword } from "bcrypt";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const headersList = headers();

    const currentPassword = body.encrypted
      ? decryptString(body.currentPassword, false)
      : body.currentPassword;
    const newPassword = body.encrypted
      ? decryptString(body.newPassword, false)
      : body.newPassword;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Invalid values passed" },
        { status: 400 }
      );
    }

    const user = JSON.parse(headersList.get("user") as string) as UserType;

    if (!(await comparePasswords(currentPassword, user.password))) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    const schemaResult = PasswordSchema.safeParse(newPassword);

    if (!schemaResult.success) {
      return NextResponse.json(
        {
          message: "Invalid password",
          reasons: schemaResult.error.format()._errors,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword, 10);

    await redis.hset(JSON.parse(headersList.get("key") as string), {
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Success", hashedPassword },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
