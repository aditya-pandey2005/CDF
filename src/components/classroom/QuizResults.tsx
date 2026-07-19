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
        colorClass: 'text-emerald-600',
        borderGlowClass: 'border-emerald-200 bg-emerald-50/20 shadow-emerald-50',
        ringColor: '#10b981',
      };
    } else if (scorePercent >= 80) {
      return {
        message: 'Bahut Achhe! Great job! 🎉',
        colorClass: 'text-emerald-600',
        borderGlowClass: 'border-emerald-200 bg-emerald-50/20 shadow-emerald-50',
        ringColor: '#10b981',
      };
    } else if (scorePercent >= 60) {
      return {
        message: 'Achha hai! Keep it up! 👍',
        colorClass: 'text-amber-600',
        borderGlowClass: 'border-amber-200 bg-amber-50/20 shadow-amber-50',
        ringColor: '#f59e0b',
      };
    } else {
      return {
        message: 'Koi baat nahi, phir try karo! 💪',
        colorClass: 'text-rose-600',
        borderGlowClass: 'border-rose-200 bg-rose-50/20 shadow-rose-50',
        ringColor: '#f43f5e',
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
      <Card variant="elevated" className={`relative overflow-hidden border ${borderGlowClass} shadow-md bg-white`}>
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
                className="stroke-slate-100"
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
              <span className="text-4xl font-extrabold text-slate-800">
                {animatedScore}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                out of {total}
              </span>
            </div>
          </div>

          {/* Performance text */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Quiz Completed 🏁
            </span>
            <h2 className={`text-3xl md:text-5xl font-black ${colorClass} tracking-tight leading-tight`}>
              {formatTextWithHindi(message)}
            </h2>
            <p className="text-base text-slate-600 mt-1">
              Aapne <span className="font-bold text-slate-800">{scorePercent}%</span> questions sahi kiye!
            </p>
          </div>
        </div>
      </Card>

      {/* ─── Review Section ─── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
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
                className={`transition-all duration-300 overflow-hidden border bg-white ${
                  isCorrect
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : 'border-rose-100 bg-rose-50/20'
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold shrink-0 text-sm mt-0.5 ${
                        isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Question {index + 1}
                      </span>
                      <p className="text-lg font-bold text-slate-800 leading-normal pr-4">
                        {formatTextWithHindi(question.question)}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl text-slate-400 font-mono shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>

                {/* Animated collapse review panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[800px] mt-6 opacity-100 border-t border-slate-200 pt-4' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optText = question.options[optKey];
                      const isSelected = selected === optKey;
                      const isOptionCorrect = question.correct === optKey;

                      let optBgClass = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isSelected) {
                        optBgClass = isCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold'
                          : 'bg-rose-50 border-rose-500 text-rose-700 font-semibold';
                      } else if (isOptionCorrect) {
                        // Highlight correct one in green if user got it wrong
                        optBgClass = 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold';
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
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-rose-500 text-white'
                                : isOptionCorrect
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-600'
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
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>💡</span> Explanation (व्याख्या)
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
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
          className="w-full sm:flex-1 py-4 text-base font-bold shadow-sm hover:scale-[1.02] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
        >
          🔄 Phir Se Quiz Lo (Retry)
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onNewCommand}
          className="w-full sm:flex-1 py-4 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:scale-[1.02]"
        >
          🎤 Naya Quiz Banao (New Quiz)
        </Button>
      </div>
    </div>
  );
}
