import { useEffect, useState } from 'react';
import type { KnowledgeBarProtocol, MasterySector, OTFQuiz } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { generateOTF } from '../../services/mastery';
import { OTFQuiz as OTFQuizUI } from '../Quiz';

interface Props {
  protocol: KnowledgeBarProtocol;
  onDismiss: () => void;
}

const TOTAL_SECONDS = 20 * 60;

export function FocusOverlay({ protocol: doc, onDismiss }: Props) {
  const user = useUserStore((s) => s.user);
  const [elapsed, setElapsed] = useState(0);
  const [otfPrompt, setOtfPrompt] = useState(false);
  const [otfLoading, setOtfLoading] = useState(false);
  const [otf, setOtf] = useState<OTFQuiz | null>(null);
  const [otfErr, setOtfErr] = useState<string | null>(null);

  async function startOTF() {
    if (!user?.uid) {
      onDismiss();
      return;
    }
    setOtfLoading(true);
    setOtfErr(null);
    try {
      const sector = guessSector(doc.topic);
      const ctx = [
        `topic: ${doc.topic}`,
        `objective: ${doc.objective}`,
        `key concepts:\n${doc.keyConcepts.map((c) => '- ' + c).join('\n')}`,
        `study plan:\n${doc.studyPlan.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
        `action step: ${doc.actionStep}`,
      ].join('\n\n');
      const quiz = await generateOTF({
        uid: user.uid,
        topic: doc.topic,
        sector,
        context: ctx,
      });
      setOtf(quiz);
    } catch (e) {
      setOtfErr((e as Error).message);
    } finally {
      setOtfLoading(false);
    }
  }

  if (otf) {
    return (
      <OTFQuiz
        quiz={otf}
        onComplete={() => {
          setOtf(null);
          onDismiss();
        }}
      />
    );
  }

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
  const done = elapsed >= TOTAL_SECONDS;

  return (
    <div className="fixed inset-0 z-[90] bg-bg/95 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-5 text-text">
        <header className="flex items-center justify-between">
          <span className="font-mono text-lg font-bold">{format(remaining)}</span>
          <div className="w-32 h-1 bg-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-[width] duration-1000"
              style={{ width: `${Math.min(elapsed / TOTAL_SECONDS, 1) * 100}%` }}
            />
          </div>
        </header>
        <h1 className="text-2xl font-extrabold">{doc.topic}</h1>
        <Section title="objective"><p>{doc.objective}</p></Section>
        {doc.keyConcepts.length > 0 && (
          <Section title="key concepts">
            <ul className="space-y-1">
              {doc.keyConcepts.map((c, i) => (
                <li key={i} className="text-sm">· {c}</li>
              ))}
            </ul>
          </Section>
        )}
        {doc.studyPlan.length > 0 && (
          <Section title="20-min study plan">
            <ol className="space-y-1">
              {doc.studyPlan.map((s, i) => (
                <li key={i} className="text-sm"><span className="text-muted">{i + 1}.</span> {s}</li>
              ))}
            </ol>
          </Section>
        )}
        <Section title="action step">
          <p className="text-accent">{doc.actionStep}</p>
        </Section>
        {otfPrompt ? (
          <div className="rounded-bn bg-surface/30 border border-border/30 p-4 space-y-3">
            <div className="text-text font-semibold lowercase">
              yo, u just finished the breakdown. let's see if it stuck.
            </div>
            <div className="text-muted text-sm lowercase">
              5 quick ones for the marbles?
            </div>
            <div className="flex gap-2">
              <button
                onClick={onDismiss}
                className="flex-1 bg-surface/30 text-text rounded-[12px] py-2.5 lowercase border border-border/30"
              >
                skip
              </button>
              <button
                onClick={() => void startOTF()}
                disabled={otfLoading}
                className="flex-1 bg-accent text-white font-semibold rounded-[12px] py-2.5 lowercase disabled:opacity-60"
              >
                {otfLoading ? 'generating…' : 'run it'}
              </button>
            </div>
            {otfErr && <div className="text-muted text-xs lowercase">{otfErr}</div>}
          </div>
        ) : (
          <button
            onClick={() => setOtfPrompt(true)}
            className={`w-full font-semibold lowercase rounded-[12px] py-3 ${
              done ? 'bg-accent text-white' : 'bg-muted/40 text-muted'
            }`}
          >
            {done ? 'done' : 'exit early'}
          </button>
        )}
      </div>
    </div>
  );
}

/** Best-effort topic → sector classifier for OTF gen. Phase 6 may swap
 *  to a Claude classifier; for now keyword match against MASTERY_SECTORS. */
function guessSector(topic: string): MasterySector {
  const t = topic.toLowerCase();
  if (/(option|stock|portfolio|equit|bond|invest|finance|tax|roth|401|hedge)/i.test(t)) return 'finance';
  if (/(real estate|rental|cap rate|noi|property|mortgage|landlord)/i.test(t)) return 'real_estate';
  if (/(ai|llm|gpt|claude|prompt|model|token|tensor|gpu|coding)/i.test(t)) return 'ai_tech';
  if (/(sleep|workout|protein|vo2|fitness|cardio|strength|nutrition)/i.test(t)) return 'fitness';
  if (/(dose|drug|medic|disease|patient|clinical|trial|nnt)/i.test(t)) return 'medical';
  return 'general';
}

function format(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</div>
      <div className="text-sm">{children}</div>
    </section>
  );
}
