import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { username, password } = body;

  if (username === "test" && password === "1234") {
    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        username: "test"
      }
    });
  }

  return NextResponse.json(
    { success: false, message: "Invalid credentials" },
    { status: 401 }
  );
}