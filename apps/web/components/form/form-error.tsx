import { CircleAlert } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-2xl bg-cherry-wash px-4 py-3 text-sm font-bold text-cherry-deep"
    >
      <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
