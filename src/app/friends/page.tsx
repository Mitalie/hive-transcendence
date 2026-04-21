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
        id: f.id,
        label: resolveLabel(f.requester),
      }))}
      sentRequests={sentRequests.map((f) => ({
        id: f.id,
        label: resolveLabel(f.addressee),
      }))}
      friends={friends.map((f) => {
        const friend = f.requesterId === userId ? f.addressee : f.requester;
        return {
          id: f.id,
          label: resolveLabel(friend),
        };
      })}
    />
  );
}
