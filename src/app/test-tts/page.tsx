'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextToSpeech from '@/components/voice/TextToSpeech';

const presets = {
  hindi: 'नमस्ते बच्चों! आज हम सौर मंडल के बारे में पढ़ेंगे। क्या आप तैयार हैं? चलिए शुरू करते हैं।',
  hinglish: 'Solar system mein aath planets hote hain. Sabse pehla planet Mercury hai, jo Sun ke sabse paas hai.',
  english: 'Hello classroom! Today, we will explore gravity, the force that keeps our feet on the ground and the planets in orbit.',
};

export default function TestTTSPage() {
  const [customText, setCustomText] = useState(presets.hinglish);
  const [mode, setMode] = useState<'inline' | 'fixed'>('inline');
  const [autoPlay, setAutoPlay] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden pb-32">
      {/* ── Background Gradients ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 60%),
            var(--bg-primary)
          `,
        }}
      />

      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            SikshaMitra
          </span>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="sm">
            ← Home Page
          </Button>
        </Link>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">
            Text-to-Speech (TTS) Sahayak
          </h1>
          <p className="text-[var(--text-secondary)]">
            Test and verify the Speech Synthesis engine with Hindi, Hinglish, and English voices.
          </p>
        </div>

        {/* ── Test Inputs & Configuration ── */}
        <Card variant="default" className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              1. Choose a Preset or Write Custom Text
            </h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                variant={customText === presets.hindi ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCustomText(presets.hindi)}
              >
                🇮🇳 Hindi Preset
              </Button>
              <Button
                variant={customText === presets.hinglish ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCustomText(presets.hinglish)}
              >
                🗣️ Hinglish Preset
              </Button>
              <Button
                variant={customText === presets.english ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCustomText(presets.english)}
              >
                🇬🇧 English Preset
              </Button>
            </div>
            <textarea
              id="tts-text-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Kuchh bhi likhiye..."
              className="w-full h-32 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none resize-none smart-board-text"
            />
          </div>

          {/* ── Options ── */}
          <div className="flex flex-wrap gap-6 items-center border-t border-[var(--border)] pt-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[var(--text-primary)]">Layout Mode</span>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'inline' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setMode('inline')}
                >
                  Inline Box
                </Button>
                <Button
                  variant={mode === 'fixed' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setMode('fixed')}
                >
                  Fixed Floating Bar
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-[var(--text-primary)]">Autoplay On Change</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--bg-surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-blue)] peer-checked:after:bg-white"></div>
                <span className="ml-3 text-sm font-medium text-[var(--text-secondary)]">
                  {autoPlay ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* ── Inline TTS Component Rendering ── */}
        {mode === 'inline' && (
          <Card variant="elevated" className="flex flex-col gap-4 border border-[var(--accent-blue)]/20">
            <h3 className="text-base font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Inline Player Control
            </h3>
            <TextToSpeech text={customText} autoPlay={autoPlay} mode="inline" />
          </Card>
        )}
      </main>

      {/* ── Fixed TTS Component Rendering ── */}
      {mode === 'fixed' && (
        <TextToSpeech text={customText} autoPlay={autoPlay} mode="fixed" />
      )}
    </div>
  );
}
