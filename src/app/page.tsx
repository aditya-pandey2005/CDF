"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/* ─── Mode Card Data ─── */

const modeCards = [
  {
    id: "explain",
    emoji: "📖",
    title: "Samjhao (Explain)",
    descHi: "Kisi bhi topic ko Hinglish mein samjhao, diagram ke saath",
    descEn: "Explain any topic in Hinglish with diagrams",
    accent: "blue" as const,
    borderGlow: "rgba(59, 130, 246, 0.5)",
    iconBg: "rgba(59, 130, 246, 0.15)",
    delay: 0,
  },
  {
    id: "quiz",
    emoji: "📝",
    title: "Quiz Banao",
    descHi: "MCQ quiz banao aur students ko padhao",
    descEn: "Create MCQ quizzes and teach students",
    accent: "emerald" as const,
    borderGlow: "rgba(16, 185, 129, 0.5)",
    iconBg: "rgba(16, 185, 129, 0.15)",
    delay: 150,
  },
  {
    id: "whiteboard",
    emoji: "🎨",
    title: "Whiteboard",
    descHi: "Diagram aur chart banao smart board pe",
    descEn: "Draw diagrams and charts on the smart board",
    accent: "purple" as const,
    borderGlow: "rgba(139, 92, 246, 0.5)",
    iconBg: "rgba(139, 92, 246, 0.15)",
    delay: 300,
  },
];

/* ─── Floating Mic SVG ─── */

function FloatingMic() {
  return (
    <div className="animate-float" aria-hidden="true">
      <div
        className="relative w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.2), rgba(16,185,129,0.15), transparent 70%)",
          boxShadow: "0 0 60px rgba(59,130,246,0.15), 0 0 120px rgba(16,185,129,0.08)",
        }}
      >
        {/* Pulsing ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(59,130,246,0.2)",
            animation: "pulse-ring 2.5s ease-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            inset: "-8px",
            border: "1px solid rgba(16,185,129,0.1)",
            animation: "pulse-ring 2.5s ease-out 0.5s infinite",
          }}
        />

        {/* Mic icon */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="md:w-12 md:h-12"
        >
          <rect
            x="9"
            y="2"
            width="6"
            height="12"
            rx="3"
            fill="url(#mic-gradient)"
          />
          <path
            d="M5 11a7 7 0 0014 0"
            stroke="url(#mic-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="18"
            x2="12"
            y2="22"
            stroke="url(#mic-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="22"
            x2="15"
            y2="22"
            stroke="url(#mic-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="mic-gradient"
              x1="5"
              y1="2"
              x2="19"
              y2="22"
            >
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/* ─── Waveform Bars (decorative) ─── */

function WaveformBars() {
  const bars = [3, 5, 7, 4, 6, 8, 5, 3, 6, 4];
  return (
    <div className="flex items-end gap-[3px] h-8 opacity-40" aria-hidden="true">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: `${height * 3}px`,
            background: "linear-gradient(to top, #3b82f6, #10b981)",
            animation: `waveform 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Particle Dots (ambient background) ─── */

/* Seeded PRNG to produce deterministic positions (avoids hydration mismatch) */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PARTICLE_DATA = (() => {
  const rng = seededRandom(42);
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${(rng() * 100).toFixed(2)}%`,
    top: `${(rng() * 100).toFixed(2)}%`,
    size: Number((rng() * 3 + 1).toFixed(2)),
    delay: Number((rng() * 5).toFixed(2)),
    duration: Number((rng() * 3 + 4).toFixed(2)),
    opacity: Number((rng() * 0.3 + 0.05).toFixed(3)),
  }));
})();

function ParticleDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLE_DATA.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor:
              dot.id % 3 === 0
                ? "rgba(59,130,246,0.6)"
                : dot.id % 3 === 1
                ? "rgba(16,185,129,0.6)"
                : "rgba(139,92,246,0.6)",
            opacity: dot.opacity,
            animation: `float ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main Landing Page ─── */

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* ── Animated Gradient Background ── */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 60%),
              var(--bg-primary)
            `,
            backgroundSize: "200% 200%",
            animation: "gradient-bg 15s ease infinite",
          }}
        />

        {/* ── Subtle Grid Overlay ── */}
        <div
          className="fixed inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
        />

        {/* Ambient particles */}
        <ParticleDots />

        {/* ══════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-8 md:pt-24 md:pb-12"
        >
          {/* Floating Mic */}
          <div
            className={`mb-6 md:mb-8 transition-all duration-1000 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <FloatingMic />
          </div>

          {/* App Name */}
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 transition-all duration-700 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 40%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(59,130,246,0.2))",
            }}
          >
            SikshaMitra
          </h1>

          {/* Waveform decoration */}
          <div
            className={`mb-4 transition-all duration-700 delay-200 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <WaveformBars />
          </div>

          {/* Tagline */}
          <div
            className={`mb-3 transition-all duration-700 delay-300 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-lg md:text-2xl font-semibold text-[var(--text-primary)]">
              <span className="hindi-text">आपका AI Teaching सहायक</span>
            </p>
            <p className="text-base md:text-lg text-[var(--text-secondary)] mt-1">
              Your AI Teaching Co-pilot
            </p>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-700 delay-500 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-base md:text-xl text-[var(--text-muted)] italic">
              <span className="hindi-text">बोलिए, और देखिए जादू!</span> ✨
            </p>
            <p className="text-sm md:text-base text-[var(--text-muted)] mt-1">
              Speak, and watch the magic!
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            MODE CARDS SECTION
            ══════════════════════════════════════════════════ */}
        <section
          id="modes"
          className="w-full max-w-6xl mx-auto px-6 pb-12 md:pb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {modeCards.map((card) => (
              <div
                key={card.id}
                className={`transition-all duration-700 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: mounted ? `${card.delay + 600}ms` : "0ms",
                }}
              >
                <Card
                  variant="interactive"
                  glowColor={card.accent}
                  className="group h-full relative overflow-hidden"
                  id={`mode-card-${card.id}`}
                >
                  {/* Accent top border */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${card.borderGlow}, transparent)`,
                    }}
                  />

                  {/* Ambient glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center, ${card.iconBg}, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: card.iconBg }}
                    >
                      {card.emoji}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                      {card.emoji} {card.title}
                    </h3>

                    {/* Hindi Description */}
                    <p className="hindi-text text-base text-[var(--text-secondary)] mb-2 leading-relaxed">
                      {card.descHi}
                    </p>

                    {/* English Description */}
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {card.descEn}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CTA SECTION
            ══════════════════════════════════════════════════ */}
        <section
          id="cta"
          className="w-full flex flex-col items-center justify-center px-6 pb-16 md:pb-20"
        >
          <div
            className={`transition-all duration-700 ${
              mounted
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transitionDelay: mounted ? "1000ms" : "0ms",
            }}
          >
            <Link href="/classroom">
              <Button
                variant="primary"
                size="xl"
                id="cta-start-teaching"
                className="text-lg md:text-xl font-bold tracking-wide"
                style={{
                  animation: "cta-glow 3s ease-in-out infinite",
                }}
              >
                Start Teaching 🎤
              </Button>
            </Link>
          </div>

          {/* Subtle helper text */}
          <p
            className={`mt-4 text-sm text-[var(--text-muted)] transition-all duration-700 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: mounted ? "1200ms" : "0ms" }}
          >
            <span className="hindi-text">बोलकर पढ़ाना शुरू करें</span> — Start
            teaching by voice
          </p>
        </section>

        {/* ══════════════════════════════════════════════════
            FOOTER
            ══════════════════════════════════════════════════ */}
        <footer
          id="footer"
          className="w-full border-t border-[var(--border)] py-8 px-6"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 text-center">
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium">
              Connecting Dreams Foundation
            </p>

            {/* Small decorative bar */}
            <div
              className="w-16 h-[2px] mt-2 rounded-full"
              style={{
                background: "linear-gradient(90deg, #3b82f6, #10b981)",
                opacity: 0.4,
              }}
            />
          </div>
        </footer>
      </div>
    </>
  );
}
