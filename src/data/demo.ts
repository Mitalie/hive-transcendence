// Data layer: get and store data in the database

interface MatchResultScore {
  userScore: number;
  opponentScore: number;
}

interface MatchResultAI {
  aiOpponent: true;
}

interface MatchResultHuman {
  aiOpponent: false;
  opponentName: string; // Only one user is logged in, human opponent is always guest and not an User
}

export type MatchResult = MatchResultScore & (MatchResultAI | MatchResultHuman);

export interface User {
  id: number;
  name: string;
  matchHistory: MatchResult[];
}

// Normally we'd store dummy data in module-level local variable, but Next.js may load the same
// module multiple times, at least in dev mode. This is a problem for mutating the dummy data in
// addMatchResult, because the server action path may end up mutating one copy and the render path
// reading another one. Store the dummy data on the Node.js global object to ensure there is only
// one copy. Alias the global object with a type assertion instead of declaring a global variable
// to keep it hidden from the rest of the codebase.
const g = global as unknown as { dataDemoDummyUsers: User[] | undefined }

g.dataDemoDummyUsers ??= [
  {
    id: 1,
    name: "Alice",
    matchHistory: [
      {
        userScore: 15,
        opponentScore: 10,
        aiOpponent: false,
        opponentName: "Charlie",
      },
      {
        userScore: 1,
        opponentScore: 15,
        aiOpponent: true,
      },
      {
        userScore: 25,
        opponentScore: 25,
        aiOpponent: false,
        opponentName: "David",
      },
    ],
  },
  {
    id: 2,
    name: "Bob",
    matchHistory: [
      {
        userScore: 1,
        opponentScore: 0,
        aiOpponent: true,
      },
      {
        userScore: 0,
        opponentScore: 1,
        aiOpponent: true,
      },
      {
        userScore: 9,
        opponentScore: 15,
        aiOpponent: false,
        opponentName: "Charlie",
      },
      {
        userScore: 15,
        opponentScore: 14,
        aiOpponent: false,
        opponentName: "Charlie",
      },
    ],
  },
];

const users = g.dataDemoDummyUsers;

export async function getUsers(): Promise<User[]> {
  return users;
}

export async function getUser(id: number): Promise<User | undefined> {
  return users.find(user => user.id === id);
}

export async function getCurrentUser(): Promise<User> {
  return users[0];
}

export async function addMatchResult(result: MatchResult) {
  (await getCurrentUser()).matchHistory.push(result);
}
