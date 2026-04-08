type BarProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Bar({ children, className = "" }: BarProps) {
  return (
    <div
      className={`
        flex items-center justify-between
        px-5 py-2.5 rounded-xl
        text-text bg-card
        ${className}
      `}
    >
      {children}
    </div>
  );
}
