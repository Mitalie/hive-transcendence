import { prisma } from "@/lib/prisma";

export async function getAllUsersExcept(userId: string) {
  return prisma.user.findMany({
    where: {
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
    },
  });
}

export async function getAvailableUsersForFriendRequest(currentUserId: string) {
  const existingFriendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
    },
    select: {
      requesterId: true,
      addresseeId: true,
    },
  });

  const excludedUserIds = new Set<string>();

  excludedUserIds.add(currentUserId);

  existingFriendships.forEach((friendship) => {
    excludedUserIds.add(friendship.requesterId);
    excludedUserIds.add(friendship.addresseeId);
  });

  return prisma.user.findMany({
    where: {
      id: {
        notIn: Array.from(excludedUserIds),
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
