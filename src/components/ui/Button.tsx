"use client";

import React, { forwardRef, useCallback, useRef } from "react";

/* ─── Variant & Size Definitions ─── */

const variantStyles: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
  secondary:
    "bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-[var(--accent-blue)]",
  accent:
    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40",
  danger:
    "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-7 py-3 text-lg rounded-xl",
  xl: "px-8 py-4 text-xl rounded-2xl min-h-[56px]",
};

/* ─── Types ─── */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
}

/* ─── Component ─── */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const handleRipple = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.style.cssText = `
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          left: ${x - 10}px;
          top: ${y - 10}px;
          pointer-events: none;
        `;

        button.appendChild(ripple);

        ripple.addEventListener("animationend", () => {
          ripple.remove();
        });

        onClick?.(e);
      },
      [onClick]
    );

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node;
        }
      },
      [ref]
    );

    const isDisabled = disabled || loading;

    return (
      <button
        ref={setRefs}
        disabled={isDisabled}
        className={`
          relative overflow-hidden
          inline-flex items-center justify-center gap-2
          font-semibold
          transition-all duration-200 ease-out
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          cursor-pointer
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        onClick={handleRipple}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
