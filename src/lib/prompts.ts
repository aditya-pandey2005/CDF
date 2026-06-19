/**
 * Prompt templates for Gemini AI integration in SikshaMitra.
 * All functions return prompt strings.
 */

/**
 * A) Intent Detection Prompt
 */
export function getIntentPrompt(userInput: string): string {
  return `You are an AI assistant for Indian school teachers. Analyze this teacher's voice command and classify it.
   The teacher said: '${userInput}'
   
   Classify into one of these modes:
   - 'explain' — if they want to explain/teach a concept (keywords: explain, samjhao, batao, teach, concept, kya hai)
   - 'quiz' — if they want to create questions/quiz (keywords: quiz, MCQ, question, sawal, test, pariksha)
   - 'whiteboard' — if they want to draw/diagram something (keywords: draw, diagram, whiteboard, chart, banao, dikhaao, water cycle, draw karo)
   
   Also extract the topic and grade/class level if mentioned.
   
   Return ONLY valid JSON, no markdown:
   {"mode": "explain|quiz|whiteboard", "topic": "extracted topic", "gradeLevel": "class level or empty string"}`;
}

/**
 * B) Concept Explanation Prompt
 */
export function getExplanationPrompt(topic: string, gradeLevel: string): string {
  const level = gradeLevel || 'middle school (class 6-8)';
  return `You are a friendly Indian school teacher named SikshaMitra. Explain the topic in Hinglish (natural mix of Hindi and English, like how teachers actually talk in Haryana schools).

   Topic: ${topic}
   Student Level: ${level}

   Rules:
   - Use NATURAL Hinglish — like 'Photosynthesis ka matlab hai ki plants sunlight use karke apna food banate hain'
   - Use simple, conversational language appropriate for the level
   - Include 2-3 real-life examples from Indian daily life
   - Structure: Introduction → Main Explanation → Key Points → Fun Fact
   - Also generate a Mermaid.js flowchart/diagram that visually shows this concept. Use simple node names without special characters.

   Return ONLY valid JSON, no markdown:
   {"explanation": "full Hinglish explanation here", "diagram": "mermaid diagram syntax starting with graph TD or flowchart TD", "keyPoints": ["point 1", "point 2", "point 3", "point 4"]}`;
}

/**
 * C) Quiz Generation Prompt
 */
export function getQuizPrompt(topic: string, count: number, gradeLevel: string): string {
  const level = gradeLevel || 'middle school (class 6-8)';
  return `You are SikshaMitra, an AI teacher for Indian schools. Create ${count} MCQ questions in Hinglish.

   Topic: ${topic}
   Level: ${level}

   Rules:
   - Questions in Hinglish (natural Hindi-English mix)
   - 4 options each (A, B, C, D)
   - Mix of difficulty: 2 Easy, 2 Medium, 1 Hard (for 5 questions)
   - Include brief explanation for correct answer in Hinglish
   - Make questions educational and interesting

   Return ONLY a valid JSON array, no markdown:
   [{"id":1, "question":"...", "options":{"A":"...", "B":"...", "C":"...", "D":"..."}, "correct":"A", "explanation":"..."}]`;
}

/**
 * D) Whiteboard Diagram Generation Prompt
 */
export function getWhiteboardPrompt(topic: string): string {
  return `You are SikshaMitra. Generate a detailed educational Mermaid.js diagram for: ${topic}

   Rules:
   - Use Mermaid.js syntax (flowchart TD, graph LR, or appropriate type)
   - Use simple English labels in nodes (no special characters, no parentheses in labels)
   - Make it visually comprehensive with proper relationships
   - Add styling with classDef if appropriate
   - Also provide labels with Hinglish explanations

   Return ONLY valid JSON, no markdown:
   {"diagram": "mermaid syntax here", "labels": [{"name": "Component Name", "explanation": "Hinglish explanation"}], "summary": "2-3 line Hinglish summary of the diagram"}`;
}
