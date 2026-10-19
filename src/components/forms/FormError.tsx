interface FormErrorProps {
  message: string | null | undefined;
  id?: string;
}

export function FormError({ message, id = "form-error" }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      className="rounded px-4 py-3 text-sm text-red-700"
      style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
    >
      {message}
    </div>
  );
}
