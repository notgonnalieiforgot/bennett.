import {
  SHIELD_DAY_END_HOUR,
  SHIELD_DAY_START_HOUR,
  SHIELD_MIN_BLOCK_MIN,
  type FreeBlock,
} from '@bennett/shared';
import type { CalendarEvent } from './google-calendar';

/**
 * Pure free-block detector. Given today's Calendar events, return
 * unscheduled spans of ≥60 minutes between 6:00am and 10:00pm in the user's
 * local timezone (caller passes `now` and `tz`).
 */
export function findFreeBlocks(opts: {
  events: CalendarEvent[];
  now: Date;
  /** IANA tz id, e.g. "America/Los_Angeles" */
  tz?: string;
}): FreeBlock[] {
  const dayStart = startOfHour(opts.now, SHIELD_DAY_START_HOUR);
  const dayEnd   = startOfHour(opts.now, SHIELD_DAY_END_HOUR);

  // Spans busy during the window.
  const busy: Array<{ start: number; end: number }> = [];
  for (const ev of opts.events) {
    const s = parseEventInstant(ev.start);
    const e = parseEventInstant(ev.end);
    if (!s || !e) continue;
    if (e <= dayStart.getTime() || s >= dayEnd.getTime()) continue;
    busy.push({
      start: Math.max(s, dayStart.getTime()),
      end:   Math.min(e, dayEnd.getTime()),
    });
  }
  busy.sort((a, b) => a.start - b.start);

  // Merge overlapping busy spans.
  const merged: Array<{ start: number; end: number }> = [];
  for (const b of busy) {
    const last = merged[merged.length - 1];
    if (last && b.start <= last.end) {
      last.end = Math.max(last.end, b.end);
    } else {
      merged.push({ ...b });
    }
  }

  const freeFromNow = Math.max(opts.now.getTime(), dayStart.getTime());
  const blocks: FreeBlock[] = [];
  let cursor = freeFromNow;
  for (const b of merged) {
    if (b.start > cursor) {
      pushIfLongEnough(blocks, cursor, b.start);
    }
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < dayEnd.getTime()) {
    pushIfLongEnough(blocks, cursor, dayEnd.getTime());
  }
  return blocks;
}

function pushIfLongEnough(out: FreeBlock[], start: number, end: number): void {
  const durationMin = (end - start) / 60_000;
  if (durationMin >= SHIELD_MIN_BLOCK_MIN) {
    out.push({ start, end, durationMin });
  }
}

function startOfHour(now: Date, hour: number): Date {
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function parseEventInstant(side: { dateTime?: string; date?: string }): number | null {
  if (side.dateTime) {
    const t = Date.parse(side.dateTime);
    return isNaN(t) ? null : t;
  }
  if (side.date) {
    // All-day events — treat as full-day busy.
    const t = Date.parse(`${side.date}T00:00:00`);
    return isNaN(t) ? null : t;
  }
  return null;
}

/**
 * Choose which free block to claim as today's shield. Strategy: claim the
 * EARLIEST block that fits, capped at 90 minutes (more than 90 starts to
 * feel like a meeting, not a focus session).
 */
export function pickShieldBlock(blocks: FreeBlock[]): FreeBlock | null {
  const earliest = blocks[0];
  if (!earliest) return null;
  const cap = 90 * 60_000;
  return {
    start: earliest.start,
    end:   Math.min(earliest.end, earliest.start + cap),
    durationMin: Math.min(earliest.durationMin, 90),
  };
}
