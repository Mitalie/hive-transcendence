import Button from "@/components/Button";

type Props = {
  onClose?: () => void;
};

export default function GameSettings({ onClose }: Props) {
  return (
    <div className="bg-card text-text w-[250px] p-5 relative rounded-xl shadow-lg">
      <Button onClick={onClose}>X</Button>

      <p>Game Setting</p>
    </div>
  );
}
