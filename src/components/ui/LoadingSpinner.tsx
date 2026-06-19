import React from "react";

/* ─── Size Map ─── */

const sizeMap: Record<string, { spinner: string; text: string }> = {
  sm: { spinner: "h-5 w-5 border-2", text: "text-xs mt-2" },
  md: { spinner: "h-8 w-8 border-[3px]", text: "text-sm mt-3" },
  lg: { spinner: "h-12 w-12 border-4", text: "text-base mt-4" },
  xl: { spinner: "h-16 w-16 border-4", text: "text-lg mt-4" },
};

/* ─── Types ─── */

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
}

/* ─── Component ─── */

export default function LoadingSpinner({
  size = "md",
  label,
  className = "",
}: LoadingSpinnerProps) {
  const { spinner, text } = sizeMap[size];

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <div
        className={`
          ${spinner}
          rounded-full
          border-[var(--text-muted)]
          border-t-[var(--accent-blue)]
          animate-spin
        `}
      />
      {label && (
        <p className={`${text} text-[var(--text-secondary)] font-medium`}>
          {label}
        </p>
      )}
      <span className="sr-only">{label || "Loading..."}</span>
    </div>
  );
}
