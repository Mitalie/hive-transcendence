import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user)
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, email: user.email },
  });

  // set cookie for session
  response.cookies.set("userId", String(user.id), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
