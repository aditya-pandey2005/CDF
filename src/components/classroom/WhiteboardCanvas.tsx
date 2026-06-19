'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { WhiteboardResult } from '@/types';
import MermaidRenderer from '@/components/diagrams/MermaidRenderer';
import TextToSpeech from '@/components/voice/TextToSpeech';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface WhiteboardCanvasProps {
  topic: string;
  onNewCommand: () => void;
}

// Helper to wrap Devanagari segments with the proper font classes
function formatTextWithHindi(text: string) {
  if (!text) return '';
  const regex = /([\u0900-\u097F]+)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.match(/[\u0900-\u097F]/)) {
      return (
        <span key={index} className="hindi-text font-hindi text-[var(--text-primary)]">
          {part}
        </span>
      );
    }
    return part;
  });
}

const accentColors = [
  'text-blue-400 border-blue-500/20 bg-blue-500/5',
  'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  'text-purple-400 border-purple-500/20 bg-purple-500/5',
  'text-amber-400 border-amber-500/20 bg-amber-500/5',
  'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
];

export default function WhiteboardCanvas({ topic, onNewCommand }: WhiteboardCanvasProps) {
  const [whiteboardData, setWhiteboardData] = useState<WhiteboardResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const diagramContainerRef = useRef<HTMLDivElement>(null);

  // Sync fullscreen state with document state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fetch whiteboard diagram
  const fetchWhiteboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'whiteboard',
          topic,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setWhiteboardData(result.data as WhiteboardResult);
      } else {
        throw new Error(result.error || 'Failed to fetch whiteboard data.');
      }
    } catch (err: any) {
      console.error('[WhiteboardCanvas] Fetch error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    fetchWhiteboard();
  }, [fetchWhiteboard]);

  // Fullscreen trigger
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Download PNG implementation
  const downloadPNG = useCallback(() => {
    if (!diagramContainerRef.current) return;
    const svgElement = diagramContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const bbox = svgElement.getBoundingClientRect();
        const canvas = document.createElement('canvas');

        // Capture SVG viewBox or client dimensions
        let width = 1200;
        let height = 800;
        if (svgElement.viewBox && svgElement.viewBox.baseVal) {
          width = svgElement.viewBox.baseVal.width || bbox.width || 1200;
          height = svgElement.viewBox.baseVal.height || bbox.height || 800;
        }

        // Higher resolution canvas for premium crisp render
        canvas.width = width * 2;
        canvas.height = height * 2;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill canvas background to match whiteboard projection theme
          ctx.fillStyle = '#070a13';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Trigger download
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${topic.replace(/\s+/g, '_')}-siksha-mitra.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error('Error generating PNG:', err);
    }
  }, [topic]);

  // Clear diagram content
  const handleClear = useCallback(() => {
    setWhiteboardData(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-6 py-12 pb-36 animate-fade-in">
        <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[var(--border)] border-t-[var(--accent-purple)] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xl">🎨</span>
          </div>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
            SikshaMitra board draw kar rahi hai... 🎨
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Generating classroom whiteboard diagram and details
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12 gap-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-fade-in">
        <div className="text-4xl">⚠️</div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">Whiteboard load nahi ho payi!</h3>
          <p className="text-sm text-rose-300/80">
            Diagram taiyyar karte waqt koi samasya aayi. Kripya check karein aur retry karein.
          </p>
          {error && <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{error}</p>}
        </div>
        <Button variant="accent" onClick={fetchWhiteboard} className="px-6">
          Board Phir Se Load Karein 🔄 (Retry)
        </Button>
      </div>
    );
  }

  if (!whiteboardData) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto my-12 gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] animate-fade-in">
        <div className="text-5xl">🗑️</div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Board is Clear</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Whiteboard ko clear kar diya gaya hai. Kuch naya padhane ke liye mic button use karein.
          </p>
        </div>
        <Button variant="primary" onClick={onNewCommand} className="px-6">
          Boliye Kya Draw Karna Hai 🎤
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-6 pb-40 flex flex-col gap-6 animate-fade-in">
      {/* ─── Top Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            🎨 Whiteboard: {topic}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Projection mode optimized for smart boards
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5"
          >
            <span>⛶</span>
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadPNG}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5"
          >
            <span>📥</span>
            <span>Download PNG</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10"
          >
            <span>🗑</span>
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* ─── Diagram Container (Fullscreen friendly) ─── */}
      <div
        ref={diagramContainerRef}
        id="whiteboard-diagram-container"
        className={`
          relative w-full flex items-center justify-center overflow-hidden transition-all duration-300
          ${
            isFullscreen
              ? 'fixed inset-0 z-[9999] bg-[#070a13] p-12'
              : 'rounded-2xl border border-[var(--border)] bg-[#070a13]/80 p-8 min-h-[450px] shadow-2xl'
          }
        `}
      >
        <div className={`w-full max-w-full ${isFullscreen ? 'h-full max-h-[85vh] flex items-center justify-center' : ''}`}>
          <MermaidRenderer
            chart={whiteboardData.diagram}
            className={`border-0 bg-transparent p-0 ${isFullscreen ? 'max-h-full' : ''}`}
          />
        </div>

        {/* Floating close fullscreen overlay */}
        {isFullscreen && (
          <div className="absolute top-6 right-6 flex items-center gap-3 z-[10000]">
            <Button variant="secondary" onClick={downloadPNG} className="bg-slate-900/80 backdrop-blur-md">
              📥 Download PNG
            </Button>
            <Button variant="primary" onClick={toggleFullscreen} className="bg-purple-600 hover:bg-purple-700">
              Exit Fullscreen ✕
            </Button>
          </div>
        )}
      </div>

      {/* ─── Labels Panel (Staggered slide-in, hidden in fullscreen) ─── */}
      {!isFullscreen && (
        <>
          {whiteboardData.labels && whiteboardData.labels.length > 0 && (
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <span>🏷️</span> Diagram Labels & Meanings (लेबल स्पष्टीकरण)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whiteboardData.labels.map((lbl, idx) => {
                  const colorClass = accentColors[idx % accentColors.length];
                  return (
                    <div
                      key={idx}
                      className={`
                        p-4 rounded-xl border flex flex-col gap-1.5 animate-slide-up
                        ${colorClass}
                      `}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <h4 className="text-lg font-bold tracking-tight">
                        {lbl.name}
                      </h4>
                      <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                        {formatTextWithHindi(lbl.explanation)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Summary Card ─── */}
          {whiteboardData.summary && (
            <Card
              variant="elevated"
              className="border border-purple-500/20 bg-purple-500/5 p-6 rounded-xl flex flex-col gap-3 mt-2"
            >
              <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                <span>📋</span> Summary (संक्षेप में)
              </h3>
              <p className="text-lg leading-relaxed text-[var(--text-primary)] smart-board-text">
                {formatTextWithHindi(whiteboardData.summary)}
              </p>
            </Card>
          )}
        </>
      )}

      {/* ─── Bottom Bar ─── */}
      {!isFullscreen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full glass border-t border-[var(--border)] px-6 py-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            {whiteboardData.summary && (
              <TextToSpeech
                text={whiteboardData.summary}
                autoPlay={true}
                mode="inline"
                className="bg-transparent border-0 shadow-none p-0 w-full"
              />
            )}
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={onNewCommand}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md shadow-purple-500/25 py-3 px-6 text-base font-semibold"
          >
            <span>Aur kuch draw karo</span>
            <span>🎤</span>
          </Button>
        </div>
      )}
    </div>
  );
}
