import { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS, type DiagnosticAnswer } from '@bennett/shared';
import { submitWaitlist } from '../../services/waitlist';

interface Props {
  onSubmitted: (applicationId: string) => void;
}

/**
 * 4-question Cognitive Diagnostic. Per spec §10a — landing page form.
 * Voice deliberately Bennett-leaning (lowercase, casual) to set tone
 * before the user has even joined.
 */
export function WaitlistDiagnostic({ onSubmitted }: Props) {
  const [email, setEmail] = useState('');
  const [q1, setQ1] = useState('');
  const [q2Scale, setQ2Scale] = useState<number>(5);
  const [q2Goal, setQ2Goal] = useState('');
  const [q3, setQ3] = useState<string[]>([]);
  const [q4, setQ4] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleStack(opt: string) {
    setQ3((cur) =>
      cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
    );
  }

  async function submit() {
    if (!email.includes('@')) {
      setError('valid email required');
      return;
    }
    if (!q1.trim() || !q2Goal.trim() || !q4.trim()) {
      setError('fill all four answers');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const answers: DiagnosticAnswer[] = [
        { questionId: 'q1_friction', text: q1.trim() },
        { questionId: 'q2_ambition', scale: q2Scale, text: q2Goal.trim() },
        { questionId: 'q3_stack', selected: q3 },
        { questionId: 'q4_failure', text: q4.trim() },
      ];
      const out = await submitWaitlist({ email, answers });
      onSubmitted(out.applicationId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const q3Q = DIAGNOSTIC_QUESTIONS.find((q) => q.id === 'q3_stack');
  const stackOptions = q3Q && q3Q.kind === 'multi_select' ? q3Q.options : [];

  return (
    <section className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold lowercase">join the founding 100.</h1>
        <p className="text-muted text-sm lowercase">
          4 questions. founder reads every one. flagged candidates get an invite by email.
        </p>
      </header>

      <Field label="email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-surface/30 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
      </Field>

      <Field label="1 — what's the biggest thing stopping u from doing the work?">
        <textarea
          value={q1}
          onChange={(e) => setQ1(e.target.value)}
          rows={3}
          className="w-full bg-surface/30 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
      </Field>

      <Field label="2 — rate ur ambition 1–10, and name ONE goal u'd bet $20 on">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setQ2Scale(n)}
              className={`w-8 h-8 rounded-md text-xs font-semibold ${
                q2Scale === n ? 'bg-accent text-white' : 'bg-surface/30 text-muted'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          value={q2Goal}
          onChange={(e) => setQ2Goal(e.target.value)}
          rows={2}
          placeholder="the one goal"
          className="w-full bg-surface/30 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
      </Field>

      <Field label="3 — what tools/apps are already in ur stack?">
        <div className="flex flex-wrap gap-1.5">
          {stackOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleStack(opt)}
              className={`px-2.5 py-1 rounded-full text-xs lowercase ${
                q3.includes(opt) ? 'bg-accent text-white' : 'bg-surface/30 text-muted'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>

      <Field label="4 — if bennett fails u in 30 days, what should happen?">
        <textarea
          value={q4}
          onChange={(e) => setQ4(e.target.value)}
          rows={3}
          className="w-full bg-surface/30 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
      </Field>

      <button
        onClick={() => void submit()}
        disabled={submitting}
        className="w-full bg-accent text-white font-semibold lowercase rounded-[14px] py-3.5 disabled:opacity-60"
      >
        {submitting ? 'sending…' : 'submit application'}
      </button>
      {error && <div className="text-muted text-xs lowercase">{error}</div>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-text text-sm font-semibold lowercase">{label}</div>
      {children}
    </div>
  );
}
