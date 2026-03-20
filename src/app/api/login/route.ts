// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

  // Optional: create a session cookie if you want manual sessions
  return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
}