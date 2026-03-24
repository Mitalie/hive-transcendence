type BarProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Bar({ children, className = "" }: BarProps) {
  return (
    <div
      className={`
        flex items-center
        px-5 py-2.5 rounded-xl
        bg-header text-text
        ${className}
      `}
    >
      {children}
    </div>
  );
}
