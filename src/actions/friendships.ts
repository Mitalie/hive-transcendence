"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFriendshipBetweenUsers } from "@/data/friendships";
import { revalidatePath } from "next/cache";

export async function sendFriendRequest(targetUserId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const currentUserId = session.user.id;

  if (currentUserId === targetUserId) {
    throw new Error("You cannot send a friend request to yourself");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: targetUserId,
    },
  });

  if (!targetUser) {
    throw new Error("Target user not found");
  }

  const existingFriendship = await getFriendshipBetweenUsers(
    currentUserId,
    targetUserId,
  );

  if (existingFriendship) {
    throw new Error("Friendship or request already exists");
  }

  await prisma.friendship.create({
    data: {
      requesterId: currentUserId,
      addresseeId: targetUserId,
      status: "PENDING",
    },
  });

  revalidatePath("/friends");
}

export async function acceptFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const currentUserId = session.user.id;

  const friendship = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  if (!friendship) {
    throw new Error("Friend request not found");
  }

  if (friendship.status !== "PENDING") {
    throw new Error("Only pending requests can be accepted");
  }

  if (friendship.addresseeId !== currentUserId) {
    throw new Error("You are not allowed to accept this request");
  }

  await prisma.friendship.update({
    where: {
      id: friendshipId,
    },
    data: {
      status: "ACCEPTED",
    },
  });

  revalidatePath("/friends");
}

export async function declineFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const currentUserId = session.user.id;

  const friendship = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  if (!friendship) {
    throw new Error("Friend request not found");
  }

  if (friendship.status !== "PENDING") {
    throw new Error("Only pending requests can be declined");
  }

  if (friendship.addresseeId !== currentUserId) {
    throw new Error("You are not allowed to decline this request");
  }

  await prisma.friendship.delete({
    where: {
      id: friendshipId,
    },
  });

  revalidatePath("/friends");
}

export async function cancelFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const currentUserId = session.user.id;

  const friendship = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  if (!friendship) {
    throw new Error("Friend request not found");
  }

  if (friendship.status !== "PENDING") {
    throw new Error("Only pending requests can be canceled");
  }

  if (friendship.requesterId !== currentUserId) {
    throw new Error("You are not allowed to cancel this request");
  }

  await prisma.friendship.delete({
    where: {
      id: friendshipId,
    },
  });

  revalidatePath("/friends");
}

export async function removeFriend(friendshipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const currentUserId = session.user.id;

  const friendship = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  if (!friendship) {
    throw new Error("Friendship not found");
  }

  if (friendship.status !== "ACCEPTED") {
    throw new Error("Only accepted friendships can be removed");
  }

  const isParticipant =
    friendship.requesterId === currentUserId ||
    friendship.addresseeId === currentUserId;

  if (!isParticipant) {
    throw new Error("You are not allowed to remove this friendship");
  }

  await prisma.friendship.delete({
    where: {
      id: friendshipId,
    },
  });

  revalidatePath("/friends");
}
