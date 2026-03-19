import { getUser } from "@/data/demo";
import { notFound } from "next/navigation";
import MatchHistory from "./_components/MatchHistory";

export default async function UserProfile({
  params
}: Readonly<{
  params: Promise<{ id: number; }>
}>) {
  const { id } = await params;
  const user = await getUser(Number(id));

  if (!user)
    notFound();

  const matches = user.matchHistory.length;
  // `.reduce(...)` is more efficient than `.filter(...).length` because it doesn't create a new array
  const wins = user.matchHistory.reduce((sum, match) => match.userScore > match.opponentScore ? sum + 1 : sum, 0);
  const losses = user.matchHistory.reduce((sum, match) => match.userScore < match.opponentScore ? sum + 1 : sum, 0);

  return (
    <div>
      <h1>User profile for {user.name}</h1>
      <p>
        Wins: {wins} / {matches}
        <br />
        Losses: {losses} / {matches}
      </p>
      <MatchHistory matchHistory={user.matchHistory}/>
    </div>
  );
}
