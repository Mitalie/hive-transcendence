"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setUserPassword } from "@/data/user";
import { apiErrors } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function toPrismaBytes(buffer: ArrayBuffer): Uint8Array<ArrayBuffer> {
  return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
}

export async function addPasswordAction(password: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  if (!password || password.length < 6) {
    return { ok: false, error: apiErrors.passwordTooShort };
  }

  await setUserPassword(session.user.email, password);

  return { ok: true };
}

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const avatarFile = formData.get("avatarFile");

  if (!displayName) {
    return { ok: false, error: apiErrors.missingFields };
  }

  let avatarData: Uint8Array<ArrayBuffer> | null = null;
  let avatarMime: string | null = null;
  let storedAvatarUrl: string | null = null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      return { ok: false, error: apiErrors.missingFields };
    }

    const fileBuffer: ArrayBuffer = await avatarFile.arrayBuffer();
    avatarData = toPrismaBytes(fileBuffer);
    avatarMime = avatarFile.type;
    storedAvatarUrl = null;
  } else if (avatarUrl) {
    const response = await fetch(avatarUrl);

    if (!response.ok) {
      return { ok: false, error: apiErrors.userNotFound };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return { ok: false, error: apiErrors.missingFields };
    }

    const downloadedBuffer: ArrayBuffer = await response.arrayBuffer();
    avatarData = toPrismaBytes(downloadedBuffer);
    avatarMime = contentType;
    storedAvatarUrl = avatarUrl;
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      displayName,
      bio,
      avatarUrl: storedAvatarUrl,
      avatarData,
      avatarMime,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/profile");

  return { ok: true };
}
