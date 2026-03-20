type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({ visible, onCancel, onConfirm }: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="card"
        style={{
          padding: "30px",
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "20px" }}>
          Are you sure you want to end the game?
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="button" onClick={onCancel}>
            Return to Game
          </button>
          <button className="button" onClick={onConfirm}>
            End Game
          </button>
        </div>
      </div>
    </div>
  );
}
