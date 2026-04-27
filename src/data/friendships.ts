import { prisma } from "@/lib/prisma";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function isUserOnline(lastActiveAt: Date | null) {
  if (!lastActiveAt) return false;
  return Date.now() - lastActiveAt.getTime() < ONLINE_THRESHOLD_MS;
}

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
  name: true,
  username: true,
  bio: true,
  lastActiveAt: true,
  updatedAt: true,
} as const;

export async function getPendingFriendRequestsByUserId(userId: string) {
  const requests = await prisma.friendship.findMany({
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

  return requests.map((request) => ({
    ...request,
    requester: {
      ...request.requester,
      isOnline: isUserOnline(request.requester.lastActiveAt),
      lastActiveAt: undefined,
      avatarVersion: request.requester.updatedAt.getTime(),
      updatedAt: undefined,
    },
  }));
}

export async function getSentFriendRequestsByUserId(userId: string) {
  const requests = await prisma.friendship.findMany({
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

  return requests.map((request) => ({
    ...request,
    addressee: {
      ...request.addressee,
      isOnline: isUserOnline(request.addressee.lastActiveAt),
      lastActiveAt: undefined,
      avatarVersion: request.addressee.updatedAt.getTime(),
      updatedAt: undefined,
    },
  }));
}

export async function getAcceptedFriendsByUserId(userId: string) {
  const friendships = await prisma.friendship.findMany({
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

  return friendships.map((friendship) => ({
    ...friendship,
    requester: {
      ...friendship.requester,
      isOnline: isUserOnline(friendship.requester.lastActiveAt),
      lastActiveAt: undefined,
      avatarVersion: friendship.requester.updatedAt.getTime(),
      updatedAt: undefined,
    },
    addressee: {
      ...friendship.addressee,
      isOnline: isUserOnline(friendship.addressee.lastActiveAt),
      lastActiveAt: undefined,
      avatarVersion: friendship.addressee.updatedAt.getTime(),
      updatedAt: undefined,
    },
  }));
}
