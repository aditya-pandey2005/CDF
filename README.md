# SikshaMitra — AI Teaching Sahayak 🎤✨

A voice-powered AI co-pilot for Indian classroom smart boards. Teachers speak in Hinglish, and SikshaMitra explains concepts, creates quizzes, and draws diagrams — all hands-free.

## Features
- 📖 **Live Concept Simplification**: Hinglish explanations with auto-generated diagrams
- 📝 **Voice-Triggered Quizzing**: MCQ generation with read-aloud and scoring
- 🎨 **Classroom Whiteboard**: AI-generated diagrams for smart board projection

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Speech-to-Text | Groq Whisper API (whisper-large-v3-turbo) |
| Text-to-Speech | Web Speech API (SpeechSynthesis) |
| AI Engine | Google Gemini API (gemini-2.5-flash) |
| Diagrams | Mermaid.js |
| Charts | Chart.js |
| Deployment | Vercel |

## Setup
1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and add your API keys
4. `npm run dev`
5. Open http://localhost:3000

## Prompt Design
See [docs/PROMPT_DESIGN.md](file:///c:/Users/ADITYA/OneDrive/Desktop/CDF/docs/PROMPT_DESIGN.md) for detailed prompt engineering documentation.

## Localization
- All AI output in Hinglish (Hindi + English mix)
- UI labels bilingual (Hindi + English)
- Optimized for Haryana government school context

## Built For
CDF Round 2 — Connecting Dreams Foundation
*"Build practical, human-centered AI tools that solve real-world problems"*
