import { anthropic, CLAUDE_MODEL } from '../lib/anthropic';
import { error, json, readJson } from '../lib/http';

export const config = { runtime: 'edge' };

interface RelayBody {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<RelayBody>(req);
  if (!body?.systemPrompt || !body?.userMessage) {
    return error(400, 'systemPrompt and userMessage required');
  }
  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: body.maxTokens ?? 512,
    system: body.systemPrompt,
    messages: [{ role: 'user', content: body.userMessage }],
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');
  return json({ text, model: CLAUDE_MODEL });
}
