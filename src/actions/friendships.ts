"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFriendshipBetweenUsers } from "@/data/friendships";
import { revalidatePath } from "next/cache";
import { apiErrors } from "@/lib/api-errors";
import { friendshipErrors } from "@/lib/friendship-errors";

type ActionResult = { success: true } | { error: string };

export async function sendFriendRequest(
  targetUserId: string,
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: apiErrors.unauthorized };
  }

  const currentUserId = session.user.id;

  if (currentUserId === targetUserId) {
    return { error: friendshipErrors.cannotAddSelf };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!targetUser) {
      return { error: friendshipErrors.userNotFound };
    }

    const existingFriendship = await getFriendshipBetweenUsers(
      currentUserId,
      targetUserId,
    );

    if (existingFriendship) {
      return { error: friendshipErrors.friendshipAlreadyExists };
    }

    await prisma.friendship.create({
      data: {
        requesterId: currentUserId,
        addresseeId: targetUserId,
        status: "PENDING",
      },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch {
    return { error: friendshipErrors.internalServerError };
  }
}

export async function acceptFriendRequest(
  friendshipId: string,
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: apiErrors.unauthorized };
  }

  const currentUserId = session.user.id;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: {
        id: friendshipId,
      },
    });

    if (!friendship) {
      return { error: friendshipErrors.friendRequestNotFound };
    }

    if (friendship.status !== "PENDING") {
      return { error: friendshipErrors.friendRequestAlreadyHandled };
    }

    if (friendship.addresseeId !== currentUserId) {
      return { error: friendshipErrors.notAllowed };
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
    return { success: true };
  } catch {
    return { error: friendshipErrors.internalServerError };
  }
}

export async function declineFriendRequest(
  friendshipId: string,
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: apiErrors.unauthorized };
  }

  const currentUserId = session.user.id;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: {
        id: friendshipId,
      },
    });

    if (!friendship) {
      return { error: friendshipErrors.friendRequestNotFound };
    }

    if (friendship.status !== "PENDING") {
      return { error: friendshipErrors.friendRequestAlreadyHandled };
    }

    if (friendship.addresseeId !== currentUserId) {
      return { error: friendshipErrors.notAllowed };
    }

    await prisma.friendship.delete({
      where: {
        id: friendshipId,
      },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch {
    return { error: friendshipErrors.internalServerError };
  }
}

export async function cancelFriendRequest(
  friendshipId: string,
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: apiErrors.unauthorized };
  }

  const currentUserId = session.user.id;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: {
        id: friendshipId,
      },
    });

    if (!friendship) {
      return { error: friendshipErrors.friendRequestNotFound };
    }

    if (friendship.status !== "PENDING") {
      return { error: friendshipErrors.friendRequestAlreadyHandled };
    }

    if (friendship.requesterId !== currentUserId) {
      return { error: friendshipErrors.notAllowed };
    }

    await prisma.friendship.delete({
      where: {
        id: friendshipId,
      },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch {
    return { error: friendshipErrors.internalServerError };
  }
}

export async function removeFriend(
  friendshipId: string,
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: apiErrors.unauthorized };
  }

  const currentUserId = session.user.id;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: {
        id: friendshipId,
      },
    });

    if (!friendship) {
      return { error: friendshipErrors.friendshipNotFound };
    }

    if (friendship.status !== "ACCEPTED") {
      return { error: friendshipErrors.notFriends };
    }

    const isParticipant =
      friendship.requesterId === currentUserId ||
      friendship.addresseeId === currentUserId;

    if (!isParticipant) {
      return { error: friendshipErrors.notAllowed };
    }

    await prisma.friendship.delete({
      where: {
        id: friendshipId,
      },
    });

    revalidatePath("/friends");
    return { success: true };
  } catch {
    return { error: friendshipErrors.internalServerError };
  }
}
