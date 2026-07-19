'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Button from '@/components/ui/Button';

export default function GuidePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* ─── Header ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              SikshaMitra Guide
            </span>
          </div>
          <Link href={user ? '/classroom' : '/login'}>
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
              {user ? 'Go to Classroom 🎤' : 'Back to Login 🔑'}
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            SikshaMitra Kaise Use Karein? (शिक्षक मार्गदर्शिका)
          </h1>
          <p className="text-slate-500 text-base sm:text-lg">
            SikshaMitra is an AI-powered voice assistant built for smart board classrooms to help teachers generate visual explanations, interactive quizzes, and whiteboards instantly.
          </p>
        </div>

        {/* ─── Step-by-Step Flow ─── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🚀</span> 3 Simple Steps to Start
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Speak (बोलें)</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Click the mic button or press <kbd className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded shadow-sm">Spacebar</kbd> and describe what you want to teach in Hindi, Hinglish, or English.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Select Mode (मोड चुनें)</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                SikshaMitra automatically detects if you want an <strong>Explanation</strong>, a <strong>Quiz</strong>, or a <strong>Diagram Whiteboard</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Teach (पढ़ाएं)</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Project the result onto the smart board, play the bilingually translated text-to-speech audio, or download diagram assets.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Mode Explanations ─── */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-900">Platform Features (विशेषताएं)</h2>
          
          <div className="flex flex-col gap-4">
            
            {/* Samjhao */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-5 items-start">
              <span className="text-4xl p-3 bg-blue-50 rounded-xl">📖</span>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Samjhao (Explain Concept Mode)</h3>
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 font-semibold rounded">Hinglish</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generates simple, easy-to-understand explanations customized to the class level. Includes side-by-side English and Devanagari translation along with high-fidelity Text-To-Speech audio player so students can listen and read simultaneously.
                </p>
                <div className="text-xs font-mono text-slate-400 bg-slate-50 p-2.5 rounded border border-slate-100">
                  💡 Try speaking: &quot;Photosynthesis samjhao class 7 ko&quot; or &quot;Tell me about Newton's third law&quot;
                </div>
              </div>
            </div>

            {/* Quiz Banao */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-5 items-start">
              <span className="text-4xl p-3 bg-emerald-50 rounded-xl">📝</span>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Quiz Banao (MCQ Generator Mode)</h3>
                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-semibold rounded">Interactive</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generates interactive classroom multiple-choice quizzes complete with live score trackers, question timers, instant answer evaluation, and brief explanations on the board.
                </p>
                <div className="text-xs font-mono text-slate-400 bg-slate-50 p-2.5 rounded border border-slate-100">
                  💡 Try speaking: &quot;Water cycle par 5 mcq questions banao&quot; or &quot;Create quiz on light reflection&quot;
                </div>
              </div>
            </div>

            {/* Whiteboard */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-5 items-start">
              <span className="text-4xl p-3 bg-purple-50 rounded-xl">🎨</span>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Whiteboard (Interactive Diagram Mode)</h3>
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 font-semibold rounded">Smart Board</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Draws clean flowchart and cycle diagrams automatically. Teachers can toggle full-screen view for the smart board, explanation labels highlight individual nodes, and diagrams can be downloaded as premium PNGs.
                </p>
                <div className="text-xs font-mono text-slate-400 bg-slate-50 p-2.5 rounded border border-slate-100">
                  💡 Try speaking: &quot;Human digestive system ka diagram banao&quot; or &quot;Show me the carbon cycle flow&quot;
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── Best Practices ─── */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col gap-3">
          <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2">
            <span>💡</span> Pro Tips for Best Classroom Performance
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-2 leading-relaxed">
            <li>Ensure the classroom microphone is placed close to you and free of background noise.</li>
            <li>Always specify the grade level in your voice prompt (e.g., &quot;class 8 ke liye&quot;) to tailor complexity.</li>
            <li>Use the Text-to-Speech audio to practice pronunciation and keep student engagement high.</li>
            <li>Utilize the full-screen mode for the Whiteboard canvas when demonstrating diagrams to the entire class.</li>
          </ul>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} SikshaMitra. Connecting Dreams Foundation. All rights reserved.
      </footer>
    </div>
  );
}
