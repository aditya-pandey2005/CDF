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
      colorClass: 'text-slate-500 hover:text-slate-800',
      activeColorClass: 'text-blue-600 font-extrabold',
    },
    {
      id: 'quiz' as const,
      label: 'Quiz Banao',
      subtitle: 'Quiz',
      icon: '📝',
      colorClass: 'text-slate-500 hover:text-slate-800',
      activeColorClass: 'text-emerald-600 font-extrabold',
    },
    {
      id: 'whiteboard' as const,
      label: 'Whiteboard',
      subtitle: 'Board',
      icon: '🎨',
      colorClass: 'text-slate-500 hover:text-slate-800',
      activeColorClass: 'text-purple-600 font-extrabold',
    },
  ];

  const getBackdropStyles = () => {
    switch (activeMode) {
      case 'explain':
        return 'bg-white border border-slate-200 shadow-sm';
      case 'quiz':
        return 'bg-white border border-slate-200 shadow-sm';
      case 'whiteboard':
        return 'bg-white border border-slate-200 shadow-sm';
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
      <div className="relative grid grid-cols-3 p-1 rounded-2xl bg-slate-100 border border-slate-200 max-w-xl mx-auto w-full shadow-sm">
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
                ${isActive ? tab.activeColorClass : `${tab.colorClass} hover:bg-white/40`}
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
