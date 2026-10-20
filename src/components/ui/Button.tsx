import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#1e3a5f",
    color: "#ffffff",
    border: "1px solid #1e3a5f",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "#1e3a5f",
    border: "1px solid #1e3a5f",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#374151",
    border: "1px solid transparent",
  },
  destructive: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "1px solid #dc2626",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${sizeStyles[size]} ${className}`}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  }
);
