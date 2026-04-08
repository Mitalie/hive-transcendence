"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateProfile, type UpdateProfileArgs } from "@/data/profile";

function validateUpdateProfileArgs(o: unknown): o is UpdateProfileArgs {
  if (typeof o !== "object" || o === null) return false;

  const { displayName, bio, avatarUrl } = o as Record<string, unknown>;

  if (typeof displayName !== "string") return false;
  if (bio !== undefined && typeof bio !== "string") return false;
  if (avatarUrl !== undefined && typeof avatarUrl !== "string") return false;
  if (displayName.trim().length === 0) return false;
  if (displayName.trim().length > 12) return false;
  if (bio !== undefined && bio.length > 160) return false;
  if (avatarUrl !== undefined && avatarUrl.length > 255) return false;

  return true;
}

export async function updateProfileAction(args: UpdateProfileArgs) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!validateUpdateProfileArgs(args)) throw new Error("Invalid arguments");

  return updateProfile(session.user.id, args);
}
