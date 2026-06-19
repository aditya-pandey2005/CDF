'use client';

import React, { useEffect, useCallback } from 'react';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/* ─── Props ─── */

interface VoiceRecorderProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

/* ─── Component ─── */

export default function VoiceRecorder({ onTranscript, className = '' }: VoiceRecorderProps) {
  const {
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceRecorder();

  // Forward transcript to parent when it changes
  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Toggle recording
  const handleToggle = useCallback(() => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      resetTranscript();
      startRecording();
    }
  }, [isRecording, isProcessing, startRecording, stopRecording, resetTranscript]);

  // Keyboard shortcut: Space bar to toggle
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  // Determine visual state
  const state: 'idle' | 'recording' | 'processing' = isProcessing
    ? 'processing'
    : isRecording
      ? 'recording'
      : 'idle';

  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      id="voice-recorder"
    >
      {/* ─── Mic Button ─── */}
      <div className="relative flex items-center justify-center">
        {/* Animated rings (recording state) */}
        {state === 'recording' && (
          <>
            <span
              className="absolute rounded-full border-2 border-[var(--accent-rose)]"
              style={{
                width: '100%',
                height: '100%',
                animation: 'pulse-ring 1.5s ease-out infinite',
              }}
            />
            <span
              className="absolute rounded-full border-2 border-[var(--accent-rose)]"
              style={{
                width: '100%',
                height: '100%',
                animation: 'pulse-ring 1.5s ease-out infinite 0.5s',
              }}
            />
            <span
              className="absolute rounded-full border border-[var(--accent-rose)]"
              style={{
                width: '100%',
                height: '100%',
                animation: 'pulse-ring 1.5s ease-out infinite 1s',
              }}
            />
          </>
        )}

        {/* Idle subtle pulse glow */}
        {state === 'idle' && (
          <span
            className="absolute rounded-full"
            style={{
              width: '100%',
              height: '100%',
              animation: 'pulse-glow 2.5s ease-in-out infinite',
            }}
          />
        )}

        <button
          id="voice-recorder-btn"
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          aria-label={
            state === 'recording'
              ? 'Stop recording'
              : state === 'processing'
                ? 'Processing audio'
                : 'Start recording'
          }
          className={`
            relative z-10 flex items-center justify-center
            w-16 h-16 md:w-20 md:h-20
            rounded-full
            border-2 border-white/10
            cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-60
            transition-all duration-300 ease-out
            ${
              state === 'recording'
                ? 'bg-[var(--accent-rose)] shadow-[0_0_32px_rgba(244,63,94,0.5)] scale-110'
                : state === 'processing'
                  ? 'bg-[var(--accent-blue)] shadow-[0_0_24px_rgba(59,130,246,0.4)]'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] hover:scale-105'
            }
          `}
        >
          {state === 'processing' ? (
            <LoadingSpinner size="sm" />
          ) : state === 'recording' ? (
            /* Animated waveform bars */
            <div className="flex items-center gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="block w-[3px] rounded-full bg-white"
                  style={{
                    height: '16px',
                    animation: `waveform 0.5s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            /* Mic icon (SVG) */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 md:w-8 md:h-8 text-[var(--text-primary)]"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>
      </div>

      {/* ─── Status Text ─── */}
      <div className="text-center min-h-[3rem]">
        {state === 'recording' && (
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-[var(--accent-rose)]">Listening...</p>
            <p className="text-xs text-[var(--text-muted)] hindi-text mt-0.5">
              सुन रहा है...
            </p>
          </div>
        )}
        {state === 'processing' && (
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-[var(--accent-blue)]">Processing...</p>
            <p className="text-xs text-[var(--text-muted)] hindi-text mt-0.5">
              समझ रहा है...
            </p>
          </div>
        )}
        {state === 'idle' && !error && (
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Tap to Speak</p>
            <p className="text-xs text-[var(--text-muted)] hindi-text mt-0.5">
              बोलने के लिए दबाएं
            </p>
          </div>
        )}
      </div>

      {/* ─── Error Display ─── */}
      {error && (
        <div
          className="animate-fade-in max-w-xs mx-auto text-center px-4 py-3 rounded-xl
                     bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/20"
          role="alert"
          id="voice-recorder-error"
        >
          <p className="text-sm text-[var(--accent-rose)]">{error}</p>
        </div>
      )}
    </div>
  );
}
