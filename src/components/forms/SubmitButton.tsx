import { Button } from "@/components/ui/Button";

interface SubmitButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SubmitButton({
  isLoading = false,
  children,
  disabled,
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      isLoading={isLoading}
      disabled={disabled || isLoading}
      className={className}
    >
      {children}
    </Button>
  );
}
