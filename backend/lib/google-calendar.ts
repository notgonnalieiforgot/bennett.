import type { GoogleTokens } from '@bennett/shared';
import { db } from './firebase-admin';
import { env } from './env';

/**
 * Edge-compatible Google Calendar API client. Hand-rolled with `fetch`
 * because the official `googleapis` SDK pulls in Node-only modules
 * (http2, net, fs) that don't run on Vercel Edge.
 *
 * Tokens live in Firestore at `users/{uid}/integrations/google`. Per
 * Critical Rule #2 the client (web/iOS/macOS) never sees them.
 */

const TOKEN_URL  = 'https://oauth2.googleapis.com/token';
const AUTH_URL   = 'https://accounts.google.com/o/oauth2/v2/auth';
const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const SCOPE      = 'https://www.googleapis.com/auth/calendar.events';

export function googleAuthUrl(opts: { state: string; redirectUri: string }): string {
  const params = new URLSearchParams({
    client_id: env.googleCalendarClientId(),
    redirect_uri: opts.redirectUri,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state: opts.state,
    include_granted_scopes: 'true',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<GoogleTokens> {
  const body = new URLSearchParams({
    code: opts.code,
    client_id: env.googleCalendarClientId(),
    client_secret: env.googleCalendarClientSecret(),
    redirect_uri: opts.redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`google token exchange failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
    scope: json.scope,
    tokenType: json.token_type,
  };
}

async function refreshTokens(refreshToken: string): Promise<GoogleTokens> {
  const body = new URLSearchParams({
    client_id: env.googleCalendarClientId(),
    client_secret: env.googleCalendarClientSecret(),
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`google token refresh failed: ${res.status}`);
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
  return {
    accessToken: json.access_token,
    refreshToken,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
    scope: json.scope,
    tokenType: json.token_type,
  };
}

function tokensRef(uid: string) {
  return db().collection('users').doc(uid).collection('integrations').doc('google');
}

export async function loadTokens(uid: string): Promise<GoogleTokens | null> {
  const snap = await tokensRef(uid).get();
  if (!snap.exists) return null;
  return snap.data() as GoogleTokens;
}

export async function saveTokens(uid: string, tokens: GoogleTokens): Promise<void> {
  await tokensRef(uid).set(tokens, { merge: true });
}

async function freshTokens(uid: string): Promise<GoogleTokens> {
  const tokens = await loadTokens(uid);
  if (!tokens) throw new Error('google calendar not connected for this user');
  if (Date.now() < tokens.expiresAt) return tokens;
  const refreshed = await refreshTokens(tokens.refreshToken);
  await saveTokens(uid, refreshed);
  return refreshed;
}

export interface CalendarEvent {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export async function listEvents(opts: {
  uid: string;
  timeMin: Date;
  timeMax: Date;
}): Promise<CalendarEvent[]> {
  const tokens = await freshTokens(opts.uid);
  const url = new URL(EVENTS_URL);
  url.searchParams.set('timeMin', opts.timeMin.toISOString());
  url.searchParams.set('timeMax', opts.timeMax.toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '250');
  const res = await fetch(url.toString(), {
    headers: { authorization: `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) throw new Error(`calendar list failed: ${res.status}`);
  const json = (await res.json()) as { items?: CalendarEvent[] };
  return json.items ?? [];
}

export async function insertEvent(opts: {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
}): Promise<CalendarEvent> {
  const tokens = await freshTokens(opts.uid);
  const res = await fetch(EVENTS_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${tokens.accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      summary: opts.summary,
      description: opts.description,
      start: { dateTime: opts.start.toISOString() },
      end:   { dateTime: opts.end.toISOString() },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 5 }] },
    }),
  });
  if (!res.ok) throw new Error(`calendar insert failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as CalendarEvent;
}

export async function getEvent(opts: { uid: string; eventId: string }): Promise<CalendarEvent | null> {
  const tokens = await freshTokens(opts.uid);
  const res = await fetch(`${EVENTS_URL}/${encodeURIComponent(opts.eventId)}`, {
    headers: { authorization: `Bearer ${tokens.accessToken}` },
  });
  if (res.status === 404 || res.status === 410) return null;
  if (!res.ok) throw new Error(`calendar get failed: ${res.status}`);
  return (await res.json()) as CalendarEvent;
}
