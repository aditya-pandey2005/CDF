'use client';

import React from 'react';
import Link from 'next/link';

export type CommandStatus = 'idle' | 'listening' | 'processing' | 'generating' | 'ready' | 'error';

interface CommandBarProps {
  status: CommandStatus;
  message?: string;
}

export default function CommandBar({ status, message = '' }: CommandBarProps) {
  // Render status icon and text based on state
  const renderStatus = () => {
    switch (status) {
      case 'listening':
        return (
          <div className="flex items-center gap-3 text-[var(--accent-rose)] animate-fade-in">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-rose)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent-rose)]"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none hindi-text">
                Sun raha hai... 🎙️
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                Listening to teacher's voice
              </span>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex items-center gap-3 text-[var(--accent-blue)] animate-fade-in">
            <div className="w-5 h-5 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none hindi-text">
                Samajh raha hai... 🧠
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                Transcribing and detecting intent
              </span>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="flex items-center gap-3 text-[var(--accent-purple)] animate-fade-in">
            <span className="text-lg animate-bounce duration-1000 shrink-0">✨</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent hindi-text">
                Banaa raha hai... 🪄
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                Generating whiteboard and classroom content
              </span>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="flex items-center gap-3 text-[var(--accent-emerald)] animate-fade-in">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] text-xs font-bold shrink-0">
              ✓
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none hindi-text">
                Taiyaar hai! 🎉
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                Content is ready on board
              </span>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-3 text-[var(--accent-rose)] animate-fade-in">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent-rose)]/15 text-[var(--accent-rose)] text-sm font-bold shrink-0">
              ⚠️
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none hindi-text">
                Rukavat aayi!
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                {message || 'An error occurred'}
              </span>
            </div>
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="flex items-center gap-3 text-[var(--text-muted)] animate-fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
            </svg>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none hindi-text">
                Boliye kuch... 🎤
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                Tap mic to instruct
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <header
      id="classroom-command-bar"
      className="fixed top-0 left-0 right-0 z-50 h-16 w-full glass border-b border-[var(--border)] px-4 md:px-8 flex items-center justify-between"
    >
      {/* App Branding */}
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110">🎓</span>
        <span className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          SikshaMitra
        </span>
      </Link>

      {/* Center Pipeline Status */}
      <div className="flex-1 max-w-sm md:max-w-md bg-slate-950/40 border border-[var(--border)] px-4 py-1.5 rounded-full flex justify-center items-center">
        {renderStatus()}
      </div>

      {/* Right Side Info/Back to Landing link */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs px-2.5 py-1 rounded-full border border-blue-500/20 text-blue-400 font-semibold bg-blue-500/5">
          Haryana Govt Schools
        </span>
      </div>
    </header>
  );
}
