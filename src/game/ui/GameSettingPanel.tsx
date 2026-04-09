import Button from "@/components/Button";
import { useTranslation } from "react-i18next";

type Props = {
  onClose?: () => void;
};

export default function GameSettingPanel({ onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-card w-[300px] h-[300px] p-5 relative rounded-xl shadow-lg">
      <Button
        onClick={onClose}
        className="absolute top-[10px] right-[10px] bg-btn-purple hover:bg-btn-purple-hover"
      >
        X
      </Button>

      <p>{t("gamesetting.title")}</p>
    </div>
  );
}
