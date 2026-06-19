"use client";

import React from "react";

/* ─── Glow Color Map ─── */

const glowColorMap: Record<string, string> = {
  blue: "hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]",
  emerald: "hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]",
  amber: "hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]",
  purple: "hover:shadow-[0_0_24px_rgba(139,92,246,0.25)]",
  rose: "hover:shadow-[0_0_24px_rgba(244,63,94,0.25)]",
};

/* ─── Variant Styles ─── */

const variantStyles: Record<string, string> = {
  default:
    "bg-[var(--bg-card)] border border-[var(--border)]",
  elevated:
    "bg-[var(--bg-card)] border border-[var(--border)] shadow-xl shadow-black/20",
  interactive:
    "bg-[var(--bg-card)] border border-[var(--border)] cursor-pointer hover:scale-[1.02] hover:border-[var(--accent-blue)] active:scale-[0.99]",
};

/* ─── Types ─── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  glowColor?: "blue" | "emerald" | "amber" | "purple" | "rose";
  noPadding?: boolean;
  children: React.ReactNode;
}

/* ─── Component ─── */

export default function Card({
  variant = "default",
  glowColor,
  noPadding = false,
  className = "",
  children,
  ...props
}: CardProps) {
  const glowClass =
    variant === "interactive" && glowColor
      ? glowColorMap[glowColor] ?? ""
      : "";

  return (
    <div
      className={`
        rounded-[var(--radius)]
        backdrop-blur-md
        transition-all duration-300 ease-out
        ${variantStyles[variant]}
        ${glowClass}
        ${noPadding ? "" : "p-6"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
