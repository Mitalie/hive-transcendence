import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getPendingFriendRequestsByUserId,
  getAcceptedFriendsByUserId,
  getSentFriendRequestsByUserId,
} from "@/data/friendships";
import { FriendsClient } from "@/components/friends/FriendsClient";
import { getCurrentUser } from "@/data/user";

// ---------- Helpers ----------
function resolveLabel(u: { displayName: string | null }): string {
  return u.displayName ?? "Unknown user";
}

function avatarUrl(userId: string): string {
  return `/api/avatar/${userId}`;
}

// ---------- Page ----------
export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await getCurrentUser();
  if (!user?.displayName) redirect("/registration/profile");

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
        isOnline: f.requester.isOnline,
      }))}
      sentRequests={sentRequests.map((f) => ({
        id: f.addressee.id,
        friendshipId: f.id,
        label: resolveLabel(f.addressee),
        bio: f.addressee.bio,
        avatarUrl: avatarUrl(f.addressee.id),
        isOnline: f.addressee.isOnline,
      }))}
      friends={friends.map((f) => {
        const friend = f.requesterId === userId ? f.addressee : f.requester;

        return {
          id: friend.id,
          friendshipId: f.id,
          label: resolveLabel(friend),
          bio: friend.bio,
          avatarUrl: avatarUrl(friend.id),
          isOnline: friend.isOnline,
        };
      })}
    />
  );
}
