import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    cookies().delete("token");
    cookies().delete("credentials");
    return NextResponse.json({ message: "Success" });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", err: `${err}` },
      { status: 500 }
    );
  }
}
