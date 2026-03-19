import { getUsers, User } from "@/data/demo";
import Link from "next/link";

function UserListEntry({ user }: Readonly<{ user: User }>) {
  return (
    <ul>
      <Link href={"user/" + user.id}>
        {user.name}
      </Link>
    </ul>
  );
}

export default async function UserList() {
  const users = await getUsers();
  return (
    <li>
      {users.map(user => <UserListEntry key={user.id} user={user} />)}
    </li>
  );
}
