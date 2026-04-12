"use server";

import { prisma } from "@/lib/prisma";
import { apiErrors } from "@/lib/api-errors";
import bcrypt from "bcrypt";
import { setUserPassword } from "@/data/user";

export async function registerUserAction(email: string, password: string) {
  if (!email || !password) {
    return { ok: false, error: apiErrors.missingFields };
  }

  if (password.length < 6) {
    return { ok: false, error: apiErrors.passwordTooShort };
  }

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ email }],
    },
  });

  if (userExists) {
    if (!userExists.password) {
      await setUserPassword(email, password);
      return {
        ok: true,
        userId: userExists.id,
        email: userExists.email,
        needsProfile: !userExists.displayName,
      };
    }

    return { ok: false, error: apiErrors.userAlreadyExists };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return {
    ok: true,
    userId: user.id,
    email: user.email,
    needsProfile: true,
  };
}

export async function completeRegistrationProfileAction(
  userId: string,
  displayName: string,
) {
  if (!userId || !displayName?.trim()) {
    return { ok: false, error: apiErrors.missingFields };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: userId }, { email: userId }],
    },
  });

  if (!user) {
    return { ok: false, error: apiErrors.userNotFound };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { displayName },
  });

  return { ok: true };
}
