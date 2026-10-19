import { Input } from "@/components/ui/Input";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, ...inputProps }: FormFieldProps) {
  return (
    <Input
      label={label}
      error={error}
      hint={hint}
      {...inputProps}
    />
  );
}
