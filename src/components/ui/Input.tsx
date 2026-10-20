import { forwardRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, id, className = "", ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = [
      error ? errorId : null,
      hint ? hintId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`block w-full rounded px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none ${className}`}
          style={{
            border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
            backgroundColor: "#ffffff",
          }}
          {...props}
        />

        {hint && !error && (
          <p id={hintId} className="text-xs text-neutral-500">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
