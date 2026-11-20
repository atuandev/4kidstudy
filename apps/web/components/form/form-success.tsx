import { CircleCheck } from "lucide-react";

interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl bg-leaf-wash px-4 py-3 text-sm font-bold text-forest"
    >
      <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
