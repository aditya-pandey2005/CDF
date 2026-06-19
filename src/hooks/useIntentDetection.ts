'use client';

import { useState, useCallback } from 'react';
import type { IntentResult } from '@/types';

interface UseIntentDetectionReturn {
  detectedIntent: IntentResult | null;
  isDetecting: boolean;
  detectIntent: (transcript: string) => Promise<IntentResult>;
}

/**
 * Parses user input locally using keyword matching as a fallback
 * when the API route is unreachable or errors.
 */
function localFallbackIntent(transcript: string): IntentResult {
  const text = transcript.toLowerCase();
  let mode: 'explain' | 'quiz' | 'whiteboard' = 'explain';

  if (
    text.includes('quiz') ||
    text.includes('mcq') ||
    text.includes('sawal') ||
    text.includes('question') ||
    text.includes('test') ||
    text.includes('pariksha')
  ) {
    mode = 'quiz';
  } else if (
    text.includes('draw') ||
    text.includes('diagram') ||
    text.includes('whiteboard') ||
    text.includes('chart') ||
    text.includes('banao') ||
    text.includes('dikhaao') ||
    text.includes('water cycle') ||
    text.includes('draw karo')
  ) {
    mode = 'whiteboard';
  } else if (
    text.includes('explain') ||
    text.includes('samjhao') ||
    text.includes('batao') ||
    text.includes('teach') ||
    text.includes('concept') ||
    text.includes('kya hai')
  ) {
    mode = 'explain';
  }

  // Simple topic extraction: remove common helper/mode keywords
  const stopWords = [
    'explain', 'samjhao', 'batao', 'teach', 'concept', 'kya hai',
    'quiz', 'mcq', 'question', 'sawal', 'test', 'pariksha',
    'draw', 'diagram', 'whiteboard', 'chart', 'banao', 'dikhaao',
    'water cycle', 'draw karo', 'karo', 'please', 'karke', 'mujhe',
    'about', 'on', 'ko', 'de', 'ek', 'bana', 'banaen', 'banaein', 'banaiye'
  ];

  const words = transcript.split(/\s+/);
  const filteredWords = words.filter((w) => {
    const cleanWord = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    return !stopWords.includes(cleanWord);
  });

  const topic = filteredWords.join(' ').trim() || 'General Topic';

  // Extract class/grade if mentioned (e.g. "class 6", "grade 8", "kaksha 10")
  let gradeLevel = '';
  const gradeMatch = transcript.match(/(?:class|grade|kaksha|कक्षा)\s*(\d+(?:th)?)/i);
  if (gradeMatch && gradeMatch[0]) {
    gradeLevel = gradeMatch[0];
  }

  return {
    mode,
    topic,
    gradeLevel,
  };
}

export default function useIntentDetection(): UseIntentDetectionReturn {
  const [detectedIntent, setDetectedIntent] = useState<IntentResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectIntent = useCallback(async (transcript: string): Promise<IntentResult> => {
    if (!transcript.trim()) {
      const emptyResult: IntentResult = { mode: 'explain', topic: '', gradeLevel: '' };
      setDetectedIntent(emptyResult);
      return emptyResult;
    }

    setIsDetecting(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'intent',
          text: transcript,
        }),
      });

      if (!response.ok) {
        throw new Error('API server responded with an error status.');
      }

      const res = await response.json();
      if (res.success && res.data) {
        const result = res.data as IntentResult;
        setDetectedIntent(result);
        return result;
      } else {
        throw new Error(res.error || 'Failed to detect intent.');
      }
    } catch (err) {
      console.warn('[useIntentDetection] API failed or timed out. Falling back to local keyword matching:', err);
      // Fallback local keyword matching
      const fallbackResult = localFallbackIntent(transcript);
      setDetectedIntent(fallbackResult);
      return fallbackResult;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    detectedIntent,
    isDetecting,
    detectIntent,
  };
}
