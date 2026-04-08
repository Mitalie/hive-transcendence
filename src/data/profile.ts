import { prisma } from "@/lib/prisma";

export type UpdateProfileArgs = {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
};

export async function updateProfile(userId: string, args: UpdateProfileArgs) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      displayName: args.displayName,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
    },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      image: true,
      lastActiveAt: true,
      updatedAt: true,
    },
  });
}

export async function getProfileByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      image: true,
      lastActiveAt: true,
      updatedAt: true,
    },
  });
}

export async function getPublicProfileByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  });
}

export function isProfileComplete(user: { displayName: string | null }) {
  return !!user.displayName?.trim();
}

export async function touchLastActive(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
    select: { lastActiveAt: true },
  });
}

export async function clearLastActive(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: null },
    select: { lastActiveAt: true },
  });
}
