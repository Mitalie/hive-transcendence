import { MatchResult } from "@/data/demo";
import ShowHide from "./ShowHide";

function MatchHistoryEntry({
  match,
} : Readonly<{
  match: MatchResult;
}>) {
  return (
    <tr>
      <td>{match.userScore}</td>
      <td>{match.opponentScore}</td>
      <td>{match.aiOpponent ? <i>AI</i> : match.opponentName}</td>
    </tr>
  );
}

export default function MatchHistory({
  matchHistory
}: Readonly<{
  matchHistory: MatchResult[];
}>
) {
  return (
    <>
      <h2>Match history</h2>
      <ShowHide label="Show match history">
        <table>
          <thead>
            <tr>
              <th colSpan={2}>Score</th>
              <th>Opponent</th>
            </tr>
          </thead>
          <tbody>
            {matchHistory.map((match, index) => <MatchHistoryEntry key={index} match={match} />)}
          </tbody>
        </table>
      </ShowHide>
    </>
  );
}
