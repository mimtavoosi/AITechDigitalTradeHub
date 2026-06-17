import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
};

type TextFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type TextAreaFieldProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextField({ label, hint, error, icon, wrapperClassName, className, ...props }: TextFieldProps) {
  return (
    <label className={cn("grid gap-1.5 text-sm", wrapperClassName)}>
      {label ? <span className="font-bold text-foreground">{label}</span> : null}
      <span className={cn("flex min-h-10 items-center gap-2 rounded-md border bg-white px-3 transition focus-within:border-accent", error ? "border-danger" : "border-border")}>
        {icon ? <span className="shrink-0 text-muted">{icon}</span> : null}
        <input className={cn("h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />
      </span>
      <FieldNote error={error} hint={hint} />
    </label>
  );
}

export function TextAreaField({ label, hint, error, wrapperClassName, className, ...props }: TextAreaFieldProps) {
  return (
    <label className={cn("grid gap-1.5 text-sm", wrapperClassName)}>
      {label ? <span className="font-bold text-foreground">{label}</span> : null}
      <textarea className={cn("min-h-28 rounded-md border bg-white px-3 py-2 text-sm leading-7 outline-none transition placeholder:text-muted/70 focus:border-accent disabled:cursor-not-allowed disabled:opacity-60", error ? "border-danger" : "border-border", className)} {...props} />
      <FieldNote error={error} hint={hint} />
    </label>
  );
}

function FieldNote({ hint, error }: { hint?: string; error?: string }) {
  if (error) return <span className="text-xs font-bold text-danger">{error}</span>;
  if (hint) return <span className="text-xs text-muted">{hint}</span>;
  return null;
}
