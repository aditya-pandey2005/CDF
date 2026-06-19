'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import useIntentDetection from '@/hooks/useIntentDetection';
import type { ExplanationResult, QuizQuestion, WhiteboardResult } from '@/types';
import MermaidRenderer from '@/components/diagrams/MermaidRenderer';
import ChartRenderer from '@/components/diagrams/ChartRenderer';
import type { ChartData } from 'chart.js';
import ConceptExplainer from '@/components/classroom/ConceptExplainer';
import QuizPanel from '@/components/classroom/QuizPanel';

const mockChartData: ChartData = {
  labels: ['Maths', 'Science', 'English', 'History', 'Geography', 'Hindi'],
  datasets: [
    {
      label: 'Class Average Performance (%)',
      data: [78, 85, 92, 68, 74, 88],
      backgroundColor: [
        'rgba(59, 130, 246, 0.4)',   // Accent Blue
        'rgba(16, 185, 129, 0.4)',  // Accent Emerald
        'rgba(139, 92, 246, 0.4)',  // Accent Purple
        'rgba(245, 158, 11, 0.4)',   // Accent Amber
        'rgba(244, 63, 94, 0.4)',    // Accent Rose
        'rgba(59, 130, 246, 0.4)',   // Accent Blue
      ],
      borderColor: [
        '#3b82f6',
        '#10b981',
        '#8b5cf6',
        '#f59e0b',
        '#f43f5e',
        '#3b82f6',
      ],
      borderWidth: 1.5,
    },
  ],
};

export default function TestGeminiPage() {
  const [transcript, setTranscript] = useState('Explain photosynthesis to grade 5 students');
  const [error, setError] = useState('');
  
  // States for secondary content generation
  const [explanationData, setExplanationData] = useState<ExplanationResult | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [whiteboardData, setWhiteboardData] = useState<WhiteboardResult | null>(null);
  
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [testChartType, setTestChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut'>('bar');
  const [showExplainerShowcase, setShowExplainerShowcase] = useState(false);
  const [showQuizShowcase, setShowQuizShowcase] = useState(false);
  const [isQuizInteractiveActive, setIsQuizInteractiveActive] = useState(false);

  const { detectIntent, isDetecting, detectedIntent } = useIntentDetection();

  // Run intent detection
  const handleDetectIntent = async () => {
    setError('');
    setExplanationData(null);
    setQuizQuestions(null);
    setWhiteboardData(null);
    try {
      await detectIntent(transcript);
    } catch (err) {
      console.error(err);
      setError('Intent detection failed.');
    }
  };

  // Generate content based on detected intent
  const handleGenerateContent = async () => {
    if (!detectedIntent) return;
    setError('');
    setIsGeneratingContent(true);

    try {
      const { mode, topic, gradeLevel } = detectedIntent;

      if (mode === 'quiz') {
        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, count: 5, gradeLevel }),
        });
        const res = await response.json();
        if (res.success && res.questions) {
          setQuizQuestions(res.questions);
        } else {
          throw new Error(res.error || 'Failed to generate quiz.');
        }
      } else {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            topic,
            gradeLevel,
          }),
        });
        const res = await response.json();
        if (res.success && res.data) {
          if (mode === 'explain') {
            setExplanationData(res.data as ExplanationResult);
          } else if (mode === 'whiteboard') {
            setWhiteboardData(res.data as WhiteboardResult);
          }
        } else {
          throw new Error(res.error || 'Failed to generate content.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Content generation failed.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden pb-24">
      {/* ── Background Gradients ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(139,92,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 60%),
            var(--bg-primary)
          `,
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            SikshaMitra
          </span>
        </Link>
        <div className="flex gap-3">
          <Link href="/test-tts">
            <Button variant="secondary" size="sm">
              → Test TTS
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="sm">
              ← Home Page
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">
            Gemini AI Integration Playground
          </h1>
          <p className="text-[var(--text-secondary)]">
            Test intent classification and content generation (Explain, Quiz, Whiteboard) powered by Gemini.
          </p>
        </div>

        {/* ── 1. Voice Command Input & Classification ── */}
        <Card variant="default" className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            1. Enter Voice command (Hindi, Hinglish, or English)
          </h2>
          <div className="flex flex-col gap-4">
            <textarea
              id="gemini-transcript-input"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. 'Photosynthesis samjhao class 7 ke liye' or 'make a 5 question quiz on gravity'"
              className="w-full h-24 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none resize-none smart-board-text"
            />
            <div className="flex justify-between items-center">
              <Button
                variant="primary"
                onClick={handleDetectIntent}
                disabled={isDetecting || !transcript.trim()}
                id="btn-detect-intent"
              >
                {isDetecting ? <LoadingSpinner size="sm" /> : 'Analyze Intent 🧠'}
              </Button>
            </div>
          </div>
        </Card>

        {/* ── 2. Detected Intent Results ── */}
        {detectedIntent && (
          <Card variant="elevated" className="flex flex-col gap-5 border border-purple-500/25">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                2. Classification Result
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Parsed Successfully
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Mode</span>
                <span className="text-base font-bold text-[var(--text-primary)] capitalize">
                  {detectedIntent.mode === 'explain' && '📖 Explain'}
                  {detectedIntent.mode === 'quiz' && '📝 Quiz'}
                  {detectedIntent.mode === 'whiteboard' && '🎨 Whiteboard'}
                </span>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Topic</span>
                <span className="text-base font-bold text-[var(--text-primary)]">
                  {detectedIntent.topic || '(None extracted)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Class Level</span>
                <span className="text-base font-bold text-[var(--text-primary)]">
                  {detectedIntent.gradeLevel || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                variant="accent"
                onClick={handleGenerateContent}
                disabled={isGeneratingContent}
                id="btn-generate-content"
              >
                {isGeneratingContent ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" /> Generating...
                  </span>
                ) : (
                  `Generate Content for "${detectedIntent.topic || 'Topic'}" ✨`
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* ── Error Output ── */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <strong>Error:</strong> {error}
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Note: Make sure a valid <code>GEMINI_API_KEY</code> is set in <code>.env.local</code>. If the key is not set, Gemini content generation will fail.
            </p>
          </div>
        )}

        {/* ── 3. Generated Content Output ── */}
        
        {/* A) Explanation Results */}
        {explanationData && (
          <Card variant="default" className="flex flex-col gap-4 border border-blue-500/20">
            <h3 className="text-lg font-bold text-blue-400">📖 Explanation Output</h3>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-[var(--text-muted)] block mb-1">Hinglish Explanation:</span>
                <p className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] text-sm leading-relaxed whitespace-pre-line text-[var(--text-primary)]">
                  {explanationData.explanation}
                </p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] block mb-1">Key Points:</span>
                <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] flex flex-col gap-1">
                  {explanationData.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
              {explanationData.diagram && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-[var(--text-muted)] block">Interactive Diagram:</span>
                  <MermaidRenderer chart={explanationData.diagram} />
                  <details className="mt-2">
                    <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] select-none">
                      Show Raw Mermaid Code
                    </summary>
                    <pre className="bg-black/40 p-4 rounded-xl border border-[var(--border)] text-xs overflow-x-auto text-emerald-400 font-mono mt-2">
                      {explanationData.diagram}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* B) Quiz Results */}
        {quizQuestions && (
          <Card variant="default" className="flex flex-col gap-5 border border-emerald-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold text-emerald-400">📝 Quiz Output ({quizQuestions.length} Questions)</h3>
              <Button
                variant={isQuizInteractiveActive ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setIsQuizInteractiveActive(!isQuizInteractiveActive)}
              >
                {isQuizInteractiveActive ? 'View Raw Questions' : 'Launch Interactive Quiz 📝'}
              </Button>
            </div>
            
            {isQuizInteractiveActive ? (
              <QuizPanel
                topic={detectedIntent?.topic || 'Photosynthesis'}
                gradeLevel={detectedIntent?.gradeLevel || '5'}
                questionCount={quizQuestions.length}
                onNewCommand={() => {
                  setIsQuizInteractiveActive(false);
                  alert('New voice command / quiz requested!');
                }}
              />
            ) : (
              <div className="flex flex-col gap-6">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] flex flex-col gap-3">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Q{idx + 1}. {q.question}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pl-2">
                      <div className={q.correct === 'A' ? 'text-emerald-400 font-semibold' : 'text-[var(--text-secondary)]'}>
                        A) {q.options.A}
                      </div>
                      <div className={q.correct === 'B' ? 'text-emerald-400 font-semibold' : 'text-[var(--text-secondary)]'}>
                        B) {q.options.B}
                      </div>
                      <div className={q.correct === 'C' ? 'text-emerald-400 font-semibold' : 'text-[var(--text-secondary)]'}>
                        C) {q.options.C}
                      </div>
                      <div className={q.correct === 'D' ? 'text-emerald-400 font-semibold' : 'text-[var(--text-secondary)]'}>
                        D) {q.options.D}
                      </div>
                    </div>
                    <div className="text-xs border-t border-[var(--border)] pt-2 mt-1 text-[var(--text-muted)]">
                      <strong className="text-emerald-500">Correct Option: {q.correct}</strong>
                      <p className="mt-1">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* C) Whiteboard Results */}
        {whiteboardData && (
          <Card variant="default" className="flex flex-col gap-4 border border-purple-500/20">
            <h3 className="text-lg font-bold text-purple-400">🎨 Whiteboard Output</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-[var(--text-muted)] block">Interactive Whiteboard Diagram:</span>
                <MermaidRenderer chart={whiteboardData.diagram} />
                <details className="mt-2">
                  <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] select-none">
                    Show Raw Mermaid Code
                  </summary>
                  <pre className="bg-black/40 p-4 rounded-xl border border-[var(--border)] text-xs overflow-x-auto text-emerald-400 font-mono mt-2">
                    {whiteboardData.diagram}
                  </pre>
                </details>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] block mb-1">Labels and Explanations:</span>
                <div className="flex flex-col gap-2">
                  {whiteboardData.labels.map((lbl, i) => (
                    <div key={i} className="text-sm bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border)]">
                      <strong className="text-[var(--text-primary)]">{lbl.name}</strong>: <span className="text-[var(--text-secondary)]">{lbl.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
              {whiteboardData.summary && (
                <div>
                  <span className="text-xs text-[var(--text-muted)] block mb-1">Summary:</span>
                  <p className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border)] text-sm text-[var(--text-primary)]">
                    {whiteboardData.summary}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── 4. Chart Visualization Showcase ── */}
        <Card variant="default" className="flex flex-col gap-5 border border-blue-500/20">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              4. Chart.js Visualization Showcase
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Demonstrates the interactive, dark-themed <code>ChartRenderer</code> component configured with our app palette.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['bar', 'line', 'pie', 'doughnut'] as const).map((t) => (
              <Button
                key={t}
                variant={testChartType === t ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTestChartType(t)}
                className="capitalize"
              >
                {t} Chart
              </Button>
            ))}
          </div>

          <ChartRenderer
            type={testChartType}
            data={mockChartData}
            title="Class Performance Analysis (Mock Data)"
          />
        </Card>

        {/* ── 5. Mermaid.js Visualization Showcase ── */}
        <Card variant="default" className="flex flex-col gap-5 border border-purple-500/20">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              5. Mermaid.js Visualization Showcase
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Demonstrates the client-side <code>MermaidRenderer</code> component with a sample diagram flow and error fallback.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Valid Diagram Render:</h3>
            <MermaidRenderer
              chart={`graph TD\n  A[Class Start] --> B(Concept Explanation)\n  B --> C{Understand?}\n  C -->|Yes| D[Next Topic]\n  C -->|No| E[Simplification / Hinglish]`}
            />
            
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mt-4">Invalid Diagram Syntax (Error Fallback):</h3>
            <MermaidRenderer
              chart={`graph TD\n  A[Class Start] --> -- B(Broken Arrow)`}
            />
          </div>
        </Card>

        {/* ── 6. ConceptExplainer Component Showcase ── */}
        <Card variant="default" className="flex flex-col gap-5 border border-indigo-500/20">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              6. ConceptExplainer Component Showcase
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Demonstrates the complete responsive split layout, Devanagari styling, alternating pills, and sticky bottom bar using the mock fetch route.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="accent"
              onClick={() => setShowExplainerShowcase(!showExplainerShowcase)}
              className="w-full md:w-auto"
            >
              {showExplainerShowcase ? 'Hide Explainer Interface' : 'Mount Explainer Interface 📖'}
            </Button>

            {showExplainerShowcase && (
              <div className="border border-[var(--border)] rounded-2xl p-4 bg-black/20 overflow-hidden">
                <ConceptExplainer
                  topic="Photosynthesis (Test Mock)"
                  gradeLevel="5"
                  onNewCommand={() => alert('New voice command triggered!')}
                />
              </div>
            )}
          </div>
        </Card>

        {/* ── 7. QuizPanel Component Showcase ── */}
        <Card variant="default" className="flex flex-col gap-5 border border-emerald-500/20">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              7. QuizPanel Component Showcase
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Demonstrates the complete interactive quiz interface, step progress bar, options selection, timer, TTS reading, and results screen.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="accent"
              onClick={() => setShowQuizShowcase(!showQuizShowcase)}
              className="w-full md:w-auto"
            >
              {showQuizShowcase ? 'Hide Quiz Interface' : 'Mount Quiz Interface 📝'}
            </Button>

            {showQuizShowcase && (
              <div className="border border-[var(--border)] rounded-2xl p-4 bg-black/20 overflow-hidden">
                <QuizPanel
                  topic="Water Cycle"
                  gradeLevel="6"
                  questionCount={5}
                  onNewCommand={() => alert('New quiz command triggered!')}
                />
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
