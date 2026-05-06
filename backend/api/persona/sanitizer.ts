import { BANNED_PHRASES } from './lingo';

const ALLOWED_EMOJIS = new Set(['💀', '😄', '😭', '🔒', '🛡']);

const EMOJI_REGEX = /\p{Extended_Pictographic}/gu;

function stripBannedPhrases(s: string): string {
  let out = s;
  for (const banned of BANNED_PHRASES) {
    const re = new RegExp(banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, '');
  }
  return out;
}

function lowercaseI(s: string): string {
  return s.replace(/\bI\b/g, 'i').replace(/\bI'/g, "i'");
}

function stripDisallowedEmojis(s: string): string {
  return s.replace(EMOJI_REGEX, (m) => (ALLOWED_EMOJIS.has(m) ? m : ''));
}

function stripMarkdown(s: string): string {
  return s
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1');
}

function lowercaseSentenceStarts(s: string): string {
  return s
    .split(/\n/)
    .map((line) => {
      const trimmed = line.trimStart();
      if (!trimmed) return line;
      const leading = line.slice(0, line.length - trimmed.length);
      const first = trimmed[0];
      if (first && first >= 'A' && first <= 'Z' && !trimmed.startsWith('Bennett')) {
        return leading + first.toLowerCase() + trimmed.slice(1);
      }
      return line;
    })
    .join('\n');
}

function stripTrailingPeriods(s: string): string {
  return s
    .split(/\n/)
    .map((line) => {
      const t = line.trimEnd();
      if (t.length > 1 && t.endsWith('.') && !t.endsWith('..') && !t.endsWith('period.')) {
        return t.slice(0, -1);
      }
      return t;
    })
    .join('\n');
}

export function sanitize(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^["']|["']$/g, '');
  s = stripMarkdown(s);
  s = stripBannedPhrases(s);
  s = lowercaseI(s);
  s = lowercaseSentenceStarts(s);
  s = stripDisallowedEmojis(s);
  s = stripTrailingPeriods(s);
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}
