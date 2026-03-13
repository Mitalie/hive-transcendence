"use client";

import { addMatchResultAction } from "@/actions/demo";
import { useState } from "react";

export default function Play() {
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [aiOpponent, setAiOpponent] = useState(false);
  const [opponentName, setOpponentName] = useState("");

  return (
    <div>
      This is where the game would be, but for now you can just type the results...
      <form action={addMatchResultAction}>
        <label>
          Your score
          <input type="number" name="userScore" min={0} step={1} value={userScore} onChange={e => setUserScore(Number(e.target.value))} />
        </label>
        <br />
        <label>
          Opponent score
          <input type="number" name="opponentScore" min={0} step={1} value={opponentScore} onChange={e => setOpponentScore(Number(e.target.value))} />
        </label>
        <br />
        <label>
          AI opponent
          <input type="checkbox" name="aiOpponent" checked={aiOpponent} onChange={e => setAiOpponent(e.target.checked)} />
        </label>
        <br />
        {aiOpponent ? null :
          <>
            <label>
              Opponent name
              <input type="text" name="opponentName" value={opponentName} onChange={e => setOpponentName(e.target.value)} />
            </label>
            <br />
          </>
        }
        <input type="submit" value="Store game result" />
      </form>
    </div>
  );
}
