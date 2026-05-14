import { getAIKey, hasAIKey } from '../lib/roadmapEngine.js';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

function defaultModel() {
  const m = import.meta.env?.VITE_GROQ_MODEL;
  return (m && String(m).trim()) || 'llama-3.3-70b-versatile';
}

async function groqJsonChat({ system, user }) {
  const apiKey = getAIKey();
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 22000);
  try {
    const response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: defaultModel(),
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Groq ${response.status}`);
    }
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (e) {
    console.warn('[ai]', e.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Gamified roadmap JSON for React Flow + persistence.
 * @param {{ topic: string, userLevel?: string }} params
 */
export async function generateGamifiedRoadmapJSON({ topic, userLevel = 'spark' }) {
  const system = `You design addictive, game-like learning roadmaps. Return ONLY valid JSON:
{
  "title": string,
  "description": string,
  "nodes": [
    { "id": number, "title": string, "type": "video" | "notes" | "quiz", "difficulty": string, "xp": number, "completed": false }
  ]
}
Rules: 6-10 nodes, start easy, ramp difficulty, include at least 2 quiz nodes and 2 video nodes.`;

  const user = `Topic: ${topic}
User attention tier: ${userLevel} (spark=shorter bursts, blaze=balanced, nova=deeper)`;

  const parsed = await groqJsonChat({ system, user });
  if (parsed?.nodes?.length) {
    return {
      title: String(parsed.title || topic),
      description: String(parsed.description || ''),
      nodes: parsed.nodes.map((n, i) => ({
        id: typeof n.id === 'number' ? n.id : i + 1,
        title: String(n.title || `Step ${i + 1}`),
        type: ['video', 'notes', 'quiz'].includes(n.type) ? n.type : 'notes',
        difficulty: String(n.difficulty || 'medium'),
        xp: Math.min(80, Math.max(5, Number(n.xp) || 15)),
        completed: false,
      })),
      _source: 'groq',
    };
  }

  return buildFallbackGamifiedRoadmap(topic);
}

export function buildFallbackGamifiedRoadmap(topic) {
  const t = String(topic || 'Your goal').slice(0, 60);
  return {
    title: `${t} — sprint path`,
    description: 'Offline template map — add Groq key for AI-shaped missions.',
    nodes: [
      { id: 1, title: 'Orientation', type: 'video', difficulty: 'easy', xp: 15, completed: false },
      { id: 2, title: 'Core concepts', type: 'notes', difficulty: 'easy', xp: 12, completed: false },
      { id: 3, title: 'Guided practice', type: 'video', difficulty: 'medium', xp: 20, completed: false },
      { id: 4, title: 'Checkpoint quiz', type: 'quiz', difficulty: 'medium', xp: 25, completed: false },
      { id: 5, title: 'Mini project', type: 'notes', difficulty: 'hard', xp: 30, completed: false },
      { id: 6, title: 'Boss quiz', type: 'quiz', difficulty: 'hard', xp: 40, completed: false },
    ],
    _source: 'local',
  };
}

/**
 * @param {{ topic: string, count?: number }} params
 * @returns {Promise<Array<{question:string,options:string[],answer:string,xp:number}>>}
 */
export async function generateQuizQuestions({ topic, count = 3 }) {
  const system = `Create short multiple-choice questions. Return ONLY JSON:
{ "questions": [ { "question": "", "options": ["","","",""], "answer": "", "xp": 10 } ] }
Exactly 4 options each; answer must match one option exactly.`;

  const user = `Topic: ${topic}\nCount: ${count}`;

  const parsed = await groqJsonChat({ system, user });
  const qs = Array.isArray(parsed?.questions) ? parsed.questions : [];
  const cleaned = qs
    .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2 && q.answer)
    .slice(0, count)
    .map((q) => ({
      question: String(q.question).slice(0, 220),
      options: q.options.slice(0, 4).map((o) => String(o)),
      answer: String(q.answer),
      xp: Math.min(40, Math.max(5, Number(q.xp) || 10)),
    }));
  if (cleaned.length) return cleaned;
  return null;
}

export { hasAIKey };
