import { sendFriendRequest } from "@/actions/friendships";

type Props = {
  userId: string;
  name: string | null;
  username: string | null;
};

export default function DiscoverUserCard({ userId, name, username }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-medium">{name || username || "Unknown user"}</p>
        <p className="text-sm text-gray-600">{username || "No username"}</p>
      </div>

      <form
        action={async () => {
          "use server";
          await sendFriendRequest(userId);
        }}
      >
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
        >
          Add friend
        </button>
      </form>
    </div>
  );
}
