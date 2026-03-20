type Props = {
  playing: boolean;
  onStart: () => void;
  onStop: () => void;
  onEnd: () => void;
};

export default function Controls({ playing, onStart, onStop, onEnd }: Props) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {!playing ? (
        <button className="button" onClick={onStart}>
          Start
        </button>
      ) : (
        <>
          <button className="button" onClick={onStop}>
            Stop
          </button>
          <button className="button" onClick={onEnd}>
            End
          </button>
        </>
      )}
    </div>
  );
}
