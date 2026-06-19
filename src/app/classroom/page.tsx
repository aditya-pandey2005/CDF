'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Mode } from '@/types';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';
import useIntentDetection from '@/hooks/useIntentDetection';

// Components
import CommandBar from '@/components/classroom/CommandBar';
import ModeSelector from '@/components/classroom/ModeSelector';
import ConceptExplainer from '@/components/classroom/ConceptExplainer';
import QuizPanel from '@/components/classroom/QuizPanel';
import WhiteboardCanvas from '@/components/classroom/WhiteboardCanvas';
import TranscriptDisplay from '@/components/voice/TranscriptDisplay';
import Button from '@/components/ui/Button';

export default function ClassroomPage() {
  // Mode and topic state
  const [currentMode, setCurrentMode] = useState<Mode>('explain');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentGradeLevel, setCurrentGradeLevel] = useState<string>('');

  const handleModeChange = useCallback((mode: Mode) => {
    setCurrentMode(mode);
  }, []);

  // Status and visibility state
  const [commandStatus, setCommandStatus] = useState<
    'idle' | 'listening' | 'processing' | 'generating' | 'ready' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [lastTranscript, setLastTranscript] = useState<string>('');

  // Hooks
  const {
    isRecording,
    isProcessing,
    transcript,
    error: voiceError,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceRecorder();

  const { detectIntent, isDetecting } = useIntentDetection();

  // Track recording/processing states to update commandStatus
  useEffect(() => {
    if (isRecording) {
      setCommandStatus('listening');
      setStatusMessage('');
    } else if (isProcessing) {
      setCommandStatus('processing');
    } else if (isDetecting) {
      setCommandStatus('generating');
    }
  }, [isRecording, isProcessing, isDetecting]);

  // Sync transcription output and run intent detection
  useEffect(() => {
    if (transcript) {
      setLastTranscript(transcript);
      setShowTranscript(true);

      // Auto fade transcript after 6 seconds
      const fadeTimer = setTimeout(() => {
        setShowTranscript(false);
      }, 6000);

      // Run intent analysis
      setCommandStatus('generating');
      detectIntent(transcript)
        .then((intent) => {
          if (intent && intent.topic) {
            setCurrentTopic(intent.topic);
            setCurrentMode(intent.mode);
            setCurrentGradeLevel(intent.gradeLevel || '');
            setCommandStatus('ready');

            // Reset status back to idle after a few seconds
            setTimeout(() => {
              setCommandStatus('idle');
            }, 3000);
          } else {
            setCommandStatus('error');
            setStatusMessage('Kuch samajh nahi aaya. Kripya phir se bolein.');
          }
        })
        .catch((err) => {
          setCommandStatus('error');
          setStatusMessage(err.message || 'Intent detection failed.');
        });

      return () => clearTimeout(fadeTimer);
    }
  }, [transcript, detectIntent]);

  // Track voice errors
  useEffect(() => {
    if (voiceError) {
      setCommandStatus('error');
      setStatusMessage(voiceError);
    }
  }, [voiceError]);

  // Keyboard shortcut: Spacebar to toggle recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when focused on input fields
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleRecording();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isProcessing]);

  // Toggle recording callback
  const handleToggleRecording = useCallback(() => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      resetTranscript();
      startRecording();
    }
  }, [isRecording, isProcessing, startRecording, stopRecording, resetTranscript]);

  // Suggestion click handler
  const handleHintClick = useCallback(
    async (hintText: string) => {
      resetTranscript();
      setLastTranscript(hintText);
      setShowTranscript(true);

      const fadeTimer = setTimeout(() => {
        setShowTranscript(false);
      }, 6000);

      setCommandStatus('generating');
      try {
        const intent = await detectIntent(hintText);
        if (intent && intent.topic) {
          setCurrentTopic(intent.topic);
          setCurrentMode(intent.mode);
          setCurrentGradeLevel(intent.gradeLevel || '');
          setCommandStatus('ready');
          setTimeout(() => {
            setCommandStatus('idle');
          }, 3000);
        } else {
          setCommandStatus('error');
          setStatusMessage('Unable to resolve command intent.');
        }
      } catch (err: any) {
        setCommandStatus('error');
        setStatusMessage(err.message || 'Intent detection failed.');
      }
    },
    [detectIntent, resetTranscript]
  );

  // Restart command input
  const handleNewCommand = useCallback(() => {
    resetTranscript();
    startRecording();
  }, [resetTranscript, startRecording]);

  const exampleHints = [
    {
      title: 'Explain Concept',
      text: 'Photosynthesis samjhao class 7 ko',
      emoji: '📖',
    },
    {
      title: 'Create Quiz',
      text: 'Newton ke laws pe 5 MCQ banao',
      emoji: '📝',
    },
    {
      title: 'Draw Diagram',
      text: 'Water cycle ka diagram banao',
      emoji: '🎨',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col pt-16">
      {/* ─── Command Bar (Fixed Top) ─── */}
      <CommandBar status={commandStatus} message={statusMessage} />

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 flex flex-col w-full">
        {!currentTopic ? (
          /* Welcome/Empty State */
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Namaste! 🙏 Main SikshaMitra hoon.
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium mb-12">
              Boliye kya padhana hai!
            </p>

            {/* Centered Large Mic Button */}
            <div className="flex flex-col items-center justify-center gap-4 mb-16">
              <div className="relative flex items-center justify-center">
                {/* Recording Pulse Rings */}
                {isRecording && (
                  <>
                    <span className="absolute w-24 h-24 rounded-full border-2 border-[var(--accent-rose)] animate-ping opacity-75" />
                    <span className="absolute w-28 h-28 rounded-full border border-[var(--accent-rose)]/50 animate-ping opacity-50" />
                  </>
                )}
                {!isRecording && !isProcessing && (
                  <span className="absolute w-20 h-20 rounded-full bg-blue-500/10 animate-pulse-glow" />
                )}

                <button
                  onClick={handleToggleRecording}
                  disabled={isProcessing}
                  className={`
                    relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/10
                    cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 outline-none
                    ${
                      isRecording
                        ? 'bg-[var(--accent-rose)] text-white shadow-[0_0_32px_rgba(244,63,94,0.4)]'
                        : isProcessing
                        ? 'bg-[var(--accent-blue)] text-white shadow-[0_0_24px_rgba(59,130,246,0.3)]'
                        : 'bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)]'
                    }
                  `}
                >
                  {isProcessing ? (
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isRecording ? (
                    <div className="flex items-center gap-[3px]">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className="block w-[3px] h-5 rounded-full bg-white animate-pulse"
                          style={{
                            animation: 'waveform 0.5s ease-in-out infinite alternate',
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8"
                    >
                      <rect x="9" y="2" width="6" height="12" rx="3" />
                      <path d="M5 10a7 7 0 0 0 14 0" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Centered Voice Status Label */}
              <div className="min-h-[2.5rem]">
                {isRecording && (
                  <p className="text-sm font-bold text-[var(--accent-rose)] tracking-wide">
                    Sun raha hai... Speak now
                  </p>
                )}
                {isProcessing && (
                  <p className="text-sm font-bold text-[var(--accent-blue)] tracking-wide animate-pulse">
                    Samajh raha hai... Transcribing
                  </p>
                )}
                {!isRecording && !isProcessing && (
                  <p className="text-sm font-bold text-[var(--text-secondary)]">
                    Tap to Speak (Press Spacebar)
                  </p>
                )}
              </div>
            </div>

            {/* Try hints */}
            <div className="w-full max-w-3xl">
              <p className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase mb-4">
                Try speaking one of these:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exampleHints.map((hint) => (
                  <button
                    key={hint.text}
                    onClick={() => handleHintClick(hint.text)}
                    className="p-4 rounded-2xl border border-[var(--border)] bg-slate-900/40 text-left hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300 group cursor-pointer"
                  >
                    <span className="text-2xl mb-2 block">{hint.emoji}</span>
                    <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-400 mb-1 leading-snug">
                      {hint.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                      "{hint.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Classroom Content State */
          <div className="flex-1 flex flex-col py-6 gap-6">
            {/* Mode Tab selector */}
            <ModeSelector activeMode={currentMode} onModeChange={handleModeChange} />

            {/* Display Active Component */}
            <div className="flex-1 w-full animate-fade-in">
              {currentMode === 'explain' && (
                <ConceptExplainer
                  topic={currentTopic}
                  gradeLevel={currentGradeLevel}
                  onNewCommand={handleNewCommand}
                />
              )}
              {currentMode === 'quiz' && (
                <QuizPanel
                  topic={currentTopic}
                  gradeLevel={currentGradeLevel}
                  onNewCommand={handleNewCommand}
                />
              )}
              {currentMode === 'whiteboard' && (
                <WhiteboardCanvas topic={currentTopic} onNewCommand={handleNewCommand} />
              )}
            </div>

            {/* Floating voice mic button */}
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={handleToggleRecording}
                disabled={isProcessing}
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center border border-white/10
                  cursor-pointer shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 outline-none
                  ${
                    isRecording
                      ? 'bg-[var(--accent-rose)] text-white animate-pulse'
                      : isProcessing
                      ? 'bg-[var(--accent-blue)] text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20'
                  }
                `}
                title="Tap to speak new command"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isRecording ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="w-5 h-5"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-6 h-6"
                  >
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Transcript Indicator */}
      {showTranscript && lastTranscript && (
        <div className="fixed bottom-24 left-6 right-6 md:left-auto md:right-24 z-[100] max-w-md w-full">
          <TranscriptDisplay
            transcript={lastTranscript}
            detectedMode={currentMode}
            isVisible={showTranscript}
          />
        </div>
      )}
    </div>
  );
}
