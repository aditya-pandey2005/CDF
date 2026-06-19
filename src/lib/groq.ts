import Groq from 'groq-sdk';

/**
 * Server-side Groq client for Whisper transcription.
 * Uses the GROQ_API_KEY environment variable.
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;
