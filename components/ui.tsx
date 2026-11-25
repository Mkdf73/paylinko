"use client";

import clsx from "clsx";
import { Check, Copy, X } from "lucide-react";
import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-brand-600" />
        <path d="M11 9h6.5a5.5 5.5 0 0 1 0 11H14v3.5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22.5" cy="23" r="2.6" className="fill-accent-500" />
      </svg>
      <span className={clsx("text-xl", light ? "text-white" : "text-ink")}>
        Pay<span className="text-brand-600">linko</span>
      </span>
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",
        variant === "dark" && "bg-ink text-white hover:bg-ink-soft",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
});

export function Label({ children, hint, htmlFor }: { children: ReactNode; hint?: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-800">
      {children}
      {hint && <span className="ml-1 font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { suffix?: ReactNode }>(
  function Input({ className, suffix, ...props }, ref) {
    const input = (
      <input
        ref={ref}
        className={clsx(
          "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-500",
          suffix && "pr-16",
          className
        )}
        {...props}
      />
    );
    if (!suffix) return input;
    return (
      <div className="relative">
        {input}
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-slate-500">{suffix}</span>
      </div>
    );
  }
);

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><path d=%22m7 15 5 5 5-5M7 9l5-5 5 5%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3.5 pr-9 text-sm focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("rounded-2xl border border-slate-200 bg-white", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-700">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, wide = false }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        className={clsx("animate-in max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CopyButton({ value, className, label }: { value: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          /* presse-papiers indisponible */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-sm text-slate-700 hover:bg-slate-50",
        className
      )}
      aria-label="Copier"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {label && <span>{copied ? "Copié" : label}</span>}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-brand-600" : "bg-slate-300")}
    >
      <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <p className="font-medium text-slate-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={clsx("inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)} />;
}
