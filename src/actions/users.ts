"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UserResult = { id: string; label: string; email?: string };

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
        {
          OR: [
            { displayName: { contains: trimmed } },
            { email: { contains: trimmed } },
          ],
        },
      ],
    },
    select: { id: true, displayName: true, email: true },
    take: 100,
  });

  const lower = trimmed.toLowerCase();
  const filtered = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(lower) ||
      u.email?.toLowerCase().includes(lower),
  );

  return filtered.slice(0, 20).map((u) => ({
    id: u.id,
    label: u.displayName || u.email || "Unknown user",
    email: u.email ?? undefined,
  }));
}
