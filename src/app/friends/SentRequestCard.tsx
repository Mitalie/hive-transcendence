import { cancelFriendRequest } from "@/actions/friendships";

type Props = {
  friendshipId: string;
  name: string | null;
  username: string | null;
};

export default function SentRequestCard({
  friendshipId,
  name,
  username,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-medium">{name || username || "Unknown user"}</p>
        <p className="text-sm text-gray-600">{username || "No username"}</p>
      </div>

      <form
        action={async () => {
          "use server";
          await cancelFriendRequest(friendshipId);
        }}
      >
        <button
          type="submit"
          className="rounded-lg bg-yellow-600 px-3 py-2 text-sm text-white"
        >
          Cancel request
        </button>
      </form>
    </div>
  );
}
