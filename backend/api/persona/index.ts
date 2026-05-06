import type { PersonaContext, PersonaResponse } from '@bennett/shared';
import { error, json, readJson } from '../../lib/http';
import { generatePersonaMessage } from './service';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const ctx = await readJson<PersonaContext>(req);
  if (!ctx?.mode || !ctx?.triggerEvent || typeof ctx.energyPulse !== 'number') {
    return error(400, 'mode, triggerEvent, energyPulse required');
  }
  const message = await generatePersonaMessage(ctx);
  const out: PersonaResponse = {
    message,
    mode: ctx.mode,
    triggerEvent: ctx.triggerEvent,
  };
  return json(out);
}
