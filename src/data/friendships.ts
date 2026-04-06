import { prisma } from "@/lib/prisma";

export async function getFriendshipBetweenUsers(
  userId1: string,
  userId2: string,
) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    },
  });
}
