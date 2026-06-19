import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generates content using the gemini-2.5-flash model.
 * Server-side only.
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Received an empty response from Gemini AI.');
    }

    return response.text;
  } catch (error) {
    console.error('[Gemini Service] Error in generateContent:', error);
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    throw new Error(`Gemini AI Generation failed: ${message}`);
  }
}

/**
 * Robust JSON parser for Gemini text outputs.
 * Follows the 4-step parsing requirement:
 * 1. Direct JSON.parse
 * 2. Strip ```json ... ``` markdown code blocks
 * 3. Regex search for JSON object/array boundaries
 * 4. Throw error if all steps fail
 */
export function parseGeminiResponse<T>(text: string): T {
  const trimmed = text.trim();

  // Step 1: Try JSON.parse directly
  try {
    return JSON.parse(trimmed) as T;
  } catch (e) {
    // Direct parse failed, continue
  }

  // Step 2: Try stripping markdown code blocks
  try {
    const markdownRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
    const match = trimmed.match(markdownRegex);
    if (match && match[1]) {
      return JSON.parse(match[1].trim()) as T;
    }
  } catch (e) {
    // Markdown stripping failed, continue
  }

  // Step 3: Try extracting JSON with regex (finding outermost bounds)
  try {
    const startIndex = trimmed.search(/[\{\[]/);
    const endIndex = trimmed.lastIndexOf(trimmed[startIndex] === '{' ? '}' : ']');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const potentialJson = trimmed.substring(startIndex, endIndex + 1);
      return JSON.parse(potentialJson) as T;
    }
  } catch (e) {
    // Regex boundary search failed, continue
  }

  // Step 4: Throw descriptive error if all parsing attempts fail
  throw new Error(`Failed to parse Gemini response as valid JSON. Raw response: "${text.substring(0, 100)}..."`);
}
