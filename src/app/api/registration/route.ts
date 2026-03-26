import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, username, password } = await req.json();

  if (!email || !username || !password) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  const User_exists = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (User_exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
}
