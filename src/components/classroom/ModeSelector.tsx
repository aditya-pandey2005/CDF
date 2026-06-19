'use client';

import React from 'react';
import type { Mode } from '@/types';

interface ModeSelectorProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  const tabs = [
    {
      id: 'explain' as const,
      label: 'Samjhao',
      subtitle: 'Explain',
      icon: '📖',
      colorClass: 'text-[var(--accent-blue)] hover:text-blue-300',
      activeColorClass: 'text-blue-400 font-extrabold',
    },
    {
      id: 'quiz' as const,
      label: 'Quiz Banao',
      subtitle: 'Quiz',
      icon: '📝',
      colorClass: 'text-[var(--accent-emerald)] hover:text-emerald-300',
      activeColorClass: 'text-emerald-400 font-extrabold',
    },
    {
      id: 'whiteboard' as const,
      label: 'Whiteboard',
      subtitle: 'Board',
      icon: '🎨',
      colorClass: 'text-[var(--accent-purple)] hover:text-purple-300',
      activeColorClass: 'text-purple-400 font-extrabold',
    },
  ];

  const getBackdropStyles = () => {
    switch (activeMode) {
      case 'explain':
        return 'bg-[var(--accent-blue)]/15 border border-[var(--accent-blue)]/30 shadow-[0_0_16px_rgba(59,130,246,0.2)]';
      case 'quiz':
        return 'bg-[var(--accent-emerald)]/15 border border-[var(--accent-emerald)]/30 shadow-[0_0_16px_rgba(16,185,129,0.2)]';
      case 'whiteboard':
        return 'bg-[var(--accent-purple)]/15 border border-[var(--accent-purple)]/30 shadow-[0_0_16px_rgba(139,92,246,0.2)]';
    }
  };

  const getTranslation = () => {
    switch (activeMode) {
      case 'explain':
        return 'translate-x-0';
      case 'quiz':
        return 'translate-x-full';
      case 'whiteboard':
        return 'translate-x-[200%]';
    }
  };

  return (
    <div className="w-full px-4" id="mode-selector-container">
      <div className="relative grid grid-cols-3 p-1 rounded-2xl bg-slate-900/60 border border-[var(--border)] max-w-xl mx-auto w-full shadow-lg">
        {/* Sliding Glow Backdrop */}
        <div
          className={`absolute top-1 bottom-1 left-1 w-[calc(33.333%-6px)] rounded-xl transition-all duration-300 ease-out ${getBackdropStyles()} ${getTranslation()}`}
          aria-hidden="true"
        />

        {/* Tabs */}
        {tabs.map((tab) => {
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onModeChange(tab.id)}
              className={`
                relative z-10 py-3 rounded-xl flex flex-col items-center justify-center gap-0.5
                cursor-pointer transition-all duration-200 outline-none
                ${isActive ? tab.activeColorClass : 'text-[var(--text-secondary)] hover:bg-slate-800/20'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-xl md:text-2xl transition-transform duration-200 group-hover:scale-110">
                  {tab.icon}
                </span>
                <span className="text-sm md:text-base font-bold tracking-wide">
                  {tab.label}
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider opacity-60 uppercase">
                {tab.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
