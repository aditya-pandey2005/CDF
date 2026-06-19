'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { QuizQuestion } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import useTextToSpeech from '@/hooks/useTextToSpeech';

interface QuizResultsProps {
  questions: QuizQuestion[];
  selectedAnswers: Record<number, string>;
  onRetry: () => void;
  onNewCommand: () => void;
}

// Helper to wrap Devanagari segments with the proper font classes
function formatTextWithHindi(text: string) {
  if (!text) return '';
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

export default function QuizResults({
  questions,
  selectedAnswers,
  onRetry,
  onNewCommand,
}: QuizResultsProps) {
  const { speak, stop } = useTextToSpeech();

  // Calculate score
  const correctCount = useMemo(() => {
    return questions.reduce((acc, question, index) => {
      const selected = selectedAnswers[question.id] || selectedAnswers[index];
      return selected === question.correct ? acc + 1 : acc;
    }, 0);
  }, [questions, selectedAnswers]);

  const total = questions.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Performance messages & colors
  const { message, colorClass, borderGlowClass, ringColor } = useMemo(() => {
    if (scorePercent === 100) {
      return {
        message: 'Perfect! Excellent! 🏆',
        colorClass: 'text-[var(--accent-emerald)]',
        borderGlowClass: 'border-[var(--accent-emerald)]/30 shadow-[var(--accent-emerald)]/10',
        ringColor: 'var(--accent-emerald)',
      };
    } else if (scorePercent >= 80) {
      return {
        message: 'Bahut Achhe! Great job! 🎉',
        colorClass: 'text-[var(--accent-emerald)]',
        borderGlowClass: 'border-[var(--accent-emerald)]/30 shadow-[var(--accent-emerald)]/10',
        ringColor: 'var(--accent-emerald)',
      };
    } else if (scorePercent >= 60) {
      return {
        message: 'Achha hai! Keep it up! 👍',
        colorClass: 'text-[var(--accent-amber)]',
        borderGlowClass: 'border-[var(--accent-amber)]/30 shadow-[var(--accent-amber)]/10',
        ringColor: 'var(--accent-amber)',
      };
    } else {
      return {
        message: 'Koi baat nahi, phir try karo! 💪',
        colorClass: 'text-[var(--accent-rose)]',
        borderGlowClass: 'border-[var(--accent-rose)]/30 shadow-[var(--accent-rose)]/10',
        ringColor: 'var(--accent-rose)',
      };
    }
  }, [scorePercent]);

  // Animated score state
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = correctCount;
    if (end === 0) {
      setAnimatedScore(0);
      return;
    }
    
    const duration = 1000; // ms
    const stepTime = Math.max(20, Math.abs(Math.floor(duration / end)));
    
    const timer = setInterval(() => {
      start += 1;
      setAnimatedScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [correctCount]);

  // Accordion state (open/close for each question review)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const toggleExpand = (idx: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // TTS read result summary on mount
  useEffect(() => {
    const summaryText = `Aapka score hai ${correctCount} out of ${total}. ${message.replace(/[🏆🎉👍💪]/g, '')}`;
    speak(summaryText);
    return () => {
      stop();
    };
  }, [correctCount, total, message, speak, stop]);

  // Circular score stroke definitions
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8 animate-slide-up">
      {/* ─── Header Result Card ─── */}
      <Card variant="elevated" className={`relative overflow-hidden border ${borderGlowClass} shadow-2xl`}>
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${ringColor}, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8 py-4">
          {/* Circular score indicator */}
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Foreground animated progress circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={ringColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1.0s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[var(--text-primary)]">
                {animatedScore}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
                out of {total}
              </span>
            </div>
          </div>

          {/* Performance text */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <span className="text-sm font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Quiz Completed 🏁
            </span>
            <h2 className={`text-3xl md:text-5xl font-black ${colorClass} tracking-tight leading-tight`}>
              {formatTextWithHindi(message)}
            </h2>
            <p className="text-base text-[var(--text-secondary)] mt-1">
              Aapne <span className="font-bold text-[var(--text-primary)]">{scorePercent}%</span> questions sahi kiye!
            </p>
          </div>
        </div>
      </Card>

      {/* ─── Review Section ─── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <span>📝</span> Review Answers (उत्तरों की समीक्षा)
        </h3>

        <div className="flex flex-col gap-4">
          {questions.map((question, index) => {
            const selected = selectedAnswers[question.id] || selectedAnswers[index];
            const isCorrect = selected === question.correct;
            const isOpen = !!expandedQuestions[index];

            return (
              <Card
                key={question.id || index}
                variant="default"
                className={`transition-all duration-300 overflow-hidden border ${
                  isCorrect
                    ? 'border-[var(--accent-emerald)]/20 bg-[var(--accent-emerald)]/5'
                    : 'border-[var(--accent-rose)]/20 bg-[var(--accent-rose)]/5'
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold shrink-0 text-sm mt-0.5 ${
                        isCorrect ? 'bg-[var(--accent-emerald)]' : 'bg-[var(--accent-rose)]'
                      }`}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Question {index + 1}
                      </span>
                      <p className="text-lg font-bold text-[var(--text-primary)] leading-normal pr-4">
                        {formatTextWithHindi(question.question)}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl text-[var(--text-muted)] font-mono shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>

                {/* Animated collapse review panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[800px] mt-6 opacity-100 border-t border-[var(--border)] pt-4' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optText = question.options[optKey];
                      const isSelected = selected === optKey;
                      const isOptionCorrect = question.correct === optKey;

                      let optBgClass = 'bg-slate-800/40 border-[var(--border)] text-[var(--text-secondary)]';
                      if (isSelected) {
                        optBgClass = isCorrect
                          ? 'bg-[var(--accent-emerald)]/20 border-[var(--accent-emerald)] text-[var(--accent-emerald)] font-semibold'
                          : 'bg-[var(--accent-rose)]/20 border-[var(--accent-rose)] text-[var(--accent-rose)] font-semibold';
                      } else if (isOptionCorrect) {
                        // Highlight correct one in green if user got it wrong
                        optBgClass = 'bg-[var(--accent-emerald)]/20 border-[var(--accent-emerald)] text-[var(--accent-emerald)] font-semibold';
                      }

                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${optBgClass}`}
                        >
                          <span
                            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-[var(--accent-emerald)] text-white'
                                  : 'bg-[var(--accent-rose)] text-white'
                                : isOptionCorrect
                                ? 'bg-[var(--accent-emerald)] text-white'
                                : 'bg-slate-700 text-[var(--text-secondary)]'
                            }`}
                          >
                            {optKey}
                          </span>
                          <span className="text-sm select-none">
                            {formatTextWithHindi(optText)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--border)] flex flex-col gap-2">
                    <span className="text-xs text-[var(--accent-blue)] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>💡</span> Explanation (व्याख्या)
                    </span>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {formatTextWithHindi(question.explanation)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ─── Actions Bottom Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={onRetry}
          className="w-full sm:flex-1 py-4 text-base font-bold shadow-md hover:scale-[1.02]"
        >
          🔄 Phir Se Quiz Lo (Retry)
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onNewCommand}
          className="w-full sm:flex-1 py-4 text-base font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md shadow-purple-500/25 hover:scale-[1.02]"
        >
          🎤 Naya Quiz Banao (New Quiz)
        </Button>
      </div>
    </div>
  );
}
