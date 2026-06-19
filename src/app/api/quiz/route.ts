import { generateContent, parseGeminiResponse } from '@/lib/gemini';
import { getQuizPrompt } from '@/lib/prompts';
import type { QuizQuestion } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, count = 5, gradeLevel } = body;

    if (!topic) {
      return Response.json(
        { success: false, error: 'Missing parameter: "topic" is required.' },
        { status: 400 }
      );
    }

        const quizCount = typeof count === 'number' ? count : parseInt(count, 10) || 5;

    const geminiKey = process.env.GEMINI_API_KEY;
    const isPlaceholderKey = !geminiKey || geminiKey.trim() === '' || geminiKey.includes('your_gemini_key_here') || geminiKey.startsWith('your_');

    if (isPlaceholderKey) {
      const cleanTopic = typeof topic === 'string' ? topic.trim() : 'Topic';
      const mockQuestions = [
        {
          id: 1,
          question: `${cleanTopic} ke baare mein basic concept kya hai? (What is the basic concept of ${cleanTopic}?)`,
          options: {
            A: "Yeh ek natural process hai (Natural process)",
            B: "Yeh ek artificial machine hai",
            C: "Yeh ek type ka game hai",
            D: "Iska koi clear description nahi hai"
          },
          correct: "A" as const,
          explanation: `${cleanTopic} ek mahatvapurna natural ya educational concept hai jisko hum primary classrooms mein padhte hain.`
        },
        {
          id: 2,
          question: `${cleanTopic} ka main component kya hai? (What is the main component of ${cleanTopic}?)`,
          options: {
            A: "Energy and water",
            B: `Primary elements of ${cleanTopic}`,
            C: "Computer and internet",
            D: "None of the above"
          },
          correct: "B" as const,
          explanation: `${cleanTopic} ke main components class mein discussion ke liye sabse important hote hain.`
        },
        {
          id: 3,
          question: `Hum ${cleanTopic} ke baare mein kyun padhte hain? (Why do we study about ${cleanTopic}?)`,
          options: {
            A: "Exam pass karne ke liye",
            B: "Apne aas-paas ki duniya ko samajhne ke liye (To understand our surrounding world)",
            C: "Kyunki teacher ne bola hai",
            D: "Iska koi use nahi hai"
          },
          correct: "B" as const,
          explanation: `${cleanTopic} hamare paryavaran aur science ka ek mahatvapurna hissa hai, jise samajhna sabhi ke liye zaroori hai.`
        },
        {
          id: 4,
          question: `Agar ${cleanTopic} na ho, toh kya hoga? (What happens if there is no ${cleanTopic}?)`,
          options: {
            A: "Earth pe life affect hogi (Life on Earth will be affected)",
            B: "Kuch bhi change nahi hoga",
            C: "Weather humesha same rahega",
            D: "Internet band ho jayega"
          },
          correct: "A" as const,
          explanation: `${cleanTopic} ke bina balance bigad jayega aur iska direct asar ecosystem par padega.`
        },
        {
          id: 5,
          question: `${cleanTopic} ko behtar tarike se kaise conservation/study kar sakte hain? (How can we conserve/study ${cleanTopic} better?)`,
          options: {
            A: "Pollution badhakar",
            B: "Research aur conservation efforts se (Through research and conservation)",
            C: "Isse ignore karke",
            D: "Forests ko cut karke"
          },
          correct: "B" as const,
          explanation: "Sahi scientific study aur conservation practice se hum topic ko preserve kar sakte hain."
        }
      ];

      return Response.json({
        success: true,
        questions: mockQuestions.slice(0, quizCount),
      });
    }

    // Generate prompt for quiz
    const prompt = getQuizPrompt(topic, quizCount, gradeLevel || '');

    // Get response from Gemini AI
    const rawText = await generateContent(prompt);

    // Parse array response
    const parsedArray = parseGeminiResponse<any[]>(rawText);

    if (!Array.isArray(parsedArray)) {
      return Response.json(
        { success: false, error: 'Gemini AI did not return a JSON array for quiz questions.' },
        { status: 500 }
      );
    }

    // Validate the structure of each question in the array
    const validatedQuestions: QuizQuestion[] = parsedArray.map((item, idx) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Item at index ${idx} is not a valid question object.`);
      }

      const id = typeof item.id === 'number' ? item.id : idx + 1;
      const question = typeof item.question === 'string' ? item.question.trim() : '';
      const options = item.options || {};
      const correct = typeof item.correct === 'string' ? item.correct.trim().toUpperCase() : '';
      const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';

      if (!question) {
        throw new Error(`Question at index ${idx} is missing required field "question".`);
      }

      if (
        typeof options.A !== 'string' ||
        typeof options.B !== 'string' ||
        typeof options.C !== 'string' ||
        typeof options.D !== 'string'
      ) {
        throw new Error(`Question at index ${idx} has invalid options format. Option options.A/B/C/D must be strings.`);
      }

      if (correct !== 'A' && correct !== 'B' && correct !== 'C' && correct !== 'D') {
        throw new Error(`Question at index ${idx} has invalid correct option: "${correct}". Must be A, B, C, or D.`);
      }

      return {
        id,
        question,
        options: {
          A: options.A.trim(),
          B: options.B.trim(),
          C: options.C.trim(),
          D: options.D.trim(),
        },
        correct: correct as 'A' | 'B' | 'C' | 'D',
        explanation,
      };
    });

    return Response.json({
      success: true,
      questions: validatedQuestions,
    });
  } catch (error) {
    console.error('[Quiz API] Error generating quiz:', error);
    const message = error instanceof Error ? error.message : 'Unknown quiz generation error';
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
