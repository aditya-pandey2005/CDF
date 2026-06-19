export type Mode = 'explain' | 'quiz' | 'whiteboard';

export interface IntentResult {
  mode: Mode;
  topic: string;
  gradeLevel?: string;
}

export interface ExplanationResult {
  explanation: string;
  diagram: string;
  keyPoints: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface WhiteboardResult {
  diagram: string;
  labels: { name: string; explanation: string }[];
  summary: string;
}

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
}
