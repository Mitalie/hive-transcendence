"use server";

import { prisma } from "@/lib/prisma";
import { apiErrors } from "@/lib/api-errors";
import bcrypt from "bcrypt";
import { setUserPassword } from "@/data/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function toPrismaBytes(arrayBuffer: ArrayBuffer): Uint8Array<ArrayBuffer> {
  return new Uint8Array(arrayBuffer);
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

async function importExternalAvatar(imageUrl: string) {
  const response = await fetch(imageUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(apiErrors.invalidImageUrl);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(apiErrors.invalidImageUrl);
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength > MAX_AVATAR_SIZE) {
    throw new Error(apiErrors.fileTooLarge);
  }

  return {
    data: toPrismaBytes(arrayBuffer),
    mime: contentType,
  };
}

export async function registerUserAction(email: string, password: string) {
  if (!email || !password) {
    return { ok: false, error: apiErrors.missingFields };
  }

  if (password.length < 6) {
    return { ok: false, error: apiErrors.passwordTooShort };
  }

  if (email.length > 100) {
    return { ok: false, error: apiErrors.emailTooLong };
  }

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ email }],
    },
  });

  if (userExists) {
    if (!userExists.password) {
      await setUserPassword(userExists.id, password);
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

export async function completeRegistrationProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const avatarChoice = String(formData.get("avatarChoice") ?? "default");
  const avatarFile = formData.get("avatarFile");

  if (!displayName) {
    return { ok: false, error: apiErrors.missingFields };
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      id: true,
      image: true,
    },
  });

  if (!user) {
    return { ok: false, error: apiErrors.userNotFound };
  }

  const dataToUpdate: {
    displayName: string;
    avatarData?: Uint8Array<ArrayBuffer> | null;
    avatarMime?: string | null;
  } = {
    displayName,
  };

  try {
    if (avatarChoice === "github") {
      if (!user.image) {
        return { ok: false, error: apiErrors.invalidImageUrl };
      }

      const imported = await importExternalAvatar(user.image);
      dataToUpdate.avatarData = imported.data;
      dataToUpdate.avatarMime = imported.mime;
    }

    if (avatarChoice === "upload") {
      if (!(avatarFile instanceof File) || avatarFile.size === 0) {
        return { ok: false, error: apiErrors.missingFields };
      }

      if (!avatarFile.type.startsWith("image/")) {
        return { ok: false, error: apiErrors.invalidImageUrl };
      }

      if (avatarFile.size > MAX_AVATAR_SIZE) {
        return { ok: false, error: apiErrors.fileTooLarge };
      }

      const arrayBuffer = await avatarFile.arrayBuffer();
      dataToUpdate.avatarData = toPrismaBytes(arrayBuffer);
      dataToUpdate.avatarMime = avatarFile.type;
    }

    if (avatarChoice === "default") {
      dataToUpdate.avatarData = null;
      dataToUpdate.avatarMime = null;
    }

    await prisma.user.update({
      where: { id: currentUserId },
      data: dataToUpdate,
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: apiErrors.errorUnexpected };
  }
}

export async function checkUsernameAvailableAction(
  username: string,
): Promise<{ available: boolean }> {
  const existing = await prisma.user.findUnique({
    where: { displayName: username },
  });
  return { available: !existing };
}
