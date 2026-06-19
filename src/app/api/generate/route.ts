import { generateContent, parseGeminiResponse } from '@/lib/gemini';
import {
  getIntentPrompt,
  getExplanationPrompt,
  getWhiteboardPrompt,
} from '@/lib/prompts';

function parseLocalIntent(text: string) {
  const lower = text.toLowerCase();
  let mode: 'explain' | 'quiz' | 'whiteboard' = 'explain';

  if (
    lower.includes('quiz') ||
    lower.includes('mcq') ||
    lower.includes('sawal') ||
    lower.includes('question') ||
    lower.includes('test') ||
    lower.includes('pariksha')
  ) {
    mode = 'quiz';
  } else if (
    lower.includes('draw') ||
    lower.includes('diagram') ||
    lower.includes('whiteboard') ||
    lower.includes('chart') ||
    lower.includes('banao') ||
    lower.includes('dikhaao') ||
    lower.includes('water cycle') ||
    lower.includes('draw karo')
  ) {
    mode = 'whiteboard';
  }

  const stopWords = [
    'explain', 'samjhao', 'batao', 'teach', 'concept', 'kya hai',
    'quiz', 'mcq', 'question', 'sawal', 'test', 'pariksha',
    'draw', 'diagram', 'whiteboard', 'chart', 'banao', 'dikhaao',
    'water cycle', 'draw karo', 'karo', 'please', 'karke', 'mujhe',
    'about', 'on', 'ko', 'de', 'ek', 'bana', 'banaen', 'banaein', 'banaiye'
  ];

  const words = text.split(/\s+/);
  const filteredWords = words.filter((w) => {
    const cleanWord = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    return !stopWords.includes(cleanWord);
  });

  const topic = filteredWords.join(' ').trim() || 'General Topic';

  let gradeLevel = '';
  const gradeMatch = text.match(/(?:class|grade|kaksha|कक्षा)\s*(\d+(?:th)?)/i);
  if (gradeMatch && gradeMatch[0]) {
    gradeLevel = gradeMatch[0];
  }

  return { mode, topic, gradeLevel };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, text, topic, gradeLevel } = body;

    if (!mode) {
      return Response.json(
        { success: false, error: 'Missing parameter: "mode" is required.' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const isPlaceholderKey =
      !geminiKey ||
      geminiKey.trim() === '' ||
      geminiKey.includes('your_gemini_key_here') ||
      geminiKey.startsWith('your_');

    // Intercept with high-quality mock fallbacks if using a placeholder key
    if (isPlaceholderKey) {
      if (mode === 'intent') {
        const localIntent = parseLocalIntent(text || '');
        return Response.json({
          success: true,
          data: localIntent,
        });
      }

      if (mode === 'explain') {
        const cleanTopic = (topic || 'General Topic').trim();
        if (cleanTopic.toLowerCase().includes('photosynthesis')) {
          return Response.json({
            success: true,
            data: {
              explanation: "Photosynthesis vah process hai jisse green plants sunlight ka use karke apna food banate hain.\n\nPlants carbon dioxide (CO2) aur water (H2O) ko absorb karte hain aur sunlight ki energy ki madad se unhe Glucose aur Oxygen (O2) mein convert karte hain.\n\nयह प्रक्रिया (process) मुख्य रूप से पत्तियों (leaves) में होती है जहाँ Chlorophyll present hota hai.",
              diagram: "graph TD\n  Sun[Sunlight] --> leaf(Chlorophyll Leaf)\n  CO2[Carbon Dioxide] --> leaf\n  H2O[Water from Roots] --> leaf\n  leaf --> Glucose[Glucose - Food]\n  leaf --> O2[Oxygen released]",
              keyPoints: [
                "Sunlight is the main energy source (सौर ऊर्जा मुख्य स्रोत है).",
                "Chlorophyll absorbs light (क्लोроफिल/chlorophyll प्रकाश को सोखता है).",
                "Oxygen is released as a byproduct (ऑक्सीजन बाहर निकलती है).",
                "Glucose stores chemical energy (ग्लूकोज में ऊर्जा संचित होती है)."
              ]
            }
          });
        }

        return Response.json({
          success: true,
          data: {
            explanation: `${cleanTopic} ek mahatvapurna concept hai jise hum everyday life se relate kar sakte hain.\n\nIsko samajhne ke liye hum basic elements aur experiments ka use karte hain.\n\nYeh topic is class ke students ke liye details ke saath basic language mein aur examples ke sath design kiya gaya hai.`,
            diagram: `graph TD\n  Core[${cleanTopic}] --> Step1(Fundamental A)\n  Core --> Step2(Fundamental B)\n  Step1 --> End1[Outcome X]\n  Step2 --> End2[Outcome Y]`,
            keyPoints: [
              `${cleanTopic} science/study ka ek basic concept hai (यह एक बुनियादी अवधारणा है).`,
              `It helps explain natural phenomenons (यह प्राकृतिक घटनाओं को समझने में मदद करता है).`,
              `Understanding its practical applications is very useful (इसके व्यावहारिक उपयोग महत्वपूर्ण हैं).`
            ]
          }
        });
      }

      if (mode === 'whiteboard') {
        const cleanTopic = (topic || 'General Topic').trim();
        if (cleanTopic.toLowerCase().includes('water cycle') || cleanTopic.toLowerCase().includes('water')) {
          return Response.json({
            success: true,
            data: {
              diagram: "graph TD\n  Ocean[Ocean / River] -- Evaporation --> Cloud(Cloud Formation)\n  Cloud -- Condensation --> Rain[Rain / Precipitation]\n  Rain -- Surface Runoff --> Ocean\n  Sun[Sunlight Energy] --> Ocean",
              labels: [
                { name: "Evaporation", explanation: "Sunlight ki heat se water vapours bankar upar aasman mein jaata hai." },
                { name: "Condensation", explanation: "Water vapours thande hokar clouds ka roop le lete hain." },
                { name: "Precipitation", explanation: "Clouds jab heavy ho jaate hain toh rain ya snow ke roop mein paani niche girta hai." },
                { name: "Surface Runoff", explanation: "Girne wala paani rivers aur streams ke zariye wapas ocean/seas mein mil jaata hai." }
              ],
              summary: "Water Cycle (जल चक्र) earth par paani ka lagatar chalne wala process hai. Paani evaporate hota hai, cloud banta hai, barish hoti hai, aur phir se ocean mein mil jaata hai."
            }
          });
        }

        return Response.json({
          success: true,
          data: {
            diagram: `graph TD\n  Core[${cleanTopic}] --> Sub1(Part A)\n  Core --> Sub2(Part B)\n  Sub1 --> End1[Result X]\n  Sub2 --> End2[Result Y]`,
            labels: [
              { name: "Core Node", explanation: `${cleanTopic} ka central part hai.` },
              { name: "Sub-processes", explanation: "Different steps of the concept details." }
            ],
            summary: `${cleanTopic} ka diagram basic structures aur flow direction ko represent karta hai.`
          }
        });
      }
    }

    let prompt = '';

    switch (mode) {
      case 'intent':
        if (!text) {
          return Response.json(
            { success: false, error: 'Missing parameter: "text" is required for intent mode.' },
            { status: 400 }
          );
        }
        prompt = getIntentPrompt(text);
        break;

      case 'explain':
        if (!topic) {
          return Response.json(
            { success: false, error: 'Missing parameter: "topic" is required for explain mode.' },
            { status: 400 }
          );
        }
        prompt = getExplanationPrompt(topic, gradeLevel || '');
        break;

      case 'whiteboard':
        if (!topic) {
          return Response.json(
            { success: false, error: 'Missing parameter: "topic" is required for whiteboard mode.' },
            { status: 400 }
          );
        }
        prompt = getWhiteboardPrompt(topic);
        break;

      default:
        return Response.json(
          { success: false, error: `Invalid mode "${mode}" specified.` },
          { status: 400 }
        );
    }

    // Call Gemini API to generate response
    const rawText = await generateContent(prompt);

    // Parse response using the robust parser
    const parsedData = parseGeminiResponse(rawText);

    return Response.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('[Generate API] Error processing request:', error);
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
