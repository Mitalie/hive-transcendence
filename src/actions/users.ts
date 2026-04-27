"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UserResult = { id: string; label: string; avatarVersion: number };

export async function searchUsersForFriendRequest(
  keyword: string,
): Promise<UserResult[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const trimmed = keyword.trim();
  if (trimmed.length === 0) return [];

  const currentUserId = session.user.id;

  const existingFriendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
    },
    select: { requesterId: true, addresseeId: true },
  });

  const excludedIds = new Set<string>([currentUserId]);
  for (const f of existingFriendships) {
    excludedIds.add(f.requesterId);
    excludedIds.add(f.addresseeId);
  }
  const excludedArray = Array.from(excludedIds);

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { notIn: excludedArray } },
        { displayName: { startsWith: trimmed } },
      ],
    },
    select: { id: true, displayName: true, bio: true, updatedAt: true },
    take: 20,
  });

  return users.map((u) => ({
    id: u.id,
    label: u.displayName ?? "Unknown user",
    bio: u.bio,
    avatarVersion: u.updatedAt.getTime(),
  }));
}
