import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getPendingFriendRequestsByUserId,
  getAcceptedFriendsByUserId,
  getSentFriendRequestsByUserId,
} from "@/data/friendships";
import { FriendsClient } from "@/components/friends/FriendsClient";

// ---------- Helpers ----------
function resolveLabel(u: { displayName: string | null }): string {
  return u.displayName ?? "Unknown user";
}

function avatarUrl(userId: string): string {
  return `/api/avatar/${userId}`;
}

function isOnline(lastActiveAt: Date | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 2 * 60 * 1000;
}

// ---------- Page ----------
export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [incomingRequests, sentRequests, friends] = await Promise.all([
    getPendingFriendRequestsByUserId(userId),
    getSentFriendRequestsByUserId(userId),
    getAcceptedFriendsByUserId(userId),
  ]);

  return (
    <FriendsClient
      incomingRequests={incomingRequests.map((f) => ({
        id: f.requester.id,
        friendshipId: f.id,
        label: resolveLabel(f.requester),
        bio: f.requester.bio,
        avatarUrl: avatarUrl(f.requester.id),
        isOnline: isOnline(f.requester.lastActiveAt),
      }))}
      sentRequests={sentRequests.map((f) => ({
        id: f.addressee.id,
        friendshipId: f.id,
        label: resolveLabel(f.addressee),
        bio: f.addressee.bio,
        avatarUrl: avatarUrl(f.addressee.id),
        isOnline: isOnline(f.addressee.lastActiveAt),
      }))}
      friends={friends.map((f) => {
        const friend = f.requesterId === userId ? f.addressee : f.requester;
        return {
          id: friend.id,
          friendshipId: f.id,
          label: resolveLabel(friend),
          bio: friend.bio,
          avatarUrl: avatarUrl(friend.id),
          isOnline: isOnline(friend.lastActiveAt),
        };
      })}
    />
  );
}
