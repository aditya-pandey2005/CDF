'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Splits text into chunks of max characters at sentence boundaries.
 * If a sentence exceeds max characters, it splits at word/punctuation boundaries.
 */
function splitTextIntoChunks(text: string, maxLen: number = 200): string[] {
  if (!text) return [];
  // Sentence boundary regex (handles standard punctuation and Hindi danda/full stop '।', newline)
  const sentenceEndRegex = /([^.?!।|\n]+[.?!।|\n]*)/g;
  const matches = text.match(sentenceEndRegex) || [text];

  const chunks: string[] = [];
  let currentChunk = '';

  for (let part of matches) {
    part = part.trim();
    if (!part) continue;

    if (part.length > maxLen) {
      // Split very long sentences by punctuation (comma, semicolon) or spaces
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }

      const subParts = part.split(/([,;，、\s]+)/);
      let subChunk = '';
      for (const subPart of subParts) {
        if (subChunk.length + subPart.length <= maxLen) {
          subChunk += subPart;
        } else {
          if (subChunk.trim()) {
            chunks.push(subChunk.trim());
          }
          subChunk = subPart;
        }
      }
      if (subChunk.trim()) {
        currentChunk = subChunk.trim();
      }
    } else {
      if (currentChunk.length + part.length + 1 <= maxLen) {
        currentChunk = currentChunk ? `${currentChunk} ${part}` : part;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = part;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export default function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRateState] = useState(0.9);

  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const isSpeakingRef = useRef<boolean>(false);
  const rateRef = useRef<number>(0.9);

  // Load available voices
  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  // Voice selection priority:
  // 1. Hindi voice (lang starts with 'hi')
  // 2. Any Indian English voice (lang 'en-IN')
  // 3. Default English voice
  const selectVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    const hindiVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    if (hindiVoice) return hindiVoice;

    const indianEngVoice = voices.find((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith('en-in')
    );
    if (indianEngVoice) return indianEngVoice;

    const defaultEngVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('en') || v.default
    );
    if (defaultEngVoice) return defaultEngVoice;

    return voices[0] || null;
  }, []);

  // Play next chunk in the queue
  const playNextChunk = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= utterancesRef.current.length) {
      // Completed all chunks
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentUtterance(null);
      currentIndexRef.current = -1;
      return;
    }

    currentIndexRef.current = nextIndex;
    const utterance = utterancesRef.current[nextIndex];

    // Apply current rate and voice
    utterance.rate = rateRef.current;
    const voice = selectVoice(window.speechSynthesis.getVoices());
    if (voice) {
      utterance.voice = voice;
    }

    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  }, [selectVoice]);

  // Start speaking text
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any current speech first
    window.speechSynthesis.cancel();

    // Reset speech state
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setIsPaused(false);
    currentIndexRef.current = -1;
    utterancesRef.current = [];

    const chunks = splitTextIntoChunks(text, 200);
    if (chunks.length === 0) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentUtterance(null);
      return;
    }

    // Create SpeechSynthesisUtterance for each chunk
    const utterances = chunks.map((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.pitch = 1.0;
      utterance.rate = rateRef.current;

      const voice = selectVoice(window.speechSynthesis.getVoices());
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        if (isSpeakingRef.current && currentIndexRef.current === index) {
          playNextChunk();
        }
      };

      utterance.onerror = (event) => {
        console.error('[useTextToSpeech] Utterance error:', event);
        if (event.error !== 'interrupted') {
          if (isSpeakingRef.current && currentIndexRef.current === index) {
            playNextChunk();
          }
        }
      };

      return utterance;
    });

    utterancesRef.current = utterances;
    playNextChunk();
  }, [playNextChunk, selectVoice]);

  // Pause speech
  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  // Resume speech
  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  // Stop speech
  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    isSpeakingRef.current = false;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    currentIndexRef.current = -1;
    utterancesRef.current = [];
  }, []);

  // Update speech rate
  const setRate = useCallback((newRate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.0, newRate));
    setRateState(clampedRate);
    rateRef.current = clampedRate;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    setRate,
    isSpeaking,
    isPaused,
    currentUtterance,
    availableVoices,
    rate,
  };
}
