interface ScoreBoardProps {
  p1: number;
  p2: number;
}

export default function ScoreBoard({ p1, p2 }: ScoreBoardProps) {
  return (
    <div className="bg-card text-text px-5 py-2.5 text-2xl rounded-xl font-mono tabular-nums">
      {String(p1).padStart(2, "0")} VS {String(p2).padStart(2, "0")}
    </div>
  );
}
