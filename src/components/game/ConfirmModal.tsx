import Button from "@/components/Button";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({ visible, onCancel, onConfirm }: Props) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-card text-text p-[30px] text-center rounded-xl shadow-lg">
        <p className="mb-5 text-lg">Are you sure you want to end the game?</p>
        <div className="flex gap-2.5 justify-center">
          <Button onClick={onCancel}>Return to Game</Button>
          <Button onClick={onConfirm}>End Game</Button>
        </div>
      </div>
    </div>
  );
}
