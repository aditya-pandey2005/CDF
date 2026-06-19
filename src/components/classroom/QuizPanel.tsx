'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { QuizQuestion } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import QuizResults from './QuizResults';

interface QuizPanelProps {
  topic: string;
  gradeLevel: string;
  questionCount?: number;
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

export default function QuizPanel({
  topic,
  gradeLevel,
  questionCount = 5,
  onNewCommand,
}: QuizPanelProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { speak, stop, isSpeaking } = useTextToSpeech();

  // Format timer into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch quiz questions from API
  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setSecondsElapsed(0);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          count: questionCount,
          gradeLevel,
        }),
      });

      const result = await response.json();
      if (result.success && Array.isArray(result.questions)) {
        setQuestions(result.questions);
      } else {
        throw new Error(result.error || 'Failed to fetch quiz questions.');
      }
    } catch (err: any) {
      console.error('[QuizPanel] Fetch error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [topic, questionCount, gradeLevel]);

  // Handle fetch on mount or topic change
  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Start/Stop Timer
  useEffect(() => {
    if (!isLoading && !isSubmitted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading, isSubmitted, questions.length]);

  // Construct current question voice text
  const speakCurrentQuestion = useCallback(() => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    // Convert options text cleanly for voice
    const cleanTTS = `Question ${currentIndex + 1}: ${currentQ.question}. Option A: ${
      currentQ.options.A
    }. Option B: ${currentQ.options.B}. Option C: ${currentQ.options.C}. Option D: ${
      currentQ.options.D
    }.`;
    
    // Speak (stops any playing TTS automatically)
    speak(cleanTTS.replace(/[🏆🎉👍💪]/g, ''));
  }, [questions, currentIndex, speak]);

  // Trigger TTS voice when questions load or active question changes
  useEffect(() => {
    if (!isLoading && !isSubmitted && questions.length > 0) {
      speakCurrentQuestion();
    }
    return () => {
      stop();
    };
  }, [currentIndex, isLoading, isSubmitted, questions.length, speakCurrentQuestion, stop]);

  // Select an option handler
  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  // Navigations
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    stop();
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setSecondsElapsed(0);
    // Restart TTS for the first question after small timeout to let state settle
    setTimeout(() => {
      speakCurrentQuestion();
    }, 100);
  };

  // Check if all questions are answered
  const allAnswered = useMemo(() => {
    if (questions.length === 0) return false;
    return questions.every((q) => selectedAnswers[q.id] !== undefined);
  }, [questions, selectedAnswers]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto px-6 py-12 pb-36 animate-fade-in">
        <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[var(--border)] border-t-[var(--accent-emerald)] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xl">📝</span>
          </div>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
            SikshaMitra quiz taiyyar kar rahi hai... 🧠
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Generating customized multiple choice questions for Grade {gradeLevel}
          </p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12 gap-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-fade-in">
        <div className="text-4xl">⚠️</div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">Quiz taiyyar nahi ho payi!</h3>
          <p className="text-sm text-rose-300/80">
            Kripya network check karein aur phir se koshish karein.
          </p>
          {error && <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{error}</p>}
        </div>
        <Button variant="accent" onClick={fetchQuiz} className="px-6">
          Quiz Dobara Load Karein 🔄 (Retry)
        </Button>
      </div>
    );
  }

  // Render results screen if submitted
  if (isSubmitted) {
    return (
      <QuizResults
        questions={questions}
        selectedAnswers={selectedAnswers}
        onRetry={handleRetry}
        onNewCommand={onNewCommand}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 pb-36 flex flex-col gap-6 animate-fade-in">
      {/* ─── Quiz Header ─── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            📝 Quiz: {topic}
          </h2>
          <div className="flex items-center gap-3">
            {/* Timer pill */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] font-mono">
              ⏱️ {formatTime(secondsElapsed)}
            </span>
            <span className="text-sm font-bold text-[var(--text-secondary)]">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-emerald)] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ─── Question Card ─── */}
      {currentQuestion && (
        <Card variant="elevated" className="flex flex-col gap-8 py-8 md:px-10 border border-slate-800 shadow-2xl">
          {/* Question Text */}
          <div className="flex items-start gap-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] text-lg font-bold shrink-0">
              Q{currentIndex + 1}
            </span>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold leading-normal text-[var(--text-primary)] smart-board-text">
                {formatTextWithHindi(currentQuestion.question)}
              </h3>
            </div>
            
            {/* TTS Speaker icon */}
            <button
              onClick={speakCurrentQuestion}
              aria-label="Read question aloud"
              className={`p-3 rounded-xl border border-[var(--border)] shrink-0 transition-all duration-200 active:scale-90 hover:bg-slate-800 ${
                isSpeaking
                  ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)] text-[var(--accent-blue)] animate-pulse'
                  : 'bg-slate-900/60 text-[var(--text-secondary)]'
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isSpeaking ? 'scale-110' : ''}
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
          </div>

          {/* Options Grid (2x2 on desktop, full width on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const optText = currentQuestion.options[optKey];
              const isSelected = selectedOption === optKey;

              const buttonBorderColor = isSelected
                ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20'
                : 'border-[var(--border)] bg-slate-900/40 text-[var(--text-secondary)] hover:border-[var(--accent-blue)]/60 hover:bg-slate-800/30';

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  className={`
                    flex items-center gap-4 p-4 min-h-[56px] w-full text-left rounded-xl border-2
                    cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none
                    ${buttonBorderColor}
                  `}
                >
                  <span
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0
                      ${
                        isSelected
                          ? 'bg-white text-[var(--accent-blue)]'
                          : 'bg-slate-800 text-[var(--text-secondary)] group-hover:bg-slate-700'
                      }
                    `}
                  >
                    {optKey}
                  </span>
                  <span className="text-base md:text-lg font-medium leading-snug">
                    {formatTextWithHindi(optText)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── Bottom Navigation ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-none py-3"
          >
            ← Pichla
          </Button>
          <Button
            variant="secondary"
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 sm:flex-none py-3"
          >
            Agla →
          </Button>
        </div>

        {/* Submit Quiz button - only appears when all questions have been answered */}
        {allAnswered && (
          <Button
            variant="accent"
            size="lg"
            onClick={handleSubmit}
            className="w-full sm:w-auto py-3 px-8 font-bold text-base shadow-md hover:scale-105 border border-emerald-500/20"
          >
            Submit Quiz ✅
          </Button>
        )}
      </div>
    </div>
  );
}
