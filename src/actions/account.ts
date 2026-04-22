"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setUserPassword } from "@/data/user";
import { apiErrors } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fileToStoredAvatar, urlToStoredAvatar } from "@/lib/avatar";

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

  const data: {
    displayName: string;
    bio: string;
    avatarUrl?: string | null;
    avatarData?: Uint8Array<ArrayBuffer> | null;
    avatarMime?: string | null;
  } = {
    displayName,
    bio,
  };

  try {
    if (avatarFile instanceof File && avatarFile.size > 0) {
      const storedAvatar = await fileToStoredAvatar(avatarFile);
      data.avatarData = storedAvatar.avatarData;
      data.avatarMime = storedAvatar.avatarMime;
      data.avatarUrl = null;
    } else if (avatarUrl) {
      const storedAvatar = await urlToStoredAvatar(avatarUrl);
      data.avatarData = storedAvatar.avatarData;
      data.avatarMime = storedAvatar.avatarMime;
      data.avatarUrl = null;
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data,
    });

    revalidatePath("/settings");
    revalidatePath("/profile");
    revalidatePath("/friends");
    revalidatePath(`/api/avatar/${session.user.id}`, "page");

    return { ok: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { ok: false, error: apiErrors.displayNameTaken };
    }
    return { ok: false, error: apiErrors.missingFields };
  }
}

export async function deleteProfileAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  try {
    await prisma.user.delete({
      where: { email: session.user.email },
    });

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/profile");
    revalidatePath("/friends");

    return { ok: true };
  } catch (error) {
    console.error("deleteProfileAction error:", error);
    return { ok: false, error: apiErrors.internalServerError };
  }
}
