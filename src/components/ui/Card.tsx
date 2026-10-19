interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white ${className}`}
      style={{ border: "1px solid #e5e7eb", ...style }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      style={{ borderBottom: "1px solid #e5e7eb" }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h2 className={`text-base font-semibold text-neutral-900 ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      style={{ borderTop: "1px solid #e5e7eb" }}
    >
      {children}
    </div>
  );
}
