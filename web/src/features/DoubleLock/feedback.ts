/**
 * Web visual feedback. No haptics — per Critical Rule #14, web uses
 * scale pulse + color flash. Caller wraps an element ref and bumps a
 * trigger counter; the helper applies a brief CSS transform + filter.
 */

export type FeedbackKind = 'success' | 'failure';

export function pulse(el: HTMLElement | null, kind: FeedbackKind = 'success'): void {
  if (!el) return;
  const color = kind === 'success' ? '#30D158' : '#E5484D';
  const prevTransition = el.style.transition;
  const prevTransform  = el.style.transform;
  const prevBox        = el.style.boxShadow;
  el.style.transition = 'transform 180ms ease-out, box-shadow 180ms ease-out';
  el.style.transform  = 'scale(1.06)';
  el.style.boxShadow  = `0 0 0 4px ${color}66, 0 0 24px ${color}88`;
  window.setTimeout(() => {
    el.style.transform = prevTransform;
    el.style.boxShadow = prevBox;
    window.setTimeout(() => {
      el.style.transition = prevTransition;
    }, 220);
  }, 180);
}
