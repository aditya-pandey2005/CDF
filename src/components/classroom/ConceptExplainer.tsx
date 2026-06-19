'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { ExplanationResult } from '@/types';
import MermaidRenderer from '@/components/diagrams/MermaidRenderer';
import TextToSpeech from '@/components/voice/TextToSpeech';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ConceptExplainerProps {
  topic: string;
  gradeLevel: string;
  onNewCommand: () => void;
}

// Helper to wrap Devanagari segments with the proper font classes
function formatTextWithHindi(text: string) {
  const regex = /([\u0900-\u097F]+)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.match(/[\u0900-\u097F]/)) {
      return (
        <span key={index} className="hindi-text font-hindi text-[var(--text-primary)]">
          {part}
        </span>
      );
    }
    return part;
  });
}

const keyPointColors = [
  {
    bg: 'bg-[var(--accent-blue)]/10',
    border: 'border-[var(--accent-blue)]/20',
    text: 'text-[var(--accent-blue)]',
    numberBg: 'bg-[var(--accent-blue)]',
  },
  {
    bg: 'bg-[var(--accent-emerald)]/10',
    border: 'border-[var(--accent-emerald)]/20',
    text: 'text-[var(--accent-emerald)]',
    numberBg: 'bg-[var(--accent-emerald)]',
  },
  {
    bg: 'bg-[var(--accent-amber)]/10',
    border: 'border-[var(--accent-amber)]/20',
    text: 'text-[var(--accent-amber)]',
    numberBg: 'bg-[var(--accent-amber)]',
  },
  {
    bg: 'bg-[var(--accent-purple)]/10',
    border: 'border-[var(--accent-purple)]/20',
    text: 'text-[var(--accent-purple)]',
    numberBg: 'bg-[var(--accent-purple)]',
  },
];

export default function ConceptExplainer({
  topic,
  gradeLevel,
  onNewCommand,
}: ConceptExplainerProps) {
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'explain',
          topic,
          gradeLevel,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setExplanation(result.data as ExplanationResult);
      } else {
        throw new Error(result.error || 'Failed to fetch explanation.');
      }
    } catch (err: any) {
      console.error('[ConceptExplainer] Fetch error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [topic, gradeLevel]);

  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-6 py-12 pb-36 animate-fade-in">
        {/* Loading title and thinking message */}
        <div className="text-center py-6 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[var(--border)] border-t-[var(--accent-blue)] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xl">🤔</span>
          </div>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            SikshaMitra soch rahi hai... 🤔
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Generating explanation and interactive diagram
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Left column skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-10 bg-slate-800/50 rounded-xl w-3/4 animate-pulse" />
            <div className="h-[400px] bg-slate-800/30 rounded-2xl border border-[var(--border)] w-full animate-pulse flex items-center justify-center">
              <span className="text-[var(--text-muted)] text-sm">Creating flowchart...</span>
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="h-6 bg-slate-800/50 rounded-xl w-1/3 animate-pulse" />
              <div className="h-4 bg-slate-800/30 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-800/30 rounded-md w-11/12 animate-pulse" />
              <div className="h-4 bg-slate-800/30 rounded-md w-10/12 animate-pulse" />
            </div>

            <div className="space-y-4">
              <div className="h-6 bg-slate-800/50 rounded-xl w-1/4 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-[var(--border)] bg-slate-800/20 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                  <div className="h-6 bg-slate-800 rounded-md w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12 gap-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-fade-in">
        <div className="text-4xl">⚠️</div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">Kuch galat ho gaya!</h3>
          <p className="text-sm text-rose-300/80">
            Hum explanation nahi la paaye. Kripya connection check karein aur retry karein.
          </p>
          {error && <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{error}</p>}
        </div>
        <Button variant="accent" onClick={fetchExplanation} className="px-6">
          Phir se koshish karein 🔄 (Retry)
        </Button>
      </div>
    );
  }

  const paragraphs = explanation?.explanation.split(/\n\n+/) || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 pb-40 flex flex-col gap-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-sm font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Grade {gradeLevel} Topic
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mt-1 leading-tight">
              {topic}
            </h2>
          </div>

          <div className="w-full">
            {explanation?.diagram ? (
              <MermaidRenderer chart={explanation.diagram} />
            ) : (
              <div className="flex items-center justify-center p-8 rounded-[var(--radius)] bg-[var(--bg-surface)] border border-[var(--border)] w-full h-[300px]">
                <p className="text-[var(--text-secondary)]">No diagram available for this topic.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-8">
          {/* Explanation Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <span>📖</span> Explanation (समझाओ)
            </h3>
            <div className="flex flex-col gap-2">
              {paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className="smart-board-text text-[var(--text-primary)] leading-relaxed mb-2"
                >
                  {formatTextWithHindi(p)}
                </p>
              ))}
            </div>
          </div>

          {/* Key Points Section */}
          {explanation?.keyPoints && explanation.keyPoints.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                <span>✨</span> Key Points (मुख्य बातें)
              </h3>
              <div className="flex flex-col gap-3">
                {explanation.keyPoints.map((point, index) => {
                  const colorConfig = keyPointColors[index % keyPointColors.length];
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${colorConfig.bg} ${colorConfig.border} animate-fade-in`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold shrink-0 text-sm ${colorConfig.numberBg}`}>
                        {index + 1}
                      </span>
                      <span className="text-lg font-medium text-[var(--text-primary)] leading-relaxed">
                        {formatTextWithHindi(point)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full glass border-t border-[var(--border)] px-6 py-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          {explanation?.explanation && (
            <TextToSpeech
              text={explanation.explanation}
              autoPlay={true}
              mode="inline"
              className="bg-transparent border-0 shadow-none p-0 w-full"
            />
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onNewCommand}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md shadow-purple-500/25 py-3 px-6 text-base font-semibold"
        >
          <span>Ask Something Else</span>
          <span>🎤</span>
        </Button>
      </div>
    </div>
  );
}
