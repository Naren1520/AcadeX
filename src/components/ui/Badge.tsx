type BadgeVariant = "pending" | "approved" | "rejected" | "revision" | "neutral" | "forming" | "confirmed" | "dissolved";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  pending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
  },
  approved: {
    backgroundColor: "#dcfce7",
    color: "#14532d",
    border: "1px solid #bbf7d0",
  },
  rejected: {
    backgroundColor: "#fee2e2",
    color: "#7f1d1d",
    border: "1px solid #fecaca",
  },
  revision: {
    backgroundColor: "#ffedd5",
    color: "#7c2d12",
    border: "1px solid #fed7aa",
  },
  neutral: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
  },
  forming: {
    backgroundColor: "#dbeafe",
    color: "#1e3a8a",
    border: "1px solid #bfdbfe",
  },
  confirmed: {
    backgroundColor: "#dcfce7",
    color: "#14532d",
    border: "1px solid #bbf7d0",
  },
  dissolved: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
  },
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
