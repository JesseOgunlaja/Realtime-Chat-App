import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const credentials = cookies().get("credentials");
    return NextResponse.json(
      { credentials: credentials?.value },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + 2592000);
    const body = await request.json();
    cookies().set({
      name: "credentials",
      value: body.credentials,
      httpOnly: true,
      sameSite: true,
      secure: true,
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

export async function DELETE() {
  try {
    cookies().delete({ name: "credentials" });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
