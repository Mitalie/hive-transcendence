import Button from '@/components/Button';

type Props = {
  playing: boolean;
  onStart: () => void;
  onStop: () => void;
  onEnd: () => void;
};

export default function Controls({ playing, onStart, onStop, onEnd }: Props) {
  return (
    <div className="flex gap-2.5">
      {!playing ? (
        <Button onClick={onStart}>
          Start
        </Button>
      ) : (
        <>
          <Button onClick={onStop}>
            Stop
          </Button>
          <Button onClick={onEnd}>
            End
          </Button>
        </>
      )}
    </div>
  );
}
