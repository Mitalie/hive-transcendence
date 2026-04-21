import { prisma } from "@/lib/prisma";

export async function getFriendshipStatsByUserId(userId: string) {
  const acceptedFriends = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });

  const pendingSent = await prisma.friendship.count({
    where: {
      status: "PENDING",
      requesterId: userId,
    },
  });

  const pendingReceived = await prisma.friendship.count({
    where: {
      status: "PENDING",
      addresseeId: userId,
    },
  });

  return {
    acceptedFriends,
    pendingSent,
    pendingReceived,
  };
}

export async function getFriendshipBetweenUsers(
  userId1: string,
  userId2: string,
) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        {
          requesterId: userId1,
          addresseeId: userId2,
        },
        {
          requesterId: userId2,
          addresseeId: userId1,
        },
      ],
    },
  });
}

const userDisplayFields = {
  id: true,
  displayName: true,
} as const;

export async function getPendingFriendRequestsByUserId(userId: string) {
  return prisma.friendship.findMany({
    where: {
      status: "PENDING",
      addresseeId: userId,
    },
    select: {
      id: true,
      requester: { select: userDisplayFields },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getSentFriendRequestsByUserId(userId: string) {
  return prisma.friendship.findMany({
    where: {
      status: "PENDING",
      requesterId: userId,
    },
    select: {
      id: true,
      addressee: { select: userDisplayFields },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAcceptedFriendsByUserId(userId: string) {
  return prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: {
      id: true,
      requesterId: true,
      requester: { select: userDisplayFields },
      addressee: { select: userDisplayFields },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}