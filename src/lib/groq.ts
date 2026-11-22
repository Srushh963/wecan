import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';

export const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

export const GROQ_MODEL = 'openai/gpt-oss-120b';
export const GROQ_FAST_MODEL = 'openai/gpt-oss-20b';

// Helper to ask Groq with JSON structure
export async function getGroqChatCompletionJson<T = any>(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = GROQ_MODEL
): Promise<T> {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model,
    response_format: { type: 'json_object' },
  });

  const content = chatCompletion.choices[0]?.message?.content || '{}';
  const cleaned = content.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
  return JSON.parse(cleaned);
}

// Helper for standard text completion
export async function getGroqChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = GROQ_FAST_MODEL
): Promise<string> {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model,
  });

  return chatCompletion.choices[0]?.message?.content || '';
}

// Agent 1: Resume Forensic Auditor
export const auditResume = async (resumeText: string, targetRole: string) => {
  return await getGroqChatCompletionJson([
    {
      role: 'system',
      content: `You are a Senior Technical Recruiter and ATS Forensic Auditor. 
Analyze the resume for "Structural Integrity" (ATS compatibility), "Keyword Entropy", and "Quantifiable Impact".
Target Role: ${targetRole}.
Identify hard-target keywords missing.
Provide a score out of 100.
You MUST reply with a JSON object in this exact schema:
{
  "integrityScore": number,
  "keywordEntropy": number,
  "quantifiableImpact": number,
  "missingKeywords": string[],
  "forensicAnalysis": string
}`
    },
    {
      role: 'user',
      content: resumeText
    }
  ], GROQ_MODEL);
};

// Agent 3: Vault Simulator (Interview Adversary)
export const getInterviewResponse = async (history: any[], lastUserAnswer: string) => {
  // Convert Gemini history or generic history to Groq format
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `You are 'The Architect' - a Voice-First adversarial interviewer for WeCan. 
You do not provide feedback during the interview. You test the "breaking point" of the user's technical knowledge.
Focus on absolute technical depth. If they provide a high-level answer, drill into implementation details.
Analyze for accuracy and keyword density.`
    }
  ];

  for (const item of history) {
    const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
    const text = item.parts?.[0]?.text || item.content || item.text || '';
    if (text) {
      formattedMessages.push({ role, content: text });
    }
  }

  if (lastUserAnswer) {
    formattedMessages.push({ role: 'user', content: lastUserAnswer });
  }

  return await getGroqChatCompletion(formattedMessages, GROQ_MODEL);
};

// Agent 4: Voice Feedback Analyzer
export const getDetailedVoiceFeedback = async (history: any[]) => {
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `You are a Communication Coach. Analyze the user's responses in this interview session.
Provide granular feedback on:
1. Pronunciation: Identify specific words or phrasings that could be clearer. Provide specific examples of words the user mispronounced or could improve.
2. Pace: Evaluate if they speak too fast, too slow, or have inconsistent rhythm.
3. Clarity: Evaluate the structural clarity of their explanations.
4. Content: General technical depth feedback.
Provide scores (0-100) for each category.
You MUST reply with a JSON object in this exact schema:
{
  "pronunciation": number,
  "pace": number,
  "clarity": number,
  "content": number,
  "detailedFeedback": string,
  "pronunciationExamples": string[],
  "tips": string[]
}`
    }
  ];

  for (const item of history) {
    const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
    const text = item.parts?.[0]?.text || item.content || item.text || '';
    if (text) {
      formattedMessages.push({ role, content: text });
    }
  }

  return await getGroqChatCompletionJson(formattedMessages, GROQ_MODEL);
};

// Agent 5: Resume Extractor
export const extractResumeText = async (fileBase64: string, mimeType: string) => {
  try {
    // If it's a text-based format or raw text:
    let decoded = '';
    try {
      decoded = atob(fileBase64);
    } catch {
      decoded = fileBase64;
    }

    const res = await getGroqChatCompletion([
      {
        role: 'system',
        content: 'Extract all readable text from this resume into a structured professional format. Focus on Education, Experience, Skills, and Projects.'
      },
      {
        role: 'user',
        content: `Resume content/data (${mimeType}):\n\n${decoded.substring(0, 15000)}`
      }
    ], GROQ_FAST_MODEL);
    return res;
  } catch (err) {
    console.error("Resume extraction failed:", err);
    return "Failed to parse resume document content.";
  }
};

// Agent 6: Q&A Follow-up Assistant
export const getQAFollowUp = async (qaHistory: any[], userQuery: string) => {
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: "You are an Interview Mentor. Help the user understand the generated interview questions better. Explain 'why' a certain answer is ideal, provide alternative ways to answer, or clarify technical concepts mentioned in the Q&A set."
    }
  ];

  for (const item of qaHistory) {
    const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
    const text = item.parts?.[0]?.text || item.content || item.text || '';
    if (text) {
      formattedMessages.push({ role, content: text });
    }
  }

  if (userQuery) {
    formattedMessages.push({ role: 'user', content: userQuery });
  }

  return await getGroqChatCompletion(formattedMessages, GROQ_FAST_MODEL);
};

// Browser TTS Helper (fallback-compatible, works completely on localhost without audio API quota)
export const generateSpeech = async (_text: string): Promise<string | null> => {
  // Returns null so callers fall back seamlessly to web speech synthesis,
  // which works offline/localhost with zero delay or API rate limits.
  return null;
};
