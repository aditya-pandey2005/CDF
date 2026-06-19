'use client';

import React, { useEffect } from 'react';
import useTextToSpeech from '@/hooks/useTextToSpeech';

/* ─── Props ─── */

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  mode?: 'fixed' | 'inline';
  className?: string;
}

/* ─── Component ─── */

export default function TextToSpeech({
  text,
  autoPlay = false,
  mode = 'fixed',
  className = '',
}: TextToSpeechProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    setRate,
    isSpeaking,
    isPaused,
    rate,
  } = useTextToSpeech();

  // Autoplay functionality when text prop changes
  useEffect(() => {
    if (autoPlay && text) {
      speak(text);
    }
  }, [text, autoPlay, speak]);

  // Handle Play/Pause toggle
  const handlePlayPause = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      if (text) {
        speak(text);
      }
    }
  };

  // Determine container styling based on mode
  const containerClass =
    mode === 'fixed'
      ? `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl glass p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-slide-up ${className}`
      : `glass p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg w-full ${className}`;

  return (
    <div className={containerClass} id="text-to-speech">
      {/* ─── Left: Label and Waveform Indicator ─── */}
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {isSpeaking && !isPaused ? (
            <span className="flex items-center gap-1.5">
              <span className="animate-pulse">🔊</span> Padh raha hai...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>🔊</span> Suniye
            </span>
          )}
        </div>

        {/* Animated sound wave bars when speaking */}
        <div className="flex items-end gap-[3px] h-5 w-12" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="block w-[3px] rounded-full bg-gradient-to-t from-[var(--accent-blue)] to-[var(--accent-emerald)] transition-all duration-300"
              style={{
                height: isSpeaking && !isPaused ? '18px' : '4px',
                animation:
                  isSpeaking && !isPaused
                    ? `waveform 0.5s ease-in-out infinite alternate`
                    : 'none',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ─── Right: Controls ─── */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Toggle Button */}
        <button
          id="tts-play-pause-btn"
          type="button"
          onClick={handlePlayPause}
          disabled={!text && !isSpeaking}
          aria-label={isSpeaking && !isPaused ? 'Pause' : 'Play'}
          className={`
            relative flex items-center justify-center
            w-12 h-12
            rounded-full
            cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-40
            transition-all duration-300 ease-out active:scale-95
            ${
              isSpeaking && !isPaused
                ? 'bg-[var(--accent-rose)]/20 text-[var(--accent-rose)] border border-[var(--accent-rose)]/40 hover:bg-[var(--accent-rose)]/35'
                : 'bg-[var(--accent-blue)] text-white hover:bg-blue-400 hover:scale-105 shadow-md shadow-blue-500/20'
            }
          `}
        >
          {isSpeaking && !isPaused ? (
            /* Pause Icon */
            <span className="text-base select-none">⏸️</span>
          ) : (
            /* Play Icon */
            <span className="text-base ml-0.5 select-none">▶️</span>
          )}
        </button>

        {/* Stop Button */}
        <button
          id="tts-stop-btn"
          type="button"
          onClick={stop}
          disabled={!isSpeaking}
          aria-label="Stop"
          className={`
            flex items-center justify-center
            w-10 h-10
            rounded-full
            border border-[var(--border)]
            cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-45
            transition-all duration-300 ease-out active:scale-95
            ${
              isSpeaking
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-rose)]'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
            }
          `}
        >
          <span className="text-xs select-none">⏹️</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-[var(--border)]" aria-hidden="true" />

        {/* Speed / Rate Selection */}
        <div
          className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border)]"
          role="group"
          aria-label="Speech Speed"
        >
          {[0.75, 1.0, 1.25, 1.5].map((speedValue) => (
            <button
              key={speedValue}
              type="button"
              onClick={() => setRate(speedValue)}
              aria-current={rate === speedValue ? 'true' : undefined}
              className={`
                px-2.5 py-1
                text-xs font-semibold
                rounded-lg
                cursor-pointer
                transition-all duration-200
                ${
                  rate === speedValue
                    ? 'bg-[var(--accent-blue)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                }
              `}
            >
              {speedValue === 1.0 ? '1x' : `${speedValue}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
