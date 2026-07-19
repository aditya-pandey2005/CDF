'use client';

import React from 'react';
import Link from 'next/link';
import { signOutAction } from '@/app/login/actions';

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
      className="fixed top-0 left-0 right-0 z-50 h-16 w-full bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm"
    >
      {/* App Branding */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <span className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
          SikshaMitra
        </span>
      </Link>

      {/* Center Pipeline Status */}
      <div className="flex-1 max-w-sm md:max-w-md bg-slate-50 border border-slate-200/80 px-4 py-1.5 rounded-full flex justify-center items-center">
        {renderStatus()}
      </div>

      {/* Right Side Info/Sign Out */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full border border-blue-200 text-blue-600 font-semibold bg-blue-50/50">
          Haryana Govt Schools
        </span>
        <button
          onClick={() => signOutAction()}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 cursor-pointer shadow-sm"
        >
          Sign Out 🚪
        </button>
      </div>
    </header>
  );
}

