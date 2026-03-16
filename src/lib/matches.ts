import { MatchInput } from "./schemas/match";

let matches = [
  {
    id: 1,
    player1: "neo",
    player2: "trinity",
    score1: 10,
    score2: 8,
    winner: "neo"
  }
];

export function getMatches() {
  return matches;
}

export function createMatch(data: MatchInput) {
  const { player1, player2, score1, score2 } = data;

  const winner = score1 > score2 ? player1 : player2;

  const newMatch = {
    id: matches.length + 1,
    player1,
    player2,
    score1,
    score2,
    winner
  };

  matches.push(newMatch);

  return newMatch;
}