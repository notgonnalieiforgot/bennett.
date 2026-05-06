import type { PersonaContext } from '@bennett/shared';
import { anthropic, CLAUDE_MODEL } from '../../lib/anthropic';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { sanitize } from './sanitizer';

export async function generatePersonaMessage(ctx: PersonaContext): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx);
  const userPrompt = buildUserPrompt(ctx);
  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const raw = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');
  return sanitize(raw);
}
