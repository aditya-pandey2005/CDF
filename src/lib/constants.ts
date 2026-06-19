import type { Mode } from '@/types';

export const APP_NAME = 'SikshaMitra';

export const APP_TAGLINE = 'Aapka AI Teaching Sahayak';

export const APP_DESCRIPTION =
  'Voice-powered AI co-pilot for Indian classrooms. Explain concepts in Hinglish, create quizzes, and draw diagrams — all with your voice.';

export const MODES: Record<Mode, { label: string; labelHi: string; icon: string }> = {
  explain: {
    label: 'Explain',
    labelHi: 'समझाओ',
    icon: '📖',
  },
  quiz: {
    label: 'Quiz',
    labelHi: 'प्रश्नोत्तरी',
    icon: '❓',
  },
  whiteboard: {
    label: 'Whiteboard',
    labelHi: 'श्वेतपट',
    icon: '🖊️',
  },
};

export const DEFAULT_QUIZ_COUNT = 5;

export const MAX_RECORDING_SECONDS = 30;
