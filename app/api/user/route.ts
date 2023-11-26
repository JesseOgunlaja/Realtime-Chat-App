import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requestHeaders = headers();
    const user = JSON.parse(String(requestHeaders.get("user")));
    const key = JSON.parse(String(requestHeaders.get("key")));

    return NextResponse.json(
      { message: "Success", user, key },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
