'use client';

import React, { useEffect, useState } from 'react';

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

export default function MermaidRenderer({ chart, className = '' }: MermaidRendererProps) {
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const renderChart = async () => {
      try {
        const mermaidModule = (await import('mermaid')).default;
        
        mermaidModule.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#f1f5f9',
            primaryBorderColor: '#1e293b',
            lineColor: '#94a3b8',
            secondaryColor: '#1a2340',
            tertiaryColor: '#131b2e',
            fontFamily: 'Inter, sans-serif',
          },
        });

        // Generate unique ID for each render
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Render the diagram to SVG string
        const { svg } = await mermaidModule.render(uniqueId, chart);

        if (isMounted) {
          setSvgOutput(svg);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-[var(--radius)] bg-[var(--bg-surface)] border border-[var(--border)] w-full min-h-[250px] ${className}`}>
        <div className="w-full max-w-md space-y-4 animate-pulse">
          <div className="h-6 bg-slate-800 rounded-md w-3/4 mx-auto" />
          <div className="h-32 bg-slate-800 rounded-md w-full" />
          <div className="h-4 bg-slate-800 rounded-md w-5/6 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col gap-4 p-6 rounded-[var(--radius)] bg-rose-500/10 border border-rose-500/20 text-rose-400 w-full overflow-x-auto ${className}`}>
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-sm">Mermaid Rendering Error</h4>
          <p className="text-xs text-rose-300/80">{error}</p>
        </div>
        <pre className="p-4 rounded-xl bg-black/40 border border-[var(--border)] text-xs font-mono overflow-x-auto text-[var(--text-primary)]">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div 
      className={`flex justify-center items-center w-full max-w-full overflow-x-auto p-6 rounded-[var(--radius)] bg-[var(--bg-surface)] border border-[var(--border)] ${className}`}
      dangerouslySetInnerHTML={{ __html: svgOutput }}
    />
  );
}
