import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { setUserPassword } from "@/data/user";
import { apiErrors } from "@/lib/api-errors";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: apiErrors.missingFields },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: apiErrors.passwordTooShort },
      { status: 400 },
    );
  }

  const User_exists = await prisma.user.findFirst({
    where: {
      OR: [{ email }],
    },
  });

  if (User_exists) {
    if (!User_exists.password) {
      await setUserPassword(email, password);
      return NextResponse.json({
        userId: User_exists.id,
        email: User_exists.email,
        needsProfile: !User_exists.displayName,
      });
    }

    return NextResponse.json(
      { error: apiErrors.userAlreadyExists },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    needsProfile: true,
  });
}
