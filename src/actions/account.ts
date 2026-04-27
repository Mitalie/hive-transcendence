"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setUserPassword } from "@/data/user";
import { apiErrors } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fileToStoredAvatar, urlToStoredAvatar } from "@/lib/avatar";
import bcrypt from "bcrypt";

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

export async function updatePasswordAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: apiErrors.missingFields };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "passwords_mismatch" };
  }

  if (newPassword.length < 6) {
    return { ok: false, error: "password_too_short" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return { ok: false, error: apiErrors.unauthorized };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { ok: false, error: "invalid_current_password" };
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return { ok: false, error: "password_same_as_old" };
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    revalidatePath("/settings");

    return { ok: true };
  } catch {
    return { ok: false, error: apiErrors.missingFields };
  }
}

export async function deletePasswordAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      accounts: {
        where: { provider: "github" },
      },
    },
  });

  if (!user?.accounts?.length) {
    return { ok: false, error: apiErrors.unauthorized };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: null },
  });

  revalidatePath("/settings");
  return { ok: true };
}
