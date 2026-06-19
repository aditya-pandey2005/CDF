'use client';

import React from 'react';
import type { Mode } from '@/types';
import Card from '@/components/ui/Card';

/* ─── Mode Badge Styles ─── */

const modeBadgeStyles: Record<Mode, { bg: string; text: string; label: string }> = {
  explain: {
    bg: 'bg-[var(--accent-blue)]/15 border-[var(--accent-blue)]/30',
    text: 'text-[var(--accent-blue)]',
    label: '📖 Explain',
  },
  quiz: {
    bg: 'bg-[var(--accent-emerald)]/15 border-[var(--accent-emerald)]/30',
    text: 'text-[var(--accent-emerald)]',
    label: '❓ Quiz',
  },
  whiteboard: {
    bg: 'bg-[var(--accent-purple)]/15 border-[var(--accent-purple)]/30',
    text: 'text-[var(--accent-purple)]',
    label: '🖊️ Whiteboard',
  },
};

/* ─── Props ─── */

interface TranscriptDisplayProps {
  transcript: string;
  detectedMode?: Mode;
  isVisible: boolean;
}

/* ─── Component ─── */

export default function TranscriptDisplay({
  transcript,
  detectedMode,
  isVisible,
}: TranscriptDisplayProps) {
  if (!isVisible || !transcript) return null;

  const badge = detectedMode ? modeBadgeStyles[detectedMode] : null;

  return (
    <div className="animate-slide-up w-full max-w-lg mx-auto" id="transcript-display">
      <Card variant="elevated" className="relative overflow-hidden">
        {/* Decorative left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius)]"
          style={{
            background: detectedMode
              ? detectedMode === 'explain'
                ? 'var(--accent-blue)'
                : detectedMode === 'quiz'
                  ? 'var(--accent-emerald)'
                  : 'var(--accent-purple)'
              : 'var(--accent-blue)',
          }}
        />

        <div className="pl-4">
          {/* Header with mic icon */}
          <div className="flex items-center gap-2 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-[var(--text-muted)]"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Teacher said
            </span>

            {/* Mode badge */}
            {badge && (
              <span
                className={`ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                           text-xs font-medium border ${badge.bg} ${badge.text}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Transcript text */}
          <blockquote className="text-base md:text-lg leading-relaxed text-[var(--text-primary)] font-medium">
            &ldquo;{transcript}&rdquo;
          </blockquote>
        </div>
      </Card>
    </div>
  );
}
