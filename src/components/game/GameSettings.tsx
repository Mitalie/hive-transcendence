type Props = {
  onClose?: () => void;
};

export default function GameSettings({ onClose }: Props) {
  return (
    <div
      className="card"
      style={{
        width: "250px",
        padding: "20px",
        position: "relative",
      }}
    >
      <button
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
        }}
        onClick={onClose}
      >
        X
      </button>

      <p>Game Setting</p>
    </div>
  );
}
