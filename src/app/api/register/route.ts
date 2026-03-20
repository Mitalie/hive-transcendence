// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}